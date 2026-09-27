// Gusto: payrolls for the company (needs GUSTO_COMPANY_ID too). Each processed payroll becomes net pay + tax debits.
import type { RawTxn } from "../mock";
import { getJSON, mockTxns, simulateLatency, since, type Pull } from "./_mock";

export const env = "GUSTO_API_KEY";

export async function pull(): Promise<Pull> {
  const key = process.env[env], co = process.env.GUSTO_COMPANY_ID;
  if (!key) { await simulateLatency(); return { txns: mockTxns("gusto"), live: false }; }
  if (!co) throw new Error("GUSTO_COMPANY_ID is required in live mode");
  const payrolls = await getJSON(`https://api.gusto.com/v1/companies/${co}/payrolls?processing_statuses=processed&start_date=${since}`, { authorization: `Bearer ${key}`, "X-Gusto-API-Version": "2024-04-01" });
  const txns: RawTxn[] = [];
  for (const p of payrolls) {
    const t = p.totals ?? {};
    const date = p.check_date;
    const tag = date.slice(2).replaceAll("-", "");
    txns.push({ id: `gusto_${p.payroll_uuid}_net`, date, amount: -Number(t.net_pay ?? 0), description: `GUSTO NET ${tag}`, source: "gusto", account: "Mercury Checking", receipt: true });
    txns.push({ id: `gusto_${p.payroll_uuid}_tax`, date, amount: -(Number(t.employee_taxes ?? 0) + Number(t.employer_taxes ?? 0)), description: `GUSTO TAX ${tag}`, source: "gusto", account: "Mercury Checking", receipt: true });
  }
  return { txns, live: true };
}
