import type { Category, FranchiseTax, Insight, MonthStat, Summary, TaxEvent, TaxOverview, Txn, VendorStat, Provider } from "../../shared/types";
import { ASOF, CAP_TABLE, HEADCOUNT, MONTHS } from "./mock";
import { CONTRACTOR_W9, SAAS_LOGINS, days } from "./rules";

const NON_SPEND: Category[] = ["Transfers", "Revenue", "Interest"];
const r0 = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;
export const usd = (n: number) => (n < 0 ? "-" : "") + "$" + Math.abs(Math.round(n)).toLocaleString("en-US");

export function monthStats(txns: Txn[]): MonthStat[] {
  return MONTHS.map((month) => {
    const ts = txns.filter((t) => t.date.startsWith(month));
    const revenue = ts.filter((t) => t.amount > 0 && (t.category === "Revenue" || t.category === "Interest")).reduce((a, t) => a + t.amount, 0);
    const byCategory: Partial<Record<Category, number>> = {};
    let expenses = 0;
    for (const t of ts) {
      if (NON_SPEND.includes(t.category)) continue;
      byCategory[t.category] = r0((byCategory[t.category] ?? 0) - t.amount);
      expenses -= t.amount;
    }
    return { month, revenue: r0(revenue), expenses: r0(expenses), net: r0(revenue - expenses), byCategory };
  });
}

export function vendorStats(txns: Txn[]): VendorStat[] {
  const map = new Map<string, { category: Category; months: number[] }>();
  for (const t of txns) {
    if (NON_SPEND.includes(t.category)) continue;
    const i = MONTHS.indexOf(t.date.slice(0, 7));
    if (i < 0) continue;
    const v = map.get(t.vendor) ?? { category: t.category, months: Array(12).fill(0) };
    v.months[i] -= t.amount;
    map.set(t.vendor, v);
  }
  return [...map].map(([vendor, v]) => {
    const sparkline = v.months.map(r0);
    const avg3 = (sparkline[8]! + sparkline[9]! + sparkline[10]!) / 3;
    return {
      vendor, category: v.category, sparkline,
      total12mo: r0(sparkline.reduce((a, b) => a + b, 0)),
      lastMonth: sparkline[11]!,
      changePct: avg3 ? r1(((sparkline[11]! - avg3) / avg3) * 100) : 0,
    };
  }).sort((a, b) => b.total12mo - a.total12mo);
}

export interface Balances { mercuryChecking: number; mercuryTreasury: number; brex: number; ramp: number }

export function franchiseTax(grossAssets: number): FranchiseTax & { assumedPar: number; apvc: number } {
  const { authorizedShares: A, issuedShares: I, parValue } = CAP_TABLE;
  const fee = 50;
  let auth = A <= 5000 ? 175 : A <= 10000 ? 250 : 250 + Math.ceil((A - 10000) / 10000) * 85;
  auth = Math.min(auth, 200_000);
  const assumedPar = Math.max(grossAssets / I, parValue);
  const apvc = assumedPar * A;
  const par = Math.min(Math.max(Math.ceil(apvc / 1_000_000) * 400, 400), 200_000);
  return {
    authorizedShares: A, issuedShares: I, grossAssets: r0(grossAssets),
    authorizedSharesMethod: auth + fee, assumedParValueMethod: par + fee, savings: auth - par,
    assumedPar: Math.round(assumedPar * 10000) / 10000, apvc: r0(apvc),
  };
}

function addDays(date: string, n: number) {
  return new Date(Date.parse(date) + n * 86_400_000).toISOString().slice(0, 10);
}

export function core(txns: Txn[], bal: Balances) {
  const months = monthStats(txns);
  const cash = bal.mercuryChecking + bal.mercuryTreasury;
  const last3 = months.slice(-3);
  const burnLast = months[11]!.expenses - months[11]!.revenue;
  const avg3 = last3.reduce((a, m) => a + (m.expenses - m.revenue), 0) / 3;
  const runway = cash / avg3;
  const mrrOf = (ym: string) => txns.filter((t) => t.category === "Revenue" && t.source === "stripe" && t.date.startsWith(ym)).reduce((a, t) => a + t.amount, 0)
    || txns.filter((t) => t.category === "Revenue" && t.date.startsWith(ym)).reduce((a, t) => a + t.amount, 0);
  const mrr = mrrOf(MONTHS[11]!), mrrPrev = mrrOf(MONTHS[10]!);
  // Gross assets at Dec 31: projected cash after 3 more months of burn + hardware and deposits
  const hardware = txns.filter((t) => t.category === "Hardware").reduce((a, t) => a - t.amount, 0);
  const grossAssets = Math.max(cash - 3 * avg3, 0) + hardware + 13_000;
  return { months, cash, burnLast, avg3, runway, zeroCashDate: addDays(ASOF, Math.round(runway * 30.44)), mrr, mrrPrev, grossAssets };
}

