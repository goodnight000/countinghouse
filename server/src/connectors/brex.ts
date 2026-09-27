// Brex: https://developer.brex.com/openapi/transactions_api/  (user token, transactions.card.readonly)
import type { RawTxn } from "../mock";
import { getJSON, mockData, mockTxns, simulateLatency, since, type Pull } from "./_mock";

export const env = "BREX_API_KEY";

export async function pull(): Promise<Pull> {
  const key = process.env[env];
  if (!key) { await simulateLatency(); return { txns: mockTxns("brex"), balance: mockData.balances.brex, accountMask: "••3310", live: false }; }
  const h = { authorization: `Bearer ${key}` };
  const txns: RawTxn[] = [];
  let cursor = "";
  for (let i = 0; i < 20; i++) {
    const page = await getJSON(`https://platform.brexapis.com/v2/transactions/card/primary?limit=100&posted_at_start=${since}T00:00:00Z${cursor ? `&cursor=${cursor}` : ""}`, h);
    for (const t of page.items ?? []) {
      txns.push({ id: `brex_${t.id}`, date: t.posted_at_date, amount: -(t.amount?.amount ?? 0) / 100, description: t.description || t.merchant?.raw_descriptor || "BREX CARD", source: "brex", account: `Brex Card ••${t.card_id?.slice(-4) ?? ""}`, receipt: true });
    }
    if (!page.next_cursor) break;
    cursor = page.next_cursor;
  }
  return { txns, live: true };
}
