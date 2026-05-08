# Deck Image Assets

Use this folder for images that `/deck` can pull into generated presentations.

## Supported files
- `.png`
- `.jpg` / `.jpeg`
- `.svg` (only if converted to PNG before insertion by `python-pptx` workflow)

## Naming convention
Use lowercase kebab-case names:
- `rfm-segmentation-hero.png`
- `whatsapp-flow-diagram-v2.png`
- `care-solution-kpi-card.png`

## Optional manifest
Create `assets/deck/images/manifest.yml` to map short keys to files:

```yaml
hero_rfm: rfm-segmentation-hero.png
wa_diagram: whatsapp-flow-diagram-v2.png
kpi_card: care-solution-kpi-card.png
```

Then in `/deck` requests, PMs can reference keys instead of full filenames.

## Quality guidance
- Prefer 16:9 artwork for full-bleed visuals.
- Use transparent PNG for logos/icons.
- Keep important content away from edges (safe margins).
- Avoid screenshots with browser chrome unless intentionally needed.
