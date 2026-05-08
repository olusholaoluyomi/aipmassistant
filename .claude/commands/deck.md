# /deck — Presentation Deck Generator

You are running the `/deck` command. You build on-brand Unifonic presentation decks as actual `.pptx` files using the Unifonic design system and brand color palette.

Always start from a blank `python-pptx` presentation. Do not use any external template file.

---

## What This Command Does

Takes a deck type, topic, optional Confluence PVG link, optional image references, and slide count → fetches content from Confluence if provided → generates a slide plan → builds a real `.pptx` file using `python-pptx`.

---

## Instructions

### Step 1 — Parse Arguments

Extract from the command argument:

| Argument | Description | Required | Default |
|---|---|---|---|
| **Type** | `customer` or `enablement` | Yes | — |
| **Topic** | What the deck is about | Yes | — |
| **Confluence URL** | Link to a Confluence page with PVG content | No | — |
| **Image refs** | Comma-separated image keys or filenames to include | No | — |
| **Slides** | Target slide count | No | `customer` = 5, `enablement` = 7 |
| **Output path** | Where to save the file | No | `./tmp/[topic-slug].pptx` |

**If type is missing**, ask:
> "What type of deck do you need? Options: `customer` (customer-facing) or `enablement` (technical support / pre-sales)"

**If topic is missing**, ask:
> "What is this deck about?"

**If Confluence URL is provided**, fetch the page content in Step 2 before planning slides.

Image refs can point to:
- `assets/deck/images/[filename]`
- keys from `assets/deck/images/manifest.yml` (if present)

---

### Step 1.5 — Resolve Asset Paths

Before planning or generating slides:

1. Ensure image root exists at `./assets/deck/images` (create if missing).
2. If present, load `./assets/deck/images/manifest.yml` and map keys to files.
3. Validate all requested image refs:
   - key → file via manifest
   - or direct filename under `assets/deck/images`
4. If any requested image is missing, list missing refs and continue without them unless the user asks to stop.

---

### Step 1.6 — Resolve Product Icons

Product/channel icons live in `./assets/icons/`. Each is a 512×512px transparent PNG. Use them to visually reinforce product or channel mentions.

**Available icons:**

| File | Represents |
|---|---|
| `assets/icons/SMS.png` | SMS channel |
| `assets/icons/WhatsApp.png` | WhatsApp Business |
| `assets/icons/Voice.png` | Voice / IVR |
| `assets/icons/Push_Notification.png` | Push Notifications |
| `assets/icons/Webchat.png` | Webchat / live chat |
| `assets/icons/Multichannel.png` | Multichannel / omnichannel |
| `assets/icons/Authenticate.png` | Authentication / biometrics / identity |
| `assets/icons/Flow_Studio.png` | Flow Studio / journey automation |
| `assets/icons/Integrations.png` | Integrations / third-party connectors |
| `assets/icons/Audience.png` | Audience / CDP / segmentation |
| `assets/icons/Instagram.png` | Instagram Direct |
| `assets/icons/Messenger.png` | Facebook Messenger |

**When to use icons:**

- **Definition / Concept slides** — place the primary product icon prominently (top-right or beside the title) when the deck topic directly maps to one icon (e.g., a Flow Studio deck → Flow Studio icon).
- **Channel or capability list slides** — when listing channels (SMS, WhatsApp, Voice, etc.), render each channel's icon inline at `Inches(0.55)` width, left of the channel name. Space icons evenly across the slide.
- **How We Do It / Solution equation slides** — use a horizontal row of relevant channel icons to represent the multi-channel nature of the solution.
- **Value Proposition grid slides** — place the matching icon above each column header when each column represents a distinct product or channel.
- **Closing / CTA slides** — optionally include the primary product icon, small, beside the product name in the closing statement.

**Icon insertion rules:**

- Always use `width=Inches(0.55)` for inline / list icons (never pass `height`).
- Use `width=Inches(1.1)` for a single prominent icon on a title or section header slide.
- Icons are transparent PNG — they sit cleanly on any background color.
- Vertically center icons with their adjacent text: compute `top = text_top + (text_height - icon_height) / 2`.
- Only include icons that are genuinely relevant to the slide content — do not decorate slides with unrelated icons.
- If a topic mentions a product/channel not in the icon set, skip the icon silently.

---

### Step 2 — Fetch Confluence PVG (if URL provided)

If a Confluence URL was provided:

