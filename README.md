# Guadalupe Valencia Toxqui · personal academic website

A fast, static personal site (no build step) with a Talavera-inspired design, a subtle
phage-on-a-bicycle cycling motif, and an immersive scroll-through **Interactive CV**.
Hosted on GitHub Pages.

## Files

```
index.html   Home: hero, about/heritage, research, publications, teaching, gallery, contact
cv.html      Interactive CV: a chaptered, scroll-driven "journey"
styles.css   All styling + the Talavera color tokens (top of file, :root)
main.js      Nav, the cyclist + hill animation, scroll reveals, counters
favicon.svg  Phage glyph used as the site icon and publication bullets
assets/img/  Web-optimized photos (orientation baked in; ~2.6 MB total)
assets/docs/ CV as PDF (download) and the editable .docx source
.nojekyll    Tells GitHub Pages to serve files as-is
```

## How to edit common things

- **Text / wording**: edit `index.html` and `cv.html` directly. Sections are clearly
  commented (e.g. `<!-- ============ RESEARCH ============ -->`).
- **Colors**: change the variables under `:root` at the top of `styles.css`
  (`--cobalt`, `--saffron`, `--terracotta`, `--verde`, `--azulejo`).
- **Add a new publication**: copy one `<div class="pub"> … </div>` block in
  `index.html` and edit it. Wrap your name in `<span class="me">Valencia-Toxqui G</span>`.
- **Profile links**: Google Scholar, ORCID, and GitHub are already wired into the
  Publications and Contact sections of `index.html`. To add another (e.g. LinkedIn),
  copy one of those `<a>` tags and change the `href`.
- **Replace the CV**: drop a new PDF at
  `assets/docs/Guadalupe_Valencia_Toxqui_CV.pdf` (keep the same filename), and the
  matching `.docx` if you like.
- **Swap a photo**: replace the file in `assets/img/` keeping the same name, or add a
  new one and update the `src` in the HTML. Keep images ≲1200 px on the long side and
  re-save at ~80% quality so the page stays light.

## Preview locally

From this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy to GitHub Pages (account: `Valencia-Toxqui`)

This publishes to **https://valencia-toxqui.github.io**.

1. On GitHub, create a new repo named exactly **`Valencia-Toxqui.github.io`** (public).
2. From inside this `site/` folder, push its contents to that repo's `main` branch:

```bash
git init
git add .
git commit -m "Launch personal academic site"
git branch -M main
git remote add origin https://github.com/Valencia-Toxqui/Valencia-Toxqui.github.io.git
git push -u origin main
```

3. GitHub → repo **Settings → Pages → Source: `main` / root**. The site is live at
   **https://valencia-toxqui.github.io** within ~1 minute.

To update later: edit files, then `git add . && git commit -m "update" && git push`.

## Accessibility & performance notes

- Fully responsive (desktop / tablet / mobile) with a collapsing nav.
- Respects `prefers-reduced-motion`: the cyclist, counters, and reveals fall back to
  static. No motion is required to read anything.
- No frameworks, no trackers, no build step, just HTML/CSS/JS.

Heritage palette and tilework are a nod to the cobalt-blue *Talavera* pottery of
Puebla. 🚲
