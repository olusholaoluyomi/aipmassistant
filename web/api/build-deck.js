import PptxGenJS from "pptxgenjs";

// Color themes keyed by style value from the deck command
const THEMES = {
  professional: {
    bg: "1B3A6B", title: "FFFFFF", subtitle: "A8C4E8", text: "E0EAFF",
    accent: "4A90D9", footer: "1B3A6B",
  },
  bold: {
    bg: "111111", title: "F5A623", subtitle: "DDDDDD", text: "FFFFFF",
    accent: "F5A623", footer: "1A1A1A",
  },
  minimal: {
    bg: "FFFFFF", title: "111111", subtitle: "555555", text: "333333",
    accent: "222222", footer: "F0F0F0",
  },
  playful: {
    bg: "5B3FA8", title: "FFD700", subtitle: "E0D4FF", text: "FFFFFF",
    accent: "FFD700", footer: "4A2E9A",
  },
  corporate: {
    bg: "0D2137", title: "FFFFFF", subtitle: "B0C8E0", text: "D8E8F0",
    accent: "5588AA", footer: "0D2137",
  },
};

function parseSlides(markdown) {
  // Split on "### Slide N:" boundaries
  const chunks = markdown.split(/(?=^### Slide \d+:)/m);
  const slides = [];

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n");

    // Extract title from the "### Slide N: Title" line
    const headerLine = lines[0] || "";
    const titleMatch = headerLine.match(/^###\s+Slide\s+\d+:\s*(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : headerLine.replace(/^#+\s*/, "").trim();

    let keyMessage  = "";
    let speakerNotes = "";
    const bullets  = [];
    let inContent  = false;

    for (const line of lines.slice(1)) {
      const s = line.trim();
      if (!s) continue;

      if (/^\*\*Key message:\*\*/i.test(s)) {
        keyMessage = s.replace(/^\*\*Key message:\*\*\s*/i, "").replace(/^\*+|\*+$/g, "").trim();
        inContent = false;
      } else if (/^\*\*Content:\*\*/i.test(s)) {
        inContent = true;
      } else if (/^\*\*Speaker notes?:\*\*/i.test(s)) {
        inContent = false;
        speakerNotes = s.replace(/^\*\*Speaker notes?:\*\*\s*/i, "").replace(/^\*+|\*+$/g, "").trim();
      } else if (/^\*\*(Design note|Notes?):\*\*/i.test(s)) {
        inContent = false;
      } else if (/^\*\*/.test(s) && s.endsWith("**")) {
        inContent = false;
      } else if (inContent && /^[-•*]\s/.test(s)) {
        const bullet = s.replace(/^[-•*]\s+/, "").replace(/\*\*/g, "").trim();
        if (bullet) bullets.push(bullet);
      }
    }

    if (title) slides.push({ title, keyMessage, bullets, speakerNotes });
  }

  return slides;
}

function buildPptx(slides, theme, deckTitle) {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: 10, height: 5.63 });
  pptx.layout = "WIDE";

  // Title slide (always first)
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: theme.bg };
  titleSlide.addText(deckTitle, {
    x: 0.5, y: 1.6, w: 9, h: 1.4,
    fontSize: 36, bold: true, color: theme.title, fontFace: "Calibri",
    align: "center",
  });
  titleSlide.addShape(pptx.ShapeType.rect, {
    x: 4, y: 3.3, w: 2, h: 0.06,
    fill: { color: theme.accent }, line: { color: theme.accent },
  });

  for (const s of slides) {
    const slide = pptx.addSlide();
    slide.background = { color: theme.bg };

    // Slide title
    slide.addText(s.title, {
      x: 0.5, y: 0.25, w: 9, h: 0.9,
      fontSize: 24, bold: true, color: theme.title, fontFace: "Calibri",
    });

    // Accent bar under title
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 1.1, w: 9, h: 0.04,
      fill: { color: theme.accent }, line: { color: theme.accent },
    });

    let yOffset = 1.25;

    if (s.keyMessage) {
      slide.addText(s.keyMessage, {
        x: 0.5, y: yOffset, w: 9, h: 0.6,
        fontSize: 13, italic: true, color: theme.subtitle, fontFace: "Calibri",
      });
      yOffset += 0.65;
    }

    if (s.bullets.length > 0) {
      const bulletObjs = s.bullets.map(b => ({
        text: b,
        options: { bullet: { type: "bullet" }, fontSize: 13, color: theme.text, fontFace: "Calibri", breakLine: true },
      }));
      slide.addText(bulletObjs, {
        x: 0.5, y: yOffset, w: 9, h: 5.63 - yOffset - 0.4,
        valign: "top",
      });
    }

    // Speaker notes
    if (s.speakerNotes) {
      slide.addNotes(s.speakerNotes);
    }
  }

  return pptx;
}

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

  const { content, style = "professional", title = "Presentation" } = req.body || {};

  if (!content) {
    return res.status(400).json({ error: "content is required" });
  }

  const theme  = THEMES[style] || THEMES.professional;
  const slides = parseSlides(content);

  if (slides.length === 0) {
    return res.status(400).json({ error: "No slides found in content. Make sure the outline uses '### Slide N: Title' headings." });
  }

  const pptx   = buildPptx(slides, theme, title);
  const buffer = await pptx.write({ outputType: "nodebuffer" });

  const safeName = title.replace(/[^a-zA-Z0-9 _-]/g, "").trim().replace(/ +/g, "_") || "deck";

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}.pptx"`);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(Buffer.from(buffer));
}
