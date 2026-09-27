// One-command demo video: node demo/make.mjs [--final]
// TTS narration -> Playwright recording of the live app -> ffmpeg assembly.
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execFileSync } from "child_process";
const require = createRequire("/tmp/pw/node_modules/");
const { chromium } = require("playwright");

const DIR = path.dirname(new URL(import.meta.url).pathname);
const CACHE = path.join(DIR, ".cache"), OUT = path.join(DIR, "out");
fs.mkdirSync(CACHE, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });
const FINAL = process.argv.includes("--final"), RAW = process.argv.includes("--raw");
const focus = [];
const ENV = fs.readFileSync(path.join(DIR, "../qm/.env"), "utf8");
const KEY = ENV.match(/^OPENAI_API_KEY=(.*)$/m)[1].trim();
const PW = ENV.match(/gdragonjcm@gmail\.com \/ (\S+)/)[1];
const FF = "/opt/homebrew/bin/ffmpeg", FP = "/opt/homebrew/bin/ffprobe";
const QM = "http://localhost:8081";

const LINES = [
  "Most startups don't fail because of the product. They run out of money, or they get blindsided by a tax bill nobody saw coming. Seed-stage founders don't have a CFO. They have a spreadsheet and a bank login.",
  "Countinghouse is an open-source finance team you run yourself. It pulls every account into one ledger, keeps what it learns in GBrain as plain markdown, and puts an agent on top in QM, Y Combinator's agent harness. That agent layer is the difference: the dashboard shows you numbers, the agent acts like a CFO.",
  "It lives right inside QM. Open the Accounting tab and you get the whole company at a glance: two point one million in cash, eleven months of runway, and a plain-English read of what changed this month.",
  "The advisor, running on GPT-6 Luna, reasons over every transaction. It finds the AWS Savings Plan worth four thousand a month, the Salesforce seats nobody logs into, the ad spend that stopped paying back. Adopt them and runway grows from eleven point three to twelve point six months.",
  "It remembers the dates founders forget. Hover any day to see what's due and why. Delaware's franchise tax notice will say eighty-five thousand dollars. Filed the right way, you owe eight hundred fifty.",
  "And you can just ask. It reasons over the books, weighs the trade-offs, and reminds you what's coming up, like the overdue W-9 that blocks a 1099.",
  "Every rule you teach it lands in GBrain, so next month it already knows. Your money, your memory, your CFO. Open source, one command to run.",
];
const QUESTION = "What should I cut to get us to 14 months of runway, and what's due in the next 30 days?";

// ---------- 1. narration ----------
const dur = (f) => parseFloat(execFileSync(FP, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());
async function tts(text) {
  const f = path.join(CACHE, crypto.createHash("sha1").update("ash|" + text).digest("hex").slice(0, 16) + ".mp3");
  if (!fs.existsSync(f)) {
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST", headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini-tts", voice: "ash", input: text, response_format: "mp3",
        instructions: "Calm, confident founder giving a product demo to YC partners. Natural pace, no hype." }),
    });
    if (!r.ok) throw new Error("TTS " + r.status + " " + (await r.text()).slice(0, 200));
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  }
  return { file: f, d: dur(f) };
}
const clips = await Promise.all(LINES.map(tts));
const N = clips.reduce((s, c) => s + c.d, 0);
const PAD = Math.max(1.6, Math.min(4, (134 - 5 - N) / 7));
console.log("narration", N.toFixed(1), "s, pad", PAD.toFixed(1));

