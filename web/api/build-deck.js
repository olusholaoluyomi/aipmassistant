import PptxGenJS from "pptxgenjs";

// ── Design themes ────────────────────────────────────────────────────────────
const THEMES = {
  professional: {
    headerBg:    "1B3A6B", bodyBg:     "FFFFFF",
    titleText:   "FFFFFF", bodyText:   "1A1A2E",
    subtitleText:"7A9CC0", accentColor:"4A90D9",
    footerText:  "9AAAC4", titleSlideText: "FFFFFF",
    darkMode: true,
  },
  bold: {
    headerBg:    "111111", bodyBg:     "F8F8F8",
    titleText:   "F5A623", bodyText:   "1A1A1A",
    subtitleText:"888888", accentColor:"F5A623",
    footerText:  "AAAAAA", titleSlideText: "F5A623",
    darkMode: true,
  },
  minimal: {
    headerBg:    "EEEEEE", bodyBg:     "FFFFFF",
    titleText:   "111111", bodyText:   "333333",
    subtitleText:"888888", accentColor:"888888",
    footerText:  "BBBBBB", titleSlideText: "111111",
    darkMode: false,
  },
  playful: {
    headerBg:    "5E35B1", bodyBg:     "FAF8FF",
    titleText:   "FFFFFF", bodyText:   "2A1760",
    subtitleText:"8B68C8", accentColor:"FFD600",
    footerText:  "9B7EC8", titleSlideText: "FFD600",
    darkMode: true,
  },
  corporate: {
    headerBg:    "002147", bodyBg:     "F0F4F8",
    titleText:   "FFFFFF", bodyText:   "1C2B3A",
    subtitleText:"5577AA", accentColor:"0066CC",
    footerText:  "7799BB", titleSlideText: "FFFFFF",
    darkMode: true,
  },
};

// Slide canvas (LAYOUT_WIDE = 13.33" × 7.5")
const W        = 13.33;
const H        = 7.5;
const HEADER_H = 1.35;
const MARGIN_X = 0.55;
const MARGIN_Y = 0.2;

// ── Helpers ──────────────────────────────────────────────────────────────────
function lighten(hex, pct) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const mix = (c) => Math.round(c + (255 - c) * pct).toString(16).padStart(2, "0");
  return `${mix(r)}${mix(g)}${mix(b)}`;
}

function darken(hex, pct) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const mix = (c) => Math.round(c * (1 - pct)).toString(16).padStart(2, "0");
  return `${mix(r)}${mix(g)}${mix(b)}`;
}

// ── Slide parser ─────────────────────────────────────────────────────────────
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

