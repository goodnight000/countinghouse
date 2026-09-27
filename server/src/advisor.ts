// CFO advisor: rule-based recommendations from the live ledger, optionally rewritten by an LLM
// (OpenAI, background single-flight, grounded against the ledger). Handlers never wait on the model.
import type { Advice, AdviceStatus, Recommendation, RunwayWhatIf, Txn } from "../../shared/types";
import * as state from "./state";
import { addDays, core, franchiseTax, scenario, taxes, usd, vendorStats } from "./derive";
import { SAAS_LOGINS } from "./rules";
import { ASOF, HEADCOUNT } from "./mock";
import { front, putPage, slugify } from "./brain";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";

type Rec = Omit<Recommendation, "status" | "decidedAt">;
type Base = { generatedAt: string; source: "ai" | "rules"; model: string | null; headline: string; recommendations: Rec[] };
type Balances = typeof state.balances;

const FILE = join(import.meta.dir, "../data/advisor.json");
const MODEL = process.env.ADVISOR_MODEL ?? "gpt-6-luna";
const r1 = (n: number) => Math.round(n * 10) / 10;
const mon = (d: string) => new Date(d.slice(0, 7) + "-15T12:00:00Z").toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

let current: Base | null = null;
const decisions = new Map<string, { status: AdviceStatus; at: string }>();
let inflight: Promise<void> | null = null;
let factsHash = "";
let lastError: string | null = null;
let stale = false;

try {
  if (existsSync(FILE)) {
    const d = JSON.parse(readFileSync(FILE, "utf8"));
    factsHash = d.factsHash ?? "";
    current = d.advice ?? null;
    lastError = d.error ?? null;
    for (const [k, v] of Object.entries(d.decisions ?? {})) decisions.set(k, v as any);
  }
} catch (e) { console.error("[advisor] could not load cache", e); }

function persist() {
  try {
    mkdirSync(dirname(FILE), { recursive: true });
    void Bun.write(FILE, JSON.stringify({ factsHash, advice: current, error: lastError, decisions: Object.fromEntries(decisions) }, null, 2));
  } catch (e) { console.error("[advisor] persist failed", e); }
}

const hashOf = (txns: Txn[], bal: Balances) => {
  const c = core(txns, bal);
  return String(Bun.hash(JSON.stringify([Math.round(c.cash), Math.round(c.avg3), Math.round(c.mrr), vendorStats(txns).map((v) => [v.vendor, v.lastMonth])])));
};

