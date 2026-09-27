// Minimal stateless MCP (streamable HTTP, JSON responses) for the QM agent.
import type { Category, Provider } from "../../shared/types";
import { core, franchiseTax, scenario, summary, taxes, usd, vendorStats } from "./derive";
import { MONTHS } from "./mock";
import * as state from "./state";
import { brainPage, brainSearch, learn, remember, review } from "./brain";
import { adviceMarkdown, decide, getAdvice, refresh } from "./advisor";

const CATEGORIES: Category[] = ["Revenue", "Interest", "Payroll", "Payroll Taxes", "Contractors", "Cloud & Infra", "AI & APIs", "Software", "Rent & Office", "Legal & Accounting", "Marketing", "Travel & Meals", "Hardware", "Insurance", "Taxes & Fees", "Bank Fees", "Transfers", "Other"];
const obj = (properties: Record<string, unknown> = {}, required: string[] = []) => ({ type: "object", properties, required });
const str = (description: string, extra: object = {}) => ({ type: "string", description, ...extra });
const num = (description: string) => ({ type: "number", description });

const TOOLS = [
  { name: "get_financial_summary", description: "Lumen Labs' current financial position: cash by account, net burn (last month and 3-month average), runway months, zero-cash date, Stripe MRR and growth, the monthly revenue/expense trend, and the top flagged insights (spend spikes, duplicates, unused SaaS, tax savings). Start here for any 'how are we doing' question.", inputSchema: obj() },
  { name: "search_transactions", description: "Search normalized transactions from every connected account (Mercury, Brex, Ramp, Stripe, Gusto, AWS). All filters are optional and combine with AND. Amounts: negative = money out. Returns newest first as a table.", inputSchema: obj({ q: str("Free text matched against the raw descriptor, vendor, category and note"), month: str("YYYY-MM"), category: str("Category name", { enum: CATEGORIES }), vendor: str("Vendor name (substring match)"), source: str("Provider", { enum: ["mercury", "brex", "ramp", "stripe", "gusto", "aws"] }), flag: str("Flag filter", { enum: ["missing_receipt", "duplicate", "unusual", "needs_review", "1099"] }), limit: num("Max rows (default 25, max 100)") }) },
  { name: "vendor_spend", description: "Spend history for one vendor (monthly totals for 12 months, category, change vs 3-month average, flags), or the top 15 vendors by 12-month spend if no vendor is given.", inputSchema: obj({ vendor: str("Vendor name, e.g. 'AWS'") }) },
  { name: "tax_calendar", description: "Tax and compliance deadlines (IRS, Delaware, California, payroll) with status (done / due_soon / upcoming / overdue), estimated amounts and a plain-English explanation. Also lists 1099 contractors and W-9 status.", inputSchema: obj({ within_days: num("Only show events due within this many days from today (default: all)") }) },
  { name: "delaware_franchise_tax", description: "Delaware franchise tax computed both ways from the Carta cap table: the authorized-shares method (what Delaware's notice will say) and the assumed par value capital method (what the company actually owes), with the math and the savings.", inputSchema: obj() },
  { name: "runway_scenario", description: "What-if runway model. Adds spend and/or hires to the current 3-month average burn and optionally grows revenue monthly; returns the new monthly burn, runway months and zero-cash date next to the baseline.", inputSchema: obj({ extra_monthly_spend: num("Extra spend per month in USD"), new_hires: num("Number of new hires starting now"), salary_per_hire: num("Annual salary per hire in USD (default 160000; 25% load added)"), revenue_growth_pct: num("Monthly revenue growth in percent, e.g. 10") }) },
  { name: "sync_integrations", description: "Pull fresh data from one provider or all of them (mercury, brex, ramp, stripe, gusto, aws, carta), re-categorize, and update the GBrain memory pages. Returns each integration's status, mode (live/mock) and record count.", inputSchema: obj({ provider: str("Provider id; omit to sync all", { enum: state.PROVIDERS }) }) },
  { name: "brain_search", description: "Search the company's GBrain memory (vendor pages, monthly closes, tax pages, policies, and notes saved earlier). Returns matching page slugs with excerpts; follow up with brain_read.", inputSchema: obj({ query: str("Keywords") }, ["query"]) },
  { name: "brain_read", description: "Read one GBrain memory page as markdown, e.g. 'company/lumen-labs', 'vendors/aws', 'months/2026-09', 'taxes/calendar', 'taxes/delaware-franchise-tax', 'policies/categorization-rules', 'notes/<slug>'.", inputSchema: obj({ slug: str("Page slug") }, ["slug"]) },
  { name: "remember", description: "Save a durable note to the company's GBrain memory (as notes/<slug>) so it is available in future sessions: decisions, context from the founder, vendor quirks, follow-ups.", inputSchema: obj({ title: str("Short title"), content: str("Markdown content") }, ["title", "content"]) },
  { name: "recategorize", description: "Teach a categorization rule: every transaction from this vendor gets the new category, now and on future syncs. The rule is saved in GBrain (vendor page + policies/categorization-rules) and overrides the built-in rules. Returns what changed.", inputSchema: obj({ vendor: str("Vendor name exactly as shown in transactions, e.g. 'Brightline Events'"), category: str("New category", { enum: CATEGORIES }), reason: str("Why, in a few words") }, ["vendor", "category", "reason"]) },
  { name: "mark_reviewed", description: "Mark one transaction as reviewed (e.g. the founder confirmed an unusual charge). Clears its 'unusual' and 'needs_review' flags, removes the matching insight, and records the review with the note on the vendor's GBrain page. Survives restarts.", inputSchema: obj({ transaction_id: str("Transaction id from search_transactions, e.g. 'mercury_0650'"), note: str("Why it is fine, in a few words") }, ["transaction_id"]) },
  { name: "get_cfo_advice", description: "CFO recommendations to extend runway, grounded in the ledger: cancel unused SaaS, refund duplicates, renegotiate AWS and AI API bills, cheaper replacements, fundraise and hiring timing, tax credits. Each has an id, monthly savings, confidence, effort, status (open/accepted/dismissed) and next step, plus runway today, if everything is adopted, and with accepted items only. Set refresh=true to regenerate (can take a minute or two).", inputSchema: obj({ refresh: { type: "boolean", description: "Regenerate the advice first and wait for it" } }) },
  { name: "decide_advice", description: "Record the founder's decision on one CFO recommendation (accept, dismiss, or reopen) by id from get_cfo_advice, e.g. 'cut:salesforce'. Returns the new accepted savings and runway. Persists across restarts.", inputSchema: obj({ id: str("Recommendation id, e.g. 'cut:salesforce'"), status: str("Decision", { enum: ["accepted", "dismissed", "open"] }) }, ["id", "status"]) },
];

