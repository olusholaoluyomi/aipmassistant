import PptxGenJS from "pptxgenjs";

// ── Slide canvas (LAYOUT_WIDE = 13.33" × 7.5") ──────────────────────────────
const W        = 13.33;
const H        = 7.5;
const HEADER_H = 1.35;
const MX       = 0.55;  // margin x
const MY       = 0.22;  // margin y

// ── Themes ───────────────────────────────────────────────────────────────────
const THEMES = {
  professional: {
    bg:          "0C2449",
    headerBg:    "0C2449",
    bodyBg:      "FFFFFF",
    titleText:   "FFFFFF",
    bodyText:    "0C2449",
    subtitleText:"6B90B8",
    accentColor: "3A8DDE",
    accentLight: "7AB8F0",
    footerText:  "7A9EC0",
    titleSlideText: "FFFFFF",
    dark: true,
  },
  bold: {
    bg:          "0A0A0A",
    headerBg:    "0A0A0A",
    bodyBg:      "F5F5F5",
    titleText:   "E8A020",
    bodyText:    "111111",
    subtitleText:"777777",
    accentColor: "E8A020",
    accentLight: "FFD06A",
    footerText:  "999999",
    titleSlideText: "E8A020",
    dark: true,
  },
  minimal: {
    bg:          "FEFEFE",
    headerBg:    "F2F2F2",
    bodyBg:      "FFFFFF",
    titleText:   "111111",
    bodyText:    "2A2A2A",
    subtitleText:"888888",
    accentColor: "333333",
    accentLight: "AAAAAA",
    footerText:  "BBBBBB",
    titleSlideText: "111111",
    dark: false,
  },
  playful: {
    bg:          "3D1F9E",
    headerBg:    "3D1F9E",
    bodyBg:      "FAF8FF",
    titleText:   "FFFFFF",
    bodyText:    "20086A",
    subtitleText:"7A55C0",
    accentColor: "FFD600",
    accentLight: "FFE866",
    footerText:  "8866CC",
    titleSlideText: "FFFFFF",
    dark: true,
  },
  corporate: {
    bg:          "001D3D",
    headerBg:    "001D3D",
    bodyBg:      "EDF2F7",
    titleText:   "FFFFFF",
    bodyText:    "001D3D",
    subtitleText:"4A6C8A",
    accentColor: "0072CE",
    accentLight: "4499E8",
    footerText:  "5588AA",
    titleSlideText: "FFFFFF",
    dark: true,
  },
};

// ── Color math ───────────────────────────────────────────────────────────────
function lighten(hex, pct) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const m = c => Math.min(255, Math.round(c + (255 - c) * pct)).toString(16).padStart(2, "0");
  return `${m(r)}${m(g)}${m(b)}`;
}
function darken(hex, pct) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const m = c => Math.max(0, Math.round(c * (1 - pct))).toString(16).padStart(2, "0");
  return `${m(r)}${m(g)}${m(b)}`;
}

// ── Primitive shape helpers ──────────────────────────────────────────────────

/** Solid filled rectangle */
function rect(slide, x, y, w, h, color, transparency = 0, rotate = 0) {
  const opts = { x, y, w, h, fill: { color, transparency }, line: { color, pt: 0 } };
  if (rotate) opts.rotate = rotate;
  slide.addShape("rect", opts);
}

/** Solid filled ellipse (circle when w===h) */
function ellipse(slide, cx, cy, size, color, transparency = 0) {
  const half = size / 2;
  slide.addShape("ellipse", {
    x: cx - half, y: cy - half, w: size, h: size,
    fill: { color, transparency },
    line: { color, pt: 0 },
  });
}

/** Ellipse outline only (no fill) */
function ellipseOutline(slide, cx, cy, size, color, transparency = 0, ptWidth = 2) {
  const half = size / 2;
  slide.addShape("ellipse", {
    x: cx - half, y: cy - half, w: size, h: size,
    fill: { color, transparency: 100 },
    line: { color, pt: ptWidth, transparency },
  });
}