// ── Title slide ───────────────────────────────────────────────────────────────
async function addTitleSlide(pptx, t, deckTitle, companyName, logoUrl) {
  const slide = pptx.addSlide();
  const dark  = darken(t.headerBg, 0.25);
  const light = lighten(t.headerBg, 0.18);

  // Full-bleed background
  slide.addShape("rect", { x: 0, y: 0, w: W, h: H,
    fill: { color: t.headerBg }, line: { color: t.headerBg } });

  // Right-side accent panel (lighter shade)
  slide.addShape("rect", { x: W * 0.62, y: 0, w: W * 0.38, h: H,
    fill: { color: light }, line: { color: light } });

  // Diagonal overlap chevron — gives depth
  const chevronX = [
    { x: W * 0.6,  y: 0 },
    { x: W * 0.655, y: 0 },
    { x: W * 0.655, y: H },
    { x: W * 0.6,  y: H },
  ];
  slide.addShape("custGeom", { x: 0, y: 0, w: W, h: H,
    fill: { color: t.headerBg }, line: { color: t.headerBg, transparency: 100 },
    // Approximate with a narrow rectangle:
  });
  slide.addShape("rect", { x: W * 0.6, y: 0, w: 0.05, h: H,
    fill: { color: t.headerBg }, line: { color: t.headerBg } });

  // Bottom accent bar
  slide.addShape("rect", { x: 0, y: H - 0.55, w: W * 0.62, h: 0.55,
    fill: { color: dark }, line: { color: dark } });

  // Accent color stripe
  slide.addShape("rect", { x: MARGIN_X - 0.1, y: H * 0.26, w: 0.12, h: H * 0.52,
    fill: { color: t.accentColor }, line: { color: t.accentColor } });

  // Title text
  slide.addText(deckTitle, {
    x: MARGIN_X + 0.2, y: H * 0.22, w: W * 0.56, h: H * 0.52,
    fontSize: 36, bold: true, color: t.titleSlideText,
    fontFace: "Calibri", valign: "middle", wrap: true,
  });

  // Thin line below title
  slide.addShape("rect", {
    x: MARGIN_X + 0.2, y: H * 0.75, w: 2.2, h: 0.05,
    fill: { color: t.accentColor }, line: { color: t.accentColor },
  });

  // Date and company line
  const today = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const meta  = [companyName, today].filter(Boolean).join("   |   ");
  slide.addText(meta, {
    x: MARGIN_X + 0.2, y: H * 0.79, w: W * 0.56, h: 0.4,
    fontSize: 12, color: t.titleSlideText, fontFace: "Calibri",
    transparency: 25,
  });

  // Logo top-right in the lighter panel
  if (logoUrl) {
    try {
      slide.addImage({ path: logoUrl,
        x: W * 0.69, y: 0.45, w: 2.2, h: 1.2,
        sizing: { type: "contain", w: 2.2, h: 1.2 },
      });
    } catch (_) {}
  } else {
    // Decorative circle as logo placeholder / visual element
    slide.addShape("ellipse", {
      x: W * 0.7, y: H * 0.2, w: 2.5, h: 2.5,
      fill: { color: lighten(t.headerBg, 0.35) },
      line: { color: lighten(t.headerBg, 0.35) },
    });
    slide.addShape("ellipse", {
      x: W * 0.77, y: H * 0.5, w: 1.5, h: 1.5,
      fill: { color: lighten(t.headerBg, 0.25) },
      line: { color: lighten(t.headerBg, 0.25) },
    });
  }

  return slide;
}

