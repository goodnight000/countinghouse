import React from "react";
import {
  AbsoluteFill, Audio, Easing, Freeze, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { loadFont } from "@remotion/google-fonts/Manrope";
import TL from "./timeline.json";
import META from "./meta.json";

const { fontFamily } = loadFont("normal", { weights: ["600", "700", "800"], subsets: ["latin"] });
type Focus = { t: number; x: number; y: number; w: number; h: number; label?: string };
type Scene = { scene: number | string; start: number; end: number; text: string; focus: Focus[] };
const S = TL as Scene[];
const VDUR: number = (META as { duration: number }).duration;
const SPANS: number[][] = (META as { spans?: number[][] }).spans ?? S.map((s) => [s.start, s.end]);
const SP = (i: number) => ({ a: SPANS[i]?.[0] ?? S[i].start, b: SPANS[i]?.[1] ?? S[i].end });
const LAST_END = Math.max(VDUR, S[S.length - 1].end);
const ENDSC = S.findIndex((s) => !s.text.trim());
const END_AT = ENDSC >= 0 ? S[ENDSC].start + 0.3 : S[S.length - 1].end + 0.4; // end card begins
export const TOTAL = Math.min(179, Math.max(LAST_END, END_AT + 5));

const BLUE = "#2F6BEA", ORANGE = "#E8793A", INK = "#0E1116", TEXT = "#E6E6E6", MUTED = "#9AA3AE";
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ramp = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

// ---- cues: estimate a phrase's time from its character position in the scene text ----
const cue = (si: number, ...phrases: string[]) => {
  const s = S[si]; if (!s) return -99;
  const { a, b } = SP(si);
  const low = s.text.toLowerCase();
  for (const p of phrases) { const k = low.indexOf(p.toLowerCase()); if (k >= 0) return a + (b - a) * (k / low.length); }
  return (a + b) / 2;
};

// ---- camera ----
type Pose = { z: number; cx: number; cy: number };
const WIDE: Pose = { z: 1, cx: 960, cy: 540 };
const fitPose = (f: Focus): Pose => {
  const z = clamp(Math.min((1920 * 0.78) / f.w, (1080 * 0.7) / f.h), 1, 1.75);
  const hx = 960 / z, hy = 540 / z;
  return { z, cx: clamp(f.x + f.w / 2, hx, 1920 - hx), cy: clamp(f.y + f.h / 2, hy, 1080 - hy) };
};
type Target = { t: number; pose: Pose; focus?: Focus; drift: boolean };
const TARGETS: Target[] = (() => {
  const out: Target[] = [{ t: 0, pose: WIDE, drift: false }];
  S.forEach((s, i) => {
    if (i < 2) return;
    s.focus.forEach((f) => out.push({ t: Math.max(f.t, s.start), pose: fitPose(f), focus: f, drift: true }));
    const nxt = S[i + 1];
    const nextFirst = nxt?.focus[0]?.t ?? Infinity;
    const edge = Math.min(s.end, nxt?.start ?? Infinity);
    if (s.focus.length && (!nxt || nextFirst - nxt.start > 1.2)) out.push({ t: Math.max(edge - 0.6, (s.focus.at(-1)?.t ?? 0) + 2.5), pose: WIDE, drift: false });
  });
  out.sort((a, b) => a.t - b.t);
  return out.filter((x, i) => !(out[i + 1] && out[i + 1].t - x.t < 0.75)); // ponytail: drop beats too close to animate
})();
const MOVE = 1.1;
const drifted = (tg: Target, dt: number): Pose => {
  if (!tg.drift || dt <= 0) return tg.pose;
  const z = tg.pose.z * (1 + 0.012 * Math.min(dt, 8));
  const hx = 960 / z, hy = 540 / z;
  return { z, cx: clamp(tg.pose.cx + 3 * Math.min(dt, 8), hx, 1920 - hx), cy: clamp(tg.pose.cy, hy, 1080 - hy) };
};
const dur = (k: number) => Math.min(MOVE, (TARGETS[k + 1]?.t ?? Infinity) - TARGETS[k].t);
const camAt = (t: number): { pose: Pose; k: number; settle: number } => {
  let k = 0; while (k + 1 < TARGETS.length && TARGETS[k + 1].t <= t) k++;
  const tg = TARGETS[k], d = dur(k);
  if (k === 0) return { pose: tg.pose, k, settle: 1 };
  const prev = TARGETS[k - 1];
  const from = drifted(prev, tg.t - (prev.t + dur(k - 1)));
  const p = ramp(t, tg.t, tg.t + d);
  const to = drifted(tg, t - (tg.t + d));
  return { pose: { z: from.z + (to.z - from.z) * p, cx: from.cx + (to.cx - from.cx) * p, cy: from.cy + (to.cy - from.cy) * p }, k, settle: p };
};
const mapRect = (f: Focus, c: Pose) => ({ x: (f.x - c.cx) * c.z + 960, y: (f.y - c.cy) * c.z + 540, w: f.w * c.z, h: f.h * c.z });

// ---- mascot: Penny, a small ledger book ----
type PennyProps = { look: [number, number]; mouth: number; blink: number; armL: number; armR: number; thumb?: boolean; surprise?: number; bob: number };
const Arm: React.FC<{ x: number; y: number; a: number; thumb?: boolean }> = ({ x, y, a, thumb }) => (
  <g transform={`rotate(${a} ${x} ${y})`}>
    <line x1={x} y1={y} x2={x} y2={y + 46} stroke={INK} strokeWidth={8} strokeLinecap="round" />
    <circle cx={x} cy={y + 50} r={10} fill="#F4F1EA" stroke={INK} strokeWidth={4} />
    {thumb && <rect x={x - 4} y={y + 30} width={8} height={16} rx={4} fill="#F4F1EA" stroke={INK} strokeWidth={3} transform={`rotate(180 ${x} ${y + 44})`} />}
  </g>
);
const Penny: React.FC<PennyProps> = ({ look, mouth, blink, armL, armR, thumb, surprise = 0, bob }) => {
  const ey = 1 - blink, eyeR = 13 + surprise * 3;
  return (
    <svg width={200} height={250} viewBox="0 0 200 250" style={{ overflow: "visible" }}>
      <ellipse cx={100} cy={238} rx={58} ry={8} fill="rgba(0,0,0,0.28)" />
      <g transform={`translate(0 ${bob})`}>
        <line x1={78} y1={196} x2={74} y2={228} stroke={INK} strokeWidth={8} strokeLinecap="round" />
        <line x1={122} y1={196} x2={126} y2={228} stroke={INK} strokeWidth={8} strokeLinecap="round" />
        <ellipse cx={70} cy={231} rx={14} ry={7} fill={INK} />
        <ellipse cx={130} cy={231} rx={14} ry={7} fill={INK} />
        <Arm x={42} y={128} a={armL} />
        <Arm x={158} y={128} a={armR} thumb={thumb} />
        <rect x={40} y={40} width={124} height={160} rx={20} fill="#F4F1EA" />
        <rect x={36} y={36} width={120} height={160} rx={20} fill={BLUE} />
        <rect x={36} y={36} width={22} height={160} rx={11} fill="#2358C9" />
        <rect x={120} y={36} width={12} height={40} fill="#F0B43C" />
        <path d="M120 76 L126 70 L132 76 Z" fill={BLUE} />
        {[82, 124].map((cx) => (
          <g key={cx} transform={`translate(${cx} 104) scale(1 ${Math.max(0.08, ey)})`}>
            <ellipse cx={0} cy={0} rx={eyeR} ry={eyeR + 2} fill="#FFFFFF" />
            <circle cx={look[0] * 5} cy={look[1] * 5} r={6.5} fill={INK} />
          </g>
        ))}
        {surprise > 0.5 ? (
          <ellipse cx={103} cy={148} rx={9} ry={12} fill={INK} />
        ) : mouth > 0.08 ? (
          <ellipse cx={103} cy={146} rx={12} ry={2 + mouth * 11} fill={INK} />
        ) : (
          <path d="M89 142 Q103 155 117 142" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        )}
      </g>
    </svg>
  );
};

// ---- captions ----
const CHUNKS = S.filter((s) => s.text.trim()).flatMap((s) => {
  const parts: string[] = [];
  for (const sent of s.text.match(/[^.!?]+[.!?]*\s*/g) ?? [s.text]) {
    const x = sent.trim(); if (!x) continue;
    if (x.length <= 95) { parts.push(x); continue; }
    let cur = "";
    for (const piece of x.split(/(?<=[,:;])\s+/)) { if ((cur + " " + piece).trim().length > 95 && cur) { parts.push(cur.trim()); cur = piece; } else cur = (cur + " " + piece).trim(); }
    if (cur) parts.push(cur);
  }
  const total = parts.reduce((a, p) => a + p.length, 0); let acc = 0; const sp = SP(S.indexOf(s));
  return parts.map((p) => { const a = sp.a + ((sp.b - sp.a) * acc) / total; acc += p.length; return { a, b: sp.a + ((sp.b - sp.a) * acc) / total, text: p }; });
});

const LABELS = ["", "", "Accounting inside QM", "Advisor · GPT-6 Luna", "Tax calendar", "Ask the agent", "Memory · GBrain"];
const sceneLabel = (i: number) => LABELS[i] ?? "";

const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", background: "rgba(16,19,24,0.94)", borderRadius: 14, padding: "20px 28px", boxShadow: "0 12px 40px rgba(0,0,0,0.35)", color: TEXT, ...style }}>{children}</div>
);
const money = (v: number) => "$" + Math.round(v).toLocaleString("en-US");

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const audio = useAudioData(staticFile("narration.mp3"));
  let amp = 0;
  if (audio && t < LAST_END) {
    const v = visualizeAudio({ fps, frame, audioData: audio, numberOfSamples: 16 });
    amp = clamp((v.slice(1, 7).reduce((a, b) => a + b, 0) / 6) * 6, 0, 1);
  }
  const si = Math.max(0, S.findIndex((s, i) => t < (S[i + 1]?.start ?? Infinity)));
  const scene = S[si];
  const { pose, k, settle } = camAt(t);
  const tg = TARGETS[k];
  const vf = Math.round(VDUR * fps) - 1;

  // opening / diagram dimming
  const s1end = S[1]?.end ?? 20;
  const dim = t < s1end ? interpolate(t, [0, 0.6], [0.4, 0.72], { extrapolateRight: "clamp" }) : interpolate(t, [s1end, s1end + 0.8], [0.72, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const blur = interpolate(t, [S[1]?.start - 0.6, S[1]?.start + 0.4], [10, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (t < s1end + 0.8 ? 1 - ramp(t, s1end, s1end + 0.8) : 0);
  const endP = ramp(t, END_AT, END_AT + 1);

  // focus ring
  const nextT = TARGETS[k + 1]?.t ?? Infinity;
  const ringOn = tg.focus && settle >= 1 ? ramp(t, tg.t + dur(k), tg.t + dur(k) + 0.6) * (1 - ramp(t, nextT - 0.35, nextT)) : 0;
  const r = tg.focus ? mapRect(tg.focus, pose) : null;

  // mascot placement: big intro -> corner -> end card
  const toCorner = ramp(t, S[1].start - 0.4, S[1].start + 0.7);
  const big = { x: 560, y: 560, s: 2.1 }, corner = { x: 1790, y: 965, s: 0.78 }, end = { x: 470, y: 560, s: 1.9 };
  let mx = big.x + (corner.x - big.x) * toCorner, my = big.y + (corner.y - big.y) * toCorner, ms = big.s + (corner.s - big.s) * toCorner;
  mx += (end.x - mx) * endP; my += (end.y - my) * endP; ms += (end.s - ms) * endP;

  // gestures
  const tUp = cue(3, "twelve point six", "12.6"), tWow = cue(4, "eighty-five", "85,215", "85"), tNod = cue(4, "eight hundred fifty", "850");
  const thumb = t > tUp && t < tUp + 3;
  const surprise = t > tWow && t < tWow + 2.2 ? 1 : 0;
  const nod = t > tNod && t < tNod + 1.4 ? Math.sin((t - tNod) * Math.PI * 2 / 0.7) * 7 : 0;
  const blink = frame % 97 < 4 ? Math.sin(((frame % 97) / 4) * Math.PI) : 0;
  const bob = Math.sin(t * 2.2) * 3 + nod;
  // point toward focus with the left arm (mascot sits bottom-right)
  let armL = 18, armR = -18, look: [number, number] = [0, 0];
  const hand = { x: mx + (42 - 100) * ms, y: my + (128 - 125) * ms };
  if (r && ringOn > 0.05 && endP === 0) {
    const dx = r.x + r.w / 2 - hand.x, dy = r.y + r.h / 2 - hand.y;
    armL = (Math.atan2(-dx, dy) * 180) / Math.PI * ringOn + 18 * (1 - ringOn);
    const n = Math.hypot(dx, dy) || 1; look = [dx / n, dy / n];
  }
  if (thumb) armR = -150;
  if (endP > 0) armR = -140 + Math.sin(t * 7) * 22 * endP;
  if (t < S[1].start) { armL = 20 + Math.sin(t * 1.3) * 10; armR = -40 + Math.sin(t * 1.7) * 18; look = [0.6, -0.1]; }

  // arrow from mascot toward ring
  let arrow: null | { x1: number; y1: number; x2: number; y2: number } = null;
  if (r && ringOn > 0) {
    const nx = clamp(hand.x, r.x, r.x + r.w), ny = clamp(hand.y, r.y, r.y + r.h);
    const ux = hand.x - nx, uy = hand.y - ny, n = Math.hypot(ux, uy);
    if (n > 260) arrow = { x1: nx + (ux / n) * 150, y1: ny + (uy / n) * 150, x2: nx + (ux / n) * 18, y2: ny + (uy / n) * 18 };
  }

  // callouts
  const c2a = cue(2, "two point one", "2.1"), c2b = cue(2, "eleven months", "runway");
  const c3a = cue(3, "adopt"), c3b = cue(3, "eleven point three", "11.3");
  const callSide: React.CSSProperties = { right: 250, bottom: 150 };
  const cnt = (a: number, from: number, to: number) => from + (to - from) * ramp(t, a, a + 1.1);
  const vis = (a: number, b: number) => ramp(t, a, a + 0.35) * (1 - ramp(t, b - 0.35, b));
  const calls: React.ReactNode[] = [];
  const pushCall = (a: number, b: number, node: React.ReactNode) => {
    const o = vis(a, b); if (o <= 0) return;
    calls.push(<Card key={a} style={{ ...callSide, opacity: o, transform: `translateY(${(1 - o) * -10}px)` }}>{node}</Card>);
  };
  const Lab = ({ c }: { c: string }) => <div style={{ fontSize: 22, color: MUTED, fontWeight: 600, marginBottom: 6 }}>{c}</div>;
  const Big = ({ c, col = TEXT, strike = 0 }: { c: string; col?: string; strike?: number }) => (
    <span style={{ position: "relative", fontSize: 58, fontWeight: 700, color: col, fontVariantNumeric: "tabular-nums", letterSpacing: -1 }}>
      {c}{strike > 0 && <span style={{ position: "absolute", left: -4, right: -4, top: "52%", height: 5, background: ORANGE, transform: `scaleX(${strike})`, transformOrigin: "left" }} />}
    </span>
  );
  pushCall(c2a, c2b - 0.2, <><Lab c="Cash on hand" /><Big c={`$${cnt(c2a, 0, 2.1).toFixed(1)}M`} /></>);
  pushCall(c2b, Math.min(c2b + 5, S[2].end), <><Lab c="Runway" /><Big c={`${cnt(c2b, 0, 11.3).toFixed(1)} mo`} /></>);
  pushCall(c3a - 2.5, Math.min(c3b + 6, S[3].end + 0.3), <>
    <Lab c="Savings found" /><Big c={`${money(cnt(c3a - 2.5, 0, 14028))}/mo`} col={BLUE} />
    <div style={{ opacity: ramp(t, c3b, c3b + 0.4), marginTop: 14 }}><Lab c="Runway" /><Big c={`11.3 → ${cnt(c3b + 0.3, 11.3, 12.6).toFixed(1)} mo`} /></div>
  </>);
  pushCall(tWow - 0.3, Math.min(tNod + 5, S[4].end + 0.3), <>
    <Lab c="Delaware franchise tax" />
    <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
      <Big c={money(cnt(tWow - 0.3, 0, 85215))} col={ORANGE} strike={ramp(t, tNod - 0.2, tNod + 0.4)} />
      <span style={{ opacity: ramp(t, tNod, tNod + 0.4) }}><Big c={money(cnt(tNod, 0, 850))} col={BLUE} /></span>
    </div>
  </>);

  // caption
  const cap = t < END_AT ? CHUNKS.find((c) => t >= c.a && t < c.b + 0.25) : undefined;
  const capTop = !!(r && ringOn > 0 && r.h < 500 && r.y + r.h > 840 && r.x < 1560 && r.x + r.w > 360);
  const lbl = si >= 2 ? sceneLabel(si) : "";
  const lblO = lbl ? ramp(t, scene.start + 0.3, scene.start + 0.8) * (1 - ramp(t, scene.start + 4.5, scene.start + 5)) : 0;

  // intro lines and flow diagram
  const intro = ["Startups don't fail on product.", "They run out of money.", "Or get blindsided by a tax bill.", "No CFO. A spreadsheet and a bank login."];
  const introT = [cue(0, "most"), cue(0, "they run"), cue(0, "or they get"), cue(0, "seed-stage")];
  const introO = 1 - ramp(t, S[1].start - 0.5, S[1].start + 0.2);
  const d0 = cue(1, "pulls every"), dL = cue(1, "one ledger"), dG = cue(1, "gbrain"), dQ = cue(1, "agent on top"), dC = cue(1, "acts like a cfo", "cfo");
  const diagO = ramp(t, S[1].start, S[1].start + 0.6) * (1 - ramp(t, s1end - 0.2, s1end + 0.5));
  const SRC = ["Mercury", "Brex", "Ramp", "Stripe", "Gusto", "AWS", "Carta"];
  const draw = (a: number) => 1 - ramp(t, a, a + 0.8);

  const video = <OffthreadVideo src={staticFile("screen.mp4")} muted style={{ width: 1920, height: 1080 }} />;
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily }}>
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${960 - pose.cx * pose.z}px, ${540 - pose.cy * pose.z}px) scale(${pose.z})`, filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
        {frame >= vf ? <Freeze frame={vf}>{video}</Freeze> : video}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: INK, opacity: Math.max(dim, endP * 0.8) }} />

      {/* intro kinetic lines */}
      {introO > 0 && (
        <div style={{ position: "absolute", left: 900, top: 330, opacity: introO }}>
          {intro.map((l, i) => { const o = ramp(t, introT[i] - 0.1, introT[i] + 0.5); return (
            <div key={i} style={{ fontSize: i === 0 ? 52 : 60, fontWeight: 700, color: i === 0 ? MUTED : TEXT, opacity: o, transform: `translateY(${(1 - o) * 16}px)`, margin: "10px 0", letterSpacing: -1 }}>{l}</div>); })}
        </div>
      )}

      {/* flow diagram */}
      {diagO > 0 && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: diagO, fontFamily }}>
          <defs><marker id="ah" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#6B7380" /></marker></defs>
          <text x={160} y={170} fontSize={60} fontWeight={700} fill={TEXT} opacity={ramp(t, S[1].start, S[1].start + 0.6)}>Countinghouse</text>
          <text x={160} y={222} fontSize={30} fill={MUTED} opacity={ramp(t, S[1].start + 0.3, S[1].start + 0.9)}>an open-source finance team you run yourself</text>
          {SRC.map((a, i) => { const at = d0 + i * 0.15; return (
            <g key={a} opacity={ramp(t, at - 0.8, at - 0.3)}>
              <text x={360} y={330 + i * 84} textAnchor="end" fontSize={32} fontWeight={600} fill="#C9CDD2">{a}</text>
              <line x1={380} y1={319 + i * 84} x2={640} y2={570} stroke="#6B7380" strokeWidth={2.5} markerEnd="url(#ah)" pathLength={1} strokeDasharray={1} strokeDashoffset={draw(at)} />
            </g>); })}
          {[{ x: 652, w: 300, t: "Ledger", s: "every account, one book", a: dL }, { x: 1090, w: 320, t: "GBrain", s: "memory, plain markdown", a: dG }, { x: 1548, w: 300, t: "QM agent", s: "= your CFO", a: dQ, hi: true }].map((b, i, arr) => (
            <g key={b.t}>
              <g opacity={ramp(t, b.a - 0.2, b.a + 0.4)}>
                <rect x={b.x} y={505} width={b.w} height={130} rx={14} fill={b.hi ? "#16213A" : "#171A1F"} stroke={b.hi ? BLUE : "#3A3F46"} strokeWidth={b.hi ? 3 : 2} />
                <text x={b.x + b.w / 2} y={562} textAnchor="middle" fontSize={38} fontWeight={700} fill={TEXT}>{b.t}</text>
                <text x={b.x + b.w / 2} y={603} textAnchor="middle" fontSize={23} fill={b.hi ? "#9DB8F5" : MUTED}>{b.s}</text>
              </g>
              {i < 2 && <line x1={b.x + b.w + 6} y1={570} x2={arr[i + 1].x - 8} y2={570} stroke="#6B7380" strokeWidth={2.5} markerEnd="url(#ah)" pathLength={1} strokeDasharray={1} strokeDashoffset={draw(arr[i + 1].a - 0.7)} />}
            </g>
          ))}
          {t > dC - 0.2 && <rect x={1540} y={497} width={316} height={146} rx={18} fill="none" stroke={BLUE} strokeWidth={2} opacity={0.5 * (1 - ramp(t, dC, dC + 1.2))} />}
        </svg>
      )}

      {/* focus ring + arrow */}
      {r && ringOn > 0 && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <rect x={r.x - 10} y={r.y - 10} width={r.w + 20} height={r.h + 20} rx={14} fill="none" stroke={BLUE} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ringOn} style={{ filter: "drop-shadow(0 0 10px rgba(47,107,234,0.45))" }} />
          {arrow && (
            <g opacity={ramp(t, tg.t + dur(k) + 0.5, tg.t + dur(k) + 0.8) * ringOn}>
              <line x1={arrow.x1} y1={arrow.y1} x2={arrow.x2} y2={arrow.y2} stroke={BLUE} strokeWidth={5} strokeLinecap="round" />
              <circle cx={arrow.x2} cy={arrow.y2} r={7} fill={BLUE} />
            </g>
          )}
        </svg>
      )}

      {calls}

      {/* lower third */}
      {lblO > 0 && (
        <div style={{ position: "absolute", left: 56, bottom: 190, opacity: lblO, transform: `translateX(${(1 - lblO) * -14}px)`, background: "rgba(16,19,24,0.94)", color: TEXT, fontSize: 26, fontWeight: 700, padding: "14px 22px 14px 18px", borderLeft: `4px solid ${BLUE}`, borderRadius: "0 8px 8px 0", boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}>{lbl}</div>
      )}

      {/* caption */}
      {cap && (
        <div style={{ position: "absolute", left: 0, right: 0, [capTop ? "top" : "bottom"]: 56, display: "flex", justifyContent: "center" }}>
          <div style={{ maxWidth: 1180, background: "rgba(12,14,18,0.82)", color: "#EDEDED", fontSize: 34, lineHeight: 1.35, fontWeight: 600, padding: "12px 26px", borderRadius: 10, textAlign: "center" }}>{cap.text}</div>
        </div>
      )}

      {/* mascot */}
      <div style={{ position: "absolute", left: mx - 100 * ms, top: my - 125 * ms, width: 200, height: 250, transform: `scale(${ms})`, transformOrigin: "0 0", filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.35))" }}>
        <Penny look={look} mouth={t < LAST_END ? amp : 0} blink={blink} armL={armL} armR={armR} thumb={thumb} surprise={surprise} bob={bob} />
      </div>

      {/* end card */}
      {endP > 0 && (
        <div style={{ position: "absolute", left: 760, top: 340, opacity: endP, transform: `translateY(${(1 - endP) * 14}px)`, color: TEXT }}>
          <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: -2 }}>Countinghouse</div>
          <div style={{ fontSize: 40, color: "#B8BEC6", fontWeight: 600, marginTop: 6 }}>An open-source CFO for startups</div>
          <div style={{ fontSize: 36, color: "#8FB0F5", marginTop: 48, fontWeight: 600, opacity: ramp(t, END_AT + 0.6, END_AT + 1.2) }}>github.com/goodnight000/countinghouse</div>
          <div style={{ display: "inline-block", marginTop: 22, fontSize: 34, fontFamily: "Menlo, monospace", background: "#1A1D22", padding: "12px 22px", borderRadius: 8, opacity: ramp(t, END_AT + 1.1, END_AT + 1.7) }}>./start.sh</div>
        </div>
      )}
      <Audio src={staticFile("narration.mp3")} />
    </AbsoluteFill>
  );
};