// ---------- 2. record ----------
const browser = await chromium.launch();
const STATE = path.join(CACHE, "state.json");
{ // sign in off-camera
  const c = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const p = await c.newPage();
  await p.goto(QM + "/", { waitUntil: "commit" }); await p.waitForTimeout(2500);
  if (p.url().includes("/idp/")) {
    await p.fill("input[name=email]", "gdragonjcm@gmail.com");
    await p.fill("input[name=password]", PW);
    await p.click('button:has-text("Sign in with password")');
    await p.waitForURL((u) => !u.pathname.startsWith("/idp"), { timeout: 20000, waitUntil: "commit" });
    await p.waitForTimeout(2000);
  }
  await c.storageState({ path: STATE }); await c.close();
}
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, storageState: STATE,
  recordVideo: { dir: path.join(CACHE, "rec"), size: { width: 1920, height: 1080 } },
});
await ctx.addInitScript(() => {
  if (window.top !== window) return;
  const css = `#dm-cur{position:fixed;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(255,255,255,.85);border:2px solid rgba(20,20,20,.75);box-shadow:0 1px 6px rgba(0,0,0,.35);z-index:2147483647;pointer-events:none;transition:transform .7s cubic-bezier(.4,0,.2,1)}
  #dm-cap{position:fixed;left:50%;bottom:48px;transform:translateX(-50%);max-width:1400px;padding:12px 22px;border-radius:8px;background:rgba(0,0,0,.6);color:#fff;font:500 29px/1.35 "Helvetica Neue",Helvetica,Arial,sans-serif;text-align:center;z-index:2147483646;pointer-events:none;display:none}
  #dm-fade{position:fixed;inset:0;background:#000;opacity:0;z-index:2147483645;pointer-events:none;transition:opacity .2s linear}
  #dm-card{position:fixed;inset:0;background:#0f1113;color:#e6e6e6;z-index:2147483644;display:none;flex-direction:column;align-items:center;justify-content:center;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;pointer-events:none}
  #dm-card h1{font-weight:600;font-size:84px;margin:0 0 18px;letter-spacing:-1px}#dm-card p{font-size:36px;margin:0;color:#b8bcc2}`;
  const add = () => {
    if (document.getElementById("dm-cur")) return;
    const s = document.createElement("style"); s.textContent = css; document.documentElement.appendChild(s);
    for (const id of ["dm-cur", "dm-cap", "dm-fade", "dm-card"]) { const d = document.createElement("div"); d.id = id; document.documentElement.appendChild(d); }
    document.getElementById("dm-cur").style.transform = `translate(960px,600px)`;
  };
  if (document.documentElement) add(); else document.addEventListener("DOMContentLoaded", add);
  new MutationObserver(add).observe(document, { childList: true, subtree: true });
});
const page = await ctx.newPage();
const T0 = Date.now();
const now = () => (Date.now() - T0) / 1000;
const wait = (s) => page.waitForTimeout(s * 1000);
const ev = (fn, arg) => page.evaluate(fn, arg).catch(() => {});
const caption = (t) => RAW ? Promise.resolve() : ev((t) => { const c = document.getElementById("dm-cap"); if (c) { c.textContent = t; c.style.display = t ? "block" : "none"; } }, t);
const card = (html) => RAW ? Promise.resolve() : ev((html) => { const c = document.getElementById("dm-card"); if (!c) return; c.innerHTML = html || ""; c.style.display = html ? "flex" : "none"; document.getElementById("dm-cur").style.opacity = html ? 0 : 1; }, html);
const lower = (t) => RAW ? Promise.resolve() : ev((t) => { let l = document.getElementById("dm-low"); if (!l) { l = document.createElement("div"); l.id = "dm-low"; document.documentElement.appendChild(l); }
  l.style.cssText = "position:fixed;left:56px;bottom:170px;z-index:2147483646;pointer-events:none;background:#15181b;color:#e6e6e6;font:600 24px/1 'Helvetica Neue',Helvetica,sans-serif;padding:14px 20px 14px 16px;border-left:4px solid #6b8afd;border-radius:0 6px 6px 0;transition:opacity .4s,transform .4s;opacity:0;transform:translateX(-16px)";
  l.textContent = t || ""; if (t) requestAnimationFrame(() => requestAnimationFrame(() => { l.style.opacity = 1; l.style.transform = "none"; })); }, t);
const zoom = (x, y, sc) => RAW ? Promise.resolve() : ev(([x, y, sc]) => { const b = document.body; b.style.transition = "transform 1.4s cubic-bezier(.4,0,.2,1)"; b.style.transformOrigin = `${x}px ${y}px`; b.style.transform = sc ? `scale(${sc})` : ""; }, [x, y, sc]);
const ST = `<style>#dm-card .k{opacity:0;transform:translateY(14px);animation:dmIn .7s cubic-bezier(.2,.7,.2,1) forwards}@keyframes dmIn{to{opacity:1;transform:none}}
#dm-card .ln{stroke-dasharray:1000;stroke-dashoffset:1000;animation:dmDraw .9s ease-out forwards}@keyframes dmDraw{to{stroke-dashoffset:0}}
#dm-card{align-items:flex-start;padding-left:220px;box-sizing:border-box}#dm-card .t{font-size:66px;font-weight:600;letter-spacing:-.5px;margin:10px 0;color:#e6e6e6}#dm-card .t.dim{color:#8b9097}</style>`;
const opening = (d) => { const L = ["Startups don't fail on product.", "They run out of money.", "Or a tax bill nobody saw coming.", "No CFO. A spreadsheet and a bank login."];
  return ST + L.map((t, k) => `<div class="k t${k === 0 ? " dim" : ""}" style="animation-delay:${(0.3 + k * d / 4.3).toFixed(2)}s">${t}</div>`).join(""); };
