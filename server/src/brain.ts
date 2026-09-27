// GBrain is the company memory. After every sync we render finance pages and write them to GBrain
// in the background (each `gbrain put` is ~1.5s; writes are serialized by the PGLite lock).
// The API serves an in-memory mirror so it never waits on the brain.
import type { BrainPage, Category } from "../../shared/types";
import { core, contractors, franchiseTax, summary, taxes, usd, vendorStats } from "./derive";
import { ASOF, CAP_TABLE, MONTHS } from "./mock";
import { RULES, learned, reviewed, SAAS_LOGINS } from "./rules";
import * as state from "./state";
import { homedir } from "os";
import { existsSync } from "fs";
import { join } from "path";

const VENDORED = join(import.meta.dir, "../../vendor/gbrain/src/cli.ts");
const CLI = process.env.GBRAIN_CLI ?? (existsSync(VENDORED) ? VENDORED : `${homedir()}/Developer/gbrain-oss/src/cli.ts`);
const mirror = new Map<string, { page: BrainPage; markdown: string }>();
const written = new Map<string, string>(); // slug -> markdown last written
const queue: string[] = [];
let running = 0;
export const brainStats = { writes: 0, failures: 0, lastError: "" };

async function gbrain(args: string[], stdin?: string) {
  const p = Bun.spawn(["bun", CLI, ...args], { stdin: stdin != null ? new Blob([stdin]) : "ignore", stdout: "pipe", stderr: "pipe", cwd: "/tmp" });
  const [out, err, code] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text(), p.exited]);
  if (code !== 0) throw new Error(`gbrain ${args[0]} failed: ${(err || out).slice(0, 300)}`);
  return out;
}

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const front = (title: string, type: string, extra: Record<string, string | number> = {}) =>
  `---\ntitle: "${title.replace(/"/g, "'")}"\ntype: ${type}\n${Object.entries(extra).map(([k, v]) => `${k}: ${typeof v === "string" ? JSON.stringify(v) : v}`).join("\n")}${Object.keys(extra).length ? "\n" : ""}updated: ${new Date().toISOString()}\n---\n`;

