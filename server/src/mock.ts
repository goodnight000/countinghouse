// Deterministic seeded mock data for Lumen Labs, Inc. Emits raw bank/card/processor lines;
// vendor + category come later from the rule table (rules.ts), exactly like live data.
import type { Provider } from "../../shared/types";

export interface RawTxn {
  id: string;
  date: string;
  amount: number;
  description: string;
  source: Provider;
  account: string;
  receipt: boolean;
  note?: string;
}

export const ASOF = "2026-09-27";
export const MONTHS = ["2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"];
export const ACCT = {
  chk: "Mercury Checking ••4821",
  trs: "Mercury Treasury ••7730",
  brex: "Brex Card ••3310",
  ramp: "Ramp Card ••5561",
  stripe: "Stripe Balance",
};
export const PLAN = { month: "2026-09", netBurn: 180_000, mrr: 42_000, note: "Seed plan approved Feb 2026" };
export const HEADCOUNT = [5, 5, 6, 6, 7, 7, 8, 8, 8, 9, 9, 9];
const TARGET_CASH = 2_103_418.27;

export const CAP_TABLE = {
  authorizedShares: 10_000_000,
  issuedShares: 8_000_000,
  parValue: 0.00001,
  stakeholders: [
    { name: "Maya Chen (CEO)", shares: 3_400_000, type: "common" },
    { name: "Dev Patel (CTO)", shares: 3_000_000, type: "common" },
    { name: "Employee option pool (granted)", shares: 420_000, type: "options" },
    { name: "Brightwater Ventures II LP", shares: 900_000, type: "preferred" },
    { name: "Lumen Angels SPV", shares: 280_000, type: "preferred" },
  ],
};

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function generate() {
  const rnd = mulberry32(20250214);
  const jit = (x: number, pct = 0.06) => r2(x * (1 + (rnd() * 2 - 1) * pct));
  const between = (a: number, b: number) => r2(a + rnd() * (b - a));
  const out: RawTxn[] = [];
  let seq = 0;
  const add = (source: Provider, account: string, date: string, amount: number, description: string, receipt = true, note?: string) => {
    out.push({ id: `${source}_${String(++seq).padStart(4, "0")}`, date, amount: r2(amount), description, source, account, receipt, note });
  };

  const MISSING = new Set(["2026-08|DELTA", "2026-08|DOORDASH", "2026-09|AIRBNB", "2026-09|UBER", "2026-07|APPLE", "2026-09|LINKEDIN"]);
  const missing = (ym: string, key: string) => {
    const k = `${ym}|${key}`;
    if (MISSING.has(k)) { MISSING.delete(k); return false; }
    return true;
  };

  const AWS = [5810, 6240, 6630, 7120, 7690, 8210, 8840, 9450, 10290, 12100, 13300, 14200];
  const COOLEY: Record<number, number> = { 0: 3200, 2: 5400, 3: 14800, 4: 3100, 6: 2400, 8: 4600, 10: 3900, 11: 5200 };
  const CUSTOMERS = ["Northwind AI", "Acme Robotics", "Parcel Health", "Brightpath Logistics", "Oakridge Capital", "Tessera Bio", "Halcyon Games", "Mosaic Legal", "Fathom Energy", "Kite Insurance", "Juniper Retail", "Vantage Freight", "Quill Media", "Sable Security", "Orchard Foods"];
  const trsFlows: { date: string; amount: number }[] = [];
  const brexByMonth: number[] = [], rampByMonth: number[] = [];
  const revByMonth: number[] = [];
  let trsBal = 0;

  MONTHS.forEach((ym, m) => {
    const last = ym === "2026-09" ? 27 : new Date(Number(ym.slice(0, 4)), Number(ym.slice(5)), 0).getDate();
    const d = (day: number) => `${ym}-${String(Math.min(day, last)).padStart(2, "0")}`;
    const hc = HEADCOUNT[m]!;
    const newHires = m === 0 ? 2 : hc - HEADCOUNT[m - 1]!;
    const yymmdd = (day: number) => d(day).slice(2).replaceAll("-", "");
    const start = out.length;

    // Cloud & AI
    add("aws", ACCT.chk, d(3), -AWS[m]!, "AMAZON WEB SERVICES AWS.AMAZON.CO WA", true,
      m >= 9 ? "Cost Explorer: EC2 p4d.24xlarge (GPU) is 58% of the bill since July" : "Cost Explorer: EC2 44%, S3 18%, RDS 21%, other 17%");
    add("brex", ACCT.brex, d(5), -jit(1400 + 90 * m), "GOOGLE *CLOUD 7KX2P9 CC@GOOGLE.COM");
    add("brex", ACCT.brex, d(8), -jit(180 + 25 * m, 0.1), "VERCEL INC. VERCEL.COM CA");
    add("brex", ACCT.brex, d(1), -jit(2800 + 480 * m), "OPENAI *API USAGE OPENAI.COM CA");
    add("brex", ACCT.brex, d(2), -jit(1500 + 700 * m), "ANTHROPIC, PBC SAN FRANCISCO CA");
    if (m >= 3) add("brex", ACCT.brex, d(10), -jit(300 + 60 * m), "DATADOG INC NEW YORK NY");
    add("brex", ACCT.brex, d(11), -80, "SENTRY FUNCTIONAL SOFTWARE");

    // Software (seat-based)
    add("brex", ACCT.brex, d(12), -540, "FIGMA MONTHLY RENEWAL FIGMA.COM CA");
    if (ym === "2026-08") add("brex", ACCT.brex, d(13), -540, "FIGMA MONTHLY RENEWAL FIGMA.COM CA");
    add("brex", ACCT.brex, d(14), -hc * 10, "LINEAR ORBIT INC LINEAR.APP");
    add("brex", ACCT.brex, d(16), -hc * 18, "NOTION LABS, INC. NOTION.SO CA");
    add("brex", ACCT.brex, d(18), -hc * 12.5, "SLACK TECHNOLOGIES SLACK.COM CA");
    add("brex", ACCT.brex, d(20), -hc * 21, "GITHUB, INC. GITHUB.COM CA");
    add("brex", ACCT.brex, d(1), -hc * 14.4, "GOOGLE *GSUITE_lumenlabs CC@GOOGLE.COM");
    add("brex", ACCT.brex, d(22), -149.9, "ZOOM.US 888-799-9666 CA");
    add("brex", ACCT.brex, d(9), -r2(hc * 7.99), "1PASSWORD* AGILEBITS TORONTO");
    add("brex", ACCT.brex, d(15), -280, "CARTA INC ESHARES.COM CA");
    if (m >= 6) add("brex", ACCT.brex, d(6), -1800, "SALESFORCE.COM SAN FRANCISCO CA", true, "10 Sales Cloud seats bought in April");
    if (m === 1) add("brex", ACCT.brex, d(9), -1199, "CLERKY INC CLERKY.COM");

    // Rent, services, insurance
    add("mercury", ACCT.chk, d(1), m < 4 ? -4200 : -6500, "WEWORK COMPANIES LLC ACH PMT");
    add("mercury", ACCT.chk, d(5), -1200, "PILOT.COM BOOKKEEPING ACH");
    if (m >= 3) add("mercury", ACCT.chk, d(7), -1150, "EMBROKER INSURANCE SERV ACH");
    if (COOLEY[m]) add("mercury", ACCT.chk, d(20), -COOLEY[m]!, "COOLEY LLP ACH PAYMENT", true, m === 3 ? "Seed financing docs" : undefined);

    // Contractors (1099)
    add("mercury", ACCT.chk, d(28), m < 6 ? -6000 : -7500, `MERCURY ACH JKL DESIGN STUDIO ${yymmdd(28)}`);
    if (m >= 5) add("mercury", ACCT.chk, d(28), -5200, `ACH PAYMENT PRIYA RAMAN ${yymmdd(28)}`);
    if (m >= 2 && m <= 7) add("mercury", ACCT.chk, d(28), -3000, `ACH PAYMENT MARCO DIAZ ${yymmdd(28)}`);

    // Marketing
    if (m >= 5) add("brex", ACCT.brex, d(25), -jit(1800 + 700 * (m - 5)), "LINKEDIN ADS 7XK29 LNKD.IN/BILL", missing(ym, "LINKEDIN"));
    if (m >= 4) add("brex", ACCT.brex, d(27), -jit(1200 + 400 * (m - 4)), "GOOGLE *ADS8812345 CC@GOOGLE.COM");

    // Travel & meals (Ramp)
    for (let i = 0; i < 4 + Math.floor(hc / 2); i++) add("ramp", ACCT.ramp, d(1 + Math.floor(rnd() * 27)), -between(14, 68), "UBER *TRIP HELP.UBER.COM CA", missing(ym, "UBER"));
    for (let i = 0; i < 2; i++) add("ramp", ACCT.ramp, d(1 + Math.floor(rnd() * 27)), -between(12, 45), "LYFT *RIDE SAN FRANCISCO CA");
    for (let i = 0; i < 4; i++) add("ramp", ACCT.ramp, d(1 + Math.floor(rnd() * 27)), -between(18, 95), "DOORDASH*SWEETGREEN SAN FRANCISCO");
    if (m % 3 === 1 || ym === "2026-08") add("ramp", ACCT.ramp, d(19), -between(380, 520), "DOORDASH*TEAM DINNER SAN FRANCISCO", missing(ym, "DOORDASH"));
    for (let i = 0; i < 3; i++) add("ramp", ACCT.ramp, d(1 + Math.floor(rnd() * 27)), -between(6, 24), "BLUE BOTTLE COFFEE SAN FRANCISCO");
    if (m % 2 === 0 || ym === "2026-08") add("ramp", ACCT.ramp, d(17), -between(380, 720), `DELTA AIR ${String(62e11 + m * 7919).slice(0, 13)} ATLANTA`, missing(ym, "DELTA"));
    if (m % 3 === 2) add("ramp", ACCT.ramp, d(21), -between(290, 610), "UNITED 0162345678901 HOUSTON TX");
    if (ym === "2026-03" || ym === "2026-09") add("ramp", ACCT.ramp, d(14), -between(900, 1400), "AIRBNB * HMXYZ12345", missing(ym, "AIRBNB"));

    // Hardware
    if (newHires > 0) add("ramp", ACCT.ramp, d(4), -3299 * newHires, "APPLE.COM/US 800-676-2775 CA", missing(ym, "APPLE"));
    if (ym === "2026-07") add("ramp", ACCT.ramp, d(23), -1599, "APPLE.COM/US 800-676-2775 CA", missing(ym, "APPLE"));

    // Taxes & fees
    if (ym === "2026-02") add("mercury", ACCT.chk, d(26), -450, "DE DIV OF CORPORATIONS FRANCHISE TAX", true, "2025 franchise tax filed with the assumed par value method ($400 + $50 report)");
    if (ym === "2026-04") add("mercury", ACCT.chk, d(15), -800, "FRANCHISE TAX BD CAPAYMENT", true, "California $800 minimum franchise tax");

    // The planted unusual charge
    if (ym === "2026-09") add("mercury", ACCT.chk, d(22), -12000, "WIRE OUT 092226 BRIGHTLINE EVENTS LLC");

    // Revenue: Stripe charges, fees, payout into Mercury
    const mrr = Math.round(8000 * Math.pow(1.16, m) * (1 + (rnd() * 2 - 1) * 0.015));
    const k = Math.min(3 + m, CUSTOMERS.length);
    const weights = CUSTOMERS.slice(0, k).map((_, i) => 1 + ((i * 7) % 5));
    const wsum = weights.reduce((a, b) => a + b, 0);
    let rev = 0;
    weights.forEach((w, i) => {
      const amt = i === k - 1 ? mrr - rev : Math.round((mrr * w) / wsum);
      rev += amt;
      add("stripe", ACCT.stripe, d(1 + ((i * 2) % 26)), amt, `STRIPE CHARGE ${CUSTOMERS[i]} - ${w >= 4 ? "Enterprise" : w >= 2 ? "Team" : "Starter"} plan`);
    });
    revByMonth.push(rev);
    const fees = r2(rev * 0.029 + 0.3 * k);
    add("stripe", ACCT.stripe, d(last), -fees, "STRIPE PROCESSING FEES");
    add("mercury", ACCT.chk, d(28), rev - fees, `STRIPE TRANSFER ST-${(m * 7919 + 1000).toString(36).toUpperCase()} LUMEN LABS INC`, true, "Payout of Stripe revenue already counted from Stripe");

    // Financing + treasury
    if (ym === "2026-01") {
      add("mercury", ACCT.chk, d(16), 2_500_000, "INCOMING WIRE BRIGHTWATER VENTURES II LP", true, "Seed round - financing, not revenue");
      add("mercury", ACCT.chk, d(20), 700_000, "INCOMING WIRE LUMEN ANGELS SPV LLC", true, "Seed round - financing, not revenue");
    }
    if (ym === "2026-02") {
      add("mercury", ACCT.chk, d(3), -2_000_000, "TRANSFER TO MERCURY TREASURY");
      add("mercury", ACCT.trs, d(3), 2_000_000, "TRANSFER FROM MERCURY CHECKING");
      trsBal += 2_000_000;
    }
    if (m >= 6) {
      add("mercury", ACCT.trs, d(1), -150_000, "TRANSFER TO MERCURY CHECKING");
      add("mercury", ACCT.chk, d(1), 150_000, "TRANSFER FROM MERCURY TREASURY");
      trsBal -= 150_000;
    }
    if (trsBal > 0) {
      const interest = r2((trsBal * 0.042) / 12);
      add("mercury", ACCT.trs, d(last), interest, "MERCURY TREASURY INTEREST");
      trsBal += interest;
    }

    // Card payments for the previous month
    const monthLines = out.slice(start);
    brexByMonth.push(-monthLines.filter((t) => t.source === "brex").reduce((a, t) => a + t.amount, 0));
    rampByMonth.push(-monthLines.filter((t) => t.source === "ramp").reduce((a, t) => a + t.amount, 0));
    if (m > 0) {
      add("mercury", ACCT.chk, d(2), -r2(brexByMonth[m - 1]!), "BREX INC PAYMENT");
      add("mercury", ACCT.chk, d(2), -r2(rampByMonth[m - 1]!), "RAMP PAYMENT");
    }
    void trsFlows;
  });

  // Payroll is the plug that gives net burn its target shape (~$120k -> ~$190k).
  MONTHS.forEach((ym, m) => {
    const last = ym === "2026-09" ? 25 : new Date(Number(ym.slice(0, 4)), Number(ym.slice(5)), 0).getDate();
    const lines = out.filter((t) => t.date.startsWith(ym));
    const isFlow = (t: RawTxn) => /TRANSFER|PAYMENT$|INCOMING WIRE|BRIGHTLINE/.test(t.description) && !/COOLEY|ACH PAYMENT/.test(t.description);
    const spend = -lines.filter((t) => t.amount < 0 && !isFlow(t)).reduce((a, t) => a + t.amount, 0);
    const income = lines.filter((t) => t.amount > 0 && (t.source === "stripe" || /INTEREST/.test(t.description))).reduce((a, t) => a + t.amount, 0);
    const netBurn = (120_000 + 70_000 * Math.pow(m / 11, 1.15)) * (1 + (rnd() * 2 - 1) * 0.015);
    const plug = netBurn + income - spend;
    const hc = HEADCOUNT[m]!;
    const fee = 80 + 12 * hc;
    for (const day of [15, last]) {
      const tag = `${ym.slice(2).replace("-", "")}${String(day).padStart(2, "0")}`;
      add("gusto", ACCT.chk, `${ym}-${String(day).padStart(2, "0")}`, -r2(((plug - fee) * 0.8) / 2), `GUSTO NET ${tag} LUMEN LABS INC`, true, `${hc} employees, semi-monthly run`);
      add("gusto", ACCT.chk, `${ym}-${String(day).padStart(2, "0")}`, -r2(((plug - fee) * 0.2) / 2), `GUSTO TAX ${tag} LUMEN LABS INC`, true, "Federal + CA withholding and employer taxes");
    }
    add("gusto", ACCT.chk, `${ym}-${String(last).padStart(2, "0")}`, -fee, `GUSTO FEE ${ym.slice(2).replace("-", "")} LUMEN LABS INC`);
  });

  // Opening balance makes today's cash land on target.
  const mercuryFlow = out.filter((t) => t.account.startsWith("Mercury")).reduce((a, t) => a + t.amount, 0);
  const opening = r2(TARGET_CASH - mercuryFlow);
  const treasury = r2(out.filter((t) => t.account === ACCT.trs).reduce((a, t) => a + t.amount, 0));
  const balances = {
    mercuryChecking: r2(TARGET_CASH - treasury),
    mercuryTreasury: treasury,
    brex: -r2(brexByMonth[11]!),
    ramp: -r2(rampByMonth[11]!),
    opening,
  };
  out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1));
  return { txns: out, balances, revByMonth };
}
