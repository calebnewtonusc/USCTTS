/* The four storefront windows, drawn to canvases for the 3D street.
 *
 * Each is the SVG design the walkthrough used on 2026-10-04 (an inbox, a
 * spreadsheet that becomes CRM cards, a list that marks the leads worth
 * reaching, a lesson card), redrawn with the 2D canvas API so it can be a
 * texture in the world instead of an HTML card over it. Each takes p, its
 * beat's progress from 0 to 1, and every item's own progress comes from p
 * and its index, so the panel plays continuously with the scroll.
 *
 * The data is made up and generic: no real companies or people. */

export const PANEL_W = 1040;
export const PANEL_H = 840;
// Drawn in the SVG's 520-unit space, doubled.
const S = 2;

const INK = "#2a1b1e";
const INK2 = "#6f6264";
const RULE = "rgba(42,27,30,0.14)";
const BLUE = "#2f80ed";
const BLUE_SOFT = "#e3efff";
const BLUE_INK = "#1f63c6";
const TEAL = "#12a594";
const TEAL_SOFT = "#dcf3ef";
const TEAL_INK = "#0b6e63";
const CARDINAL = "#990000";
const GOLD = "#ffcc00";
const GOLD_SOFT = "#fff1b8";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

type Ctx = CanvasRenderingContext2D;
export type Draw = (ctx: Ctx, p: number, font: string) => void;

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
function text(
  ctx: Ctx,
  s: string,
  x: number,
  y: number,
  size: number,
  color: string,
  font: string,
  align: CanvasTextAlign = "left",
) {
  ctx.font = `${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(s, x, y);
}
function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number) {
  ctx.strokeStyle = RULE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
function pill(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  label: string,
  bg: string,
  fg: string,
  font: string,
) {
  rr(ctx, x, y, w, 20, 10);
  ctx.fillStyle = bg;
  ctx.fill();
  text(ctx, label, x + w / 2, y + 14, 12, fg, font, "center");
}
function card(ctx: Ctx, x: number, y: number, w: number, h: number, r = 14) {
  ctx.save();
  ctx.shadowColor = "rgba(42,27,30,0.12)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.restore();
  rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r);
  ctx.strokeStyle = RULE;
  ctx.stroke();
}
function bar(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  left: string,
  right: string,
  font: string,
) {
  text(ctx, left, x + 20, y + 30, 15, INK, font);
  if (right) text(ctx, right, x + w - 20, y + 30, 15, INK2, font, "right");
  line(ctx, x, y + 47.5, x + w, y + 47.5);
}

/* 1. The café: its inbox, replies drafted one by one. */
const EMAILS: [string, string, string][] = [
  [
    "O",
    "Can I move my pickup to Friday?",
    "Yes, Friday works. I've moved it for you.",
  ],
  [
    "N",
    "Do you cater for 20 people?",
    "We do! Here's our catering menu and prices.",
  ],
  [
    "B",
    "I was charged twice this morning",
    "Sorry! I've refunded the second charge.",
  ],
  ["R", "Are you open on the holiday?", "We are, 7am to 2pm. See you then!"],
  [
    "T",
    "Can I book the back room Saturday?",
    "It's yours from 6pm. Want me to hold it?",
  ],
];
const inbox: Draw = (ctx, p, font) => {
  const x = 0,
    y = 0,
    w = 520,
    RH = 66;
  card(ctx, x, y, w, 48 + RH * EMAILS.length + 2);
  bar(ctx, x, y, w, "Inbox", "5 waiting", font);
  EMAILS.forEach(([init, subj, draft], i) => {
    const k = clamp((p - i * 0.17) * 5);
    const top = 48 + i * RH;
    if (k > 0) {
      ctx.globalAlpha = k * 0.85;
      ctx.fillStyle = BLUE_SOFT;
      ctx.fillRect(1, top, w - 2, RH);
      ctx.globalAlpha = 1;
    }
    ctx.beginPath();
    ctx.arc(34, top + 33, 15, 0, Math.PI * 2);
    ctx.fillStyle = BLUE_SOFT;
    ctx.fill();
    text(ctx, init, 34, top + 38, 13, BLUE_INK, font, "center");
    text(ctx, subj, 62, top + 28, 15, INK, font);
    ctx.globalAlpha = k;
    text(ctx, draft, 62, top + 49, 12.5, BLUE_INK, font);
    pill(ctx, 436 - (1 - k) * 8, top + 9, 66, "Drafted", BLUE, "#fff", font);
    ctx.globalAlpha = 1;
    if (i < EMAILS.length - 1) line(ctx, 0, top + RH - 0.5, w, top + RH - 0.5);
  });
  note(ctx, 384, -12, "reply to 41", "emails??", font);
};
/** A sticky note, taped on at an angle. */
function note(ctx: Ctx, x: number, y: number, a: string, b: string, font: string) {
  ctx.save();
  ctx.translate(x + 60, y + 44);
  ctx.rotate(0.07);
  ctx.shadowColor = "rgba(42,27,30,0.18)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = "#ffe36e";
  ctx.fillRect(-60, -44, 120, 88);
  ctx.shadowColor = "transparent";
  text(ctx, a, 0, -6, 17, INK, `"Bradley Hand", "Marker Felt", "Segoe Print", ${font}`, "center");
  text(ctx, b, 0, 18, 17, INK, `"Bradley Hand", "Marker Felt", "Segoe Print", ${font}`, "center");
  ctx.restore();
}
function tape(ctx: Ctx, x: number, y: number, r: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(r);
  ctx.fillStyle = "rgba(235,228,205,0.85)";
  ctx.fillRect(-28, -9, 56, 18);
  ctx.restore();
}

/* 2. The law firm: a messy spreadsheet whose rows become CRM cards. */
const SHEET = [
  ["jen m", "jen@??", "called 3/2?", "maybe"],
  ["D. Ortiz", "N/A", "", "HOT!!"],
  ["sam (expo)", "sam.k@mail", "left vm", ""],
  ["Priya", "", "emailed 2x", "follow up"],
];
const CARDS = [
  ["Jen M.", "New lead", "Consult booked Thursday"],
  ["D. Ortiz", "Talking", "Sent the retainer"],
  ["Sam K.", "New lead", "Met at the expo"],
  ["Priya S.", "Talking", "Follow up Monday"],
];
const crm: Draw = (ctx, p, font) => {
  const COL = [16, 136, 262, 404];
  const sheetA = clamp(1 - p * 1.6);
  if (sheetA > 0) {
    ctx.globalAlpha = sheetA;
    card(ctx, 0, 0, 520, 300);
    const mono = `ui-monospace, Menlo, monospace`;
    bar(ctx, 0, 0, 520, "", "", font);
    text(ctx, "leads_FINAL_v3.xlsx", 20, 30, 14, INK, mono);
    ctx.fillStyle = "#f6f4ef";
    ctx.fillRect(1, 48, 518, 40);
    ["name", "email", "notes", "??"].forEach((h, k) =>
      text(ctx, h, COL[k], 73, 12.5, INK2, mono),
    );
    [1, 2, 3].forEach((k) => line(ctx, COL[k] - 10.5, 48, COL[k] - 10.5, 300));
    SHEET.forEach((r, i) => {
      const k = clamp((p - i * 0.14) * 3.2);
      ctx.globalAlpha = sheetA * (1 - k);
      const top = 88 + i * 53 - k * 14;
      line(ctx, 0, top + 0.5, 520, top + 0.5);
      r.forEach((c, j) => text(ctx, c, COL[j], top + 32, 12.5, INK, mono));
    });
    ctx.globalAlpha = sheetA;
    // Taped to the window, the way it really lives.
    tape(ctx, 12, 4, -0.5);
    tape(ctx, 508, 4, 0.5);
    ctx.globalAlpha = 1;
  }
  CARDS.forEach(([name, stage, note], i) => {
    const k = clamp((p - 0.1 - i * 0.14) * 3.2);
    if (k <= 0) return;
    const x = (i % 2) * 266,
      y = Math.floor(i / 2) * 150 + 20 - (1 - k) * 18;
    ctx.globalAlpha = k;
    card(ctx, x, y, 254, 133, 12);
    ctx.fillStyle = TEAL;
    rr(ctx, x + 0.5, y + 0.5, 6, 132, 3);
    ctx.fill();
    text(ctx, name, x + 20, y + 36, 18, INK, font);
    const on = stage === "Talking";
    pill(
      ctx,
      x + 20,
      y + 50,
      on ? 62 : 72,
      stage,
      on ? TEAL : TEAL_SOFT,
      on ? "#fff" : TEAL_INK,
      font,
    );
    text(ctx, note, x + 20, y + 96, 12.5, INK2, font);
    ctx.globalAlpha = 1;
  });
};

/* 3. The shop: everyone it could reach, the ones worth it marked and
 * risen to the top. */
const PROSPECTS: [string, boolean][] = [
  ["A yoga studio in Los Feliz", false],
  ["A bridal shop in Glendale", true],
  ["A gym in Burbank", false],
  ["A bakery opening in Pasadena", true],
  ["A florist in Santa Monica", false],
  ["A salon in Long Beach", false],
  ["A car wash in Torrance", false],
  ["A café opening in Echo Park", true],
];
const list: Draw = (ctx, p, font) => {
  card(ctx, 0, 0, 520, 404);
  bar(ctx, 0, 0, 520, "Find the 12 who'll actually buy", "12 of 412", font);
  const keep = PROSPECTS.map((r, i) => (r[1] ? i : -1)).filter((i) => i >= 0);
  const rest = PROSPECTS.map((r, i) => (r[1] ? -1 : i)).filter((i) => i >= 0);
  const to = new Map<number, number>();
  [...keep, ...rest].forEach((i, k) => to.set(i, k));
  const move = clamp((p - 0.45) * 2.4);
  // The rows worth reaching are drawn last, so they pass over the rest.
  for (const i of [...rest, ...keep]) {
    const [name, worth] = PROSPECTS[i];
    const mark = clamp((p - i * 0.035) * 4);
    const y = 50 + (i + ((to.get(i) ?? i) - i) * move) * 44;
    ctx.fillStyle = "#fff";
    ctx.fillRect(2, y, 516, 44);
    line(ctx, 16, y + 43.5, 504, y + 43.5);
    ctx.beginPath();
    ctx.arc(26, y + 22, 5, 0, Math.PI * 2);
    ctx.fillStyle = worth ? `rgba(153,0,0,${mark})` : "#fff";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = worth ? CARDINAL : RULE;
    ctx.stroke();
    text(
      ctx,
      name,
      44,
      y + 27,
      15,
      worth ? INK : `rgba(42,27,30,${1 - move * 0.4})`,
      font,
    );
    if (worth) {
      ctx.globalAlpha = mark;
      pill(ctx, 400, y + 12, 104, "Worth reaching", CARDINAL, "#fff", font);
      ctx.globalAlpha = 1;
    }
  }
};

/* 4. The dental office: a lesson, a question from the staff answered
 * step by step. */
const ANSWER = [
  [
    "Paste in three replies you've already sent",
    "that sound like your office.",
  ],
  ["Ask it to write the new one in the same voice."],
  ["Then read it out loud before you send it."],
];
const lesson: Draw = (ctx, p, font) => {
  card(ctx, 0, 0, 520, 330);
  ctx.fillStyle = GOLD_SOFT;
  ctx.save();
  rr(ctx, 1, 1, 518, 47, 13);
  ctx.clip();
  ctx.fillRect(0, 0, 520, 47);
  ctx.restore();
  bar(ctx, 0, 0, 520, "Lesson 3: Getting AI to sound like you", "3 of 8", font);
  ctx.beginPath();
  ctx.arc(38, 90, 15, 0, Math.PI * 2);
  ctx.fillStyle = GOLD_SOFT;
  ctx.fill();
  text(ctx, "M", 38, 95, 13, "#7a5a00", font, "center");
  rr(ctx, 64, 66, 400, 58, 14);
  ctx.fillStyle = GOLD_SOFT;
  ctx.fill();
  text(
    ctx,
    "How do I get it to write patient emails that",
    80,
    90,
    15,
    INK,
    font,
  );
  text(ctx, "sound like us, not like a robot?", 80, 111, 15, INK, font);
  ANSWER.forEach((lines, i) => {
    const k = clamp((p - 0.08 - i * 0.26) * 3.5);
    if (k <= 0) return;
    const y = 150 + i * 54 + (1 - k) * 8;
    ctx.globalAlpha = k;
    ctx.beginPath();
    ctx.arc(92, y + 14, 11, 0, Math.PI * 2);
    ctx.fillStyle = GOLD;
    ctx.fill();
    text(ctx, String(i + 1), 92, y + 18, 12, INK, font, "center");
    lines.forEach((l, j) => text(ctx, l, 114, y + 19 + j * 21, 15, INK, font));
    ctx.globalAlpha = 1;
  });
};

const PANELS: Draw[] = [inbox, crm, list, lesson];
// Each panel's height in the 520-wide drawing, to centre it.
const DRAWN_H = [382, 300, 404, 330];

/** Draws panel k at progress p: a clean wall-white behind the card, so the
 * window reads lit, and the card centred on it. */
export function drawPanel(k: number, ctx: Ctx, p: number, font: string) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#f7f9fc";
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  ctx.setTransform(S, 0, 0, S, 0, (PANEL_H - DRAWN_H[k] * S) / 2);
  PANELS[k](ctx, p, font);
}