/** Many diagonal stripe lines using rotated thin rects */
function diagonalStripes(slide, color, transparency, count, angle = -28) {
  const span = Math.sqrt(W * W + H * H) * 1.4;
  const step = (W + H) / count;
  for (let i = 0; i < count; i++) {
    slide.addShape("rect", {
      x: -H + i * step, y: H / 2 - 0.012,
      w: span, h: 0.024,
      fill: { color, transparency },
      line: { color, pt: 0 },
      rotate: angle,
    });
  }
}

/** Grid of tiny dots */
function dotGrid(slide, x0, y0, cols, rows, dot, gapX, gapY, color, transparency) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slide.addShape("ellipse", {
        x: x0 + c * gapX, y: y0 + r * gapY, w: dot, h: dot,
        fill: { color, transparency },
        line: { color, pt: 0 },
      });
    }
  }
}

/** Evenly-spaced thin horizontal lines */
function scanLines(slide, color, transparency, count, y0 = 0, y1 = H) {
  const gap = (y1 - y0) / count;
  for (let i = 0; i < count; i++) {
    slide.addShape("rect", {
      x: 0, y: y0 + i * gap, w: W, h: 0.018,
      fill: { color, transparency },
      line: { color, pt: 0 },
    });
  }
}

// ── Title slide designers (one per theme) ────────────────────────────────────

function titleProfessional(slide, t) {
  // Base
  rect(slide, 0, 0, W, H, t.bg);

  // Giant overlapping circles — right half, bleed off edge
  ellipse(slide,  W * 0.92, H * 0.52, 8.2,  "FFFFFF", 94);
  ellipse(slide,  W * 0.80, H * 0.22, 3.8,  "FFFFFF", 91);
  ellipse(slide,  W * 1.05, H * 0.85, 3.2,  t.accentLight, 88);

  // Concentric outlines — add depth
  ellipseOutline(slide, W * 0.82, H * 0.52, 7.0,  "FFFFFF",      88, 1.5);
  ellipseOutline(slide, W * 0.82, H * 0.52, 9.5,  t.accentColor, 90, 1.0);
  ellipseOutline(slide, W * 0.82, H * 0.52, 11.5, t.accentColor, 94, 0.8);

  // Small accent filled circles
  ellipse(slide, W * 0.08, H * 1.05, 2.5,  t.accentColor, 87);
  ellipse(slide, W * 0.52, H * -0.08, 1.4, t.accentLight, 84);

  // Micro diagonal stripes across whole slide
  diagonalStripes(slide, "FFFFFF", 97, 18, -30);

  // Dark bottom-left anchor strip
  rect(slide, 0, H * 0.82, W * 0.58, H * 0.18, darken(t.bg, 0.35));

  // Left accent bar
  rect(slide, 0, 0, 0.13, H, t.accentColor);
  rect(slide, 0.13, 0, 0.05, H, lighten(t.accentColor, 0.4), 40);

  // Row of accent dots above title area
  for (let i = 0; i < 5; i++) ellipse(slide, MX + 0.25 + i * 0.36, H * 0.73, 0.1, t.accentColor);
}

function titleBold(slide, t) {
  rect(slide, 0, 0, W, H, t.bg);

  // Gold circle cluster — right, bleeds off
  ellipse(slide,  W * 0.90, H * 0.48, 6.0,  t.accentColor, 90);
  ellipse(slide,  W * 0.80, H * 0.35, 3.5,  t.accentLight, 86);
  ellipse(slide,  W * 1.02, H * 0.78, 3.0,  t.accentColor, 84);

  // Ring outlines — create halo effect
  ellipseOutline(slide, W * 0.88, H * 0.48, 7.5,  t.accentColor, 88, 2.0);
  ellipseOutline(slide, W * 0.88, H * 0.48, 9.5,  t.accentColor, 93, 1.2);
  ellipseOutline(slide, W * 0.88, H * 0.48, 11.8, t.accentColor, 96, 0.8);

  // Gold scan lines — industrial feel
  scanLines(slide, t.accentColor, 97, 50);

  // Bold top bracket
  rect(slide, 0,   0, W * 0.38, 0.08, t.accentColor);
  rect(slide, 0,   0, 0.38,     H * 0.42, t.accentColor);

  // Bottom bracket (mirror)
  rect(slide, W * 0.62, H - 0.08, W * 0.38, 0.08, t.accentColor);
  rect(slide, W - 0.38, H * 0.58, 0.38, H * 0.42, t.accentColor);

  // Small accent dots
  for (let i = 0; i < 4; i++) ellipse(slide, MX + 0.5 + i * 0.38, H * 0.73, 0.11, t.accentColor);
}

