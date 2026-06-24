# Styling Features — Implementation Spec

This document captures two visual background effects for the CodeBloggs app, along with the AI prompts used to implement them. Both effects draw exclusively from the brand, semantic, and accent color groups defined in `client/src/styles/theme.css`.

---

## Color Reference

These groups are the source of truth for all effects below.

### Brand Colors
| Variable | Hex |
|---|---|
| `--color-delft-blue` | `#403E6B` |
| `--color-tropical-indigo` | `#8D88EA` |
| `--color-periwinkle` | `#B1ADFF` |
| `--color-lavender` | `#D3D1EE` |
| `--color-slate-blue` | `#6E6AB8` |

### Semantic Color Roles
| Variable | Hex |
|---|---|
| `--color-midnight-indigo` | `#29274A` |
| `--color-deep-slate` | `#35344F` |
| `--color-storm-gray` | `#4A495E` |

### Accent Colors
| Variable | Hex |
|---|---|
| `--color-electric-violet` | `#7C73FF` |
| `--color-bright-periwinkle` | `#9993FF` |
| `--color-glow-lavender` | `#C0BCFF` |
| `--color-iris` | `#6A5CFF` |
| `--color-neon-indigo` | `#5B4DFF` |

---

## Feature 1 — Grid Background Effect

> **Superseded by Feature 3.** The CSS `background-image` approach below was the initial implementation. It was replaced by the canvas-based BulgeGrid (Feature 3), which draws the same grid interactively with cursor-driven displacement and per-segment color gradients. The CSS recipe is preserved here as a reference for simpler static use cases.

### Design Intent

A static, fixed-position CSS grid texture applied to the `body` element so it appears behind every page in the app — authenticated and public alike. The grid uses two scales: a fine 24 px cell for texture density and a coarse 96 px cell to define structural rhythm. Line colors are derived from the brand and accent groups at low opacity so the grid reads as surface texture rather than foreground decoration. Cards, sidebar, and header panels sit visually above the grid without modification.

### Implementation Prompt

```
In `client/src/styles/theme.css`, update the `body` rule to add a 4-layer CSS grid background using brand and accent colors from the CodeBloggs palette. The grid must:

1. Use a 24 px × 24 px fine cell for texture, with:
   - Horizontal lines in tropical-indigo (rgba(141, 136, 234, 0.10))
   - Vertical lines in periwinkle (rgba(177, 173, 255, 0.08))

2. Use a 96 px × 96 px coarse cell for structural rhythm, with:
   - Horizontal lines in electric-violet (rgba(124, 115, 255, 0.13))
   - Vertical lines in iris (rgba(106, 92, 255, 0.10))

3. Set `background-attachment: fixed` so the grid stays stationary as content scrolls.

4. Keep `background-color: var(--color-background)` as the base fill beneath the grid.

Also change `.app-shell { background: var(--color-background) }` to `background: transparent` so it doesn't paint over the body grid. No changes are needed in `theme-dark.css` — the dark theme only redefines CSS variables, so the grid color shifts automatically.
```

### CSS Recipe

```css
/* In theme.css — body rule */
body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background-color: var(--color-background);
  background-image:
    /* Fine grid: brand colors */
    linear-gradient(rgba(141, 136, 234, 0.10) 1px, transparent 1px),   /* tropical-indigo H */
    linear-gradient(90deg, rgba(177, 173, 255, 0.08) 1px, transparent 1px), /* periwinkle V */
    /* Coarse grid: accent colors */
    linear-gradient(rgba(124, 115, 255, 0.13) 1px, transparent 1px),   /* electric-violet H */
    linear-gradient(90deg, rgba(106, 92, 255, 0.10) 1px, transparent 1px); /* iris V */
  background-size: 24px 24px, 24px 24px, 96px 96px, 96px 96px;
  background-attachment: fixed;
  color: var(--color-text);
}

/* In theme.css — app-shell rule */
.app-shell {
  min-height: 100vh;
  background: transparent;
}
```

### Verification
1. Hard-refresh any page — grid lines appear behind all content
2. Navigate to `/login` — grid present on public pages too
3. Toggle dark mode — lines shift automatically (no override needed)
4. Scroll a long page — grid stays fixed

---

## Feature 2 — Mesh Gradient Effect

### Design Intent

