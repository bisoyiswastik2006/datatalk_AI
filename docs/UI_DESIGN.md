# UI/UX Design Guidelines: DataTalk AI

## 1. Color palette

| Token | Hex | Role |
|---|---|---|
| `--color-primary` | #3368A0 | Primary actions, active states, links, key chart series, focus rings |
| `--color-secondary` | #66A3BF | Secondary chart series, hover states, borders on active items, icons |
| `--color-tint` | #C8DFDB | Panels, assistant panel background, selected rows, subtle fills |
| `--color-surface` | #F2EFE7 | Page background, cards, table backgrounds |

### Derived neutrals (additions, not in the supplied palette)
The four colors alone cannot give readable body text, so add two derived tokens. Confirm with the team before using anything else.

| Token | Hex | Role |
|---|---|---|
| `--color-ink` | #14283D | Body text and headings (dark shade of the primary hue) |
| `--color-ink-muted` | #4A5F73 | Secondary text, captions, table headers |

Status colors (error, warning, success) are not in the palette. Prefer expressing them with an icon plus text label; if a color is needed, use a muted red and amber that sit well on #F2EFE7, and decide this once in the theme file.

### Contrast rules
- Body text: `--color-ink` on `--color-surface` or `--color-tint` (high contrast).
- #3368A0 on #F2EFE7 passes for text and buttons. White text on #3368A0 is fine for primary buttons.
- **Do not use #66A3BF for text on #F2EFE7 or #C8DFDB.** It is too low in contrast. Use it for fills, borders, icons, and chart series only.
- Do not rely on color alone to convey meaning (add labels, icons, or patterns).
- Target WCAG AA (4.5:1 for normal text, 3:1 for large text and UI components). Verify with a contrast checker before finalizing.

### Chart colors
Plotly series order: #3368A0, #66A3BF, then dark ink #14283D, then #C8DFDB with a darker outline. Set chart paper and plot background to transparent or #F2EFE7. Use direct labels or clear legends. Keep gridlines light.

## 2. Typography

**Typeface: Nohemi** (Pangram Pangram).

- Load with `@font-face` from local files in the frontend (`src/styles/fonts/`), using `woff2`.
- Weights to use: Regular (400), Medium (500), SemiBold (600). Add others only if needed.
- **Licensing:** Nohemi is not an open-source font. Check the license on the Pangram Pangram site. Personal/trial use is free; any public or commercial deployment needs the correct license. For a college project, confirm the terms allow your use and record the license in the README.
- Fallback stack: `"Nohemi", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Use `font-display: swap`.
- For SQL, code, and numeric tables, use a monospace font (e.g. `ui-monospace, "JetBrains Mono", Consolas, monospace`) so SQL stays readable. Nohemi is a display-leaning sans and is not suited to code blocks.

### Type scale (suggested)
| Use | Size | Weight |
|---|---|---|
| Page/section title | 20-24px | 600 |
| Card title | 16-18px | 600 |
| Body | 14-15px | 400 |
| Table cells | 13-14px | 400 |
| Caption / metadata | 12px | 400-500 |

## 3. No emoji rule
- No emoji anywhere: UI text, buttons, labels, empty states, error messages, chat responses, placeholders, docs.
- Use Lucide icons for visual cues.
- The LLM system prompt must instruct the model not to use emoji in answers. Strip or reject emoji from model output as a safeguard.

## 4. Layout
Follows the technical spec: compact top bar, main workspace on the left, assistant panel on the right.

- Page background: `--color-surface`.
- Top bar: `--color-surface` with a thin bottom border in `--color-tint`; brand in `--color-primary`.
- Assistant panel: `--color-tint` background so it is distinct but not heavy.
- Cards (SQL, table, chart): `--color-surface` with a 1px `--color-tint` or `--color-secondary` border, 8-12px radius, minimal shadow.
- Primary button: `--color-primary` fill, white text. Secondary button: transparent with `--color-primary` border and text.
- Selected table row / active dataset: `--color-tint` fill with a `--color-primary` left border.
- Focus ring: 2px `--color-primary` with offset, always visible for keyboard users.
- Internal scrolling for tables and chat; stack panels on small screens.
- Spacing on a 4px grid (4, 8, 12, 16, 24, 32).

## 5. Tailwind setup (suggested)
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: "#3368A0",
      secondary: "#66A3BF",
      tint: "#C8DFDB",
      surface: "#F2EFE7",
      ink: "#14283D",
      "ink-muted": "#4A5F73",
    },
    fontFamily: {
      sans: ['"Nohemi"', "system-ui", "-apple-system", '"Segoe UI"', "Roboto", "sans-serif"],
      mono: ['ui-monospace', '"JetBrains Mono"', "Consolas", "monospace"],
    },
  },
}
```
Define the same colors as CSS variables so Plotly and non-Tailwind code can use them.

## 6. UX principles
1. **Always show context:** the active dataset name is visible at all times.
2. **Show the work:** SQL is visible or one click away on every answer.
3. **Honest states:** every state in the technical spec has a designed, text-labeled screen (loading, empty, error, not answerable, SQL rejected, timeout, LLM not configured).
4. **Plain language errors:** say what happened and what to do next. No stack traces.
5. **Progressive disclosure:** answer first, then SQL, table, chart, warnings.
6. **Never imply certainty the data does not support.** Show warnings near the result.
7. **Keyboard accessible:** full tab order, Enter to send, Escape to close dialogs, labeled form fields, `aria-live` for status updates.
8. **Reduced motion:** respect `prefers-reduced-motion`. Keep animation minimal and functional.
9. **Suggested questions** must be generated from the active dataset's schema, never hardcoded.

## 7. Content and tone
- Short, direct, professional sentences.
- No emoji, no exclamation-heavy copy, no slang.
- Use sentence case for labels and buttons ("Upload dataset", "Ask a question").

## 8. Design acceptance checklist
- [ ] Only the four palette colors plus the two derived ink tones (and status colors, once decided) are used
- [ ] No text uses #66A3BF on a light background
- [ ] Nohemi loads and falls back gracefully; SQL and code use monospace
- [ ] Nohemi license confirmed and noted in the README
- [ ] No emoji in UI, chat output, or docs
- [ ] Contrast checked to WCAG AA
- [ ] Layout fits a standard laptop viewport without page-level scrolling
- [ ] All required UI states are designed and implemented
- [ ] Keyboard navigation and visible focus work throughout
