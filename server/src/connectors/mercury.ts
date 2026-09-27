// Mercury: https://docs.mercury.com/reference  (Bearer API token, read-only is enough)
import { ACCT } from "../mock";
import type { RawTxn } from "../mock";
import { getJSON, mockData, mockTxns, simulateLatency, since, type Pull } from "./_mock";

export const env = "MERCURY_API_KEY";

export async function pull(): Promise<Pull> {
  const key = process.env[env];
  if (!key) {
    await simulateLatency();
    return { txns: mockTxns("mercury"), balance: mockData.balances.mercuryChecking + mockData.balances.mercuryTreasury, accountMask: "••4821", live: false,
      extra: { checking: mockData.balances.mercuryChecking, treasury: mockData.balances.mercuryTreasury } };
  }
  const h = { authorization: `Bearer ${key}` };
  const { accounts } = await getJSON("https://api.mercury.com/api/v1/accounts", h);
  const txns: RawTxn[] = [];
  let checking = 0, treasury = 0;
  for (const a of accounts) {
    const name = `Mercury ${a.kind === "treasury" || /treasury|savings/i.test(a.name) ? "Treasury" : "Checking"} ••${String(a.accountNumber ?? "").slice(-4)}`;
    if (name.includes("Treasury")) treasury += a.currentBalance; else checking += a.currentBalance;
    for (let offset = 0; offset < 5000; offset += 500) {
      const page = await getJSON(`https://api.mercury.com/api/v1/account/${a.id}/transactions?limit=500&offset=${offset}&start=${since}`, h);
      for (const t of page.transactions ?? []) {
        if (t.status === "failed" || t.status === "cancelled") continue;
        txns.push({
          id: `mercury_${t.id}`,
          date: String(t.postedAt ?? t.createdAt).slice(0, 10),
          amount: t.amount,
          description: t.bankDescription || t.counterpartyName || t.note || "MERCURY TRANSACTION",
          source: "mercury",
          account: name,
          receipt: (t.attachments?.length ?? 0) > 0 || t.amount > 0 || t.kind !== "debitCardTransaction",
          note: t.counterpartyName ? `Counterparty: ${t.counterpartyName}` : undefined,
        });
      }
      if ((page.transactions ?? []).length < 500) break;
    }
  }
  return { txns, balance: checking + treasury, accountMask: accounts[0] ? `••${String(accounts[0].accountNumber ?? "").slice(-4)}` : undefined, live: true, extra: { checking, treasury } };
}
void ACCT;