function titleMinimal(slide, t) {
  rect(slide, 0, 0, W, H, "FFFFFF");

  // Single dominant large circle outline — elegant
  ellipseOutline(slide, W * 0.72, H * 0.52, 9.0,  "E0E0E0", 0,  1.5);
  ellipseOutline(slide, W * 0.72, H * 0.52, 6.5,  "CCCCCC", 0,  1.0);
  ellipseOutline(slide, W * 0.72, H * 0.52, 4.2,  "BBBBBB", 30, 0.8);

  // Soft filled circle in background
  ellipse(slide, W * 0.78, H * 0.55, 4.0, "F5F5F5");

  // Dot matrix — subtle texture right side
  dotGrid(slide, W * 0.44, 0.3, 14, 11, 0.055, 0.58, 0.64, "CCCCCC", 45);

  // Thin top + bottom border lines
  rect(slide, 0, 0,       W, 0.055, "DDDDDD");
  rect(slide, 0, H - 0.055, W, 0.055, "DDDDDD");

  // Vertical rhythm lines — left side
  rect(slide, MX, H * 0.2,  0.03, H * 0.6, "CCCCCC");
  rect(slide, MX + 0.2, H * 0.3, 0.02, H * 0.4, "DDDDDD");

  // Small solid accent square
  rect(slide, MX, H * 0.72, 0.14, 0.14, "333333");
}

function titlePlayful(slide, t) {
  rect(slide, 0, 0, W, H, t.bg);

  // Cluster of circles — energetic, overlapping
  ellipse(slide, W * 0.78, H * 0.32, 5.5,  t.accentColor,          88);
  ellipse(slide, W * 0.88, H * 0.70, 4.0,  lighten(t.bg, 0.22),     0);
  ellipse(slide, W * 0.60, H * 0.82, 2.8,  t.accentColor,          82);
  ellipse(slide, W * 0.12, H * -0.05, 2.2, lighten(t.bg, 0.28),     0);
  ellipse(slide, W * 1.02, H * 0.42, 3.5,  lighten(t.bg, 0.18),     0);

  // Outline halos
  ellipseOutline(slide, W * 0.78, H * 0.32, 7.0,  t.accentColor, 82, 2.0);
  ellipseOutline(slide, W * 0.78, H * 0.32, 9.0,  "FFFFFF",      88, 1.2);
  ellipseOutline(slide, W * 0.78, H * 0.32, 11.0, t.accentColor, 93, 0.8);

  // Energetic diagonal stripes
  diagonalStripes(slide, "FFFFFF", 95, 10, -40);

  // Dark bottom band
  rect(slide, 0, H * 0.84, W, H * 0.16, darken(t.bg, 0.28));

  // Dot cluster accent
  dotGrid(slide, MX + 0.2, H * 0.6, 7, 3, 0.1, 0.3, 0.28, t.accentColor, 25);
}

function titleCorporate(slide, t) {
  rect(slide, 0, 0, W, H, t.bg);

  // Staircase geometric band — right side
  // Creates a diagonal "step" pattern suggesting motion/progress
  for (let i = 0; i < 22; i++) {
    const progress = i / 22;
    const bx = W * (0.52 + progress * 0.08);
    const by = progress * H;
    const bw = W - bx;
    const bh = H / 22 + 0.04;
    rect(slide, bx, by, bw, bh, lighten(t.bg, 0.14));
  }

  // Overlay circles on the right panel
  ellipse(slide,  W * 0.85, H * 0.28, 3.8, t.accentColor,  86);
  ellipse(slide,  W * 0.95, H * 0.72, 2.8, "FFFFFF",        92);
  ellipseOutline(slide, W * 0.75, H * 0.50, 5.8, t.accentColor, 82, 1.5);
  ellipseOutline(slide, W * 0.75, H * 0.50, 8.2, t.accentColor, 90, 0.8);

  // Subtle scan lines on dark bg
  scanLines(slide, "FFFFFF", 98, 30);

  // Dual left accent bars
  rect(slide, 0,    0, 0.10, H, t.accentColor);
  rect(slide, 0.10, 0, 0.04, H, lighten(t.accentColor, 0.45), 35);

  // Bottom dark footer area
  rect(slide, 0, H * 0.83, W, H * 0.17, darken(t.bg, 0.32));

  // Small accent squares
  for (let i = 0; i < 3; i++) rect(slide, MX + 0.22 + i * 0.28, H * 0.73, 0.12, 0.12, t.accentColor);
}

