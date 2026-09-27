// Carta: cap table (authorized/issued shares, par) feeds the Delaware franchise tax calculation.
import { CAP_TABLE } from "../mock";
import { getJSON, simulateLatency, type Pull } from "./_mock";

export const env = "CARTA_API_KEY";

export async function pull(): Promise<Pull> {
  const key = process.env[env];
  if (!key) { await simulateLatency(); return { txns: [], live: false, extra: CAP_TABLE }; }
  const issuer = process.env.CARTA_ISSUER_ID;
  const cap = await getJSON(`https://api.carta.com/v1alpha1/issuers/${issuer}/capitalizationTable`, { authorization: `Bearer ${key}` });
  return { txns: [], live: true, extra: { ...CAP_TABLE, raw: cap } };
}
