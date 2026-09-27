import { generate, type RawTxn } from "../mock";
import type { Provider } from "../../../shared/types";

export interface Pull { txns: RawTxn[]; balance?: number; accountMask?: string; live: boolean; extra?: unknown }
const data = generate();
export const mockData = data;
export const mockTxns = (p: Provider) => data.txns.filter((t) => t.source === p);
export const simulateLatency = () => Bun.sleep(800 + Math.random() * 700);
export const since = "2025-10-01";

export async function getJSON(url: string, headers: Record<string, string>) {
  const host = new URL(url).host;
  const res = await fetch(url, { headers: { accept: "application/json", ...headers }, signal: AbortSignal.timeout(15_000) })
    .catch((e) => { throw new Error(`${host} unreachable: ${e?.message ?? e}`); });
  const detail = async () => { const t = await res.text(); try { const j = JSON.parse(t); return String(j.error?.message ?? j.message ?? j.error ?? t).slice(0, 160); } catch { return t.replace(/\s+/g, " ").slice(0, 160); } };
  if (res.status === 401 || res.status === 403) throw new Error(`${host} rejected the API key (HTTP ${res.status}): ${await detail()}`);
  if (!res.ok) throw new Error(`${host} HTTP ${res.status}: ${await detail()}`);
  return res.json() as Promise<any>;
}
