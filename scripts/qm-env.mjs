// Writes qm/.env with every secret the deployment needs plus a demo admin password.
// usage: OPENAI_API_KEY=sk-... ADMIN_EMAIL=you@example.com node scripts/qm-env.mjs
import { generateKeyPairSync, randomBytes, scryptSync } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";

const path = new URL("../qm/.env", import.meta.url);
if (existsSync(path)) {
  console.log("qm/.env exists, keeping it");
  process.exit(0);
}
const key = process.env.OPENAI_API_KEY;
const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
if (!key || !email) {
  console.error("set OPENAI_API_KEY and ADMIN_EMAIL");
  process.exit(1);
}
const hex = () => randomBytes(32).toString("hex");
const password = `books-${randomBytes(6).toString("hex")}`;
// Same format as QM's plugins/auth/src/password.ts: scrypt$log2N$r$p$salt$key
const salt = randomBytes(16);
const derived = scryptSync(password, salt, 32, { N: 2 ** 15, r: 8, p: 1, maxmem: 256 * 1024 * 1024 });
const hash = ["scrypt", 15, 8, 1, salt.toString("base64url"), derived.toString("base64url")].join("$");
const jwk = JSON.stringify(generateKeyPairSync("ec", { namedCurve: "P-256" }).privateKey.export({ format: "jwk" }));

const env = {
  CAPABILITY_SECRET: hex(), CONNECTOR_SECRET_KEY: hex(), CORE_SIGNING_SECRET: hex(), SKILL_SIGNING_SECRET: hex(),
  PORTAL_IDENTITY_SECRET: hex(), PORTAL_SESSION_SECRET: hex(), AUTH_TOKEN_SECRET: hex(), AUTH_CLIENT_SECRET: hex(),
  AUTH_SIGNING_JWK: jwk, AUTH_ALLOWED_EMAILS: email, AUTH_PASSWORD_USERS: `${email}:${hash}`, SMTP_HOST: "localhost",
  OPENAI_API_KEY: key, PUBLIC_API_URL: `http://host.docker.internal:${process.env.QM_BASE_PORT ?? 8080}`,
};
writeFileSync(path, Object.entries(env).map(([k, v]) => `${k}=${v}`).join("\n") + `\n# Demo sign-in: ${email} / ${password}\n`, { mode: 0o600 });
console.log(`wrote qm/.env — sign in as ${email} / ${password}`);
