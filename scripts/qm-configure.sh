#!/usr/bin/env bash
# Configures the running QM deployment for Countinghouse:
#  - registers the finance MCP server (QM's admin UI has no MCP form), and
#  - sets the org default runtime: pi harness, $QM_MODEL (gpt-6-luna) at $QM_EFFORT (high) effort,
#    for chat, crons and subagents.
# Writes the rows core reads from Postgres and bumps their cache versions; core picks them up
# within a few minutes (restart core to apply at once).
set -euo pipefail
ORG=$(grep -oE '"orgId": "[^"]+"' "$(dirname "$0")/../qm/qm.config.jsonc" | cut -d'"' -f4)
MODEL=${QM_MODEL:-gpt-6-luna} EFFORT=${QM_EFFORT:-high}
NOW=$(($(date +%s) * 1000))
RT="{\"modelId\":\"$MODEL\",\"harnessId\":\"pi\",\"effortLevel\":\"$EFFORT\"}"
docker exec "qm-$ORG-pg" psql -U postgres -d qm -q -c "
insert into mcp_servers(id, json) values ('books', '{\"id\":\"books\",\"name\":\"Countinghouse Books\",\"url\":\"http://host.docker.internal:4001/mcp\",\"auth\":\"none\",\"readOnly\":false,\"enabled\":true,\"updatedAt\":$NOW,\"updatedBy\":\"start.sh\"}'::jsonb)
on conflict (id) do update set json = excluded.json;
insert into base_model_configs(id, json) values ('org:$ORG', '{\"scopeId\":\"org:$ORG\",\"modelId\":\"$MODEL\",\"harnessId\":\"pi\",\"effortLevel\":\"$EFFORT\",\"fastMode\":false,\"orgRevision\":1,\"revision\":1,\"cronRuntime\":$RT,\"subagentRuntime\":$RT}'::jsonb)
on conflict (id) do update set json = base_model_configs.json || excluded.json - 'orgRevision' - 'revision';
insert into durable_map_versions(tbl, v) values ('mcp_servers', 1), ('base_model_configs', 1)
on conflict (tbl) do update set v = durable_map_versions.v + 1;"
echo "QM: books MCP server registered; default runtime $MODEL ($EFFORT)"