const table = (head: string[], rows: (string | number)[][]) => `| ${head.join(" | ")} |\n|${head.map(() => "---").join("|")}|\n${rows.map((r) => `| ${r.join(" | ")} |`).join("\n")}`;
const cap = (s: string) => (s.length > 7800 ? s.slice(0, 7800) + "\n...(truncated)" : s);

async function call(name: string, a: any): Promise<string> {
  const t = state.txns, b = state.balances;
  switch (name) {
    case "get_financial_summary": {
      const s = summary(t, b);
      return `# ${s.company.legalName} as of ${s.asOf}\n\n- Cash: **${usd(s.cash.total)}** (${s.cash.byAccount.map((x) => `${x.name}: ${usd(x.balance)}`).join("; ")})\n- Net burn: ${usd(s.burn.lastMonth)} last month, ${usd(s.burn.avg3mo)}/mo 3-month avg\n- Runway: **${s.runwayMonths} months** (zero cash ~${s.zeroCashDate})\n- MRR: ${usd(s.mrr)} (${s.mrrGrowthPct >= 0 ? "+" : ""}${s.mrrGrowthPct}% MoM)\n\n## Monthly\n${table(["Month", "Revenue", "Interest", "Expenses", "Net"], s.months.map((m) => [m.month, usd(m.revenue), usd(m.byCategory.Interest ?? 0), usd(m.expenses), usd(m.net)]))}\n\nBurn = expenses - Stripe revenue - treasury interest. MRR/revenue exclude interest.\n\n## Insights\n${s.insights.map((i) => `- [${i.severity}] **${i.title}**: ${i.body}`).join("\n")}`;
    }
    case "search_transactions": {
      const rows = state.filterTxns({ q: a.q, month: a.month, category: a.category, vendor: a.vendor, source: a.source, flag: a.flag });
      const lim = Math.min(Number(a.limit) || 25, 100);
      const total = rows.reduce((s, x) => s + x.amount, 0);
      return `${rows.length} transactions, net ${usd(total)}${rows.length > lim ? ` (showing ${lim})` : ""}\n\n${table(["Id", "Date", "Amount", "Vendor", "Category", "Source", "Descriptor", "Flags"], rows.slice(0, lim).map((x) => [x.id, x.date, usd(x.amount), x.vendor, x.category, x.source, x.description, x.flags.join(",")]))}`;
    }
    case "vendor_spend": {
      const vs = vendorStats(t);
      if (a.vendor) {
        const v = vs.find((x) => x.vendor.toLowerCase() === String(a.vendor).toLowerCase()) ?? vs.find((x) => x.vendor.toLowerCase().includes(String(a.vendor).toLowerCase()));
        if (!v) return `No spend found for "${a.vendor}". Known vendors: ${vs.map((x) => x.vendor).join(", ")}`;
        const flags = [...new Set(t.filter((x) => x.vendor === v.vendor).flatMap((x) => x.flags))];
        return `# ${v.vendor} (${v.category})\n12-month spend ${usd(v.total12mo)}; last month ${usd(v.lastMonth)} (${v.changePct}% vs 3-mo avg). Flags: ${flags.join(", ") || "none"}\n\n${table(["Month", "Spend"], MONTHS.map((m, i) => [m, usd(v.sparkline[i]!)]))}`;
      }
      return table(["Vendor", "Category", "12-mo", "Last month", "Change vs 3-mo"], vs.slice(0, 15).map((v) => [v.vendor, v.category, usd(v.total12mo), usd(v.lastMonth), `${v.changePct}%`]));
    }
    case "tax_calendar": {
      const tx = taxes(t, b);
      const within = Number(a.within_days) || 0;
      const today = Date.parse("2026-09-27");
      const ev = within ? tx.events.filter((e) => e.status === "overdue" || (Date.parse(e.date) >= today && Date.parse(e.date) - today <= within * 864e5)) : tx.events;
      return `${table(["Date", "Status", "Authority", "Form", "What", "Amount"], ev.map((e) => [e.date, e.status, e.authority, e.form ?? "", e.title, e.amount != null ? usd(e.amount) : ""]))}\n\n${ev.map((e) => `- **${e.title}** (${e.date}): ${e.description}`).join("\n")}\n\n1099 contractors: ${tx.contractors1099.map((c) => `${c.name} ${usd(c.paid)} (W-9 ${c.w9 ? "on file" : "MISSING"})`).join("; ")}\nEstimated for the year: federal ${usd(tx.estimatedTaxYear.federal)}, state ${usd(tx.estimatedTaxYear.state)}, payroll ${usd(tx.estimatedTaxYear.payroll)}.`;
    }
    case "delaware_franchise_tax": {
      const ft = franchiseTax(core(t, b).grossAssets);
      return `Delaware franchise tax + annual report, due 2027-03-01\n\n- Authorized: ${ft.authorizedShares.toLocaleString()}, issued: ${ft.issuedShares.toLocaleString()}, par $0.00001 (Carta)\n- **Authorized shares method** (the default notice): $250 + ${Math.ceil((ft.authorizedShares - 10000) / 10000)} x $85 = ${usd(ft.authorizedSharesMethod - 50)} + $50 report = **${usd(ft.authorizedSharesMethod)}**\n- **Assumed par value capital method**: gross assets ${usd(ft.grossAssets)} / ${ft.issuedShares.toLocaleString()} issued = $${ft.assumedPar} assumed par; x ${ft.authorizedShares.toLocaleString()} authorized = ${usd(ft.apvc)} APVC; $400 per $1M or part = ${usd(ft.assumedParValueMethod - 50)} + $50 = **${usd(ft.assumedParValueMethod)}**\n- **Savings: ${usd(ft.savings)}** by filing with the assumed par value method.`;
    }
    case "runway_scenario": {
      const r = scenario(t, b, a);
      return `Baseline: burn ${usd(r.baseline.burn)}/mo, runway ${r.baseline.runwayMonths} months, zero cash ${r.baseline.zeroCashDate}\nScenario: +${usd(r.scenario.addedMonthlySpend)}/mo spend -> burn ${usd(r.scenario.burn)}/mo, runway ${r.scenario.runwayMonths ?? "infinite (default alive)"} months, zero cash ${r.scenario.zeroCashDate}${a.revenue_growth_pct ? ` (revenue growing ${a.revenue_growth_pct}%/mo)` : ""}`;
    }
    case "sync_integrations": {
      const res = a.provider ? [await state.sync(a.provider as Provider)] : await state.syncAll();
      return table(["Provider", "Mode", "Status", "Records", "Balance"], res.map((i) => [i.name, i.mode, i.status + (state.errors.get(i.id) ? ` (${state.errors.get(i.id)!.slice(0, 80)})` : ""), i.records, i.balance != null ? usd(i.balance) : ""])) + "\n\nGBrain pages are being refreshed in the background.";
    }
    case "brain_search": {
      const hits = await brainSearch(String(a.query ?? ""));
      return hits.length ? hits.map((h: any) => `- **${h.slug}** (${h.title}): ${h.excerpt}`).join("\n") : "No pages matched.";
    }
    case "brain_read": return (await brainPage(String(a.slug ?? ""))) ?? `Page not found: ${a.slug}`;
    case "mark_reviewed": {
      const t = review(String(a.transaction_id), a.note ? String(a.note) : "");
      if (!t) return `No transaction with id ${a.transaction_id}. Use search_transactions to find ids.`;
      return `Reviewed ${t.id}: ${t.date} ${t.vendor} ${usd(t.amount)}. Flags now: ${t.flags.join(", ") || "none"}. Saved to GBrain (vendor page + policies/categorization-rules).`;
    }
    case "get_cfo_advice": {
      if (a.refresh) await refresh();
      const ad = getAdvice();
      return `${ad.source === "rules" ? "Rule-based estimate (no AI model)" : `AI advice from ${ad.model}`}${ad.error ? `; last AI error: ${ad.error}` : ""}${ad.refreshing ? "; a refresh is running" : ""}\n\n${adviceMarkdown(ad)}`;
    }
    case "decide_advice": {
      if (!["accepted", "dismissed", "open"].includes(a.status)) throw new Error("status must be accepted, dismissed or open");
      const ad = decide(String(a.id), a.status);
      if (!ad) throw new Error(`Unknown recommendation id "${a.id}". Valid ids: ${getAdvice().recommendations.map((r) => r.id).join(", ")}`);
      return `Marked ${a.id} ${a.status}. Accepted savings now ${usd(ad.accepted.monthlySavings)}/mo; runway ${ad.accepted.runwayMonths} months.`;
    }
    case "remember": {
      const slug = remember(String(a.title), String(a.content));
      return `Saved to GBrain as ${slug}.`;
    }
    case "recategorize": {
      const vendor = String(a.vendor);
      if (!CATEGORIES.includes(a.category)) throw new Error(`Unknown category ${a.category}`);
      const match = t.find((x) => x.vendor.toLowerCase() === vendor.toLowerCase())?.vendor
        ?? t.find((x) => x.vendor.toLowerCase().includes(vendor.toLowerCase()) || x.description.toLowerCase().includes(vendor.toLowerCase()))?.vendor;
      if (!match) return `No transactions found for vendor "${vendor}". Nothing changed.`;
      const before = t.filter((x) => x.vendor === match);
      const from = [...new Set(before.map((x) => x.category))].join(", ");
      learn(match, a.category, String(a.reason ?? ""));
      return `Learned: ${match} -> ${a.category} (was ${from}). ${before.length} transactions (${usd(before.reduce((s, x) => s + x.amount, 0))}) re-categorized. Saved to GBrain vendors/${match.toLowerCase().replace(/[^a-z0-9]+/g, "-")} and policies/categorization-rules; applies to future syncs.`;
    }
  }
  throw new Error(`Unknown tool: ${name}`);
}

