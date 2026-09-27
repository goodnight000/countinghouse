#!/usr/bin/env bash
# Registers the Countinghouse MCP server with QM core. QM's admin UI has no MCP form and its admin API
# needs an admin session, so write the row core reads from Postgres and bump its cache version (core reloads it within ~5 min; restart core to apply now).
set -euo pipefail
ORG=$(grep -oE '"orgId": "[^"]+"' "$(dirname "$0")/../qm/qm.config.jsonc" | cut -d'"' -f4)
NOW=$(($(date +%s) * 1000))
docker exec "qm-$ORG-pg" psql -U postgres -d qm -q -c "
insert into mcp_servers(id, json) values ('books', '{\"id\":\"books\",\"name\":\"Countinghouse Books\",\"url\":\"http://host.docker.internal:4001/mcp\",\"auth\":\"none\",\"readOnly\":false,\"enabled\":true,\"updatedAt\":$NOW,\"updatedBy\":\"start.sh\"}'::jsonb)
on conflict (id) do update set json = excluded.json;
insert into durable_map_versions(tbl, v) values ('mcp_servers', 1) on conflict (tbl) do update set v = durable_map_versions.v + 1;"
echo "registered books MCP server with QM"