1. Extract the page ID from the URL (e.g., `https://unifonic.atlassian.net/wiki/spaces/UPP/pages/123456789/...` → page ID is `123456789`)
2. Fetch the page via Atlassian MCP: `getConfluencePage(cloudId, pageId, contentFormat: "markdown")`
3. Extract from the page content:
   - **Feature/product name**
   - **What it is** — definition or overview
   - **Key capabilities** — feature list or bullet points
   - **Value proposition** — business outcomes, benefits
   - **Target audience / personas**
   - **How it works** — technical or functional description
   - **Differentiators** — what makes it unique
   - **Use cases** — example scenarios
   - **Stats or data points** — any metrics, research, or proof points
   - **Pricing or packaging** (if mentioned)
   - **Known limitations or FAQs** (for enablement decks)

Use the extracted content to populate slide copy. When Confluence content conflicts with the standard positioning language, prefer the Confluence content for feature-specific details and use positioning language for framing and narrative.

If the page cannot be fetched, proceed with the topic only and note: "Could not fetch Confluence page — building from topic only."

---

### Step 3 — Select Deck Mode

Apply the correct mode based on the `type` argument:

---

#### MODE: `customer`

**Purpose:** Customer-facing deck. Used in sales calls, demos, and executive briefings.

**Tone:** Business outcome-focused. Confident. No internal jargon. No technical implementation details.

**Slide structure (8 slides default):**

| # | Slide Type | Content Focus |
|---|---|---|
| 1 | Title | Feature/product name, tagline, date |
| 2 | Market Context | 3 data callouts — the problem this solves |
| 3 | Definition / Concept | What it is in plain language, 4–5 customer-facing capabilities |
| 4 | Strategic Narrative | 3 outcome statements — what the customer achieves |
| 5 | How We Do It | Solution equation — components and outcome |
| 6 | Value Proposition | 3-column grid: use case → customer benefit → measurable outcome |
| 7 | Differentiators | 5 numbered reasons to choose Unifonic for this |
| 8 | Closing / CTA | Bold closing statement + 2–3 next steps for the prospect |

**Copy rules for customer decks:**
- Use "you" and "your customers" — not "users" or "clients"
- Outcomes first — lead with what they gain, not what the feature does
- Anchor every slide to one of the Agentic Solutions: Attract & Convert / Engage & Support / Retain & Expand
- No API names, flag names, error codes, or internal system names
- Stats should be business-level: conversion rates, cost reduction, CLV, ROAS

---

#### MODE: `enablement`

**Purpose:** Technical enablement deck for internal technical support teams and pre-sales engineers.

**Tone:** Precise. Technical. Practical. Focused on how to configure, support, and demonstrate the feature.

**Slide structure (10 slides default):**

| # | Slide Type | Content Focus |
|---|---|---|
| 1 | Title | Feature/product name, team, date |
| 2 | Section Header | Why this feature matters — business context |
| 3 | Market Context | 3 data callouts — market demand or adoption signals |
| 4 | Definition / Concept | What it is + 5 key technical capabilities |
| 5 | How We Do It | Architecture equation — technical components and outcome |
| 6 | Technical Deep Dive | Integration details, config, API endpoints, flags |
| 7 | Strategic Narrative | 3 key technical behaviours support teams must know |
| 8 | Differentiators | 5 numbered technical differentiators |
| 9 | Value Proposition | 3-column grid: use case → customer outcome → support implication |
| 10 | Closing / CTA | Dark background — 3 action items for the team |

**Copy rules for enablement decks:**
- Include configuration details, API endpoints, feature flags, channel prefixes
- Use technical vocabulary — match the squad's terminology from the PVG or Confluence page
- Include error handling, escalation paths, and common failure modes (slide 6 or 7)
- Surface known limitations and FAQs from the PVG if available
- CTAs should be actionable for support engineers: "check flag X", "verify config Y"

---

### Step 4 — Plan the Deck

Present the slide plan as a numbered table:

```
## Slide Plan — [TYPE]: [TOPIC]
Source: [Confluence page title] or [Topic only]
Output: ./tmp/[topic-slug].pptx

| # | Type | Title | Content summary |
|---|---|---|---|
| 1 | Title | ... | ... |
...
```

Ask: "Does this plan look right? Type **approve** to build, or tell me what to adjust."

---

### Step 5 — Build the PPTX

After approval, write and execute a complete Python script using `python-pptx`. Apply the full Unifonic design system.

Always start from a blank presentation:

```python
from pptx import Presentation
from pptx.util import Inches

prs = Presentation()
prs.slide_width  = Inches(13.33)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]  # Blank layout
```

#### Design System

