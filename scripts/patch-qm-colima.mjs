// QM's docker target mounts the host socket path into core. Under Colima that path only exists on the
// Mac, so let QM_DOCKER_SOCKET_MOUNT / QM_DOCKER_SOCKET_GID name the socket inside the VM. Idempotent.
import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../qm/node_modules/@yc-software/qm/dist/src/backends/docker.js", import.meta.url);
const src = readFileSync(file, "utf8");
const old = "    return { path, ...(gid ? { gid } : {}) };\n}";
if (src.includes("QM_DOCKER_SOCKET_MOUNT")) process.exit(0);
if (!src.includes(old)) throw new Error("QM docker backend changed; update scripts/patch-qm-colima.mjs");
writeFileSync(file, src.replace(old,
  "    const mount = process.env.QM_DOCKER_SOCKET_MOUNT || path;\n" +
  "    const mgid = process.env.QM_DOCKER_SOCKET_GID || gid;\n" +
  "    return { path: mount, ...(mgid ? { gid: mgid } : {}) };\n}"));
console.log("patched QM docker backend for Colima");
