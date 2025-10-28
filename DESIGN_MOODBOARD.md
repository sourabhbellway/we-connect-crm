# Design Moodboard & UI Guidelines

This document captures the design language to ensure pixel-perfect and consistent UI across the app.

## 1) Brand & Palette
Primary (WeConnect):
- Red: #EF444E
- Black: #2B2C2B

Secondary:
- Blue: #446AEF
- Orange: #F7B638
- Green: #5ED790
- Purple: #AC5ADE
- Cyan: #63DCE4

Implementation:
- Tailwind theme extends these tokens in `client/tailwind.config.js` and utility classes exist in `src/index.css` (e.g., `.bg-weconnect-red`, `.text-brand-blue`).

## 2) Typography
- Font: Proxima Nova (fallback: system sans). Declared in `src/index.css`.
- Base font-size: 14px (adaptive down for smaller screens).
- Headings: semantic `<h1..h6>` with Tailwind font weights; labels 120% line height; body 150% line height.

## 3) Spacing & Grid
- Base grid unit: 30px columns; 15px gutters.
- Custom utilities provided (e.g., `.grid-col-2`, `.grid-gap-2`).
- Tailwind spacing scale can be used in tandem; prefer design utilities for consistency.

## 4) Components (Design System)
Primitives live in `src/components/ui/` and CSS utilities in `src/index.css`.
- Buttons:
  - Variants: Primary (red), Secondary (outlined red), Tertiary (text).
  - Base class patterns: `.btn-base`, `.btn-primary`, `.btn-secondary`, `.btn-tertiary`.
- Inputs:
  - `.input-base` and `.input-divided` (with icon divider), with states for hover/focus/disabled/error; dark mode variants included.
- Cards:
  - `.card`, `.card-compact`, `.card-stats` with header/body/footer patterns.
- Modals/Popups/Leaflets:
  - `.modal*`, `.popup*`, `.leaflet*`; include overlays, headers, footers, animations.

Always drive component variants via props; no hard-coded colors in components—use theme tokens or utility classes.

## 5) States & Feedback
- Loading: use skeletons/spinners (see `ui/LoadingSpinner.tsx`) and page-level placeholders.
- Errors: friendly messages; inputs use `.error` styles.
- Toasts: success/error/info via react-toastify (position top-right by default).

## 6) Responsiveness
- Breakpoints: xs 475, sm 640, md 768, lg 1024, xl 1280, 2xl 1536.
- Provide mobile-first layout; tables degrade to card views under 640px (`.mobile-card-view`).
- Better touch targets on mobile (min-height 44px for interactive elements).

## 7) Theming & Effects
- Dark mode via `class` strategy; ensure colors use Tailwind tokens with dark variants.
- Disable blur effects globally with `.no-blur` opt-in class when needed.
- Gradients and shadows: `.bg-weconnect-gradient`, `.shadow-weconnect*`.

## 8) Accessibility
- Keyboard navigation (focus rings present on interactive elements).
- Labels tied to inputs; aria attributes for modals and buttons.
- Provide contrast using semantic tokens; avoid text over strong gradients without contrast checks.

## 9) Do & Don’t
- Do centralize labels, colors, and behaviors (constants/theme); update in one place.
- Do build config-driven tables and form schemas for reusability.
- Don’t duplicate inline styles or magic hex codes in components.
- Don’t couple features to layout; use layouts for chrome (sidebar/header).

## 10) Review Checklist
- Pixel-perfect vs design tokens (spacing, sizes, radii).
- Responsive at sm/md/lg breakpoints.
- States: hover/focus/disabled/error implemented.
- i18n text externalized; no hard-coded strings.