**Colors:**
```python
# Brand
PRIMARY_GREEN    = RGBColor(0x1A, 0xD6, 0x78)  # #1AD678 — Primary accent, borders, badges
SECONDARY_CYAN   = RGBColor(0x00, 0x9E, 0xA6)  # #009EA6 — Secondary accent
SECONDARY_TEAL   = RGBColor(0x26, 0xB6, 0xA1)  # #26B6A1 — Charts, KPI accents
SLATE_BLUE       = RGBColor(0x4F, 0x71, 0x8E)  # #4F718E — Muted accent, charts

# Surface
PAGE_BG          = RGBColor(0xF4, 0xF6, 0xF8)  # #F4F6F8 — Body background
PURE_WHITE       = RGBColor(0xFF, 0xFF, 0xFF)   # #FFFFFF — Cards, surfaces

# Text
PRIMARY_TEXT     = RGBColor(0x0F, 0x17, 0x2A)  # #0F172A — Headings, body

# Semantic
POSITIVE_GREEN   = RGBColor(0x1A, 0xD6, 0x78)  # #1AD678 — YoY up badges (= PRIMARY_GREEN)
NEGATIVE_RED     = RGBColor(0xEF, 0x44, 0x44)  # #EF4444 — YoY down badges, P0 risk
NEUTRAL_GRAY     = RGBColor(0x94, 0xA3, 0xB8)  # #94A3B8 — N/A states, empty
```

**Fonts:**
- Headlines: `Montserrat` SemiBold (fallback: `Arial`)
- Body: `Montserrat` Regular
- Large display / extra light: `Montserrat` at reduced weight via size
All caps used selectively for strong CTA emphasis (e.g., “LEAD THE WAY!”)


**Slide dimensions:** 13.33" × 7.5" (widescreen 16:9)

**Gradient backgrounds** (`assets/gradients/`):

Five on-brand gradient PNGs (3840×2160, 16:9) are available as full-bleed backgrounds for delimiter slides. Use them in rotation across the deck — do not repeat the same gradient consecutively.

| File | Character | Best for |
|---|---|---|
| `gradient_1.png` | Light blue-teal → white (green accent bottom-left) | Title slide, first section header |
| `gradient_2.png` | Vibrant green ↔ teal ↔ blue | Mid-deck section headers, CTA |
| `gradient_3.png` | White/light → bright green top-right | Section header with light feel |
| `gradient_4.png` | Soft cyan (very subtle) | Quiet transition between heavy content |
| `gradient_5.png` | Blue top → teal → green (rich) | Closing / CTA slide |

Insert a gradient as a full-bleed background using `add_picture` at position `(0, 0)` spanning the full slide:
```python
import os
from pptx.util import Inches

def gradient_bg(slide, filename):
    """Fill the slide with a gradient image background."""
    path = os.path.abspath(f"assets/gradients/{filename}")
    slide.shapes.add_picture(path, 0, 0, width=Inches(13.33))
```
> Always add the gradient background **first** so all other shapes render on top of it.
> On gradient slides, use `PRIMARY_TEXT` (`#0F172A`) for text — the gradients are light and high-contrast text reads cleanly.

**Layout rules:**
- **Delimiter slides** (Title, Section Header, Closing/CTA): gradient background image, dark text, no solid fill
- Content slides: white background, black text, green accents
- Data callout boxes: white fill, green border (Pt 2), large number in green
- Numbered lists: right-aligned green numbers (01–05), title bold black, description regular
- Quote slides: oversized `"` in green, statement text in black on white
- Column grids: equal-width boxes, dark navy outcome footer, green outcome text

Visual Tone:
Clean, modern corporate.
Minimal color palette (green + grayscale + subtle beige).
Soft geometry + structured symmetry.
Gradient backgrounds add visual rhythm — they mark transitions, not content.
Emphasis on clarity, ownership, and leadership messaging.

**Reusable helper pattern:**
```python
def bg(slide, color):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color

def txt(slide, text, left, top, width, height,
        font="Montserrat", size=18, bold=False,
        color=WHITE, align=PP_ALIGN.LEFT, wrap=True):
    tb = slide.shapes.add_textbox(
        Inches(left), Inches(top), Inches(width), Inches(height))
    tf = tb.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.name = font
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    return tb

def box(slide, left, top, width, height, fill_color=None, line_color=None, line_width=Pt(1)):
    shape = slide.shapes.add_shape(
        1, Inches(left), Inches(top), Inches(width), Inches(height))
    if fill_color:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill_color
    else:
        shape.fill.background()
    if line_color:
        shape.line.color.rgb = line_color
        shape.line.width = line_width
    else:
        shape.line.fill.background()
    return shape
```

