// AWS: monthly bill via Cost Explorer. Live mode shells out to the AWS CLI (it handles SigV4 for us).
import type { RawTxn } from "../mock";
import { mockTxns, simulateLatency, since, type Pull } from "./_mock";

export const env = "AWS_ACCESS_KEY_ID";

export async function pull(): Promise<Pull> {
  if (!process.env[env]) { await simulateLatency(); return { txns: mockTxns("aws"), live: false }; }
  const end = new Date().toISOString().slice(0, 10);
  const p = Bun.spawn(["aws", "ce", "get-cost-and-usage", "--time-period", `Start=${since},End=${end}`, "--granularity", "MONTHLY", "--metrics", "UnblendedCost", "--output", "json"], { stdout: "pipe", stderr: "pipe" });
  const out = await new Response(p.stdout).text();
  if ((await p.exited) !== 0) throw new Error(`aws ce failed: ${(await new Response(p.stderr).text()).slice(0, 200)}`);
  const txns: RawTxn[] = JSON.parse(out).ResultsByTime.map((r: any) => ({
    id: `aws_${r.TimePeriod.Start}`, date: r.TimePeriod.End, amount: -Number(r.Total.UnblendedCost.Amount),
    description: "AMAZON WEB SERVICES AWS.AMAZON.CO WA", source: "aws", account: "Mercury Checking", receipt: true,
  }));
  return { txns, live: true };
}
