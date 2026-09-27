// Two local-only patches to the pinned QM CLI (qm/node_modules), both idempotent:
// 1. Colima: QM mounts the host socket path into core, but under Colima that path only exists on the
//    Mac. QM_DOCKER_SOCKET_MOUNT / QM_DOCKER_SOCKET_GID name the socket inside the VM instead.
// 2. imageOverrides that exist only locally (our patched core, qm/images/core) are used without a pull.
import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../qm/node_modules/@yc-software/qm/dist/src/backends/docker.js", import.meta.url);
let src = readFileSync(file, "utf8");
const patches = [
  ["QM_DOCKER_SOCKET_MOUNT", "    return { path, ...(gid ? { gid } : {}) };\n}",
    "    const mount = process.env.QM_DOCKER_SOCKET_MOUNT || path;\n" +
    "    const mgid = process.env.QM_DOCKER_SOCKET_GID || gid;\n" +
    "    return { path: mount, ...(mgid ? { gid: mgid } : {}) };\n}"],
  ["countinghouse: local override", "    const ref = imageRef(ctx, service);\n    step(`pulling ${ref}`);",
    "    const ref = imageRef(ctx, service);\n" +
    "    // countinghouse: local override images are used as-is\n" +
    "    if (ctx.config.imageOverrides[service]) { try { capture(\"docker\", [\"image\", \"inspect\", ref]); return ref; } catch {} }\n" +
    "    step(`pulling ${ref}`);"],
];
for (const [marker, old, next] of patches) {
  if (src.includes(marker)) continue;
  if (!src.includes(old)) throw new Error(`QM CLI changed near "${marker}"; update scripts/patch-qm-cli.mjs`);
  src = src.replace(old, next);
}
writeFileSync(file, src);
