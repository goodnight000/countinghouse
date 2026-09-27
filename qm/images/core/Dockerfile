# QM core pinned by CLI 0.1.13, plus one fix: upstream reads QM_CORE_CONTAINER into another backend's
# config, so the local sandbox never learns core runs in Docker and dials 127.0.0.1 (unreachable).
FROM ghcr.io/yc-software/qm/core@sha256:24f58b9b72c4413c6004001be6844087169c855e6bd28d6a8bcc06d62faa5987
USER root
RUN node -e '\
const fs = require("fs"), f = "/app/src/config.ts", s = fs.readFileSync(f, "utf8"); \
const a = "...(env.LOCAL_SANDBOX_IMAGE ? { image: env.LOCAL_SANDBOX_IMAGE } : {}),"; \
if (s.split(a).length !== 2) throw new Error("anchor not found once"); \
fs.writeFileSync(f, s.replace(a, a + "\n    ...(env.QM_CORE_CONTAINER ? { coreContainer: env.QM_CORE_CONTAINER } : {}),"));'
USER node
