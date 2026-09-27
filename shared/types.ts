// The one contract between server/ (producer) and web/ (consumer). Amounts are USD dollars;
// negative = money out, positive = money in. Dates are "YYYY-MM-DD", months are "YYYY-MM".

export type Provider = "mercury" | "brex" | "ramp" | "stripe" | "gusto" | "aws" | "carta";

export type Category =
  | "Revenue" | "Interest"
  | "Payroll" | "Payroll Taxes" | "Contractors" | "Cloud & Infra" | "AI & APIs" | "Software"
  | "Rent & Office" | "Legal & Accounting" | "Marketing" | "Travel & Meals" | "Hardware"
  | "Insurance" | "Taxes & Fees" | "Bank Fees" | "Transfers" | "Other";

export type Flag = "missing_receipt" | "duplicate" | "unusual" | "needs_review" | "1099";

export interface Integration {
  id: Provider;
  name: string;                 // "Mercury"
  kind: "bank" | "card" | "revenue" | "payroll" | "cloud" | "equity";
  mode: "live" | "mock";        // live when the provider's API key env var is set
  status: "connected" | "syncing" | "error";
  lastSync: string | null;      // ISO timestamp
  records: number;              // records pulled on the last sync
  balance?: number;             // bank/card accounts only
  accountMask?: string;         // "••4821"
}

export interface Txn {
  id: string;
  date: string;
  amount: number;
  description: string;          // raw bank descriptor, e.g. "AWS EMEA *AMAZON WEB SERVICES"
  vendor: string;               // normalized, e.g. "AWS"
  category: Category;
  source: Provider;
  account: string;              // "Mercury Checking ••4821"
  receipt: boolean;
  flags: Flag[];
  note?: string;                // why it was categorized or flagged
}

export interface MonthStat {
  month: string;
  revenue: number;              // positive
  expenses: number;             // positive
  net: number;                  // revenue - expenses
  byCategory: Partial<Record<Category, number>>;  // positive spend per category
}

export interface VendorStat {
  vendor: string;
  category: Category;
  total12mo: number;            // positive
  lastMonth: number;            // positive
  changePct: number;            // last month vs 3-month average
  sparkline: number[];          // 12 monthly totals, oldest first
}

export interface Insight {
  id: string;
  severity: "good" | "info" | "warn";
  title: string;                // "AWS spend up 38% since July"
  body: string;
  metric?: string;              // "$14,210/mo"
}

export interface Summary {
  company: { name: string; legalName: string; state: string; incorporated: string; stage: string; employees: number };
  asOf: string;
  cash: { total: number; byAccount: { provider: Provider; name: string; balance: number }[] };
  months: MonthStat[];          // 12 months, oldest first
  burn: { lastMonth: number; avg3mo: number };
  runwayMonths: number;
  zeroCashDate: string;         // month cash runs out at avg3mo burn
  mrr: number;
  mrrGrowthPct: number;         // month over month
  topVendors: VendorStat[];     // top 12 by total12mo
  insights: Insight[];
}

export interface TaxEvent {
  id: string;
  date: string;
  title: string;                // "Delaware franchise tax + annual report"
  authority: "IRS" | "Delaware" | "California" | "Payroll" | "Other";
  form?: string;                // "Form 1120"
  amount?: number;              // estimated amount due
  status: "done" | "upcoming" | "due_soon" | "overdue";
  description: string;          // plain-English what and why
}

export interface FranchiseTax {
  authorizedShares: number;
  issuedShares: number;
  grossAssets: number;
  authorizedSharesMethod: number;   // what Delaware's default notice will show
  assumedParValueMethod: number;    // what you actually owe if you file with this method
  savings: number;
}

export interface TaxOverview {
  events: TaxEvent[];               // next 12 months plus the last 3
  franchiseTax: FranchiseTax;
  contractors1099: { name: string; paid: number; w9: boolean }[];
  estimatedTaxYear: { federal: number; state: number; payroll: number };
}

export interface BrainPage {
  slug: string;                     // "vendors/aws"
  title: string;
  type: string;                     // vendor | account | month | policy | company | tax
  updatedAt: string;
  excerpt: string;
}

// HTTP API served by server/ on :4000
//   GET  /api/summary                                 -> Summary
//   GET  /api/transactions?month=&category=&source=&q= -> Txn[]  (newest first)
//   GET  /api/integrations                            -> Integration[]
//   POST /api/integrations/:id/sync                   -> Integration   (takes ~1s so the UI can animate)
//   POST /api/sync                                    -> Integration[] (all)
//   GET  /api/taxes                                   -> TaxOverview
//   GET  /api/brain                                   -> BrainPage[]
//   GET  /api/brain/page?slug=vendors/aws             -> { slug: string; markdown: string }
//   POST /mcp                                         -> MCP (streamable HTTP) for the QM agent