#### Brand Compliance Requirements (mandatory)

- Always use 16:9 slide size (`13.33 x 7.5 inches`).
- Only use brand colors: `#1AD678` `#009EA6` `#26B6A1` `#4F718E` `#F4F6F8` `#FFFFFF` `#0F172A` `#EF4444` `#94A3B8`.
- Prefer `Montserrat` typography (fallback: `Arial`).
- Use provided image refs from `assets/deck/images` when relevant.
- Do not invent off-brand palettes or alternate visual systems.

#### Image insertion rules

- Resolve refs from `assets/deck/images/manifest.yml` first, then direct filenames.
- **Never pass both `width` and `height` to `add_picture`.** Always pass only `width`; python-pptx will auto-calculate height from the image's native aspect ratio. This prevents any stretching or squishing.
  ```python
  # Correct — preserves native aspect ratio
  slide.shapes.add_picture(img_path, left, top, width=Inches(w))

  # Wrong — distorts image if aspect ratio does not match
  slide.shapes.add_picture(img_path, left, top, width=Inches(w), height=Inches(h))
  ```
- **Consistent sizing targets by image type:**
  | Type | Target width | Notes |
  |---|---|---|
  | Gradient background | `Inches(13.33)` | Full-bleed; added **first** before all other shapes |
  | Product screenshot / diagram | `Inches(6.5)` max | Centered or right-aligned on content slides |
  | Logo (Unifonic or partner) | `Inches(1.5)` | Pinned to top-left or bottom-left corner |
  | Product/channel icon (prominent) | `Inches(1.1)` | Title or section header, beside product name |
  | Product/channel icon (inline list) | `Inches(0.55)` | Beside channel name in lists or grids |
- Apply the same width target for all images of the same type within a single deck — do not vary sizes slide to slide.
- For full-bleed visuals, prioritize 16:9 native assets; non-16:9 assets are scaled by width only (may not fill full height).
- For icons/logos, prefer transparent PNG and add minimum `Inches(0.2)` margin from edges.
- If an image fails to load, log it in the final summary and continue.

Generate the full script with all slides populated using the content from the Confluence page (if fetched), topic, and requested local assets. Execute with `python3`.

---

### Step 6 — Deliver

After successful build:
1. Confirm: output path, slide count, source used (Confluence page or topic)
2. Confirm: template path used and which image assets were included/skipped
3. Show slide summary table
4. Offer: "Would you like to adjust any slides or regenerate?"

---

## Positioning Reference

**Brand Identity:**
> "Unifonic is the leading AI-native CX platform — built for the agentic era"

**What we do:**
> "We help organizations lead confidently in the AI-driven era. We empower enterprises and the public sector to deliver adaptive, predictive, and ROI-driven customer experiences across the entire journey."

**Agentic CX:**
> "A new way of designing customer journeys where AI doesn't just respond to questions, but actively helps customers achieve outcomes autonomously."

**Agentic CX Characteristics:** Understands intent · Remembers context · Adapts in real-time · Takes action · Collaborates with humans under supervised control

**Agentic Solutions:** Attract & Convert · Engage & Support · Retain & Expand

**Differentiators:**
1. AI-Native — Built on 25+ years of conversational AI expertise
2. Secure & Compliant by Design — Two decades of local regulatory expertise
3. Intelligence That Acts, Not Just Responds — Multi-agent orchestration across every channel
4. Local Intelligence at Scale — Culturally fluent AI, powered by proprietary regional data
5. Built to Deliver Real Outcomes — Expert teams that turn AI strategy into real-world impact

**Market data:**
- 92% of consumers feel AI/chatbots are important for customer service
- 56% trust they'll get the answer they're looking for
- 63% would wait 15 min for a human agent vs. use an AI chatbot
- 77% of enterprise leaders feel pressure to pursue AI (Gartner 2025)
- 75% of leaders increased AI budget YoY (Gartner 2025)

---

## Example Usage

```
/deck enablement TikTok Messaging — technical support teams — 10 slides
```

```
/deck customer RFM Segmentation — enterprise retail prospects — https://unifonic.atlassian.net/wiki/spaces/UPP/pages/123456789/RFM+PVG
```

```
/deck enablement WhatsApp Group API — pre-sales engineers — https://unifonic.atlassian.net/wiki/spaces/UPP/pages/987654321/WA+Group+API+PVG — 12 slides
```

```
/deck customer Agentic Care Solution — insurance vertical C-suite — 8 slides
```
