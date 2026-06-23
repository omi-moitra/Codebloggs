# 🤖 AI_FEATURE_Responsive-Design

---

## Feature Identity

- **Feature Name:** Responsive Design (Responsive Navbar)
- **Related Area:** Frontend

---

## Feature Goal

Adapt the CodeBloggs navigation so the site is usable on desktop, tablet, and mobile viewports. On desktop the existing vertical sidebar layout is preserved. Below the desktop breakpoint the sidebar collapses and a hamburger toggle appears in the top header — clicking it reveals the navigation links in a vertical dropdown. Three distinct views must be implemented and justified: desktop, tablet, and mobile. Breakpoint justifications must be documented in both this spec and in `README.md`.

---

## Feature Scope

### In Scope (Included)

- Responsive behaviour for the existing sidebar navigation component (the component that renders Home, Blogs, Network, and Admin links)
- Hamburger toggle button — visible only on tablet and mobile; hidden on desktop
- Collapsible nav — the sidebar links collapse into a toggled vertical menu on smaller viewports
- Three viewport breakpoints — desktop (≥ 992px), tablet (768px–991px), and mobile (< 768px)
- CSS media queries — written inside the existing navigation component's CSS file; no new global stylesheet changes beyond what is necessary
- Breakpoint justification — a short explanation of why each breakpoint was chosen, written here and copied to `README.md`

### Out of Scope (Excluded)

- Redesigning the top header bar (logo + action buttons) — only the sidebar navigation links are made responsive
- Making the admin table panels (User Manager, Content Manager) responsive — that is out of the approved M10 scope
- Rebuilding the navigation with a different UI library — reuse React Bootstrap `<Navbar>` patterns on the existing component
- Redux changes — navigation state (active route) is already handled by React Router; no Redux needed
- All backend changes

---

## Sub-Requirements (Feature Breakdown)

- **Desktop layout (≥ 992px)** — existing sidebar renders as a vertical column on the left side of the page; hamburger toggle is hidden (`d-lg-none` on the toggle); no layout change from current M9 behaviour
- **Hamburger toggle button** — rendered using `<Navbar.Toggle>` from React Bootstrap; visible only below the `lg` breakpoint (`d-lg-none`); positioned in the top header bar; uses Bootstrap's default burger icon
- **Collapsible nav links** — the sidebar navigation links (Home, Blogs, Network, Admin) are wrapped in `<Navbar.Collapse>`; on desktop they are always visible; on tablet and mobile they are hidden until the toggle is clicked
- **Tablet layout (768px–991px)** — sidebar is hidden; hamburger toggle appears in the top header; clicking it reveals the nav links as a vertical dropdown below the header; links are still readable and tap-target sized (minimum 44px height per link)
- **Mobile layout (< 768px)** — same hamburger pattern as tablet; nav links stack vertically in the dropdown; font and tap targets sized for touch use
- **Active link highlight** — the active route link remains visually highlighted at all breakpoints using React Router's `<NavLink>` active class; in the collapsed dropdown add a `border-left: 3px solid` rule on `.nav-link.active` — the sidebar's bracket-style indicator does not translate to a vertical dropdown
- **Page layout grid** — wrap the app layout in `<Container fluid><Row>`; sidebar in `<Col lg={2} className="d-none d-lg-block">`; page content in `<Col lg={10} xs={12}>`; Bootstrap hides the sidebar column and expands content to full width automatically below `lg`
- **Header visibility at breakpoints** — `[Post]` button: `d-none d-lg-inline-block`; `[Crescent]` icon: `d-none d-md-inline-block`; username text inside user button: `d-none d-lg-inline`; user avatar icon always visible; hamburger: `d-lg-none`
- **Close-on-navigate** — the collapsed menu closes automatically when the user clicks a nav link and navigates to a new route; no manual re-click of the hamburger needed
- **Media queries** — CSS breakpoints written in the navigation component's existing CSS file; follow the existing CodeBloggs CSS comment TOC format per ai-spec Code Quality Requirements
- **README.md update** — add a "Responsive Design" section documenting the three views, the breakpoints chosen, and the justification for each; cross-reference `Research.md`

