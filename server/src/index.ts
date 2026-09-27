import type { Provider } from "../../shared/types";
import { summary, taxes } from "./derive";
import { PROVIDERS, balances, integrations, sync, syncAll, txns, filterTxns } from "./state";
import * as state from "./state";
import { brainPage, brainPages, initBrain } from "./brain";
import { handleMcp } from "./mcp";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "*",
  "access-control-expose-headers": "mcp-session-id, mcp-protocol-version",
};
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: CORS });

const handler = {
  idleTimeout: 60,
  async fetch(req: Request) {
    const url = new URL(req.url);
    const p = url.pathname;
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    try {
      if (p === "/mcp") return handleMcp(req, CORS);
      if (p === "/api/summary") return json(summary(state.txns, state.balances));
      if (p === "/api/transactions") {
        const s = url.searchParams;
        return json(filterTxns({ month: s.get("month"), category: s.get("category"), source: s.get("source"), q: s.get("q"), vendor: s.get("vendor"), flag: s.get("flag") }));
      }
      if (p === "/api/integrations") return json([...integrations.values()]);
      if (p === "/api/sync" && req.method === "POST") return json(await syncAll());
      const m = p.match(/^\/api\/integrations\/(\w+)\/sync$/);
      if (m && req.method === "POST") {
        if (!PROVIDERS.includes(m[1] as Provider)) return json({ error: "unknown provider" }, 404);
        return json(await sync(m[1] as Provider));
      }
      if (p === "/api/taxes") return json(taxes(state.txns, state.balances));
      if (p === "/api/brain") return json(await brainPages());
      if (p === "/api/brain/page") {
        const slug = url.searchParams.get("slug") ?? "";
        const markdown = await brainPage(slug);
        return markdown == null ? json({ error: "not found", slug }, 404) : json({ slug, markdown });
      }
      if (p === "/" || p === "/health") return json({ ok: true, name: "countinghouse", txns: state.txns.length });
      return json({ error: "not found" }, 404);
    } catch (e) {
      console.error(e);
      return json({ error: String(e) }, 500);
    }
  },
};

// :4001 (not the original :4000): NoMachine's nxd holds :4000 on the demo machine.
const server = Bun.serve({ ...handler, port: Number(process.env.PORT ?? 4001) });

void balances; void txns;
console.log(`countinghouse server on :${server.port}`);
const t0 = Date.now();
await syncAll();
console.log(`initial sync: ${state.txns.length} txns in ${Date.now() - t0}ms`);
initBrain();
