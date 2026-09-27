// Ramp: https://docs.ramp.com/developer-api/v1/api/transactions  (OAuth client-credentials access token)
import type { RawTxn } from "../mock";
import { getJSON, mockData, mockTxns, simulateLatency, since, type Pull } from "./_mock";

export const env = "RAMP_API_KEY";

export async function pull(): Promise<Pull> {
  const key = process.env[env];
  if (!key) { await simulateLatency(); return { txns: mockTxns("ramp"), balance: mockData.balances.ramp, accountMask: "••5561", live: false }; }
  const h = { authorization: `Bearer ${key}` };
  const txns: RawTxn[] = [];
  let url: string | null = `https://api.ramp.com/developer/v1/transactions?page_size=100&from_date=${since}T00:00:00Z`;
  for (let i = 0; url && i < 20; i++) {
    const page: any = await getJSON(url, h);
    for (const t of page.data ?? []) {
      txns.push({ id: `ramp_${t.id}`, date: String(t.user_transaction_time).slice(0, 10), amount: -t.amount, description: t.merchant_descriptor || t.merchant_name || "RAMP CARD", source: "ramp", account: `Ramp Card ••${t.card_id?.slice(-4) ?? ""}`, receipt: (t.receipts?.length ?? 0) > 0 });
    }
    url = page.page?.next ?? null;
  }
  return { txns, live: true };
}
