import PptxGenJS from "pptxgenjs";

// ── Canvas (LAYOUT_WIDE 16:9 = 13.33" × 7.5") ────────────────────────────────
const W        = 13.33;
const H        = 7.5;
const HEADER_H = 1.35;
const MX       = 0.55;
const MY       = 0.22;

// ── Themes ────────────────────────────────────────────────────────────────────
const THEMES = {
  professional: {
    bg: "0C2449", headerBg: "0C2449", bodyBg: "FFFFFF",
    titleText: "FFFFFF", bodyText: "0C2449",
    subtitleText: "6B90B8", accentColor: "3A8DDE", accentLight: "7AB8F0",
    footerText: "7A9EC0", titleSlideText: "FFFFFF", dark: true,
  },
  bold: {
    bg: "0A0A0A", headerBg: "0A0A0A", bodyBg: "F5F5F5",
    titleText: "E8A020", bodyText: "111111",
    subtitleText: "777777", accentColor: "E8A020", accentLight: "FFD06A",
    footerText: "999999", titleSlideText: "E8A020", dark: true,
  },
  minimal: {
    bg: "FEFEFE", headerBg: "222222", bodyBg: "FFFFFF",
    titleText: "FFFFFF", bodyText: "2A2A2A",
    subtitleText: "888888", accentColor: "333333", accentLight: "AAAAAA",
    footerText: "BBBBBB", titleSlideText: "111111", dark: false,
  },
  playful: {
    bg: "3D1F9E", headerBg: "3D1F9E", bodyBg: "FAF8FF",
    titleText: "FFFFFF", bodyText: "20086A",
    subtitleText: "7A55C0", accentColor: "FFD600", accentLight: "FFE866",
    footerText: "8866CC", titleSlideText: "FFFFFF", dark: true,
  },
  corporate: {
    bg: "001D3D", headerBg: "001D3D", bodyBg: "EDF2F7",
    titleText: "FFFFFF", bodyText: "001D3D",
    subtitleText: "4A6C8A", accentColor: "0072CE", accentLight: "4499E8",
    footerText: "5588AA", titleSlideText: "FFFFFF", dark: true,
  },
};

// ── Color helpers ─────────────────────────────────────────────────────────────
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
function lighten(hex, pct) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
  const m = c => clamp(Math.round(c + (255 - c) * pct), 0, 255).toString(16).padStart(2, "0");
  return `${m(r)}${m(g)}${m(b)}`;
}
function darken(hex, pct) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
  const m = c => clamp(Math.round(c * (1 - pct)), 0, 255).toString(16).padStart(2, "0");
  return `${m(r)}${m(g)}${m(b)}`;
}

// ── Primitive helpers ─────────────────────────────────────────────────────────
// All shapes added here go BELOW text. Text is always added last.

function R(slide, x, y, w, h, color, tr = 0) {
  slide.addShape("rect", {
    x, y, w, h,
    fill: { color, transparency: tr },
    line: { color, pt: 0 },
  });
}

function C(slide, cx, cy, size, color, tr = 0) {
  const half = size / 2;
  slide.addShape("ellipse", {
    x: cx - half, y: cy - half, w: size, h: size,
    fill: { color, transparency: tr },
    line: { color, pt: 0 },
  });
}

// Circle outline only
function CO(slide, cx, cy, size, color, tr = 0, pt = 2) {
  const half = size / 2;
  slide.addShape("ellipse", {
    x: cx - half, y: cy - half, w: size, h: size,
    fill: { color, transparency: 100 },
    line: { color, pt, transparency: tr },
  });
}

// Dot grid in a bounding box (safe to use in non-text areas)
function dots(slide, x0, y0, cols, rows, dot, gx, gy, color, tr) {
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      slide.addShape("ellipse", {
        x: x0 + c * gx, y: y0 + r * gy, w: dot, h: dot,
        fill: { color, transparency: tr },
        line: { color, pt: 0 },
      });
}

// ── Title slide designs ───────────────────────────────────────────────────────
// Rule: ALL geometric shapes must stay in the RIGHT 45% (x > W*0.55) or
//       in the bottom strip (y > H*0.78). The left 55% is the TEXT ZONE — clean.

