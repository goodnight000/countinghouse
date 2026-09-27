// Stripe: balance transactions are the ledger of charges, fees, refunds and payouts.
import type { RawTxn } from "../mock";
import { getJSON, mockTxns, simulateLatency, since, type Pull } from "./_mock";

export const env = "STRIPE_API_KEY";

export async function pull(): Promise<Pull> {
  const key = process.env[env];
  if (!key) { await simulateLatency(); return { txns: mockTxns("stripe"), live: false }; }
  const h = { authorization: `Bearer ${key}` };
  const gte = Math.floor(Date.parse(since) / 1000);
  const txns: RawTxn[] = [];
  let after = "";
  for (let i = 0; i < 20; i++) {
    const page = await getJSON(`https://api.stripe.com/v1/balance_transactions?limit=100&created[gte]=${gte}${after ? `&starting_after=${after}` : ""}&expand[]=data.source`, h);
    for (const b of page.data) {
      const date = new Date(b.created * 1000).toISOString().slice(0, 10);
      const who = b.source?.billing_details?.name || b.source?.customer || "";
      const base = { date, source: "stripe" as const, account: "Stripe Balance", receipt: true };
      if (b.type === "payout") continue; // the payout shows up in the bank feed as a transfer
      if (b.type === "charge" || b.type === "payment") {
        txns.push({ ...base, id: `stripe_${b.id}`, amount: b.amount / 100, description: `STRIPE CHARGE ${who || b.description || b.id}` });
      } else if (b.type === "refund" || b.type === "payment_refund") {
        txns.push({ ...base, id: `stripe_${b.id}`, amount: b.amount / 100, description: `STRIPE CHARGE REFUND ${b.description ?? ""}` });
      } else if (b.type !== "adjustment") {
        txns.push({ ...base, id: `stripe_${b.id}`, amount: b.amount / 100, description: `STRIPE ${b.type.toUpperCase()} ${b.description ?? ""}`.trim() });
      }
      if (b.fee) txns.push({ ...base, id: `stripe_${b.id}_fee`, amount: -b.fee / 100, description: "STRIPE PROCESSING FEES" });
    }
    if (!page.has_more) break;
    after = page.data.at(-1).id;
  }
  const bal = await getJSON("https://api.stripe.com/v1/balance", h).catch(() => null);
  const pending = bal ? (bal.available ?? []).concat(bal.pending ?? []).filter((x: any) => x.currency === "usd").reduce((a: number, x: any) => a + x.amount, 0) / 100 : undefined;
  return { txns, balance: pending, live: true };
}
