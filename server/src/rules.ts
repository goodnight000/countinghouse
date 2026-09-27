// Out-of-the-box vendor knowledge: raw descriptor pattern -> normalized vendor + category.
// Learned rules (from the MCP recategorize tool, persisted in GBrain) override these.
import type { Category, Flag, Txn } from "../../shared/types";
import type { RawTxn } from "./mock";

export const RULES: [RegExp, string, Category][] = [
  [/AMAZON WEB SERVICES|AWS\.AMAZON|^AWS /i, "AWS", "Cloud & Infra"],
  [/GOOGLE \*CLOUD|GOOGLE CLOUD/i, "Google Cloud", "Cloud & Infra"],
  [/GOOGLE \*ADS|GOOGLE ADS/i, "Google Ads", "Marketing"],
  [/GSUITE|GOOGLE \*WORKSPACE/i, "Google Workspace", "Software"],
  [/VERCEL/i, "Vercel", "Cloud & Infra"],
  [/DATADOG/i, "Datadog", "Cloud & Infra"],
  [/SENTRY/i, "Sentry", "Software"],
  [/OPENAI/i, "OpenAI", "AI & APIs"],
  [/ANTHROPIC/i, "Anthropic", "AI & APIs"],
  [/FIGMA/i, "Figma", "Software"],
  [/LINEAR/i, "Linear", "Software"],
  [/NOTION/i, "Notion", "Software"],
  [/SLACK/i, "Slack", "Software"],
  [/GITHUB/i, "GitHub", "Software"],
  [/ZOOM\.US|ZOOM VIDEO/i, "Zoom", "Software"],
  [/1PASSWORD|AGILEBITS/i, "1Password", "Software"],
  [/SALESFORCE/i, "Salesforce", "Software"],
  [/CARTA|ESHARES/i, "Carta", "Software"],
  [/CLERKY/i, "Clerky", "Legal & Accounting"],
  [/COOLEY/i, "Cooley", "Legal & Accounting"],
  [/PILOT\.COM/i, "Pilot", "Legal & Accounting"],
  [/WEWORK/i, "WeWork", "Rent & Office"],
  [/EMBROKER/i, "Embroker", "Insurance"],
  [/GUSTO TAX/i, "Gusto", "Payroll Taxes"],
  [/GUSTO/i, "Gusto", "Payroll"],
  [/JKL DESIGN/i, "JKL Design Studio", "Contractors"],
  [/PRIYA RAMAN/i, "Priya Raman", "Contractors"],
  [/MARCO DIAZ/i, "Marco Diaz", "Contractors"],
  [/LINKEDIN/i, "LinkedIn Ads", "Marketing"],
  [/UBER/i, "Uber", "Travel & Meals"],
  [/LYFT/i, "Lyft", "Travel & Meals"],
  [/DOORDASH/i, "DoorDash", "Travel & Meals"],
  [/BLUE BOTTLE/i, "Blue Bottle Coffee", "Travel & Meals"],
  [/DELTA AIR/i, "Delta", "Travel & Meals"],
  [/^UNITED \d/i, "United Airlines", "Travel & Meals"],
  [/AIRBNB/i, "Airbnb", "Travel & Meals"],
  [/APPLE\.COM|APPLE STORE/i, "Apple", "Hardware"],
  [/DE DIV OF CORP|DELAWARE/i, "Delaware Division of Corporations", "Taxes & Fees"],
  [/FRANCHISE TAX BD|FTB/i, "California FTB", "Taxes & Fees"],
  [/STRIPE (PROCESSING )?FEES/i, "Stripe", "Bank Fees"],
  [/STRIPE TRANSFER|STRIPE PAYOUT/i, "Stripe", "Transfers"],
  [/STRIPE CHARGE/i, "Stripe", "Revenue"],
  [/TREASURY INTEREST|INTEREST PAYMENT/i, "Mercury", "Interest"],
  [/MERCURY TREASURY|MERCURY CHECKING/i, "Mercury", "Transfers"],
  [/BREX INC PAYMENT|BREX PAYMENT/i, "Brex", "Transfers"],
  [/RAMP PAYMENT/i, "Ramp", "Transfers"],
  [/INCOMING WIRE/i, "Seed investors", "Transfers"],
];