// ── Content slide ─────────────────────────────────────────────────────────────
async function addContentSlide(pptx, t, s, slideNum, totalSlides, companyName, logoUrl) {
  const slide = pptx.addSlide();

  // ── Body background
  slide.addShape("rect", { x: 0, y: 0, w: W, h: H,
    fill: { color: t.bodyBg }, line: { color: t.bodyBg } });

  // ── Header band
  slide.addShape("rect", { x: 0, y: 0, w: W, h: HEADER_H,
    fill: { color: t.headerBg }, line: { color: t.headerBg } });

  // Accent stripe — right edge of header
  slide.addShape("rect", { x: W - 0.35, y: 0, w: 0.35, h: HEADER_H,
    fill: { color: t.accentColor }, line: { color: t.accentColor } });

  // Small decorative notch top-left corner
  slide.addShape("rect", { x: 0, y: 0, w: MARGIN_X * 0.4, h: HEADER_H,
    fill: { color: darken(t.headerBg, 0.2) }, line: { color: darken(t.headerBg, 0.2) } });

  // ── Title in header
  const logoReserve = logoUrl ? 2.0 : 0;
  slide.addText(s.title, {
    x: MARGIN_X,
    y: MARGIN_Y,
    w: W - MARGIN_X - 0.5 - logoReserve,
    h: HEADER_H - MARGIN_Y * 2,
    fontSize: 20, bold: true, color: t.titleText,
    fontFace: "Calibri", valign: "middle",
  });

  // ── Logo in header (top-right)
  if (logoUrl) {
    try {
      slide.addImage({ path: logoUrl,
        x: W - logoReserve - 0.1, y: 0.12, w: logoReserve * 0.85, h: HEADER_H - 0.24,
        sizing: { type: "contain", w: logoReserve * 0.85, h: HEADER_H - 0.24 },
      });
    } catch (_) {}
  }

  // ── Left accent bar (vertical strip in body area)
  slide.addShape("rect", {
    x: 0, y: HEADER_H, w: 0.08, h: H - HEADER_H - 0.45,
    fill: { color: t.accentColor }, line: { color: t.accentColor },
  });

  let yPos = HEADER_H + 0.22;

  // ── Key message (italic subtitle under header)
  if (s.keyMessage) {
    slide.addText(s.keyMessage, {
      x: MARGIN_X, y: yPos, w: W - MARGIN_X * 2, h: 0.5,
      fontSize: 12, italic: true, color: t.subtitleText, fontFace: "Calibri",
    });
    yPos += 0.52;
    // Thin separator
    slide.addShape("rect", {
      x: MARGIN_X, y: yPos - 0.06, w: W - MARGIN_X * 2 - 0.5, h: 0.012,
      fill: { color: t.accentColor }, line: { color: t.accentColor },
    });
    yPos += 0.12;
  }

  // ── Bullet points
  if (s.bullets.length > 0) {
    const availH  = H - yPos - 0.5;
    const bulletH = Math.min(availH, s.bullets.length * 0.56 + 0.3);

    const bulletObjs = s.bullets.map((b, i) => ({
      text: b,
      options: {
        bullet: { indent: 15, code: "25CF" },
        color: t.bodyText,
        fontSize: 14,
        fontFace: "Calibri",
        paraSpaceAfter: 8,
        breakLine: i < s.bullets.length - 1,
      },
    }));

    slide.addText(bulletObjs, {
      x: MARGIN_X + 0.15, y: yPos,
      w: W - MARGIN_X * 2 - 0.15, h: bulletH,
      valign: "top", charSpacing: 0.2,
    });
  }

  // ── Footer
  // Thin footer line
  slide.addShape("rect", { x: 0, y: H - 0.38, w: W, h: 0.012,
    fill: { color: t.accentColor }, line: { color: t.accentColor } });
  // Page number right
  slide.addText(`${slideNum} / ${totalSlides}`, {
    x: W - 1.0, y: H - 0.34, w: 0.8, h: 0.28,
    fontSize: 8, color: t.footerText, fontFace: "Calibri", align: "right",
  });
  // Company name left
  if (companyName) {
    slide.addText(companyName, {
      x: MARGIN_X, y: H - 0.34, w: 5, h: 0.28,
      fontSize: 8, color: t.footerText, fontFace: "Calibri", align: "left",
    });
  }

  if (s.speakerNotes) slide.addNotes(s.speakerNotes);
  return slide;
}

// ── Main builder ─────────────────────────────────────────────────────────────
async function buildDeck(slides, theme, deckTitle, companyName, logoUrl, primaryColorOverride) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  // Apply brand color override
  const t = { ...theme };
  if (primaryColorOverride) {
    const hex = primaryColorOverride.replace("#", "");
    t.headerBg    = hex;
    t.accentColor = lighten(hex, 0.45);
  }

  await addTitleSlide(pptx, t, deckTitle, companyName, logoUrl);

  for (let i = 0; i < slides.length; i++) {
    await addContentSlide(pptx, t, slides[i], i + 1, slides.length, companyName, logoUrl);
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

  if (!content) {
    return res.status(400).json({ error: "content is required" });
  }

  const theme  = THEMES[style] || THEMES.professional;
  const slides = parseSlides(content);

  if (slides.length === 0) {
    return res.status(400).json({
      error: "No slides found. Outline must use '### Slide N: Title' headings.",
    });
  }

  const pptx   = await buildDeck(slides, theme, title, company_name, logo_url || null, primary_color || null);
  const buffer = await pptx.write({ outputType: "nodebuffer" });

  const safeName = title.replace(/[^a-zA-Z0-9 _-]/g, "").trim().replace(/ +/g, "_") || "deck";

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}.pptx"`);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(Buffer.from(buffer));
}