const diagram = (d) => { const f = d / 17, A = ["Mercury", "Brex", "Ramp", "Stripe", "Gusto", "AWS", "Carta"];
  const del = (t) => `animation-delay:${(t * f).toFixed(2)}s`;
  const box = (x, y, w, t, sub, at, hi) => `<g class="k" style="${del(at)}"><rect x="${x}" y="${y}" width="${w}" height="120" rx="10" fill="${hi ? "#1c2230" : "#181b1f"}" stroke="${hi ? "#8fa6ff" : "#3a3f46"}" stroke-width="2"/><text x="${x + w / 2}" y="${y + 55}" text-anchor="middle" font-size="36" font-weight="600" fill="#e6e6e6">${t}</text><text x="${x + w / 2}" y="${y + 92}" text-anchor="middle" font-size="22" fill="#9aa0a8">${sub}</text></g>`;
  const ln = (x1, y1, x2, y2, at) => `<line class="ln" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#5b6270" stroke-width="2.5" marker-end="url(#ah)" style="${del(at)}"/>`;
  return ST + `<svg width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;inset:0;font-family:'Helvetica Neue',Helvetica,sans-serif"><defs><marker id="ah" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#5b6270"/></marker></defs>
  <text x="160" y="150" font-size="54" font-weight="600" fill="#e6e6e6" class="k" style="${del(0.1)}">Countinghouse</text><text x="160" y="198" font-size="28" fill="#8b9097" class="k" style="${del(0.4)}">an open-source finance team you run yourself</text>
  ${A.map((a, k) => `<text x="340" y="${318 + k * 86}" text-anchor="end" font-size="32" fill="#c9cdd2" class="k" style="${del(0.8 + k * 0.18)}">${a}</text>` + ln(360, 307 + k * 86, 640, 565, 2.4 + k * 0.08)).join("")}
  ${box(650, 505, 300, "Ledger", "every account, one book", 3.2)}${ln(955, 565, 1075, 565, 4.6)}${box(1085, 505, 320, "GBrain", "memory · plain markdown", 5.2)}${ln(1410, 565, 1530, 565, 7.6)}${box(1540, 505, 300, "QM agent", "acts like your CFO", 8.2, 1)}</svg>`; };
const ending = ST + `<div class="k t" style="font-size:90px;animation-delay:.1s">Countinghouse</div><div class="k t dim" style="font-size:40px;font-weight:500;animation-delay:.6s">An open-source finance team for startups. QM + GBrain.</div><div class="k" style="margin-top:56px;font-size:36px;color:#8fa6ff;animation-delay:1.2s">github.com/goodnight000/countinghouse</div><div class="k" style="margin-top:22px;font:500 34px Menlo,monospace;color:#e6e6e6;background:#1a1d21;padding:14px 22px;border-radius:6px;animation-delay:1.8s">./start.sh</div>`;
const fade = async () => { await ev(() => (document.getElementById("dm-fade").style.opacity = 1)); await wait(0.22); };
const unfade = () => ev(() => (document.getElementById("dm-fade").style.opacity = 0));
let cx = 960, cy = 600;
async function move(x, y) {
  cx = x; cy = y;
  await ev(([x, y]) => (document.getElementById("dm-cur").style.transform = `translate(${x}px,${y}px)`), [x, y]);
  await page.mouse.move(x, y, { steps: 25 }); await wait(0.5);
}
async function to(loc) {
  try { const b = await loc.first().boundingBox({ timeout: 3000 }); if (!b) return false; focus.push({ t: now(), x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), label: loc.toString().slice(-90) }); await move(b.x + b.width / 2, b.y + Math.min(b.height / 2, 30)); return true; } catch { return false; }
}
async function click(loc) { if (await to(loc)) { await page.mouse.click(cx, cy); return true; } return false; }
const fr = () => page.frameLocator("iframe[title=Accounting]");
const marks = []; let cut = null;
async function scene(i, fn) {
  await caption(LINES[i]); const s = now(); marks.push({ i, t: s + 0.3 });
  await unfade();
  await fn().catch((e) => console.log("scene", i + 1, "warn:", e.message.split("\n")[0]));
  const hold = clips[i].d + PAD - (now() - s) - (cut && cut.scene === i ? cut.b - cut.a : 0);
  if (hold > 0) await wait(hold);
  await fade();
}