---

## Breakpoints and Justifications

| Breakpoint | Range | Behaviour | Justification |
|---|---|---|---|
| Desktop | ≥ 992px | Full vertical sidebar visible; no hamburger | Bootstrap's `lg` breakpoint (992px) aligns with the minimum width at which the sidebar and content panel can comfortably share horizontal space without overlap |
| Tablet | 768px–991px | Sidebar hidden; hamburger toggle in header; dropdown nav | Bootstrap's `md` breakpoint (768px) corresponds to common tablet widths (iPad portrait: 768px); the sidebar would crowd the content panel below 992px |
| Mobile | < 768px | Sidebar hidden; hamburger toggle; full-width vertical dropdown | Below 768px the viewport matches typical phone sizes (iPhone SE: 375px, iPhone 14: 390px); a full-width collapsible nav is the standard touch-friendly pattern at this width |

*Copy this table into `README.md` under a "Responsive Design — Breakpoints" section.*

---

## User Flow / Logic (High Level)

**Desktop (≥ 992px)**

1. User loads any page — the vertical sidebar renders on the left with all nav links visible
2. No change from current M9 behaviour

**Tablet / Mobile (< 992px)**

3. User loads any page on a narrower viewport — the sidebar is hidden; a hamburger (☰) button appears in the top header
4. User clicks the hamburger — the nav links drop down in a vertical list below the header
5. User clicks a nav link — navigates to the route; the dropdown closes automatically
6. User clicks the hamburger again (or clicks outside, if implemented) — the dropdown closes

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend

- Existing navigation/sidebar component (file name depends on M9 implementation — likely something like `Sidebar.jsx`, `NavBar.jsx`, or `SideNav.jsx`; locate it before editing)
- Existing CSS file for that navigation component — add media queries here
- `README.md` — add the breakpoint justification section

### Backend / API

No backend endpoints — purely CSS and component layout changes.

---

## UI Layout

### Screen 1 — Desktop (≥ 992px) — unchanged sidebar

```
+---------------------------------------------------------------------------------------------------------+
| [CodeBloggs]                                                               [Post] [Crescent] [Anakin V] |
+---------------------------------------------------------------------------------------------------------+
|          |                                                                                              |
|  Home    |  (page content)                                                                             |
|          |                                                                                              |
|  Blogs   |                                                                                              |
|          |                                                                                              |
|  Network |                                                                                              |
|          |                                                                                              |
|  Admin   |                                                                                              |
|          |                                                                                              |
+----------+----------------------------------------------------------------------------------------------+
```

- Sidebar is a fixed-width left column
- All nav links always visible; no hamburger button

### Screen 2 — Tablet (768px–991px) — sidebar collapsed, hamburger visible

```
+------------------------------------------------------------+
| [CodeBloggs]                              [☰]  [Crescent] |
+------------------------------------------------------------+
|                                                            |
|  (page content — full width)                               |
|                                                            |
+------------------------------------------------------------+
```

- Sidebar column hidden via `d-none d-lg-block`; content col expands to full width automatically via the Bootstrap grid
- Hamburger `[☰]` appears in the top header via `<Navbar.Toggle>`
- `[Post]` button hidden (`d-none d-lg-inline-block`); `[Crescent]` icon still visible; username text hidden (`d-none d-lg-inline`); user avatar icon remains
- Clicking `[☰]` opens Screen 3

### Screen 3 — Tablet/Mobile — nav dropdown open

```
+------------------------------------------------------------+
| [CodeBloggs]                              [✕]  [Crescent] |
+------------------------------------------------------------+
| Home                                                       |
+------------------------------------------------------------+
| Blogs                                                      |
+------------------------------------------------------------+
| Network                                                    |
+------------------------------------------------------------+
| Admin                                                      |
+------------------------------------------------------------+
|                                                            |
|  (page content — partially obscured by open nav)           |
|                                                            |
+------------------------------------------------------------+
```

