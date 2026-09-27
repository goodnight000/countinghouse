import type { Integration, Provider, Txn } from "../../shared/types";
import type { RawTxn } from "./mock";
import { categorize } from "./rules";
import type { Balances } from "./derive";
import * as mercury from "./connectors/mercury";
import * as brex from "./connectors/brex";
import * as ramp from "./connectors/ramp";
import * as stripe from "./connectors/stripe";
import * as gusto from "./connectors/gusto";
import * as aws from "./connectors/aws";
import * as carta from "./connectors/carta";
import { mockData } from "./connectors/_mock";

const CONNECTORS = { mercury, brex, ramp, stripe, gusto, aws, carta };
const META: Record<Provider, [string, Integration["kind"]]> = {
  mercury: ["Mercury", "bank"], brex: ["Brex", "card"], ramp: ["Ramp", "card"], stripe: ["Stripe", "revenue"],
  gusto: ["Gusto", "payroll"], aws: ["AWS", "cloud"], carta: ["Carta", "equity"],
};
export const PROVIDERS = Object.keys(CONNECTORS) as Provider[];

const raw = new Map<Provider, RawTxn[]>();
export const integrations = new Map<Provider, Integration>(PROVIDERS.map((id) => [id, {
  id, name: META[id][0], kind: META[id][1], mode: process.env[CONNECTORS[id].env] ? "live" : "mock",
  status: "connected", lastSync: null, records: 0,
}]));
export const errors = new Map<Provider, string>();
export let balances: Balances = { ...mockData.balances };
export let txns: Txn[] = [];
const listeners: (() => void)[] = [];
export const onChange = (f: () => void) => listeners.push(f);

export function rederive() {
  txns = categorize([...raw.values()].flat()).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  listeners.forEach((f) => f());
}

export async function sync(id: Provider, quiet = false): Promise<Integration> {
  const i = integrations.get(id)!;
  i.status = "syncing";
  try {
    const p = await CONNECTORS[id].pull();
    raw.set(id, p.txns);
    i.status = "connected";
    i.mode = p.live ? "live" : "mock";
    i.records = id === "carta" ? ((p.extra as any)?.stakeholders?.length ?? 0) : p.txns.length;
    if (p.balance !== undefined) i.balance = Math.round(p.balance * 100) / 100;
    if (p.accountMask) i.accountMask = p.accountMask;
    if (id === "mercury" && p.extra) {
      const e = p.extra as { checking: number; treasury: number };
      balances = { ...balances, mercuryChecking: e.checking, mercuryTreasury: e.treasury };
    }
    errors.delete(id);
  } catch (e) {
    // Live pull failed: degrade to mock data so the demo stays whole; status "error" + reason in logs / MCP.
    const msg = e instanceof Error ? e.message : String(e);
    i.status = "error";
    errors.set(id, msg);
    console.error(`[sync ${id}] live pull failed, serving mock data: ${msg}`);
    const mock = mockData.txns.filter((t) => t.source === id);
    raw.set(id, mock);
    i.records = id === "carta" ? 5 : mock.length;
    const mb = mockData.balances;
    if (id === "mercury") { balances = { ...balances, mercuryChecking: mb.mercuryChecking, mercuryTreasury: mb.mercuryTreasury }; i.balance = mb.mercuryChecking + mb.mercuryTreasury; }
    if (id === "brex") i.balance = mb.brex;
    if (id === "ramp") i.balance = mb.ramp;
  }
  i.lastSync = new Date().toISOString();
  if (!quiet) rederive();
  return { ...i };
}

export async function syncAll() {
  const out = await Promise.all(PROVIDERS.map((p) => sync(p, true)));
  rederive();
  return out;
}

export function filterTxns(q: { month?: string | null; category?: string | null; source?: string | null; q?: string | null; vendor?: string | null; flag?: string | null }) {
  const needle = q.q?.toLowerCase();
  return txns.filter((t) =>
    (!q.month || t.date.startsWith(q.month)) &&
    (!q.category || t.category.toLowerCase() === q.category.toLowerCase()) &&
    (!q.source || t.source === q.source) &&
    (!q.vendor || t.vendor.toLowerCase().includes(q.vendor.toLowerCase())) &&
    (!q.flag || t.flags.includes(q.flag as any)) &&
    (!needle || `${t.description} ${t.vendor} ${t.category} ${t.note ?? ""}`.toLowerCase().includes(needle)));
}