await page.goto(QM + "/", { waitUntil: "commit" });
await page.waitForSelector("#countinghouse-accounting", { timeout: 30000 });
if (page.url().includes("/idp/")) throw new Error("not signed in");
await card(opening(clips[0].d)); await wait(0.5);
await page.click('.navrow:has-text("New session")').catch(() => console.log("no New session row"));
await wait(2.5); await card(""); await card(opening(clips[0].d)); // restart animation at t=tStart
const tStart = now();
await scene(0, async () => {});
await card(diagram(clips[1].d));
await scene(1, async () => {});
await card("");
await scene(2, async () => {
  await lower("Inside QM"); await wait(1.2); await move(700, 500); await to(page.locator("#countinghouse-accounting")); await wait(0.4);
  await click(page.locator("#countinghouse-accounting")); await lower("Accounting · CFO brief"); await wait(3);
  await to(fr().locator(".brief, .brief-p")); await wait(2.5); await to(fr().locator("a[href='#runway']"));
});
await fetch("http://localhost:4001/api/advice").then((r) => r.json()).then((d) => console.log("advice pre-S3", d.potential?.monthlySavings, d.potential?.runwayMonths, "accepted", d.accepted?.monthlySavings, "refreshing", d.refreshing)).catch((e) => console.log("advice check failed", e.message));
await scene(3, async () => {
  await lower("AI advisor · GPT-6 Luna");
  if (await fr().locator("a[href='#/advisor']").count()) {
    await click(fr().locator("a[href='#/advisor']")); await wait(2.5);
    focus.push({ t: now(), x: 260, y: 200, w: 1600, h: 110, label: 'Advisor savings total and runway before -> after' }); await zoom(1000, 250, 1.4); await wait(4); await zoom(1000, 250, 0); await wait(1.5);
    const rows = fr().locator(".adv-row");
    for (let k = 0; k < Math.min(4, await rows.count()); k++) { await to(rows.nth(k)); await wait(1.1); }
  } else {
    const ins = fr().locator(".insight");
    for (let k = 0; k < Math.min(4, await ins.count()); k++) { await to(ins.nth(k)); await wait(1.2); }
  }
});
await scene(4, async () => {
  await lower("Tax calendar");
  await click(fr().locator("a[href='#/taxes']")); await wait(1.5);
  const evd = fr().locator(".day.ev");
  const n = await evd.count();
  for (let k = 1; k < Math.min(3, n); k++) { await to(evd.nth(k)); await wait(1.8); }
  await move(1000, 150); await wait(0.3);
  const b = await fr().locator(".reveal").first().boundingBox().catch(() => null);
  if (b) { focus.push({ t: now(), x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), label: "Delaware reveal: notice vs owe vs keep" }); await zoom(b.x + b.width / 2, b.y + b.height / 2, 1.3); await wait(4.5); await zoom(b.x + b.width / 2, b.y + b.height / 2, 0); await wait(1.4); }
});
await scene(5, async () => {
  await lower("Ask the agent · QM");
  await click(page.locator('.navrow:has-text("New session")')); await wait(2);
  const box = page.locator('textarea, [contenteditable="true"]').first();
  await to(box); await box.click(); await box.pressSequentially(QUESTION, { delay: 16 });
  await wait(0.4); await page.keyboard.press("Enter");
  const a = now() + 1.2;
  let last = "", stable = 0;
  for (let k = 0; k < 70; k++) {
    await wait(1.5);
    const t = await page.innerText("body").catch(() => "");
    const busy = /Thinking|Working/.test(t.slice(-400));
    stable = !busy && t === last && t.length > 0 ? stable + 1 : 0; last = t;
    if (stable >= 2 && k > 4) break;
  }
  const b = now() - 3.2;
  if (b > a) cut = { scene: 5, a, b };
  focus.push({ t: now(), x: 330, y: 60, w: 1260, h: 900, label: 'chat answer' });
  await move(1300, 700); await wait(4); await page.mouse.wheel(0, 500); await wait(3);
});
await scene(6, async () => {
  await lower("Memory · GBrain");
  await click(page.locator("#countinghouse-accounting")); await wait(1.5);
  await click(fr().locator("a[href='#/memory']")); await wait(2);
  const v = fr().locator("button:has-text('Categorization rules'), button:has-text('AWS (cloud)')");
  await click(v); await wait(2.5);
});
await lower(""); await caption(""); await card(ending);
await unfade(); await wait(5.2); const tEnd = now();
const video = page.video(); await ctx.close(); await browser.close();
const raw = await video.path();