async function rpc(msg: any): Promise<any | null> {
  const { id, method, params } = msg ?? {};
  const ok = (result: unknown) => ({ jsonrpc: "2.0", id, result });
  const err = (code: number, message: string) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
  if (id === undefined || id === null) return null; // notification
  switch (method) {
    case "initialize":
      return ok({ protocolVersion: params?.protocolVersion ?? "2025-06-18", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "countinghouse", version: "0.1.0" }, instructions: "Countinghouse is Lumen Labs' finance team: cash, burn, runway, transactions, vendors, taxes, and GBrain memory. Use get_financial_summary first." });
    case "ping": return ok({});
    case "tools/list": return ok({ tools: TOOLS });
    case "tools/call":
      try {
        return ok({ content: [{ type: "text", text: cap(await call(params?.name, params?.arguments ?? {})) }] });
      } catch (e) {
        return ok({ content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : e}` }], isError: true });
      }
    case "resources/list": return ok({ resources: [] });
    case "prompts/list": return ok({ prompts: [] });
    default: return err(-32601, `Method not found: ${method}`);
  }
}

export async function handleMcp(req: Request, cors: Record<string, string>) {
  if (req.method === "GET") return new Response("Method Not Allowed", { status: 405, headers: { ...cors, allow: "POST" } });
  if (req.method === "DELETE") return new Response(null, { status: 200, headers: cors });
  let body: any;
  try { body = await req.json(); } catch { return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400, headers: cors }); }
  const batch = Array.isArray(body);
  const out = (await Promise.all((batch ? body : [body]).map(rpc))).filter(Boolean);
  if (!out.length) return new Response(null, { status: 202, headers: cors });
  return Response.json(batch ? out : out[0], { headers: cors });
}