function titleProfessional(slide, t) {
  // Full background
  R(slide, 0, 0, W, H, t.bg);

  // Lighter right panel — creates a two-tone split
  R(slide, W * 0.60, 0, W * 0.40, H, lighten(t.bg, 0.14));

  // Accent edge stripe on far right
  R(slide, W - 0.18, 0, 0.18, H, t.accentColor);

  // Giant circles on right side (centre x > W*0.65, partial off-slide)
  C(slide,  W * 0.92, H * 0.50, 7.8,  "FFFFFF", 93);
  C(slide,  W * 0.80, H * 0.22, 4.0,  "FFFFFF", 91);
  C(slide,  W * 1.05, H * 0.82, 3.2,  t.accentLight, 88);

  // Concentric ring outlines
  CO(slide, W * 0.83, H * 0.52, 6.8,  "FFFFFF",      87, 2.0);
  CO(slide, W * 0.83, H * 0.52, 9.0,  t.accentColor, 89, 1.5);
  CO(slide, W * 0.83, H * 0.52, 11.4, t.accentColor, 93, 1.0);

  // Small accent circle top-right corner
  C(slide, W * 0.68, -0.3, 1.6, t.accentLight, 82);

  // Dark anchor strip — bottom of the LEFT panel only
  R(slide, 0, H * 0.82, W * 0.60, H * 0.18, darken(t.bg, 0.32));

  // Left accent bars
  R(slide, 0,    0, 0.12, H, t.accentColor);
  R(slide, 0.12, 0, 0.05, H, lighten(t.accentColor, 0.40), 40);

  // Row of tiny accent dots sitting just above the title (safe y zone)
  for (let i = 0; i < 5; i++) C(slide, MX + 0.25 + i * 0.34, H * 0.73, 0.09, t.accentColor);
}

function titleBold(slide, t) {
  R(slide, 0, 0, W, H, t.bg);

  // Gold circle cluster — right side only (cx > W*0.65)
  C(slide,  W * 0.90, H * 0.48, 6.2,  t.accentColor, 89);
  C(slide,  W * 0.78, H * 0.30, 3.8,  t.accentLight, 85);
  C(slide,  W * 1.02, H * 0.80, 3.0,  t.accentColor, 84);
  C(slide,  W * 0.70, H * 0.70, 2.2,  t.accentLight, 88);

  // Ring halos
  CO(slide, W * 0.88, H * 0.48, 7.5,  t.accentColor, 87, 2.0);
  CO(slide, W * 0.88, H * 0.48, 9.8,  t.accentColor, 91, 1.4);
  CO(slide, W * 0.88, H * 0.48, 12.2, t.accentColor, 95, 0.8);

  // Corner L-brackets using rectangles (no rotation needed)
  // Top-left bracket
  R(slide, 0,       0, W * 0.36, 0.09, t.accentColor);
  R(slide, 0,       0, 0.40,     H * 0.40, t.accentColor);
  // Bottom-right bracket
  R(slide, W * 0.64, H - 0.09, W * 0.36, 0.09, t.accentColor);
  R(slide, W - 0.40, H * 0.60, 0.40, H * 0.40, t.accentColor);
}

function titleMinimal(slide, t) {
  R(slide, 0, 0, W, H, "FFFFFF");

  // Soft filled area — right panel
  R(slide, W * 0.58, 0, W * 0.42, H, "F5F5F5");

  // Three concentric circle OUTLINES in the right panel
  CO(slide, W * 0.78, H * 0.52, 9.5,  "E0E0E0", 0,  1.5);
  CO(slide, W * 0.78, H * 0.52, 6.8,  "CCCCCC", 0,  1.2);
  CO(slide, W * 0.78, H * 0.52, 4.2,  "BBBBBB", 20, 0.9);

  // Soft circle fill in the right area
  C(slide, W * 0.82, H * 0.55, 4.0, "EBEBEB");

  // Dot grid — right half only (x > W*0.55), safe from text
  dots(slide, W * 0.56, 0.4, 12, 10, 0.055, 0.58, 0.65, "CCCCCC", 40);

  // Clean top + bottom rule lines — full width (these are thin and behind text)
  R(slide, 0, 0,         W, 0.055, "DDDDDD");
  R(slide, 0, H - 0.055, W, 0.055, "DDDDDD");

  // Left rhythm lines — vertical, in text zone but very thin
  R(slide, MX,       H * 0.20, 0.025, H * 0.60, "CCCCCC");
  R(slide, MX + 0.2, H * 0.28, 0.015, H * 0.44, "DDDDDD");

  // Solid small accent block
  R(slide, MX, H * 0.72, 0.14, 0.14, "333333");
}

