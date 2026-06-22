# Research

## Table of Contents

1. [Reactive Design](#reactive-design)
2. [Responsive Design](#responsive-design)
3. [Differences Between the Two](#differences-between-the-two)
4. [Implementation in CodeBloggs](#implementation-in-codebloggs)
5. [Sources](#sources)

---

## Reactive vs. Responsive Design

### Reactive Design

Reactive design is the practice of making a user interface feel alive and responsive to ongoing processes — particularly while data is being fetched or computed in the background. Rather than showing a blank screen or a static spinner, a reactive UI communicates progress and activity to the user in a meaningful way. The most common expression of this is the skeleton loader: a placeholder layout that mirrors the shape of the content to come, so the user has a visual anchor while waiting. The key idea is that the UI always reacts to the current state of the system — loading, loaded, error — and transitions smoothly between those states so users are never left wondering whether the app is working.

### Responsive Design

Responsive design is the practice of building a UI that adapts its layout and presentation to fit any screen size — desktop, tablet, or mobile. Instead of designing one fixed layout that breaks on smaller viewports, a responsive design uses fluid grids, flexible components, and CSS media queries to reflow content gracefully as the available space changes. Navigation might collapse into a hamburger menu on mobile; multi-column layouts might stack into a single column on a phone. The goal is that the same codebase delivers an equally usable experience regardless of the device the user is holding.

### Differences Between the Two

Although the terms are sometimes confused, reactive and responsive design solve entirely different problems. Reactive design is about **time** — it manages how the UI behaves during asynchronous operations like data fetching, making wait states visible and informative rather than invisible and disorienting. Responsive design is about **space** — it manages how the UI behaves across different screen sizes, rearranging and resizing elements so nothing overflows or gets cut off.

Another way to frame it: responsive design is a layout problem solved at build time through CSS; reactive design is a state problem solved at runtime through component logic. A page can be perfectly responsive (it looks great on every device) but not reactive (it goes blank for two seconds while loading), and vice versa. A well-built application needs both: it should look right on any device and feel alive at every moment of the user journey.

### Implementation in CodeBloggs

**Reactive Design — Skeleton Loaders**

In CodeBloggs, reactive design is implemented through skeleton loaders on the Admin section's User Manager and Content Manager pages. When the admin first loads either page, the app dispatches a Redux Thunk action to fetch users or posts from the backend. During that fetch, instead of rendering an empty table, the UI renders a set of animated placeholder rows that match the shape of the real content. Once the data arrives and the Redux store updates, the skeleton rows are replaced by the actual user or post rows. This keeps the admin interface from feeling broken or unfinished during the brief window between page load and data arrival.

**Responsive Design — Responsive Navigation and Layouts**

Responsive design in CodeBloggs is implemented primarily through CSS media queries and React Bootstrap's grid system. The navigation bar is the most visible touchpoint: on a full desktop viewport it displays all links inline, while on tablet and mobile viewports it collapses into a compact menu that does not overflow the screen. Page layouts such as the blog feed, admin tables, and profile sections are built with Bootstrap's column system so they reflow naturally as the viewport narrows — multi-column arrangements stack vertically, and oversized elements scale down to fit. Three breakpoints are targeted: desktop (full width), tablet (medium viewports), and mobile (small viewports), ensuring the site is usable on any device a visitor might bring.

---

## Sources

- Marcotte, E. (2010). *Responsive Web Design*. A List Apart. https://alistapart.com/article/responsive-web-design/
- MDN Web Docs. *Responsive design*. Mozilla. https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design
- MDN Web Docs. *Using media queries*. Mozilla. https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries
- Wroblewski, L. (2013). *Mobile First*. A Book Apart. https://abookapart.com/products/mobile-first
- React Bootstrap. *Layout — Grid system*. https://react-bootstrap.github.io/docs/layout/grid
- UX Collective. *Everything you need to know about skeleton screens*. https://uxdesign.cc/what-you-should-know-about-skeleton-screens-a820c45a571a