export function contractors(txns: Txn[]) {
  const paid = new Map<string, number>();
  for (const t of txns) if (t.flags.includes("1099") && t.date >= "2026-01-01" && t.amount < 0) paid.set(t.vendor, (paid.get(t.vendor) ?? 0) - t.amount);
  return [...paid].filter(([, p]) => p > 600).map(([name, p]) => ({ name, paid: r0(p), w9: CONTRACTOR_W9[name] ?? false })).sort((a, b) => b.paid - a.paid);
}

export function summary(txns: Txn[], bal: Balances): Summary {
  const c = core(txns, bal);
  const vendors = vendorStats(txns).filter((v) => !["Payroll", "Payroll Taxes"].includes(v.category));
  const aws = vendors.find((v) => v.vendor === "AWS");
  const insights: Insight[] = [];
  if (aws) {
    const pct = Math.round(((aws.sparkline[11]! - aws.sparkline[8]!) / aws.sparkline[8]!) * 100);
    insights.push({ id: "aws-spike", severity: "warn", title: `AWS spend up ${pct}% since July`, body: `GPU instances (EC2 p4d) came online in July. ${usd(aws.sparkline[11]!)} in September vs ${usd(aws.sparkline[8]!)} in June. Reserved capacity or spot could cut this ~30%.`, metric: `${usd(aws.lastMonth)}/mo` });
  }
  const dups = txns.filter((t) => t.flags.includes("duplicate"));
  for (const d of dups.slice(0, 1)) insights.push({ id: "duplicate", severity: "warn", title: `Duplicate ${d.vendor} charge: ${usd(-d.amount)}`, body: `${d.vendor} billed ${usd(-d.amount)} twice (${d.date}, ${d.account}). Ask for a refund.`, metric: usd(-d.amount) });
  const ft = franchiseTax(c.grossAssets);
  insights.push({ id: "franchise-tax", severity: "warn", title: `Delaware will bill you ${usd(ft.authorizedSharesMethod)}. You actually owe ~${usd(ft.assumedParValueMethod)}`, body: `Delaware's notice uses the authorized-shares method (10M shares). File with the assumed par value method using ${usd(ft.grossAssets)} of gross assets and save ${usd(ft.savings)}. Due Mar 1, 2027.`, metric: `save ${usd(ft.savings)}` });
  const sf = vendors.find((v) => v.vendor === "Salesforce");
  if (sf && SAAS_LOGINS.Salesforce === 0) insights.push({ id: "unused-saas", severity: "warn", title: `Salesforce: ${usd(sf.lastMonth)}/mo, 0 logins`, body: `10 seats since April, zero SSO logins in 90 days. Cancelling saves ${usd(sf.lastMonth * 12)}/yr.`, metric: `${usd(sf.total12mo)} spent` });
  const noReceipt = txns.filter((t) => t.flags.includes("missing_receipt"));
  if (noReceipt.length) insights.push({ id: "receipts", severity: "info", title: `${noReceipt.length} transactions missing receipts`, body: `${usd(noReceipt.reduce((a, t) => a - t.amount, 0))} of card spend has no receipt: ${[...new Set(noReceipt.map((t) => t.vendor))].join(", ")}.`, metric: `${noReceipt.length} txns` });
  const unusual = txns.filter((t) => t.flags.includes("unusual")).sort((a, b) => a.amount - b.amount)[0];
  if (unusual) insights.push({ id: "unusual", severity: "warn", title: `Unusual ${usd(-unusual.amount)} payment to ${unusual.vendor}`, body: `${unusual.description} on ${unusual.date}. ${unusual.note?.split(". ")[0] ?? ""}. Category: ${unusual.category}.`, metric: usd(-unusual.amount) });
  const growth = c.mrrPrev ? ((c.mrr - c.mrrPrev) / c.mrrPrev) * 100 : 0;
  insights.push({ id: "mrr", severity: "good", title: `MRR up ${Math.round(growth)}% month over month`, body: `Stripe MRR is ${usd(c.mrr)}, up from ${usd(c.months[0]!.revenue > 0 ? txns.filter((t) => t.category === "Revenue" && t.date.startsWith(MONTHS[0]!)).reduce((a, t) => a + t.amount, 0) : 0)} a year ago.`, metric: `${usd(c.mrr)} MRR` });
  const missingW9 = contractors(txns).filter((x) => !x.w9);
  if (missingW9.length) insights.push({ id: "w9", severity: "warn", title: `${missingW9[0]!.name} has no W-9 on file`, body: `Paid ${usd(missingW9[0]!.paid)} this year. You need a W-9 to file their 1099-NEC by Jan 31, 2027.`, metric: usd(missingW9[0]!.paid) });
  if (c.runway < 12) insights.splice(0, 0, { id: "runway", severity: "warn", title: `${r1(c.runway)} months of runway`, body: `At ${usd(c.avg3)}/mo net burn, cash hits zero around ${c.zeroCashDate}. Start the Series A process by ${addDays(ASOF, Math.round((c.runway - 6) * 30.44)).slice(0, 7)}.`, metric: `${r1(c.runway)} mo` });
  return {
    company: { name: "Lumen Labs", legalName: "Lumen Labs, Inc.", state: "Delaware", incorporated: "2025-02-14", stage: "Seed", employees: HEADCOUNT[11]! },
    asOf: ASOF,
    cash: {
      total: r0(c.cash),
      byAccount: [
        { provider: "mercury", name: "Mercury Checking ••4821", balance: r0(bal.mercuryChecking) },
        { provider: "mercury", name: "Mercury Treasury ••7730", balance: r0(bal.mercuryTreasury) },
      ],
    },
    months: c.months,
    burn: { lastMonth: r0(c.burnLast), avg3mo: r0(c.avg3) },
    runwayMonths: r1(c.runway),
    zeroCashDate: c.zeroCashDate,
    mrr: r0(c.mrr),
    mrrGrowthPct: r1(growth),
    topVendors: vendors.slice(0, 12),
    insights: insights.slice(0, 8),
  };
}