An animated, multi-layer linear gradient that produces a soft, shifting color wash. Three animatable CSS angle properties drive five overlapping gradient layers, causing colors to morph smoothly over 8–10 seconds. The effect is implemented as a `::before` pseudo-element so it can be layered behind any container without affecting layout. Currently applied to `.app-header__brand::before` (header logo area) and `.auth-card::before` (login/register card). Uses glow-lavender, iris, and neon-indigo from the accent group.

### Implementation Prompt

```
To apply the CodeBloggs mesh gradient animation to a new element, add the following to `client/src/styles/theme.css`:

1. Register three animatable angle custom properties using `@property` (if not already present):
   - `--mesh-a1`: initial 30deg
   - `--mesh-a2`: initial 150deg
   - `--mesh-a3`: initial 270deg

2. Define `@keyframes mesh-morph` (if not already present) that cycles all three angles through a full rotation over three keyframe stops (0%, 33%, 66%, 100%), returning to the initial values at 100%.

3. On the target selector (use `::before` to avoid layout impact), set:
   - `content: ''`
   - `position: absolute` with `inset` sized to bleed beyond the container edges
   - `z-index: -1`
   - A 5-layer background using the three mesh angle variables:
     - Layer 1: `linear-gradient(--mesh-a1, glow-lavender 0%, transparent 58%)`
     - Layer 2: `linear-gradient(--mesh-a2, iris 0%, transparent 58%)`
     - Layer 3: `linear-gradient(--mesh-a3, neon-indigo 0%, transparent 55%)`
     - Layer 4: `linear-gradient(--mesh-a1 + 75deg, glow-lavender 0%, transparent 62%)`
     - Layer 5: `linear-gradient(--mesh-a2 + 75deg, neon-indigo 0%, transparent 62%)`
   - `filter: blur(18px)` to soften edges
   - `animation: mesh-morph 8s ease-in-out infinite`
   - `will-change: filter`

4. The parent element must have `position: relative` and `overflow: hidden` (optional, clips the bleed).

Wrap all animations in `@media (prefers-reduced-motion: reduce) { animation: none }` for accessibility.
```

### CSS Recipe

```css
/* @property registrations — place near top of theme.css */
@property --mesh-a1 { syntax: '<angle>'; initial-value:  30deg; inherits: false; }
@property --mesh-a2 { syntax: '<angle>'; initial-value: 150deg; inherits: false; }
@property --mesh-a3 { syntax: '<angle>'; initial-value: 270deg; inherits: false; }

/* Keyframes */
@keyframes mesh-morph {
  0%   { --mesh-a1:  30deg; --mesh-a2: 150deg; --mesh-a3: 270deg; }
  33%  { --mesh-a1: 120deg; --mesh-a2: 240deg; --mesh-a3:   0deg; }
  66%  { --mesh-a1: 210deg; --mesh-a2: 330deg; --mesh-a3:  90deg; }
  100% { --mesh-a1:  30deg; --mesh-a2: 150deg; --mesh-a3: 270deg; }
}

/* Apply to any target — swap selector as needed */
.your-element {
  position: relative;
}

.your-element::before {
  content: '';
  position: absolute;
  inset: -36px -48px;   /* bleed beyond container edges */
  border-radius: 16px;
  z-index: -1;
  background:
    linear-gradient(var(--mesh-a1), rgba(192, 188, 255, 0.95) 0%, transparent 58%),  /* glow-lavender */
    linear-gradient(var(--mesh-a2), rgba(106,  92, 255, 0.88) 0%, transparent 58%),  /* iris */
    linear-gradient(var(--mesh-a3), rgba( 91,  77, 255, 0.84) 0%, transparent 55%),  /* neon-indigo */
    linear-gradient(calc(var(--mesh-a1) + 75deg), rgba(192, 188, 255, 0.70) 0%, transparent 62%),
    linear-gradient(calc(var(--mesh-a2) + 75deg), rgba( 91,  77, 255, 0.65) 0%, transparent 62%);
  filter: blur(18px);
  animation: mesh-morph 8s ease-in-out infinite;
  will-change: filter;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .your-element::before { animation: none; }
}
```

### Verification
1. Add the `.your-element` class to any container in a page component
2. The element should show a softly shifting purple/violet color wash behind its content
3. Toggle `prefers-reduced-motion` in DevTools — animation should stop

---

## Feature 3 — Canvas Bulge Grid Effect (Current Grid Implementation)

### Design Intent