function titlePlayful(slide, t) {
  R(slide, 0, 0, W, H, t.bg);

  // Right-side lighter panel
  R(slide, W * 0.58, 0, W * 0.42, H, lighten(t.bg, 0.20));

  // Circle cluster — right side
  C(slide,  W * 0.80, H * 0.30, 5.5,  t.accentColor, 87);
  C(slide,  W * 0.92, H * 0.72, 4.0,  lighten(t.bg, 0.30), 0);
  C(slide,  W * 0.65, H * 0.80, 2.8,  t.accentColor, 82);
  C(slide,  W * 1.02, H * 0.45, 3.5,  lighten(t.bg, 0.22), 0);
  C(slide,  W * 0.70, H * 0.10, 1.8,  t.accentLight, 78);

  // Halo rings
  CO(slide, W * 0.80, H * 0.30, 7.2,  t.accentColor, 82, 2.0);
  CO(slide, W * 0.80, H * 0.30, 9.2,  "FFFFFF",      87, 1.4);
  CO(slide, W * 0.80, H * 0.30, 11.2, t.accentColor, 92, 0.8);

  // Dark bottom band — full width
  R(slide, 0, H * 0.84, W, H * 0.16, darken(t.bg, 0.28));

  // Dot cluster — right of text area
  dots(slide, W * 0.56 + MX, H * 0.56, 7, 4, 0.10, 0.30, 0.28, t.accentColor, 25);
}

function titleCorporate(slide, t) {
  R(slide, 0, 0, W, H, t.bg);

  // Staircase geometric band — right side only, no text overlap
  // 22 horizontal strips, each one slightly shorter on the left edge
  for (let i = 0; i < 22; i++) {
    const progress = i / 22;
    const bx = W * (0.56 + progress * 0.10);
    const by = progress * H;
    const bh = H / 22 + 0.06;
    R(slide, bx, by, W - bx, bh, lighten(t.bg, 0.15));
  }

  // Circles overlay the staircase
  C(slide,  W * 0.87, H * 0.28, 3.8, t.accentColor, 85);
  C(slide,  W * 0.96, H * 0.73, 2.8, "FFFFFF",       92);
  C(slide,  W * 0.68, H * 0.60, 2.0, t.accentLight,  88);

  CO(slide, W * 0.76, H * 0.50, 5.8, t.accentColor, 82, 1.6);
  CO(slide, W * 0.76, H * 0.50, 8.2, t.accentColor, 89, 1.0);

  // Dual left accent bars
  R(slide, 0,    0, 0.10, H, t.accentColor);
  R(slide, 0.10, 0, 0.04, H, lighten(t.accentColor, 0.45), 35);

  // Dark footer strip
  R(slide, 0, H * 0.83, W, H * 0.17, darken(t.bg, 0.32));

  // Small accent squares (above dark strip)
  for (let i = 0; i < 3; i++) R(slide, MX + 0.22 + i * 0.30, H * 0.73, 0.12, 0.12, t.accentColor);
}

// ── Content slide background (corners/edges only — NEVER over body text) ──────
function decorateContentBg(slide, t, style) {
  // White/light body base
  R(slide, 0, 0, W, H, t.bodyBg);

  // Decorations only in bottom-right corner (y > H*0.55, x > W*0.65)
  // — these areas are safely below bullet text on normal slides
  if (style === "minimal") {
    C(slide,  W + 1.2, H + 0.8, 5.5, "E8E8E8");
    CO(slide, W + 1.2, H + 0.8, 7.0, "DCDCDC", 0, 1.0);
    return;
  }

  C(slide,  W + 1.5, H + 1.0, 6.0, t.headerBg, 92);
  C(slide,  W + 0.4, H * 0.72, 2.5, t.accentColor, 95);
  CO(slide, W + 1.5, H + 1.0, 8.0, t.accentColor, 94, 0.8);
}