// ---------- 3. assemble ----------
const map = (t) => t - tStart - (cut && t > cut.b ? cut.b - cut.a : 0);
const total = map(tEnd);
let vf;
if (cut) vf = `[0:v]trim=start=${tStart}:end=${cut.a},setpts=PTS-STARTPTS[a];[0:v]trim=start=${cut.b}:end=${tEnd},setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0,fps=30,format=yuv420p[v]`;
else vf = `[0:v]trim=start=${tStart}:end=${tEnd},setpts=PTS-STARTPTS,fps=30,format=yuv420p[v]`;
const af = marks.map((m, k) => `[${k + 1}:a]adelay=${Math.round(map(m.t) * 1000)}:all=1[n${k}]`).join(";") +
  ";" + marks.map((_, k) => `[n${k}]`).join("") + `amix=inputs=${marks.length}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad[au]`;
if (RAW) {
  const R = path.join(OUT, "raw"); fs.mkdirSync(R, { recursive: true });
  execFileSync(FF, ["-y", "-loglevel", "error", "-i", raw, "-filter_complex", vf, "-map", "[v]", "-t", total.toFixed(2), "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart", path.join(R, "screen.mp4")], { stdio: "inherit" });
  execFileSync(FF, ["-y", "-loglevel", "error", ...marks.flatMap((m) => ["-i", clips[m.i].file]), "-filter_complex", af.replace(/\[(\d+):a\]/g, (_, k) => `[${k - 1}:a]`), "-map", "[au]", "-t", total.toFixed(2), "-c:a", "libmp3lame", "-b:a", "192k", path.join(R, "narration.mp3")], { stdio: "inherit" });
  const tl = marks.map((m, k) => { const start = +map(m.t - 0.3).toFixed(2), end = +(k + 1 < marks.length ? map(marks[k + 1].t - 0.3) : total).toFixed(2);
    return { scene: m.i, start, end, audioStart: +map(m.t).toFixed(2), audioDur: +clips[m.i].d.toFixed(2), text: LINES[m.i],
      focus: focus.filter((f) => map(f.t) >= start && map(f.t) < end && !(cut && f.t > cut.a && f.t < cut.b)).map((f) => ({ ...f, t: +map(f.t).toFixed(2) })) }; });
  tl.push({ scene: "end", start: +map(tEnd - 5.2).toFixed(2), end: +total.toFixed(2), text: "", focus: [] });
  fs.writeFileSync(path.join(R, "timeline.json"), JSON.stringify(tl, null, 1));
  console.log("raw done", R, total.toFixed(1)); process.exit(0);
}
const outFile = path.join(OUT, FINAL ? "countinghouse-demo-final.mp4" : "countinghouse-demo-backup.mp4");
execFileSync(FF, ["-y", "-loglevel", "error", "-i", raw, ...marks.flatMap((m) => ["-i", clips[m.i].file]),
  "-filter_complex", vf + ";" + af, "-map", "[v]", "-map", "[au]", "-t", total.toFixed(2),
  "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30",
  "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", outFile], { stdio: "inherit" });
const desk = path.join(process.env.HOME, "Desktop");
fs.copyFileSync(outFile, path.join(desk, "countinghouse-demo.mp4"));
if (!FINAL) fs.copyFileSync(outFile, path.join(desk, "countinghouse-demo-backup.mp4"));
console.log("done", outFile, dur(outFile).toFixed(1) + "s", "cut", cut ? (cut.b - cut.a).toFixed(1) : 0, JSON.stringify(marks.map((m) => map(m.t).toFixed(1))));
