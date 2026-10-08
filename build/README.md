# FinanceSelf.jp — build scripts

Scripts to regenerate the site's image assets from source SVGs.

## Regenerate everything

```bash
# 1. PNG icons (requires Node; one-time: npm install)
cd build
npm install
node svg2png.mjs       # → assets/img/icon-{16..512}.png + apple-touch-icon.png

# 2. favicon.ico (requires Python + Pillow)
python make-ico.py     # → favicon.ico (16/32/48/64/128/256)

# 3. Open Graph image
python make-og.py      # → assets/img/og-image.png (1200x630)
```

## Source files

| File | Purpose |
|---|---|
| `src/apple-touch.svg` | Full-bleed icon variant (iOS adds its own rounded corners) |
| `assets/img/logo-icon.svg` | Brand mark — chip + growth arrow + AI circuit node |
| `assets/img/logo.svg` | Full lockup for dark backgrounds (used in navbar/footer) |
| `assets/img/logo-dark.svg` | Full lockup for light backgrounds |

The `node_modules/` folder created by step 1 can be deleted after building;
keep it if you plan to regenerate icons.