// ── Content slide background decorators ─────────────────────────────────────

function decorateContentBg(slide, t, style) {
  // Light body bg base
  rect(slide, 0, 0, W, H, t.bodyBg);

  if (style === "minimal") {
    // Just a faint large circle bottom-right
    ellipse(slide, W + 1.2, H + 0.8, 5.5, "EBEBEB");
    ellipseOutline(slide, W + 1.2, H + 0.8, 7.0, "E0E0E0", 0, 0.8);
    return;
  }

  if (style === "bold") {
    // Subtle scan lines in body
    scanLines(slide, "CCCCCC", 97, 25, HEADER_H, H);
    // Corner accent
    ellipse(slide, W + 0.8, H + 0.6, 4.5, t.accentColor, 95);
    return;
  }

  // All other themes: large transparent circle + faint diagonal texture
  ellipse(slide, W + 1.5, H + 0.8,  5.5, t.headerBg, 93);
  ellipse(slide, W + 0.5, H * 0.3,  2.5, t.accentColor, 96);
  ellipseOutline(slide, W + 1.5, H + 0.8, 7.5, t.accentColor, 94, 0.6);
  diagonalStripes(slide, t.headerBg, 98, 5, -22);
}

// ── Parse markdown outline into slide objects ────────────────────────────────