Replaces the static CSS grid (Feature 1) with an interactive canvas that physically displaces grid lines around the cursor, creating the illusion of the background surface doming upward. Each line point within the influence radius is pushed radially outward by a smooth quadratic falloff — zero at the radius boundary so displaced segments reconnect seamlessly to their straight counterparts. Line color transitions from the cursor outward using theme-specific palettes, so the effect reads differently in light vs. dark mode. The canvas draws only the grid — body retains its flat `background-color` beneath.

### Color Palettes

| Mode | Region | Fine lines | Coarse lines |
|---|---|---|---|
| Light | Cursor center | delft-blue `#403E6B` | delft-blue `#403E6B` |
| Light | Zone edge → far | tropical-indigo `#8D88EA` | neon-indigo `#5B4DFF` |
| Dark | Cursor center | periwinkle `#B1ADFF` | bright-periwinkle `#9993FF` |
| Dark | Mid zone | tropical-indigo `#8D88EA` | iris `#6A5CFF` |
| Dark | Zone edge → far | neon-indigo `#5B4DFF` | neon-indigo `#5B4DFF` |

Light mode uses `t²` easing (color shift is subtle far out, dramatic near center). Dark mode uses a 3-stop piecewise interpolation split at `t = 0.5` to include the iris/tropical-indigo midpoint.

### Implementation Prompt

```
Create `client/src/components/BulgeGrid.jsx` — a React component that renders a full-viewport
canvas (position: fixed, inset: 0, z-index: 0, pointer-events: none) and redraws a two-scale
grid on every mousemove using requestAnimationFrame with a dirty flag.

Grid constants:
  CELL = 24       (fine grid cell px)
  COARSE = 96     (coarse grid cell px)
  RADIUS = 300    (bulge influence radius px)
  AMPLITUDE = 50  (max radial displacement px)

For each grid line, split into three segments:
  1. Straight portion before the bulge zone  → single lineTo, far color
  2. Curved portion inside the zone          → iterate at 2 px steps, per-segment color
  3. Straight portion after the zone         → single lineTo, far color

Displacement per point (x, y) at distance d from cursor (mx, my):
  t   = max(0, 1 - d / RADIUS)
  mag = AMPLITUDE * t²
  displaced = (x + (dx/d) * mag,  y + (dy/d) * mag)   // push radially outward

Because displacement = 0 when t = 0 (zone boundary), displaced endpoints match the straight
segments exactly — no kink.

Per-segment color — read data-theme="dark" from <html> to choose palette:

  Light mode (t² easing):
    fine   t=0: rgba(141,136,234,0.09)  →  t=1: rgba(64,62,107,0.55)   [tropical-indigo → delft-blue]
    coarse t=0: rgba(91,77,255,0.13)    →  t=1: rgba(64,62,107,0.65)   [neon-indigo → delft-blue]

  Dark mode (piecewise, split at t=0.5):
    fine   t=0→0.5: neon-indigo → tropical-indigo
           t=0.5→1: tropical-indigo → periwinkle (177,173,255)
    coarse t=0→0.5: neon-indigo → iris (106,92,255)
           t=0.5→1: iris → bright-periwinkle (153,147,255)

Far colors (outside zone):
  Light fine:   rgba(141,136,234,0.09)   tropical-indigo
  Light coarse: rgba(91,77,255,0.13)     neon-indigo
  Dark fine:    rgba(91,77,255,0.09)     neon-indigo
  Dark coarse:  rgba(91,77,255,0.13)     neon-indigo

Mount in App.jsx before <Outlet /> so every route sees the effect.
Add position: relative; z-index: 1 to .app-shell in theme.css so content
stacks above the canvas (z-index: 0).
Watch data-theme mutations with MutationObserver to redraw on theme toggle.
Hide canvas with @media (prefers-reduced-motion: reduce) { canvas[aria-hidden="true"] { display: none } }.
```

### Key Files

| File | Role |
|---|---|
| `client/src/components/BulgeGrid.jsx` | Canvas component — grid drawing + displacement + color logic |
| `client/src/App.jsx` | Mounts `<BulgeGrid />` before `<Outlet />` |
| `client/src/styles/theme.css` | `body` keeps only `background-color`; `.app-shell` gets `position: relative; z-index: 1` |

### Verification

1. Move the mouse — grid lines bow outward from cursor in a dome shape
2. Lines within the zone shift color toward delft-blue (light) or periwinkle (dark)
3. Toggle dark mode — palettes switch immediately via MutationObserver redraw
4. Resize the window — canvas resizes and redraws cleanly
5. Navigate between routes — effect persists on every page
6. Enable `prefers-reduced-motion` in DevTools — canvas hidden