// ── Slide parser ──────────────────────────────────────────────────────────────
function parseSlides(markdown) {
  const chunks = markdown.split(/(?=^### Slide \d+:)/m);
  const slides = [];
  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    const lines      = trimmed.split("\n");
    const titleMatch = lines[0].match(/^###\s+Slide\s+\d+:\s*(.+)/i);
    const title      = titleMatch ? titleMatch[1].trim() : lines[0].replace(/^#+\s*/, "").trim();
    let keyMessage = "", speakerNotes = "", inContent = false;
    const bullets = [];
    for (const line of lines.slice(1)) {
      const s = line.trim();
      if (!s) continue;
      if (/^\*\*Key message:\*\*/i.test(s)) {
        keyMessage = s.replace(/^\*\*Key message:\*\*\s*/i, "").replace(/\*\*/g, "").trim();
        inContent  = false;
      } else if (/^\*\*Content:\*\*/i.test(s)) {
        inContent = true;
      } else if (/^\*\*Speaker notes?:\*\*/i.test(s)) {
        inContent    = false;
        speakerNotes = s.replace(/^\*\*Speaker notes?:\*\*\s*/i, "").replace(/\*\*/g, "").trim();
      } else if (/^\*\*/.test(s)) {
        inContent = false;
      } else if (inContent && /^[-•*]\s/.test(s)) {
        const b = s.replace(/^[-•*]\s+/, "").replace(/\*\*/g, "").trim();
        if (b) bullets.push(b);
      }
    }
    if (title) slides.push({ title, keyMessage, bullets, speakerNotes });
  }
  return slides;
}

// ── Build the deck ────────────────────────────────────────────────────────────
async function buildDeck(slides, theme, style, deckTitle, companyName, logoUrl, primaryColorOverride) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  const t = { ...theme };
  if (primaryColorOverride) {
    const hex = primaryColorOverride.replace("#", "");
    t.bg = t.headerBg = hex;
    t.accentColor = lighten(hex, 0.42);
    t.accentLight = lighten(hex, 0.60);
  }

  const titleBuilders = {
    professional: titleProfessional,
    bold:         titleBold,
    minimal:      titleMinimal,
    playful:      titlePlayful,
    corporate:    titleCorporate,
  };

  // ── Title slide ─────────────────────────────────────────────────────────────
  const titleSlide = pptx.addSlide();

  // 1. Geometric background (all shapes stay right of W*0.55 or bottom strip)
  (titleBuilders[style] || titleProfessional)(titleSlide, t);

  // 2. Text always added last — guaranteed on top
  titleSlide.addText(deckTitle, {
    x: MX + 0.22, y: H * 0.20, w: W * 0.52, h: H * 0.50,
    fontSize: 36, bold: true, color: t.titleSlideText,
    fontFace: "Calibri", valign: "middle", wrap: true,
  });

  // Accent line under title text
  R(titleSlide, MX + 0.22, H * 0.73, 2.0, 0.055, t.accentColor);

  // Company + date
  const today = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const meta  = [companyName, today].filter(Boolean).join("   |   ");
  titleSlide.addText(meta, {
    x: MX + 0.22, y: H * 0.78, w: W * 0.52, h: 0.38,
    fontSize: 12, color: t.titleSlideText, fontFace: "Calibri",
    transparency: 25,
  });

  // Logo
  if (logoUrl) {
    try {
      titleSlide.addImage({ path: logoUrl, x: W * 0.70, y: 0.40, w: 2.2, h: 1.1,
        sizing: { type: "contain", w: 2.2, h: 1.1 } });
    } catch (_) {}
  }

  // ── Content slides ──────────────────────────────────────────────────────────
  for (let i = 0; i < slides.length; i++) {
    const s     = slides[i];
    const slide = pptx.addSlide();

    // 1. Background decorations (corners only)
    decorateContentBg(slide, t, style);

    // 2. Header band
    R(slide, 0, 0, W, HEADER_H, t.headerBg);

    // Header accent stripe — right edge
    R(slide, W - 0.32, 0, 0.32, HEADER_H, t.accentColor);

    // Small decorative circle behind title text in header
    // (same dark color as header so it's subtle, not covering text)
    C(slide, W * 0.42, HEADER_H / 2, HEADER_H * 1.8, darken(t.headerBg, 0.15));

    // Left notch in header
    R(slide, 0, 0, MX * 0.35, HEADER_H, darken(t.headerBg, 0.24));

    // Left body accent bar
    R(slide, 0,     HEADER_H, 0.09, H - HEADER_H - 0.38, t.accentColor);
    R(slide, 0.09,  HEADER_H, 0.03, H - HEADER_H - 0.38, lighten(t.accentColor, 0.4), 40);

    // 3. ALL text is added after shapes ─ always on top

    // Slide title in header
    const logoReserve = logoUrl ? 2.0 : 0;
    slide.addText(s.title, {
      x: MX, y: MY, w: W - MX - 0.45 - logoReserve, h: HEADER_H - MY * 2,
      fontSize: 20, bold: true, color: t.titleText, fontFace: "Calibri", valign: "middle",
    });

    // Logo in header
    if (logoUrl) {
      try {
        slide.addImage({ path: logoUrl,
          x: W - logoReserve - 0.08, y: 0.12, w: logoReserve * 0.82, h: HEADER_H - 0.24,
          sizing: { type: "contain", w: logoReserve * 0.82, h: HEADER_H - 0.24 } });
      } catch (_) {}
    }

    let yPos = HEADER_H + 0.22;

    // Key message
    if (s.keyMessage) {
      slide.addText(s.keyMessage, {
        x: MX, y: yPos, w: W - MX * 2, h: 0.50,
        fontSize: 12, italic: true, color: t.subtitleText, fontFace: "Calibri",
      });
      yPos += 0.52;
      R(slide, MX, yPos - 0.06, W - MX * 2 - 0.45, 0.015, t.accentColor, 55);
      yPos += 0.12;
    }

    // Bullets
    if (s.bullets.length > 0) {
      const bulletObjs = s.bullets.map((b, idx) => ({
        text: b,
        options: {
          bullet: { indent: 15, code: "25CF" },
          color: t.bodyText, fontSize: 14, fontFace: "Calibri",
          paraSpaceAfter: 7,
          breakLine: idx < s.bullets.length - 1,
        },
      }));
      slide.addText(bulletObjs, {
        x: MX + 0.18, y: yPos,
        w: W - MX * 2 - 0.18, h: H - yPos - 0.48,
        valign: "top",
      });
    }

    // Footer
    R(slide, 0, H - 0.38, W, 0.014, t.accentColor);
    slide.addText(`${i + 1} / ${slides.length}`, {
      x: W - 1.0, y: H - 0.34, w: 0.82, h: 0.28,
      fontSize: 8, color: t.footerText, fontFace: "Calibri", align: "right",
    });
    if (companyName) {
      slide.addText(companyName, {
        x: MX, y: H - 0.34, w: 5, h: 0.28,
        fontSize: 8, color: t.footerText, fontFace: "Calibri",
      });
    }
    if (s.speakerNotes) slide.addNotes(s.speakerNotes);
  }

  return pptx;
}

// ── Vercel handler ────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    return res.status(204).end();
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { content, style = "professional", title = "Presentation",
          company_name = "", logo_url = "", primary_color = "" } = req.body || {};

  if (!content) return res.status(400).json({ error: "content is required" });

  const theme  = THEMES[style] || THEMES.professional;
  const slides = parseSlides(content);
  if (slides.length === 0)
    return res.status(400).json({ error: "No slides found — outline must use '### Slide N: Title' headings." });

  const pptx   = await buildDeck(slides, theme, style, title, company_name, logo_url || null, primary_color || null);
  const buffer = await pptx.write({ outputType: "nodebuffer" });
  const safe   = title.replace(/[^a-zA-Z0-9 _-]/g, "").trim().replace(/ +/g, "_") || "deck";

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
  res.setHeader("Content-Disposition", `attachment; filename="${safe}.pptx"`);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(Buffer.from(buffer));
}