- `[✕]` replaces `[☰]` while the nav is open (Bootstrap's `<Navbar.Toggle>` handles this automatically)
- Dropdown is **push-down** (Bootstrap default) — nav links appear in normal document flow directly below the header; no `position: absolute` or overlay CSS needed
- Dropdown background matches the `<Navbar>` `bg` and `variant` props; set these to match the existing M9 sidebar background (`variant="dark"` for a dark-themed sidebar, `variant="light"` for a light one)
- Active nav link: add `.nav-link.active { border-left: 3px solid currentColor; background-color: rgba(255,255,255,0.1); }` to the nav CSS file — the desktop bracket-style active indicator does not carry over to the dropdown
- Each nav item is a full-width tap target (minimum 44px height via `padding: 0.75rem 1rem` on `.nav-link`)
- Clicking any nav item navigates and collapses the menu

### Screen 4 — Mobile (< 768px) — same hamburger pattern, narrower viewport

```
+----------------------------------+
| [CodeBloggs]         [☰] [Contributor1] |
+----------------------------------+
|                                  |
|  (page content — full width)     |
|                                  |
+----------------------------------+
```

- Same hamburger pattern as Screen 2/3 but at phone width (375px–767px)
- `[Crescent]` icon hidden below `md` (`d-none d-md-inline-block`); only the user avatar icon and hamburger remain in the header at this width

### Header Content at Breakpoints

| Header Element | Desktop ≥992px | Tablet 768–991px | Mobile <768px | Bootstrap Class |
|---|---|---|---|---|
| `[Post]` button | Visible | Hidden | Hidden | `d-none d-lg-inline-block` |
| `[Crescent]` icon | Visible | Visible | Hidden | `d-none d-md-inline-block` |
| User avatar icon | Visible | Visible | Visible | (always visible) |
| Username text | Visible | Hidden | Hidden | `d-none d-lg-inline` |
| Hamburger `[☰]` | Hidden | Visible | Visible | `d-lg-none` |

### Bootstrap Component Map

| UI Element | Bootstrap Component / Props |
|---|---|
| Navbar wrapper | `<Navbar expand="lg">` — `expand="lg"` means hamburger shows below 992px, full nav at 992px+ |
| Hamburger toggle | `<Navbar.Toggle aria-controls="codebloggs-nav" className="d-lg-none" />` |
| Collapsible container | `<Navbar.Collapse id="codebloggs-nav">` |
| Nav link list | `<Nav className="flex-column">` on desktop; collapses to vertical dropdown on mobile |
| Individual nav link | `<Nav.Link as={NavLink} to="/home">Home</Nav.Link>` — React Router `NavLink` adds active class automatically |
| Desktop sidebar hide/show | `className="d-none d-lg-block"` on sidebar wrapper hides it below `lg`; `d-lg-none` on toggle shows hamburger below `lg` |
| Page layout grid | `<Container fluid><Row><Col lg={2} className="d-none d-lg-block">` (sidebar) + `<Col lg={10} xs={12}>` (content) — content expands to full width automatically when sidebar col is hidden |
| Active link in dropdown | `.nav-link.active { border-left: 3px solid currentColor; background-color: rgba(255,255,255,0.1); }` — add to the nav component's CSS file |
| `[Post]` button visibility | `className="d-none d-lg-inline-block"` |
| `[Crescent]` icon visibility | `className="d-none d-md-inline-block"` |
| Username text visibility | `className="d-none d-lg-inline"` — wraps only the text node inside the user button, not the avatar icon |

---

## Data Used or Modified

- No data used or modified — this feature is purely presentational
- React Router `location` is read implicitly by `<NavLink>` to apply the active class; no additional state required

---

## Tech Constraints (Feature-Level)

- Use React Bootstrap's `<Navbar expand="lg">` — do not rewrite the navigation in plain HTML or introduce a new nav library
- The `expand="lg"` prop handles the breakpoint logic for the hamburger toggle; do not use a custom `useState` to track open/closed — Bootstrap's `<Navbar.Toggle>` and `<Navbar.Collapse>` manage this automatically
- Use Bootstrap utility classes (`d-none`, `d-lg-block`, `d-lg-none`) for show/hide at breakpoints instead of writing custom hide/show CSS where possible — keeps the implementation minimal
- Page layout must use `<Col lg={2} className="d-none d-lg-block">` for the sidebar and `<Col lg={10} xs={12}>` for content — do not use `position: fixed`, `width: 250px`, or any fixed sidebar approach that prevents the content column from expanding at smaller viewports
- Dropdown background and `variant` prop must match the existing M9 sidebar theme — check the existing sidebar's background color before choosing `variant="dark"` or `variant="light"` on `<Navbar>`
- Media queries in CSS must follow the existing CodeBloggs file comment format (TOC at top, section comments) per ai-spec Code Quality Requirements
- Do not change the color palette, font, or icon choices — responsive layout adjustments only
- All three breakpoints (desktop ≥ 992px, tablet 768–991px, mobile < 768px) must be tested in Chrome DevTools before the feature is considered done
- ESM6 syntax throughout — no CommonJS
- Every generated or modified file must open with a comments-based TOC per the ai-spec Code Quality Requirements

---

## Acceptance Criteria

- [ ] At ≥ 992px (desktop), the sidebar is visible and no hamburger button appears — existing M9 layout is unchanged
- [ ] At 768px–991px (tablet), the sidebar is hidden and a hamburger `[☰]` button is visible in the top header
- [ ] At < 768px (mobile), the sidebar is hidden and the hamburger `[☰]` is visible
- [ ] Clicking the hamburger reveals the nav links (Home, Blogs, Network, Admin) as a vertical dropdown
- [ ] Clicking a nav link navigates to the correct route and closes the dropdown
- [ ] The active route nav link is visually highlighted at all breakpoints
- [ ] The top header (logo + action buttons) remains visible and functional at all three breakpoints
- [ ] Page content expands to full width when the sidebar is hidden
- [ ] Each nav link in the dropdown has a minimum tap-target height of 44px
- [ ] All three breakpoints verified in Chrome DevTools (desktop, tablet 768px, mobile 375px)
- [ ] `README.md` includes a "Responsive Design" section with the three breakpoints and their justifications
- [ ] All existing Module 9 functionality is unaffected at all breakpoints
- [ ] All modified files include a comments-based TOC and inline why-comments per ai-spec

---

## Notes for the AI

- **This spec is frontend-only. Do not generate backend code.**
- Before editing, locate the existing navigation/sidebar component in the M9 codebase. It is likely named `Sidebar.jsx`, `NavBar.jsx`, `SideNav.jsx`, or similar — check `client/src/components/` before assuming a file name. Do not create a new navigation component if one already exists; modify the existing one.
- If the existing navigation component is not already using `<Navbar>` from React Bootstrap, refactor it to use `<Navbar expand="lg">` so the hamburger collapse behaviour is handled by Bootstrap rather than custom JavaScript.
- The `expand="lg"` prop on `<Navbar>` is the single most important prop for this feature — it controls when the hamburger appears vs. when the full nav is shown. Do not hardcode breakpoints in JavaScript; let Bootstrap handle it.
- "Close-on-navigate" behaviour: wrap the nav links so that clicking a `<NavLink>` calls the Bootstrap toggle close. One approach is to read the `useNavigate` or leverage `<NavLink>` clicks — check React Bootstrap docs for the `onSelect` callback on `<Nav>` to close `<Navbar.Collapse>` on link click.
- Breakpoint justification is required in `README.md` — when updating README.md, add a "Responsive Design — Breakpoints" section. Copy the breakpoints table from this spec.
- Do not restyle or move the top header bar — only the sidebar/nav links become responsive.
- Test using Chrome DevTools device emulation: set width to 1200px (desktop), 768px (tablet), and 375px (mobile) and verify all three views before marking the feature complete.