// ---------- rules ----------
export function rulesAdvice(txns: Txn[], bal: Balances): Rec[] {
  const c = core(txns, bal);
  const vs = vendorStats(txns);
  const V = (name: string) => vs.find((v) => v.vendor === name);
  const ids = (vendor: string, n = 99) => txns.filter((t) => t.vendor === vendor && t.amount < 0).slice(0, n).map((t) => t.id);
  const out: Rec[] = [];
  const add = (r: Omit<Rec, "annualSavings">) => out.push({ ...r, monthlySavings: Math.max(0, Math.round(r.monthlySavings)), oneTimeCash: Math.max(0, Math.round(r.oneTimeCash)), annualSavings: Math.max(0, Math.round(r.monthlySavings)) * 12 });

  const sf = V("Salesforce");
  if (sf && SAAS_LOGINS.Salesforce === 0) add({ id: "cut:salesforce", kind: "cut", title: `Cancel Salesforce: ${usd(sf.lastMonth)}/mo with zero logins`, rationale: `Salesforce bills ${usd(sf.lastMonth)}/mo (${usd(sf.total12mo)} so far) for 10 Sales Cloud seats bought in April, and SSO shows 0 logins in the last 90 days.`, monthlySavings: sf.lastMonth, oneTimeCash: 0, confidence: "high", effort: "low", evidence: { vendors: ["Salesforce"], txnIds: ids("Salesforce") }, action: "Cancel the 10 Sales Cloud seats before the next renewal on the 6th." });

  const dups = txns.filter((t) => t.flags.includes("duplicate"));
  if (dups.length) {
    const orig = dups.map((t) => t.note?.match(/duplicate of (\S+)/)?.[1]).filter((x): x is string => !!x);
    const amt = dups.reduce((a, t) => a - t.amount, 0);
    const v = dups[0]!.vendor;
    add({ id: `cut:${slugify(v)}-duplicate`, kind: "cut", title: `Get the duplicate ${v} charge refunded (${usd(amt)})`, rationale: `${v} billed ${usd(-dups[0]!.amount)} twice within three days on ${dups[0]!.account} (${dups[0]!.date}). It is a one-off billing error, not recurring spend.`, monthlySavings: 0, oneTimeCash: amt, confidence: "high", effort: "low", evidence: { vendors: [v], txnIds: [...dups.map((t) => t.id), ...orig] }, action: `Ask ${v} support to refund the ${new Date(dups[0]!.date + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })} charge.` });
  }

  const aws = V("AWS");
  if (aws) add({ id: "renegotiate:aws", kind: "renegotiate", title: "Commit to an AWS Savings Plan and move training to Spot", rationale: `AWS is ${usd(aws.lastMonth)}/mo, up from ${usd(aws.sparkline[6]!)} in April. Cost Explorer shows GPU p4d instances are 58% of the bill since July; a 1-year Compute Savings Plan plus Spot for batch jobs typically cuts ~30%.`, monthlySavings: 0.3 * aws.lastMonth, oneTimeCash: 0, confidence: "medium", effort: "medium", evidence: { vendors: ["AWS"], txnIds: ids("AWS", 3) }, action: "Buy a 1-year Compute Savings Plan for the steady p4d baseline and move batch training to Spot." });

  const ai = ["OpenAI", "Anthropic"].filter((n) => V(n));
  if (ai.length) {
    const spend = ai.reduce((a, n) => a + V(n)!.lastMonth, 0);
    add({ id: "renegotiate:ai-apis", kind: "renegotiate", title: `Cut AI API spend ~20% (${ai.join(" + ")}: ${usd(spend)}/mo)`, rationale: `${ai.map((n) => `${n} ${usd(V(n)!.lastMonth)}`).join(" and ")} last month, growing every month. Prompt caching, the Batch API (50% off for async jobs) and a committed-use discount usually save 20% or more.`, monthlySavings: 0.2 * spend, oneTimeCash: 0, confidence: "medium", effort: "medium", evidence: { vendors: ai, txnIds: ai.flatMap((n) => ids(n, 3)) }, action: "Turn on prompt caching, move offline evals to the Batch API, and ask both vendors for committed-use pricing." });
  }

  const dd = V("Datadog");
  if (dd && dd.lastMonth > 120) add({ id: "build:datadog", kind: "build", title: "Replace Datadog with self-hosted Grafana + Prometheus", rationale: `Datadog is ${usd(dd.lastMonth)}/mo and climbing with usage. Moving to Grafana Cloud free tier plus self-hosted Prometheus (~$120/mo) takes about 4 engineer-days (~$3,100 of loaded salary), pays back in ~4 months.`, monthlySavings: dd.lastMonth - 120, oneTimeCash: 0, confidence: "medium", effort: "medium", evidence: { vendors: ["Datadog"], txnIds: ids("Datadog", 3) }, action: "Have one engineer spike Grafana + Prometheus for a week, then cancel Datadog." });

  const pilot = V("Pilot");
  if (pilot && pilot.lastMonth > 250) add({ id: "build:pilot", kind: "build", title: "Drop Pilot bookkeeping; keep a CPA for the returns", rationale: `Pilot costs ${usd(pilot.lastMonth)}/mo. Countinghouse already categorizes every transaction and closes the books monthly (months/* pages); a CPA at ~$250/mo covers Form 1120 and CA Form 100.`, monthlySavings: pilot.lastMonth - 250, oneTimeCash: 0, confidence: "medium", effort: "low", evidence: { vendors: ["Pilot"], txnIds: ids("Pilot", 3) }, action: "Give Pilot 30 days notice and engage a CPA for the annual returns only." });

  const li = V("LinkedIn Ads");
  if (li && li.lastMonth > 4000) add({ id: "cut:linkedin-ads", kind: "cut", title: `Cap LinkedIn Ads at $4,000/mo (now ${usd(li.lastMonth)})`, rationale: `LinkedIn Ads grew from ${usd(li.sparkline[5]!)} in March to ${usd(li.lastMonth)} last month, and nothing in the ledger ties it to revenue: there is no attribution data.`, monthlySavings: li.lastMonth - 4000, oneTimeCash: 0, confidence: "low", effort: "low", evidence: { vendors: ["LinkedIn Ads"], txnIds: ids("LinkedIn Ads", 3) }, action: "Set a $4,000 monthly campaign cap until attribution shows which campaigns close deals." });

  const month = ASOF.slice(0, 7);
  const ent = txns.filter((t) => t.date.startsWith(month) && /STRIPE CHARGE .* - Enterprise plan/.test(t.description));
  if (ent.length) {
    const sum = ent.reduce((a, t) => a + t.amount, 0);
    const save = sum * 0.029 - ent.length * 5;
    if (save > 0) add({ id: "revenue:stripe-ach", kind: "revenue", title: `Move ${ent.length} Enterprise customers to ACH invoicing`, rationale: `${ent.length} Enterprise plans pay ${usd(sum)}/mo by card at 2.9%. ACH Direct Debit costs about $5 per payment, keeping ~${usd(save)}/mo more of revenue.`, monthlySavings: save, oneTimeCash: 0, confidence: "medium", effort: "low", evidence: { vendors: ["Stripe"], txnIds: ent.map((t) => t.id) }, action: "Switch Enterprise customers to Stripe ACH Direct Debit invoices at their next renewal." });
  }

  const g = c.mrrPrev ? c.mrr / c.mrrPrev - 1 : 0;
  if (c.mrr > 0 && g > 0) {
    const m = Math.log(83_333 / c.mrr) / Math.log(1 + g);
    const prep = mon(addDays(ASOF, Math.round((c.runway - 9) * 30.44)));
    const open = mon(addDays(ASOF, Math.round(m * 30.44)));
    add({ id: "timing:series-a", kind: "timing", title: `Start Series A prep in ${prep}`, rationale: `MRR is ${usd(c.mrr)} growing ${Math.round(g * 100)}% a month, so it clears $83k ($1M ARR) in about ${r1(m)} months. Runway is ${r1(c.runway)} months, so prep must start 9 months before cash runs out.`, monthlySavings: 0, oneTimeCash: 0, confidence: "medium", effort: "high", evidence: { vendors: [], txnIds: [] }, action: `Start Series A prep in ${prep}; open the process when MRR clears $83k (around ${open}).` });
  }

  const hire = scenario(txns, bal, { new_hires: 1 });
  if (hire.scenario.runwayMonths != null) {
    const delta = r1(hire.baseline.runwayMonths - hire.scenario.runwayMonths);
    add({ id: "timing:hiring", kind: "timing", title: "Gate the next hire on the Series A timeline", rationale: `Each $160k engineer adds ${usd(hire.scenario.addedMonthlySpend)}/mo loaded and costs ~${delta} months of runway (${hire.baseline.runwayMonths} -> ${hire.scenario.runwayMonths}). Headcount is ${HEADCOUNT[11]}.`, monthlySavings: 0, oneTimeCash: 0, confidence: "medium", effort: "low", evidence: { vendors: [], txnIds: [] }, action: "Hold new hires until MRR growth confirms the Series A date, or fund them from the cuts above." });
  }

  const tx = taxes(txns, bal);
  const rd = tx.events.find((e) => e.id === "6765");
  if (rd?.amount) add({ id: "compliance:rd-credit", kind: "compliance", title: `Claim the R&D tax credit (~${usd(Math.abs(rd.amount))})`, rationale: `Engineering wages qualify Lumen Labs for roughly ${usd(Math.abs(rd.amount))} of R&D credit. As a qualified small business it can offset payroll taxes even with no income tax owed.`, monthlySavings: 0, oneTimeCash: Math.abs(rd.amount), confidence: "medium", effort: "low", evidence: { vendors: ["Gusto"], txnIds: [] }, action: "Have the CPA attach Form 6765 to the 2026 Form 1120 and elect the payroll-tax offset." });

  const ft = franchiseTax(c.grossAssets);
  add({ id: "compliance:delaware", kind: "compliance", title: `File Delaware franchise tax by assumed par value (save ${usd(ft.savings)})`, rationale: `Delaware's notice will ask for ${usd(ft.authorizedSharesMethod)} under the authorized-shares method. The assumed par value method on ${usd(ft.grossAssets)} of gross assets owes ${usd(ft.assumedParValueMethod)}, saving ${usd(ft.savings)}.`, monthlySavings: 0, oneTimeCash: 0, confidence: "high", effort: "low", evidence: { vendors: [], txnIds: [] }, action: "File the annual report with the assumed par value method before Mar 1, 2027." });

  return out;
}