export function taxes(txns: Txn[], bal: Balances): TaxOverview {
  const c = core(txns, bal);
  const ft = franchiseTax(c.grossAssets);
  const payrollTax = (from: string, to: string) => r0(txns.filter((t) => t.category === "Payroll Taxes" && t.date >= from && t.date <= to).reduce((a, t) => a - t.amount, 0));
  const q3 = payrollTax("2026-07-01", "2026-09-30");
  const cs = contractors(txns);
  const E = (id: string, date: string, title: string, authority: TaxEvent["authority"], description: string, form?: string, amount?: number, done?: boolean): TaxEvent => {
    const d = days(ASOF, date);
    const status: TaxEvent["status"] = done ? "done" : d < 0 ? "overdue" : d <= 30 ? "due_soon" : "upcoming";
    return { id, date, title, authority, form, amount, status, description };
  };
  const events: TaxEvent[] = [
    E("941-q2", "2026-07-31", "Q2 payroll tax return", "IRS", "Quarterly report of wages and withholding. Gusto filed it; deposits already covered the tax.", "Form 941", payrollTax("2026-04-01", "2026-06-30"), true),
    E("de9-q2", "2026-07-31", "California Q2 payroll report", "California", "EDD quarterly wage report. Gusto filed it.", "DE 9", undefined, true),
    E("est-q3", "2026-09-15", "Federal estimated tax, Q3", "IRS", "No payment needed: Lumen Labs has a net operating loss, so there is no income tax to prepay.", "Form 1120-W", 0, true),
    E("w9-priya", "2026-09-15", "Collect W-9 from Priya Raman", "Other", `Priya was paid ${usd(cs.find((x) => x.name === "Priya Raman")?.paid ?? 0)} this year with no W-9 on file. Without it you can't file her 1099 and may owe 24% backup withholding.`, "W-9"),
    E("941-q3", "2026-10-31", "Q3 payroll tax return", "IRS", "Quarterly federal payroll return. Gusto files it automatically; confirm the deposits match.", "Form 941", q3),
    E("de9-q3", "2026-10-31", "California Q3 payroll report", "California", "EDD quarterly wage report. Gusto files it.", "DE 9"),
    E("est-q4", "2026-12-15", "Federal estimated tax, Q4", "IRS", "Likely $0: the company is loss-making. Skip unless you turn a profit.", "Form 1120-W", 0),
    E("1099", "2027-01-31", "1099-NEC for contractors", "IRS", `Send 1099-NEC to everyone paid over $600 in 2026: ${cs.map((x) => x.name).join(", ")}. Lawyers count too.`, "1099-NEC"),
    E("w2", "2027-01-31", "W-2s to employees", "Payroll", "Gusto generates and files W-2s for all 9 employees.", "W-2 / W-3"),
    E("940", "2027-01-31", "Annual federal unemployment tax", "IRS", "FUTA return. Usually $42 per employee; Gusto files it.", "Form 940", 42 * HEADCOUNT[11]!),
    E("941-q4", "2027-01-31", "Q4 payroll tax return", "IRS", "Quarterly federal payroll return, filed by Gusto.", "Form 941"),
    E("3921", "2027-01-31", "ISO exercise reporting", "IRS", "Only if an employee exercised incentive stock options in 2026. Carta can generate it.", "Form 3921"),
    E("ca-soi", "2027-02-28", "California Statement of Information", "California", "Every two years, update your officers and address with the CA Secretary of State ($25). Foreign corps registered in CA file too.", "Form SI-550", 25),
    E("sf-gr", "2027-02-28", "San Francisco annual business tax return", "Other", "SF gross receipts tax filing. Likely exempt under the small business threshold, but you still have to file.", "SF ABT"),
    E("de-franchise", "2027-03-01", "Delaware franchise tax + annual report", "Delaware", `Delaware's notice will say ${usd(ft.authorizedSharesMethod)} (authorized-shares method). Recalculate with the assumed par value method and pay ${usd(ft.assumedParValueMethod)}.`, "Annual Franchise Tax Report", ft.assumedParValueMethod),
    E("1120", "2027-04-15", "Federal corporate income tax return", "IRS", "Annual C-corp return. You owe $0 with a loss, but must file (or extend with Form 7004).", "Form 1120", 0),
    E("6765", "2027-04-15", "R&D tax credit", "IRS", `Claim up to $500k/yr against payroll taxes as a qualified small business. Engineering wages make you eligible for roughly ${usd(0.066 * 900_000)}.`, "Form 6765", -Math.round(0.066 * 900_000)),
    E("ca-100", "2027-04-15", "California corporate tax return", "California", "California charges an $800 minimum franchise tax even with no profit.", "Form 100", 800),
    E("ca-100es", "2027-04-15", "California estimated tax (2027)", "California", "First installment of next year's $800 minimum.", "Form 100-ES", 800),
    E("941-q1", "2027-04-30", "Q1 payroll tax return", "IRS", "Quarterly federal payroll return, filed by Gusto.", "Form 941"),
    E("sf-reg", "2027-05-31", "San Francisco business registration renewal", "Other", "Annual SF business registration fee, based on payroll/gross receipts.", "SF Business Registration", 250),
    E("est-q2-27", "2027-06-15", "Federal estimated tax, Q2 2027", "IRS", "Only needed if you become profitable.", "Form 1120-W", 0),
    E("941-q2-27", "2027-07-31", "Q2 payroll tax return", "IRS", "Quarterly federal payroll return, filed by Gusto.", "Form 941"),
    E("est-q3-27", "2027-09-15", "Federal estimated tax, Q3 2027", "IRS", "Only needed if you become profitable.", "Form 1120-W", 0),
  ].filter((e) => days(addDays(ASOF, -92), e.date) >= 0 && days(e.date, addDays(ASOF, 366)) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const payroll12 = txns.filter((t) => t.category === "Payroll Taxes").reduce((a, t) => a - t.amount, 0);
  return {
    events,
    franchiseTax: { authorizedShares: ft.authorizedShares, issuedShares: ft.issuedShares, grossAssets: ft.grossAssets, authorizedSharesMethod: ft.authorizedSharesMethod, assumedParValueMethod: ft.assumedParValueMethod, savings: ft.savings },
    contractors1099: cs,
    estimatedTaxYear: { federal: 0, state: 800, payroll: r0(payroll12) },
  };
}

export function scenario(txns: Txn[], bal: Balances, o: { extra_monthly_spend?: number; new_hires?: number; salary_per_hire?: number; revenue_growth_pct?: number }) {
  const c = core(txns, bal);
  const hires = o.new_hires ?? 0, salary = o.salary_per_hire ?? 160_000;
  const addSpend = (o.extra_monthly_spend ?? 0) + (hires * salary * 1.25) / 12; // 25% load for taxes/benefits
  const last3 = c.months.slice(-3);
  const expenses = last3.reduce((a, m) => a + m.expenses, 0) / 3 + addSpend;
  let revenue = last3.reduce((a, m) => a + m.revenue, 0) / 3;
  const g = (o.revenue_growth_pct ?? 0) / 100;
  const newBurn = expenses - revenue;
  let cash = c.cash, months = 0;
  while (cash > 0 && months < 120) {
    const net = expenses - revenue;
    if (net <= 0) { months = Infinity; break; }
    if (cash < net) { months += cash / net; cash = 0; break; }
    cash -= net; months++; revenue *= 1 + g;
  }
  return {
    baseline: { burn: r0(c.avg3), runwayMonths: r1(c.runway), zeroCashDate: c.zeroCashDate },
    scenario: {
      addedMonthlySpend: r0(addSpend), burn: r0(newBurn),
      runwayMonths: months === Infinity ? null : r1(months),
      zeroCashDate: months === Infinity || months >= 120 ? "default alive" : addDays(ASOF, Math.round(months * 30.44)),
    },
  };
}