export const CONTRACTOR_W9: Record<string, boolean> = { "JKL Design Studio": true, "Priya Raman": false, "Marco Diaz": true, Cooley: true };
// SSO login counts in the last 90 days (from Google Workspace), used to spot shelfware.
export const SAAS_LOGINS: Record<string, number> = { Salesforce: 0, Figma: 41, Linear: 212, Notion: 305, Slack: 1180, Zoom: 57 };

export interface Learned { category: Category; reason: string; at: string }
export const learned = new Map<string, Learned>(); // key: lowercased vendor

function fallbackVendor(desc: string) {
  const s = desc
    .replace(/^(WIRE OUT|WIRE IN|ACH PAYMENT|MERCURY ACH|POS|SQ \*|TST\*)\s*\d*\s*/i, "")
    .replace(/\b(LLC|INC\.?|CORP|CO|LTD)\b.*$/i, "")
    .replace(/[*#].*$/, "")
    .trim();
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) || desc;
}

export function categorize(raw: RawTxn[]): Txn[] {
  const txns: Txn[] = raw.map((r) => {
    const hit = RULES.find(([re]) => re.test(r.description));
    const vendor = hit ? hit[1] : fallbackVendor(r.description);
    let category: Category = hit ? hit[2] : r.amount > 0 ? "Other" : "Other";
    let note = hit ? `Rule: /${hit[0].source}/ -> ${vendor} (${category})` : "No rule matched: needs a human or the agent to categorize";
    const l = learned.get(vendor.toLowerCase());
    if (l) { category = l.category; note = `Learned rule: ${vendor} -> ${l.category} (${l.reason})`; }
    if (r.note) note = `${r.note}. ${note}`;
    const flags: Flag[] = [];
    if (!r.receipt) flags.push("missing_receipt");
    if (category === "Contractors" || (vendor in CONTRACTOR_W9)) flags.push("1099");
    if (category === "Other" && !l) flags.push("needs_review");
    if (vendor === "Salesforce") flags.push("needs_review");
    return { id: r.id, date: r.date, amount: r.amount, description: r.description, vendor, category, source: r.source, account: r.account, receipt: r.receipt, flags, note };
  });
  // duplicates: same vendor + amount on a card within 3 days
  const asc = [...txns].sort((a, b) => (a.date < b.date ? -1 : 1));
  asc.forEach((t, i) => {
    if (t.amount >= 0 || !/Card/.test(t.account)) return;
    const prev = asc.slice(Math.max(0, i - 60), i).find((p) => p.vendor === t.vendor && p.amount === t.amount && days(p.date, t.date) <= 3);
    if (prev) { t.flags.push("duplicate"); t.note = `Possible duplicate of ${prev.id} on ${prev.date}. ${t.note ?? ""}`; }
  });
  // unusual: a first-time vendor over $5k, or >3x the vendor's typical charge
  const byVendor = new Map<string, number[]>();
  for (const t of txns) if (t.amount < 0) byVendor.set(t.vendor, [...(byVendor.get(t.vendor) ?? []), -t.amount]);
  for (const t of txns) {
    if (t.amount >= 0 || ["Transfers", "Payroll", "Payroll Taxes"].includes(t.category)) continue;
    const hist = byVendor.get(t.vendor)!;
    const med = [...hist].sort((a, b) => a - b)[Math.floor(hist.length / 2)]!;
    if ((hist.length === 1 && -t.amount >= 5000) || (hist.length > 3 && -t.amount > 4 * med && -t.amount > 2000)) {
      t.flags.push("unusual");
      t.note = `Unusual: ${hist.length === 1 ? "first payment ever to this vendor" : `${Math.round(-t.amount / med)}x typical`}. ${t.note ?? ""}`;
    }
  }
  return txns;
}

export const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