// ---------- what-if ----------
function whatIf(recs: Rec[], c: ReturnType<typeof core>): RunwayWhatIf {
  const monthlySavings = recs.reduce((a, r) => a + r.monthlySavings, 0);
  const oneTimeCash = recs.reduce((a, r) => a + r.oneTimeCash, 0);
  const burn = c.avg3 - monthlySavings;
  const runwayMonths = r1((c.cash + oneTimeCash) / burn);
  return { monthlySavings, oneTimeCash, burn: Math.round(burn), runwayMonths, runwayGained: r1(runwayMonths - r1(c.runway)), zeroCashDate: addDays(ASOF, Math.round(runwayMonths * 30.44)) };
}

function rulesBase(): Base {
  const recs = rulesAdvice(state.txns, state.balances);
  const p = whatIf(recs, core(state.txns, state.balances));
  const c = core(state.txns, state.balances);
  return { generatedAt: new Date().toISOString(), source: "rules", model: null, headline: `${usd(p.monthlySavings)}/mo of burn you can cut. Adopting all of it adds ${r1(p.runwayMonths - r1(c.runway))} months of runway.`, recommendations: recs };
}

// Model prose must never mention the internal rule-based inputs it was given.
const scrub = (s: string) => s.replace(/\b(the )?candidates?(['\u2019]s)?( recommendations?| estimates?)?\b/gi, (m) => (/^T/.test(m) ? "The baseline estimate" : "the baseline estimate"));

export function getAdvice(): Advice {
  try { return buildAdvice(); } catch {
    // Ledger not loaded yet (first sync still running): contract says always 200.
    const zero: RunwayWhatIf = { monthlySavings: 0, oneTimeCash: 0, burn: 0, runwayMonths: 0, runwayGained: 0, zeroCashDate: ASOF };
    return { generatedAt: new Date().toISOString(), source: "rules", model: null, refreshing: true, stale: true, error: null, headline: "Loading the ledger.", baseline: { cash: 0, burn: 0, runwayMonths: 0, zeroCashDate: ASOF }, potential: zero, accepted: zero, recommendations: [] };
  }
}

function buildAdvice(): Advice {
  const base = current ?? rulesBase();
  const c = core(state.txns, state.balances);
  // Rule text is exact ledger math; for recs the model matched to a rule, keep the rule's rationale and action.
  const rules = new Map(base.source === "ai" ? rulesAdvice(state.txns, state.balances).map((r) => [r.id, r]) : []);
  const recs: Recommendation[] = base.recommendations.map((r0) => {
    const m = rules.get(r0.id);
    const r = m ? { ...r0, rationale: m.rationale, action: m.action } : { ...r0, rationale: scrub(r0.rationale), action: scrub(r0.action), title: scrub(r0.title) };
    const d = decisions.get(r.id);
    return d ? { ...r, status: d.status, decidedAt: d.at } : { ...r, status: "open" as const };
  }).sort((a, b) => b.monthlySavings - a.monthlySavings || b.oneTimeCash - a.oneTimeCash);
  return {
    generatedAt: base.generatedAt, source: base.source, model: base.model,
    refreshing: !!inflight, stale, error: lastError, headline: scrub(base.headline),
    baseline: { cash: Math.round(c.cash), burn: Math.round(c.avg3), runwayMonths: r1(c.runway), zeroCashDate: c.zeroCashDate },
    potential: whatIf(recs.filter((r) => r.status !== "dismissed"), c),
    accepted: whatIf(recs.filter((r) => r.status === "accepted"), c),
    recommendations: recs,
  };
}

// ---------- AI ----------
const SYSTEM = `You are the fractional CFO for a seed-stage startup. You get the company's live ledger facts as JSON, plus rule-based baseline recommendations (the "baseline" field). Never mention the baseline, rules, or inputs in any text; write as the CFO speaking directly to the founder.
Return 6-12 concrete recommendations that extend runway: cut unused spend, renegotiate big bills, build cheap replacements, time the fundraise and hiring, capture revenue leakage, and claim tax/compliance savings.
Rules:
- Every number must come from the facts. Never invent vendors or transaction ids; cite only vendors in vendorStats and ids in vendorTxnIds / flagged.
- monthlySavings is the recurring USD/month burn reduction (0 for timing and compliance). oneTimeCash is one-off cash back (refunds, credits).
- rationale: 1-3 plain sentences citing ledger numbers. action: one imperative next step. title under 90 characters.
- When a recommendation matches a baseline one, set subject to the part of its id after ':' so ids stay stable. Otherwise use the vendor name as subject.
- Start Series A prep no later than zero-cash minus 9 months.
- headline: one sentence, no dollar totals.
- Be conservative: prefer the baseline savings estimates unless the facts clearly support a different number.`;

const S = { type: "string" } as const;
const E = (values: string[]) => ({ type: "string", enum: values });
const REC_PROPS = {
  kind: E(["cut", "renegotiate", "build", "timing", "revenue", "compliance"]), subject: S, title: S, rationale: S,
  monthlySavings: { type: "number" }, oneTimeCash: { type: "number" },
  confidence: E(["high", "medium", "low"]), effort: E(["high", "medium", "low"]),
  evidenceVendors: { type: "array", items: S }, evidenceTxnIds: { type: "array", items: S }, action: S,
};
const SCHEMA = {
  type: "object", additionalProperties: false, required: ["headline", "recommendations"],
  properties: {
    headline: S,
    recommendations: { type: "array", items: { type: "object", additionalProperties: false, required: Object.keys(REC_PROPS), properties: REC_PROPS } },
  },
};

export function facts(txns: Txn[], bal: Balances) {
  const c = core(txns, bal);
  const vs = vendorStats(txns);
  const tx = taxes(txns, bal);
  const month = ASOF.slice(0, 7);
  const plans: Record<string, { count: number; mrr: number }> = {};
  for (const t of txns) {
    const m = t.date.startsWith(month) && t.description.match(/STRIPE CHARGE .* - (\w+) plan/);
    if (m) { const p = (plans[m[1]!] ??= { count: 0, mrr: 0 }); p.count++; p.mrr += Math.round(t.amount); }
  }
  const vendorTxnIds: Record<string, string[]> = {};
  for (const t of txns) if (t.amount < 0 && (vendorTxnIds[t.vendor] ??= []).length < 3) vendorTxnIds[t.vendor]!.push(t.id);
  return {
    company: "Lumen Labs, Inc. (seed-stage Delaware C-corp, San Francisco)", asOf: ASOF,
    cash: Math.round(c.cash), burn: { lastMonth: Math.round(c.burnLast), avg3mo: Math.round(c.avg3) },
    runwayMonths: r1(c.runway), zeroCashDate: c.zeroCashDate, mrr: Math.round(c.mrr),
    mrrGrowthPct: c.mrrPrev ? r1((c.mrr / c.mrrPrev - 1) * 100) : 0, headcount: HEADCOUNT[11],
    months: c.months.map((m) => ({ month: m.month, revenue: m.revenue, expenses: m.expenses, byCategory: m.byCategory })),
    vendorStats: vs.map((v) => ({ vendor: v.vendor, category: v.category, lastMonth: v.lastMonth, total12mo: v.total12mo, changePct: v.changePct, sparkline: v.sparkline })),
    saasLogins90d: SAAS_LOGINS,
    flagged: txns.filter((t) => t.flags.some((f) => f !== "1099")).slice(0, 40).map((t) => ({ id: t.id, date: t.date, vendor: t.vendor, amount: t.amount, flags: t.flags, note: t.note?.slice(0, 160) })),
    vendorTxnIds,
    awsNote: txns.find((t) => t.vendor === "AWS")?.note?.split(". Rule")[0],
    franchiseTax: tx.franchiseTax,
    taxEvents: tx.events.filter((e) => e.amount).map((e) => ({ id: e.id, date: e.date, title: e.title, amount: e.amount, status: e.status })),
    contractors1099: tx.contractors1099, stripePlans: plans,
    baseline: rulesAdvice(txns, bal),
  };
}

export async function aiAdvice(f: unknown): Promise<{ headline: string; recommendations: any[] }> {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL, reasoning_effort: "high",
      messages: [{ role: "developer", content: SYSTEM }, { role: "user", content: JSON.stringify(f) }],
      response_format: { type: "json_schema", json_schema: { name: "cfo_advice", strict: true, schema: SCHEMA } },
    }),
    signal: AbortSignal.timeout(180_000),
  });
  const body: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${r.status} ${body.error?.message ?? "request failed"}`);
  const msg = body.choices?.[0]?.message;
  if (msg?.refusal) throw new Error(`refused: ${msg.refusal}`);
  try { return JSON.parse(msg?.content); } catch { throw new Error("model returned invalid JSON"); }
}

// Trust boundary: nothing from the model reaches the UI unless it matches the ledger.
export function ground(raw: { headline: string; recommendations: any[] }, txns: Txn[]): { headline: string; recommendations: Rec[] } {
  const vs = vendorStats(txns);
  const vmap = new Map(vs.map((v) => [v.vendor.toLowerCase(), v]));
  const idset = new Set(txns.map((t) => t.id));
  const seen = new Set<string>();
  const recs: Rec[] = [];
  const LV = ["high", "medium", "low"];
  for (const x of raw?.recommendations ?? []) {
    if (!["cut", "renegotiate", "build", "timing", "revenue", "compliance"].includes(x?.kind)) continue;
    const slug = slugify(String(x.subject ?? ""));
    if (!slug) continue;
    const id = `${x.kind}:${slug}`;
    if (seen.has(id)) continue;
    const vendors = [...new Set((x.evidenceVendors ?? []).map((v: string) => vmap.get(String(v).toLowerCase())?.vendor).filter(Boolean))] as string[];
    const txnIds = [...new Set((x.evidenceTxnIds ?? []).map(String).filter((i: string) => idset.has(i)))] as string[];
    let monthly = Math.max(0, Math.round(Number(x.monthlySavings) || 0));
    if (["cut", "renegotiate", "build"].includes(x.kind) && vendors.length) monthly = Math.min(monthly, vendors.reduce((a, v) => a + vmap.get(v.toLowerCase())!.lastMonth, 0));
    if (x.kind === "timing" || x.kind === "compliance") monthly = 0;
    if (monthly > 0 && !vendors.length && !txnIds.length) continue;
    seen.add(id);
    recs.push({
      id, kind: x.kind, title: String(x.title ?? "").slice(0, 90), rationale: String(x.rationale ?? "").slice(0, 400),
      monthlySavings: monthly, annualSavings: monthly * 12, oneTimeCash: Math.max(0, Math.round(Number(x.oneTimeCash) || 0)),
      confidence: LV.includes(x.confidence) ? x.confidence : "medium", effort: LV.includes(x.effort) ? x.effort : "medium",
      evidence: { vendors, txnIds }, action: String(x.action ?? ""),
    });
  }
  if (recs.length < 3) throw new Error(`only ${recs.length} grounded recommendations`);
  return { headline: String(raw.headline ?? "").slice(0, 200), recommendations: recs };
}

export function refresh(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    let hash = "";
    try {
      hash = hashOf(state.txns, state.balances);
      if (!process.env.OPENAI_API_KEY) {
        current = rulesBase();
        lastError = "OPENAI_API_KEY not set";
      } else {
        const g = ground(await aiAdvice(facts(state.txns, state.balances)), state.txns);
        current = { generatedAt: new Date().toISOString(), source: "ai", model: MODEL, ...g };
        lastError = null;
      }
      factsHash = hash;
      stale = false;
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      console.error(`[advisor] AI run failed: ${lastError}`);
      if (current?.source !== "ai" && hash) { try { current = rulesBase(); factsHash = hash; } catch {} }
    } finally {
      inflight = null;
      persist();
      writeAdvisorPage();
    }
  })();
  return inflight;
}

export function decide(id: string, status: AdviceStatus): Advice | null {
  const base = current ?? rulesBase();
  if (!base.recommendations.some((r) => r.id === id)) return null;
  if (status === "open") decisions.delete(id);
  else decisions.set(id, { status, at: new Date().toISOString() });
  persist();
  writeAdvisorPage();
  return getAdvice();
}

// ---------- GBrain ----------
export function adviceMarkdown(a: Advice = getAdvice()) {
  const cell = (s: string) => s.replace(/\|/g, "/").replace(/\n/g, " ");
  return `# CFO advice (${a.source === "ai" ? a.model : "rule-based"}, ${a.generatedAt})\n\n${a.headline}\n\n` +
    `Potential: ${usd(a.potential.monthlySavings)}/mo, ${usd(a.potential.oneTimeCash)} one-time. Runway ${a.baseline.runwayMonths} -> ${a.potential.runwayMonths} months.\n` +
    `Accepted: ${usd(a.accepted.monthlySavings)}/mo. Runway ${a.accepted.runwayMonths} months.\n\n` +
    `| Id | Status | Kind | Recommendation | $/mo | Confidence | Effort | Next step |\n|---|---|---|---|---|---|---|---|\n` +
    a.recommendations.map((r) => `| ${r.id} | ${r.status} | ${r.kind} | ${cell(r.title)} | ${usd(r.monthlySavings)}${r.oneTimeCash ? ` (+${usd(r.oneTimeCash)} once)` : ""} | ${r.confidence} | ${r.effort} | ${cell(r.action)} |`).join("\n") +
    `\n\n` + a.recommendations.map((r) => `## ${r.title}\n\n${r.rationale}\n\nEvidence: ${[...r.evidence.vendors.map((v) => `[[vendors/${slugify(v)}]]`), "[[company/lumen-labs]]"].join(" · ")}${r.evidence.txnIds.length ? ` (txns ${r.evidence.txnIds.slice(0, 6).join(", ")})` : ""}\n`).join("\n");
}

function writeAdvisorPage() {
  try { putPage("advisor/latest", "CFO advice", "advisor", front("CFO advice", "advisor") + adviceMarkdown()); } catch (e) { console.error("[advisor] page write failed", e); }
}

export function initAdvisor() {
  if (!current || factsHash !== hashOf(state.txns, state.balances)) void refresh();
  else writeAdvisorPage();
  let timer: ReturnType<typeof setTimeout> | undefined;
  state.onChange(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (hashOf(state.txns, state.balances) !== factsHash) { stale = true; void refresh(); }
    }, 5000);
  });
}
