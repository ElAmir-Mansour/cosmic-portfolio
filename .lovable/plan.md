

# Expert Improvements Plan

## 1. Fix Dead Resume Link

**Problem**: `resumeUrl` is `"#"` in content.json, which passes the truthy check and renders a broken "Download Resume" button.

**Fix**: Update the conditional in `Index.tsx` to also check `resumeUrl !== "#"`, and update content.json to either remove `resumeUrl` or set it to an actual URL.

**Files**: `src/pages/Index.tsx`, `public/data/content.json`

---

## 2. Fix OG Image and Canonical URL for SEO

**Problem**: `og:image` uses a relative path (`/og-image.png`) which social crawlers cannot resolve. The `canonical` URL points to the preview domain.

**Fix**:
- Make `og:image` and `twitter:image` use a full absolute URL
- Update canonical to the published domain (or remove it until published)

**Files**: `index.html`

---

## 3. Move Font Loading to HTML for Faster First Paint

**Problem**: Google Fonts loaded via `@import` in CSS blocks rendering until the stylesheet is fetched.

**Fix**:
- Remove the `@import url(...)` from `src/index.css`
- Add `<link rel="preconnect" href="https://fonts.googleapis.com">` and the stylesheet `<link>` in `index.html`

**Files**: `index.html`, `src/index.css`

---

## 4. Add Error Boundary and Retry for Data Loading

**Problem**: If `content.json` fails to load (network error, corrupted localStorage), the app shows a spinner forever.

**Fix**:
- Add error state to the `Index.tsx` loading flow with a "Retry" button
- Wrap the app in a React error boundary that shows a themed fallback

**Files**: `src/pages/Index.tsx`, `src/components/ErrorBoundary.tsx` (new)

---

## 5. Make About Section Stats Data-Driven

**Problem**: The stats (10+ Years Engineering, 8+ Years Military, etc.) are hardcoded in `AboutSection.tsx`, breaking the content.json data-driven pattern.

**Fix**:
- Add a `stats` array to the profile in `content.json`
- Pass stats to `AboutSection` as a prop
- Fall back to current hardcoded values if not present

**Files**: `public/data/content.json`, `src/components/AboutSection.tsx`, `src/pages/Index.tsx`, `src/services/DataService.ts`

---

## 6. Accessibility Improvements

**Problem**: No keyboard navigation for the galaxy, missing form labels, no skip-nav link, no aria-labels on icon-only buttons.

**Fix**:
- Add `aria-label` to the audio toggle button (currently only has `title`)
- Add visually-hidden `<label>` elements to contact form inputs
- Add a "Skip to content" link at the top of the page
- Add `role="region"` and `aria-label` to major sections

**Files**: `src/pages/Index.tsx`, `src/components/ContactSection.tsx`, `src/components/Navbar.tsx`

---

## 7. Add Noscript Fallback

**Problem**: With JS disabled, users see a blank white page. Search engine crawlers that don't execute JS get nothing.

**Fix**: Add a `<noscript>` tag inside `<body>` in `index.html` with the portfolio name, title, and a brief description.

**Files**: `index.html`

---

## Implementation Order

1. Fix dead resume link (2 min)
2. Fix OG/canonical URLs (3 min)
3. Move font loading to HTML (5 min)
4. Add noscript fallback (2 min)
5. Error boundary and retry (10 min)
6. Data-driven about stats (10 min)
7. Accessibility improvements (15 min)

---

## Technical Notes

- No new dependencies required
- All changes are backward-compatible with existing localStorage data (new fields use optional typing)
- The error boundary is a class component (React requirement) but wraps functional components seamlessly
- Font preconnect will improve Lighthouse performance score by eliminating the render-blocking CSS import

