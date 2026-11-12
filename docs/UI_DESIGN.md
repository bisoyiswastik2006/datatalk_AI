# UI/UX Design Guidelines: DataTalk AI

## 1. Color System (Light & Dark Mode)

DataTalk AI uses a semantic CSS-variable and Tailwind token architecture supporting instant light/dark theme toggling with system preference detection and localStorage persistence.

### Brand Palette & Semantic Roles
- **Brand Colors:** `#00B8FC`, `#0058FD`, `#FFFF00`, `#FF0000`, `#FD3500`, `#000000`
- **Primary:**
  - Light mode: `#0058FD` (fill with `#FFFFFF` text)
  - Dark mode: `#00B8FC` (fill with `#000000` text)
  - Used for: buttons, active nav indicators, links, focus rings, primary chart series.
- **Warning:** `#FFFF00` (warnings and highlights only, always with `#000000` text and an `AlertTriangle` warning icon).
- **Error:** `#FF0000` (errors, always with an icon and text label).
- **Destructive / Timeout / Rejected:** `#FD3500` (SQL rejected, timeout, destructive actions, and third chart series).
- **Page Background / Text:** `#000000` (dark mode page background and light mode main text).

### Neutrals
| Token | Light Mode | Dark Mode | Role |
|---|---|---|---|
| `page` | `#F5F7FA` | `#000000` | Page workspace background |
| `card` | `#FFFFFF` | `#0F1115` | Cards, panels, top bar, sidebar, assistant panel |
| `border` | `#D9DEE7` | `#232833` | Borders, dividers, subtle separators |
| `main` | `#000000` | `#FFFFFF` | Headings, primary body text |
| `secondary` | `#4A5361` | `#A8B0BD` | Captions, table headers, subtitles, helper text |

### Contrast & Styling Rules
- **Noemoji rule:** Zero emoji anywhere in UI, code, or documentation.
- **Light mode rule:** Never use `#00B8FC` or `#FFFF00` for text or thin lines in light mode; use them only as fills with black text.
- **Status rule:** Never rely on color alone for status; every status requires an icon and text label.
- **Primary buttons:** Standard rounded corners (8px `rounded-lg`), min 40px touch target. White text on `#0058FD` in light mode; black text on `#00B8FC` in dark mode.
- **Cards:** Clean plain cards with 8-12px radius, 1px border, minimal shadow (`shadow-sm`). No glow, no lift on hover, no card gradient, no accent line.
- **SQL viewer:** `#000000` background with `#232833` border in dark mode; `#F5F7FA` background with `#D9DEE7` border in light mode. Monospace 15px syntax highlighting.
- **Plotly charts:** Transparent background (`rgba(0,0,0,0)`), text from theme tokens, light gridlines from border token.
  - Series order (dark mode): `#00B8FC`, `#FFFF00`, `#FD3500`, `#FFFFFF`.
  - Series order (light mode): `#0058FD`, `#00B8FC`, `#FD3500`, `#000000`.
  - Re-themes instantly upon mode change.

---

## 2. Typography

**Typeface: Nohemi** (Pangram Pangram).
- Fallback stack: `"Nohemi", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Monospace stack: `ui-monospace, "JetBrains Mono", Consolas, monospace`.

### Semantic Type Scale
| Role | Size | Weight | Line Height | Token |
|---|---|---|---|---|
| Page/section title | 28px | 600 | 1.3 | `text-title-page` |
| Card title | 20px | 600 | 1.3 | `text-title-card` |
| Body and chat text | 16px | 400 | 1.5 | `text-body` |
| Table cells | 15px | 400 | 1.4 | `text-table-cell` |
| Table headers | 14px | 500 | 1.4 | `text-table-header` |
| Controls (buttons, inputs, tabs, nav) | 16px | 400/500 | 1.5 | `text-control` |
| Captions, labels, badges, status | 14px (min 13px) | 400/500 | 1.5 | `text-caption` |
| SQL viewer & code | 15px monospace | 400 | 1.5 | `text-code font-mono` |
| Chart ticks | 13px | 400 | 1.4 | `text-tick` |

---

## 3. Light/Dark Mode Toggle

- Located at the right end of the top bar.
- Uses Lucide `Sun` and `Moon` icons (no emoji).
- Accessible `aria-label` ("Switch to dark mode" / "Switch to light mode").
- Default: `prefers-color-scheme`.
- Remembers preference in `localStorage` safely wrapped in `try/catch`.
- Pre-paint inline script prevents theme flashing.
- Respects `prefers-reduced-motion` for transitions.
