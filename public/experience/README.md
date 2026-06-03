# Experience SVG screens

Drop your Figma-exported **`.svg`** files in **this folder**.

```text
public/experience/
  my-stage.svg
  rings.svg
  manifest.json   ← auto-updated when you build or run npm run experience:manifest
```

## Steps

1. Export each screen from Figma as **SVG**.
2. Copy the `.svg` files here (any names, e.g. `lux-stage.svg`).
3. Regenerate the manifest:

   ```bash
   npm run experience:manifest
   ```

4. Run the app (`npm run dev`) or push to `main` for the live site.

Files in this folder load automatically during the concert experience. They use the same beat-reactive layer as imported SVGs (bass, beat flash, typography colors).

**Tip:** In Figma, name layers clearly; use solid fills where you want colors driven by the music later.

You can still import extra SVGs from **Customize → SVG** (stored on the device).
