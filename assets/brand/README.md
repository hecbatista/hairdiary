# Brand artwork

The Hair Diary mark: an open journal whose bookmark ribbon turns into a curl of hair.

## How it was made

1. Two concepts were generated from the prompts in [`prompts.md`](prompts.md) and kept in
   [`generated/`](generated/) for reference. Concept B (the hair bookmark) was chosen.
2. It was redrawn by hand as a vector in [`build.mjs`](build.mjs): flat palette colors instead of
   gradients, the curl pulled up so the mark is balanced, and wider gaps between the strand and
   the book so it still reads at 60 px.

## Files

| File | What it is |
| --- | --- |
| `build.mjs` | Source of the mark. Draws it as SVG and renders every PNG below. |
| `mark.svg` | The mark on a transparent background. |
| `icon-light.svg`, `icon-dark.svg` | Full icon previews for light and dark appearance. |
| `icon-tinted.svg` | Rough preview of the tinted appearance (iOS applies the real tint). |
| `../AppIcon.icon/` | Icon Composer document used for iOS (`ios.icon` in `app.json`): three layers (book, hair, ribbon) recolored per appearance in `icon.json`. |
| `../icon.png` | Flat 1024×1024 icon (no alpha), the fallback for anything that can't use the `.icon`. |
| `../splash-icon.png`, `../splash-icon-dark.png` | Splash mark for light and dark appearance (`expo-splash-screen` plugin). |
| `../adaptive-icon.png` | Android adaptive icon foreground, scaled into the safe zone. |
| `../favicon.png` | 48×48 web favicon. |

Palette: blush `#EAD9D1`, cocoa `#61524A`, rose `#D7B5A6`, dark background `#2B2320`.

## Rebuilding

Edit the geometry or colors in `build.mjs`, then run it. It needs Google Chrome installed (used
headless to render the PNGs):

```bash
node assets/brand/build.mjs
```

The layer colors for dark and tinted appearance live in `assets/AppIcon.icon/icon.json`. Open
the `.icon` in Icon Composer (bundled with Xcode) to preview it or adjust glass and shadows.
