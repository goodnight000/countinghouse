import { generate, type RawTxn } from "../mock";
import type { Provider } from "../../../shared/types";

export interface Pull { txns: RawTxn[]; balance?: number; accountMask?: string; live: boolean; extra?: unknown }
const data = generate();
export const mockData = data;
export const mockTxns = (p: Provider) => data.txns.filter((t) => t.source === p);
export const simulateLatency = () => Bun.sleep(800 + Math.random() * 700);
export const since = "2025-10-01";

export async function getJSON(url: string, headers: Record<string, string>) {
  const res = await fetch(url, { headers: { accept: "application/json", ...headers } });
  if (!res.ok) throw new Error(`${new URL(url).host} ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json() as Promise<any>;
}
