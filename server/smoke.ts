// Smoke check: pure math + the running server. `bun run smoke.ts` (BASE=http://host:port to override; default :4001).
import { franchiseTax } from "./src/derive";

const assert = (c: unknown, m: string) => { if (!c) { console.error("FAIL", m); process.exit(1); } console.log("ok  ", m); };

// Delaware franchise tax math (10M authorized, 8M issued)
const ft = franchiseTax(1_579_472);
assert(ft.authorizedSharesMethod === 250 + 999 * 85 + 50, `authorized-shares method = $85,215 (got ${ft.authorizedSharesMethod})`);
assert(ft.assumedParValueMethod === 850, `APVC method: $1.97M APVC -> $800 + $50 = $850 (got ${ft.assumedParValueMethod})`);
assert(franchiseTax(0).assumedParValueMethod === 450, "APVC minimum $400 + $50");
assert(franchiseTax(2_400_000).assumedParValueMethod === 1250, "$2.4M assets -> $3M APVC -> $1,200 + $50");

const BASE = process.env.BASE || "http://localhost:4001";
const get = async (p: string) => (await fetch(BASE + p)).json() as Promise<any>;
const s = await get("/api/summary");
assert(Math.abs(s.cash.total - 2_103_418) < 5000, `cash ~$2.1M (${s.cash.total})`);
assert(s.runwayMonths >= 10.5 && s.runwayMonths <= 12.5, `runway 11-12 months (${s.runwayMonths})`);
assert(s.mrr > 35_000 && s.mrr < 46_000, `MRR ~$41k (${s.mrr})`);
assert(s.months.length === 12 && s.months[0].revenue < 9000, "12 months, MRR started ~$8k");
assert(s.topVendors.length === 12 && s.topVendors[0].sparkline.length === 12, "top 12 vendors with sparklines");
assert(s.insights.length >= 5 && s.insights.some((i: any) => /AWS spend up 38%/.test(i.title)), "insights incl. AWS +38%");
assert(s.months.every((m: any) => !m.byCategory.Transfers), "transfers (seed, payouts) never counted as spend");
const t = await get("/api/taxes");
assert(t.franchiseTax.authorizedSharesMethod === 85215 && t.franchiseTax.savings > 80_000, "franchise tax savings");
assert(t.contractors1099.some((c: any) => c.name === "Priya Raman" && !c.w9), "Priya Raman missing W-9");
const tx = await get("/api/transactions?q=figma");
assert(tx.filter((x: any) => x.flags.includes("duplicate")).length === 1, "one duplicate Figma charge");
assert((await get("/api/transactions")).filter((x: any) => x.flags.includes("missing_receipt")).length === 6, "6 missing receipts");
const tools = await (await fetch(BASE + "/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) })).json() as any;
assert(tools.result.tools.length === 11, "MCP tools/list has 11 tools");
assert((await get("/api/brain")).length > 40, "brain pages listed");
console.log(`all good against ${BASE}`);
