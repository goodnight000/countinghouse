# Countinghouse server
Run: cd server && bun run --watch src/index.ts > server.log 2>&1 &   (port 4001; PORT overrides; :4000 is held by NoMachine nxd)
Smoke: bun run smoke.ts  (franchise-tax math + key numbers against the running server; BASE overrides)
Endpoints: GET /api/summary, /api/transactions?month=&category=&source=&q=&vendor=&flag=, /api/integrations, /api/taxes,
  /api/brain, /api/brain/page?slug=, /health; POST /api/integrations/:id/sync (~1s), POST /api/sync; POST /mcp
MCP: stateless JSON-RPC, JSON responses (no SSE): initialize, notifications/* (202), ping, tools/list, tools/call, batches.
  Tools: get_financial_summary, search_transactions, vendor_spend, tax_calendar, delaware_franchise_tax, runway_scenario,
  sync_integrations, brain_search, brain_read, remember, recategorize. From Docker: http://host.docker.internal:4001/mcp
Env (live mode per connector): MERCURY_API_KEY, STRIPE_API_KEY (real fetch code), BREX_API_KEY, RAMP_API_KEY,
  GUSTO_API_KEY+GUSTO_COMPANY_ID, AWS_ACCESS_KEY_ID (aws ce CLI), CARTA_API_KEY+CARTA_ISSUER_ID (best-effort).
  Unset = mock from seeded generator; live failure => status "error" and mock data kept. GBRAIN_CLI overrides gbrain path.
GBrain: pages rendered after every sync and written serially in background with retry (~2s/put, ~70 pages, 2-3 min cold);
  only changed pages rewritten. /api/brain + brain_read serve an in-memory mirror; brain_search uses real `gbrain search`.
  Learned rules persist as JSON in policies/categorization-rules and reload on start.
Known gaps: revenue includes treasury interest; 1099s = 2026 YTD; APVC gross assets = projected Dec 31 cash + hardware +
  deposits; no cross-source dedupe when live Mercury mixes with mock Gusto/AWS; only Stripe/Mercury live paths are
  seriously written; SaaS login counts hardcoded.