function parseSlides(markdown) {
  const chunks = markdown.split(/(?=^### Slide \d+:)/m);
  const slides = [];

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const lines      = trimmed.split("\n");
    const header     = lines[0] || "";
    const titleMatch = header.match(/^###\s+Slide\s+\d+:\s*(.+)/i);
    const title      = titleMatch ? titleMatch[1].trim() : header.replace(/^#+\s*/, "").trim();

    let keyMessage = "", speakerNotes = "";
    const bullets  = [];
    let inContent  = false;

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

// ── Build the full deck ───────────────────────────────────────────────────────

async function buildDeck(slides, theme, style, deckTitle, companyName, logoUrl, primaryColorOverride) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  // Apply brand color override
  const t = { ...theme };
  if (primaryColorOverride) {
    const hex = primaryColorOverride.replace("#", "");
    t.bg         = hex;
    t.headerBg   = hex;
    t.accentColor = lighten(hex, 0.42);
    t.accentLight = lighten(hex, 0.60);
  }

  // ── Title slide ─────────────────────────────────────────────────────────
  const titleSlide = pptx.addSlide();
  const titleBuilders = {
    professional: titleProfessional,
    bold:         titleBold,
    minimal:      titleMinimal,
    playful:      titlePlayful,
    corporate:    titleCorporate,
  };
  (titleBuilders[style] || titleProfessional)(titleSlide, t);

  // Title text
  titleSlide.addText(deckTitle, {
    x: MX + 0.22, y: H * 0.22, w: W * 0.54, h: H * 0.50,
    fontSize: 36, bold: true, color: t.titleSlideText,
    fontFace: "Calibri", valign: "middle", wrap: true,
  });

  // Thin accent line below title
  rect(titleSlide, MX + 0.22, H * 0.74, 2.0, 0.055, t.accentColor);

  // Company name + date
  const today = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const meta  = [companyName, today].filter(Boolean).join("   |   ");
  titleSlide.addText(meta, {
    x: MX + 0.22, y: H * 0.79, w: W * 0.54, h: 0.38,
    fontSize: 12, color: t.titleSlideText, fontFace: "Calibri",
    transparency: 30,
  });

  // Logo on title slide
  if (logoUrl) {
    try {
      titleSlide.addImage({
        path: logoUrl,
        x: W * 0.70, y: 0.4, w: 2.2, h: 1.1,
        sizing: { type: "contain", w: 2.2, h: 1.1 },
      });
    } catch (_) {}
  }

  // ── Content slides ──────────────────────────────────────────────────────
  for (let i = 0; i < slides.length; i++) {
    const s     = slides[i];
    const slide = pptx.addSlide();

    // Decorated body background
    decorateContentBg(slide, t, style);

    // Header band
    rect(slide, 0, 0, W, HEADER_H, t.headerBg);

    // Header right accent stripe
    rect(slide, W - 0.32, 0, 0.32, HEADER_H, t.accentColor);

    // Small decorative element in header — offset circle behind title
    ellipse(slide, W * 0.5, HEADER_H * 0.5, HEADER_H * 1.8, lighten(t.headerBg, 0.12), 0);

    // Header left notch
    rect(slide, 0, 0, MX * 0.38, HEADER_H, darken(t.headerBg, 0.22));

    // Slide title in header
    const logoReserve = logoUrl ? 2.0 : 0;
    slide.addText(s.title, {
      x: MX, y: MY, w: W - MX - 0.45 - logoReserve, h: HEADER_H - MY * 2,
      fontSize: 20, bold: true, color: t.titleText,
      fontFace: "Calibri", valign: "middle",
    });

    // Logo in header top-right
    if (logoUrl) {
      try {
        slide.addImage({
          path: logoUrl,
          x: W - logoReserve - 0.08, y: 0.12,
          w: logoReserve * 0.82, h: HEADER_H - 0.24,
          sizing: { type: "contain", w: logoReserve * 0.82, h: HEADER_H - 0.24 },
        });
      } catch (_) {}
    }

    // Left accent bar — runs the full body height
    rect(slide, 0, HEADER_H, 0.085, H - HEADER_H - 0.38, t.accentColor);
    rect(slide, 0.085, HEADER_H, 0.03, H - HEADER_H - 0.38, lighten(t.accentColor, 0.4), 35);

    let yPos = HEADER_H + 0.22;

    // Key message — italic subtitle
    if (s.keyMessage) {
      slide.addText(s.keyMessage, {
        x: MX, y: yPos, w: W - MX * 2, h: 0.50,
        fontSize: 12, italic: true, color: t.subtitleText, fontFace: "Calibri",
      });
      yPos += 0.52;
      // Thin separator line
      rect(slide, MX, yPos - 0.06, W - MX * 2 - 0.45, 0.015, t.accentColor, 55);
      yPos += 0.12;
    }

    // Bullet points
    if (s.bullets.length > 0) {
      const availH   = H - yPos - 0.45;
      const bulletObjs = s.bullets.map((b, idx) => ({
        text: b,
        options: {
          bullet:        { indent: 15, code: "25CF" },
          color:         t.bodyText,
          fontSize:      14,
          fontFace:      "Calibri",
          paraSpaceAfter: 7,
          breakLine:     idx < s.bullets.length - 1,
        },
      }));
      slide.addText(bulletObjs, {
        x: MX + 0.18, y: yPos,
        w: W - MX * 2 - 0.18, h: availH,
        valign: "top",
      });
    }

    // Footer line
    rect(slide, 0, H - 0.38, W, 0.014, t.accentColor);

    // Page number right
    slide.addText(`${i + 1} / ${slides.length}`, {
      x: W - 1.0, y: H - 0.34, w: 0.82, h: 0.28,
      fontSize: 8, color: t.footerText, fontFace: "Calibri", align: "right",
    });

    // Company name left
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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    content,
    style         = "professional",
    title         = "Presentation",
    company_name  = "",
    logo_url      = "",
    primary_color = "",
  } = req.body || {};

  if (!content) return res.status(400).json({ error: "content is required" });

  const theme  = THEMES[style] || THEMES.professional;
  const slides = parseSlides(content);

  if (slides.length === 0) {
    return res.status(400).json({
      error: "No slides found — outline must use '### Slide N: Title' headings.",
    });
  }

  const pptx   = await buildDeck(slides, theme, style, title, company_name, logo_url || null, primary_color || null);
  const buffer = await pptx.write({ outputType: "nodebuffer" });

  const safe = title.replace(/[^a-zA-Z0-9 _-]/g, "").trim().replace(/ +/g, "_") || "deck";

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
  res.setHeader("Content-Disposition", `attachment; filename="${safe}.pptx"`);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(Buffer.from(buffer));
}