function setPage(slug: string, title: string, type: string, markdown: string) {
  const body = markdown.replace(/^---[\s\S]*?---\n/, "").replace(/[#*|>\[\]`_-]/g, " ").replace(/\s+/g, " ").trim();
  const prev = mirror.get(slug);
  const same = prev && prev.markdown.replace(/updated: .*\n/, "") === markdown.replace(/updated: .*\n/, "");
  mirror.set(slug, { page: { slug, title, type, updatedAt: same ? prev.page.updatedAt : new Date().toISOString(), excerpt: body.slice(0, 180) }, markdown: same ? prev.markdown : markdown });
  if (!same && written.get(slug) !== markdown) enqueue(slug);
}

function enqueue(slug: string) {
  if (queue.includes(slug)) return pump();
  // durable state (learned rules, reviews, agent notes) jumps the queue so a restart can't lose it
  if (/^(policies|notes)\//.test(slug)) queue.unshift(slug); else queue.push(slug);
  pump();
}
async function putWithRetry(slug: string, md: string) {
  for (let i = 0; ; i++) {
    try { return await gbrain(["put", slug, "--force"], md); }
    catch (e) { if (i >= 3) throw e; await Bun.sleep(1000 * (i + 1)); }
  }
}
function pump() {
  while (running < 1 && queue.length) {
    const slug = queue.shift()!;
    const md = mirror.get(slug)!.markdown;
    running++;
    putWithRetry(slug, md)
      .then(() => { written.set(slug, md); brainStats.writes++; if (!queue.length) console.log(`[brain] queue drained, ${brainStats.writes} writes`); })
      .catch((e) => { brainStats.failures++; brainStats.lastError = String(e); console.error(`[brain] ${slug}:`, String(e).slice(0, 200)); })
      .finally(() => { running--; pump(); });
  }
}

export function renderAll() {
  const t = state.txns, b = state.balances;
  if (!t.length) return;
  const s = summary(t, b), tx = taxes(t, b), c = core(t, b), ft = franchiseTax(c.grossAssets);
  const vendors = vendorStats(t);
  const table = (rows: (string | number)[][], head: string[]) => `| ${head.join(" | ")} |\n| ${head.map(() => "---").join(" | ")} |\n${rows.map((r) => `| ${r.join(" | ")} |`).join("\n")}\n`;

  setPage("company/lumen-labs", "Lumen Labs, Inc. - finance overview", "company",
    front("Lumen Labs, Inc. - finance overview", "company", { as_of: ASOF }) +
    `# Lumen Labs, Inc.\n\nDelaware C-corp incorporated ${s.company.incorporated}, San Francisco, ${s.company.stage} stage, ${s.company.employees} employees. Raised a $3.2M seed in Jan 2026.\n\n` +
    `## Numbers as of ${ASOF}\n\n- Cash: **${usd(s.cash.total)}** (${s.cash.byAccount.map((a) => `${a.name} ${usd(a.balance)}`).join(", ")})\n- Net burn: ${usd(s.burn.lastMonth)} last month, ${usd(s.burn.avg3mo)} 3-month average\n- Runway: **${s.runwayMonths} months**, zero cash around ${s.zeroCashDate}\n- MRR: ${usd(s.mrr)} (${s.mrrGrowthPct}% MoM)\n\n` +
    `## What needs attention\n\n${s.insights.map((i) => `- **${i.title}**: ${i.body}`).join("\n")}\n\n` +
    `## Accounts\n\n${state.PROVIDERS.map((p) => `- [[accounts/${p}]]`).join("\n")}\n\n## Months\n\n${MONTHS.map((m) => `[[months/${m}]]`).join(" · ")}\n\n` +
    `## Related\n\n- [[taxes/calendar]] · [[taxes/delaware-franchise-tax]] · [[policies/categorization-rules]]\n- Top vendors: ${s.topVendors.slice(0, 8).map((v) => `[[vendors/${slugify(v.vendor)}]]`).join(", ")}\n`);

  for (const i of state.integrations.values()) {
    const own = t.filter((x) => x.source === i.id);
    setPage(`accounts/${i.id}`, `${i.name} (${i.kind})`, "account",
      front(`${i.name} (${i.kind})`, "account", { provider: i.id, mode: i.mode }) +
      `# ${i.name}\n\nKind: ${i.kind}. Mode: **${i.mode}**${i.mode === "mock" ? " (set the API key env var to go live)" : ""}. Status: ${i.status}. Last sync: ${i.lastSync ?? "never"}. Records: ${i.records}.\n` +
      (i.balance !== undefined ? `\nBalance: **${usd(i.balance)}** ${i.accountMask ?? ""}\n` : "") +
      (i.id === "carta" ? `\n## Cap table\n\n- Authorized: ${CAP_TABLE.authorizedShares.toLocaleString()} shares\n- Issued: ${CAP_TABLE.issuedShares.toLocaleString()}\n- Par: $${CAP_TABLE.parValue}\n\n${table(CAP_TABLE.stakeholders.map((x) => [x.name, x.shares.toLocaleString(), x.type]), ["Holder", "Shares", "Class"])}\nFeeds [[taxes/delaware-franchise-tax]].\n` : "") +
      (own.length ? `\n## Recent\n\n${table(own.slice(0, 10).map((x) => [x.date, x.description, usd(x.amount), `[[vendors/${slugify(x.vendor)}]]`]), ["Date", "Descriptor", "Amount", "Vendor"])}` : "") +
      `\nPart of [[company/lumen-labs]].\n`);
  }

  for (const v of vendors) {
    const own = t.filter((x) => x.vendor === v.vendor);
    const rule = RULES.find(([, name]) => name === v.vendor);
    const l = learned.get(v.vendor.toLowerCase());
    const flags = [...new Set(own.flatMap((x) => x.flags))];
    const notes: string[] = [];
    if (v.vendor in SAAS_LOGINS) notes.push(`${SAAS_LOGINS[v.vendor]} SSO logins in the last 90 days.`);
    if (v.vendor === "AWS") notes.push("GPU instances (p4d) started in July; spend up since then.");
    for (const x of own.filter((x) => reviewed.has(x.id))) notes.push(`${x.date} ${usd(x.amount)} reviewed ${reviewed.get(x.id)!.at}${reviewed.get(x.id)!.note ? `: ${reviewed.get(x.id)!.note}` : ""}`);
    for (const x of own.filter((x) => x.flags.includes("duplicate") || x.flags.includes("unusual") || x.flags.includes("missing_receipt"))) notes.push(`${x.date} ${usd(x.amount)}: ${x.flags.join(", ")}`);
    const slug = `vendors/${slugify(v.vendor)}`;
    setPage(slug, v.vendor, "vendor",
      front(v.vendor, "vendor", { category: l?.category ?? v.category }) +
      `# ${v.vendor}\n\n- Category: **${l?.category ?? v.category}**\n- Rule: ${l ? `learned: ${v.vendor} -> ${l.category} (${l.reason}, ${l.at})` : rule ? `built-in /${rule[0].source}/ -> ${rule[2]}` : "none (needs review)"}\n` +
      `- 12-month spend: **${usd(v.total12mo)}**, last month ${usd(v.lastMonth)} (${v.changePct >= 0 ? "+" : ""}${v.changePct}% vs 3-mo avg)\n- Flags: ${flags.length ? flags.join(", ") : "none"}\n\n` +
      `## Monthly spend\n\n${table(MONTHS.map((m, i) => [m, usd(v.sparkline[i]!)]), ["Month", "Spend"])}` +
      (notes.length ? `\n## Notes\n\n${notes.map((n) => `- ${n}`).join("\n")}\n` : "") +
      `\nSee [[policies/categorization-rules]] · [[company/lumen-labs]]\n`);
  }

  s.months.forEach((m, i) => {
    const cats = Object.entries(m.byCategory).filter(([k]) => k !== "Interest").sort((a, b) => b[1]! - a[1]!);
    const mt = t.filter((x) => x.date.startsWith(m.month));
    const top = vendorStats(mt).slice(0, 6);
    const flagged = mt.filter((x) => x.flags.some((f) => f !== "1099"));
    setPage(`months/${m.month}`, `${m.month} monthly close`, "month",
      front(`${m.month} monthly close`, "month", { month: m.month }) +
      `# ${m.month} close\n\nRevenue ${usd(m.revenue)} · Interest ${usd(m.byCategory.Interest ?? 0)} · Expenses ${usd(m.expenses)} · Net ${usd(m.net)} (burn = expenses - revenue - interest)${i > 0 ? ` · Expenses ${m.expenses >= s.months[i - 1]!.expenses ? "up" : "down"} ${usd(Math.abs(m.expenses - s.months[i - 1]!.expenses))} vs [[months/${s.months[i - 1]!.month}]]` : ""}\n\n` +
      `## By category\n\n${table(cats.map(([k, val]) => [k, usd(val!)]), ["Category", "Spend"])}\n## Top vendors\n\n${top.map((x) => `- [[vendors/${slugify(x.vendor)}]] ${usd(x.lastMonth)}`).join("\n")}\n` +
      (flagged.length ? `\n## Open items\n\n${flagged.map((x) => `- ${x.date} ${x.vendor} ${usd(x.amount)}: ${x.flags.join(", ")}`).join("\n")}\n` : "\nNo open items. Month is clean.\n") +
      `\nPart of [[company/lumen-labs]].\n`);
  });

  setPage("taxes/calendar", "Tax & compliance calendar", "tax",
    front("Tax & compliance calendar", "tax") +
    `# Tax & compliance calendar\n\nAs of ${ASOF}. Estimated for the year: federal income ${usd(tx.estimatedTaxYear.federal)} (net operating loss), California ${usd(tx.estimatedTaxYear.state)}, payroll taxes ${usd(tx.estimatedTaxYear.payroll)}.\n\n` +
    table(tx.events.map((e) => [e.date, e.status, e.authority, e.form ?? "", e.title, e.amount != null ? usd(e.amount) : ""]), ["Date", "Status", "Authority", "Form", "What", "Amount"]) +
    `\n## 1099 contractors (2026)\n\n${table(tx.contractors1099.map((x) => [x.name, usd(x.paid), x.w9 ? "on file" : "**MISSING**"]), ["Contractor", "Paid", "W-9"])}\nSee [[taxes/delaware-franchise-tax]] · [[company/lumen-labs]]\n`);

  setPage("taxes/delaware-franchise-tax", "Delaware franchise tax", "tax",
    front("Delaware franchise tax", "tax", { due: "2027-03-01" }) +
    `# Delaware franchise tax (due Mar 1, 2027)\n\nCap table from [[accounts/carta]]: ${ft.authorizedShares.toLocaleString()} authorized, ${ft.issuedShares.toLocaleString()} issued, par $${CAP_TABLE.parValue}.\n\n` +
    `## Authorized shares method (Delaware's default notice)\n\n$250 for the first 10,000 shares + $85 for each additional 10,000 (or part): 250 + ${Math.ceil((ft.authorizedShares - 10000) / 10000)} x 85 = **${usd(ft.authorizedSharesMethod - 50)}**, plus $50 annual report = **${usd(ft.authorizedSharesMethod)}**.\n\n` +
    `## Assumed par value capital method (what you actually owe)\n\n1. Gross assets (projected Dec 31): ${usd(ft.grossAssets)}\n2. Assumed par = gross assets / issued shares = $${ft.assumedPar}\n3. Assumed par value capital = $${ft.assumedPar} x ${ft.authorizedShares.toLocaleString()} = ${usd(ft.apvc)}\n4. Tax = $400 per $1M or portion (min $400) = ${usd(ft.assumedParValueMethod - 50)}\n5. Plus $50 annual report = **${usd(ft.assumedParValueMethod)}**\n\n` +
    `**Savings: ${usd(ft.savings)}.** Last year (2025) Lumen Labs filed with this method and paid $450.\n\nSee [[taxes/calendar]].\n`);

  setPage("policies/categorization-rules", "Categorization rules", "policy",
    front("Categorization rules", "policy") +
    `# Categorization rules\n\nBuilt-in descriptor rules categorize every transaction on day one. Learned rules override them and are saved here and on the vendor page.\n\n` +
    `## Learned rules\n\n${learned.size ? table([...learned].map(([k, l]) => [k, l.category, l.reason, l.at]), ["Vendor", "Category", "Reason", "Learned"]) : "None yet.\n"}\n` +
    "```json learned-rules\n" + JSON.stringify(Object.fromEntries(learned), null, 1) + "\n```\n\n" +
    `## Reviewed transactions\n\n${reviewed.size ? [...reviewed].map(([id, r]) => `- ${id} (${r.at})${r.note ? `: ${r.note}` : ""}`).join("\n") : "None yet."}\n\n` +
    "```json reviewed-txns\n" + JSON.stringify(Object.fromEntries(reviewed), null, 1) + "\n```\n\n" +
    `## Policies\n\n- Stripe revenue is counted once, from Stripe. The Mercury payout line is a Transfer.\n- Equity financing (seed wires) is a Transfer, never revenue.\n- Card payments (Brex, Ramp) are Transfers; the card lines carry the expense.\n- Contractors and law firms paid over $600 get a 1099-NEC.\n\n` +
    `## Built-in rules\n\n${table(RULES.map(([re, v, c]) => ["`/" + re.source.replace(/\|/g, "\\|") + "/`", `[[vendors/${slugify(v)}]]`, c]), ["Pattern", "Vendor", "Category"])}`);
}

// ---------- reads ----------
export async function brainPages(): Promise<BrainPage[]> {
  return [...mirror.values()].map((x) => x.page).sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function brainPage(slug: string): Promise<string | null> {
  const m = mirror.get(slug);
  if (m?.markdown) return m.markdown;
  try { return await gbrain(["get", slug]); } catch { return null; }
}

export async function brainSearch(q: string) {
  try {
    const out = await gbrain(["search", q, "--json"]);
    const hits = JSON.parse(out.slice(out.indexOf("[")));
    if (Array.isArray(hits) && hits.length) return hits.slice(0, 10).map((h: any) => ({ slug: h.slug, title: h.title, excerpt: String(h.chunk_text ?? h.excerpt ?? h.snippet ?? "").slice(0, 240) }));
  } catch (e) { console.error("[brain search]", String(e).slice(0, 200)); }
  const n = q.toLowerCase();
  return [...mirror.values()].filter((x) => x.markdown.toLowerCase().includes(n) || x.page.title.toLowerCase().includes(n)).slice(0, 10)
    .map((x) => ({ slug: x.page.slug, title: x.page.title, excerpt: x.page.excerpt }));
}

export function remember(title: string, content: string) {
  const slug = `notes/${slugify(title)}`;
  setPage(slug, title, "note", front(title, "note") + `# ${title}\n\n${content}\n\nSaved by the agent on ${new Date().toISOString().slice(0, 10)}. Related: [[company/lumen-labs]]\n`);
  return slug;
}

export function learn(vendor: string, category: Category, reason: string) {
  learned.set(vendor.toLowerCase(), { category, reason, at: new Date().toISOString().slice(0, 10) });
  state.rederive(); // triggers renderAll -> vendor page + policies page rewritten in GBrain
}

export function review(id: string, note = "") {
  if (!state.txns.some((t) => t.id === id)) return null;
  reviewed.set(id, { note, at: new Date().toISOString().slice(0, 10) });
  state.rederive(); // re-derives flags + insights, rewrites the vendor page and policies page in GBrain
  return state.txns.find((t) => t.id === id)!;
}

let timer: Timer | undefined;
export function initBrain() {
  state.onChange(() => { clearTimeout(timer); timer = setTimeout(renderAll, 300); });
  // Load learned rules persisted from earlier runs, then render + write everything.
  gbrain(["get", "policies/categorization-rules"]).then((md) => {
    const m = md.match(/```json learned-rules\n([\s\S]*?)\n```/);
    if (m) for (const [k, v] of Object.entries(JSON.parse(m[1]!))) learned.set(k, v as any);
    const r = md.match(/```json reviewed-txns\n([\s\S]*?)\n```/);
    if (r) for (const [k, v] of Object.entries(JSON.parse(r[1]!))) reviewed.set(k, v as any);
    if (learned.size || reviewed.size) { console.log(`[brain] loaded ${learned.size} learned rules, ${reviewed.size} reviews`); state.rederive(); }
  }).catch(() => {}).finally(renderAll);
  // Include pre-existing notes (from the agent) in the mirror listing.
  loadNotes();
}

// Notes written by the agent (remember tool) in earlier runs: list them, then pull each page's markdown.
async function loadNotes() {
  for (let i = 0; i < 4; i++) {
    try {
      const out = await gbrain(["list", "--type", "note", "--limit", "200"]);
      for (const line of out.trim().split("\n")) {
        const [slug, , , title] = line.split("\t");
        if (!slug?.startsWith("notes/") || mirror.has(slug)) continue;
        let md = "";
        for (let j = 0; j < 4 && !md; j++) md = await gbrain(["get", slug]).catch(() => Bun.sleep(1500).then(() => ""));
        const body = md.replace(/^---[\s\S]*?---\n/, "").replace(/[#*|>\[\]`_-]/g, " ").replace(/\s+/g, " ").trim();
        const updatedAt = md.match(/updated(?:_at)?: '?([^'\n]+)/)?.[1] ?? new Date().toISOString();
        mirror.set(slug, { page: { slug, title: title ?? slug, type: "note", updatedAt, excerpt: body.slice(0, 180) }, markdown: md });
      }
      return;
    } catch (e) { console.error("[brain] loading notes, retrying:", String(e).slice(0, 120)); await Bun.sleep(2000 * (i + 1)); }
  }
}
export const mirrorHas = (slug: string) => mirror.has(slug);
void contractors;
