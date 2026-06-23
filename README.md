# FullStack_CodeBloggsM10
Codeboxx Module 10 clone

## Responsive Design

CodeBloggs is fully responsive across three viewport sizes. Below the desktop breakpoint the sidebar collapses and a hamburger toggle in the top header reveals the navigation links as a vertical dropdown.

### Breakpoints

| Breakpoint | Range | Behaviour | Justification |
|---|---|---|---|
| Desktop | ≥ 992px | Full vertical sidebar visible; no hamburger | Bootstrap's `lg` breakpoint (992px) is the minimum width at which the sidebar and content panel share horizontal space comfortably without crowding |
| Tablet | 768px–991px | Sidebar hidden; hamburger toggle in header; collapsible dropdown nav | Bootstrap's `md` breakpoint (768px) corresponds to common tablet widths (iPad portrait: 768px); the sidebar would crowd the content panel below 992px |
| Mobile | < 768px | Sidebar hidden; hamburger toggle; full-width vertical dropdown | Below 768px matches typical phone sizes (iPhone SE: 375px, iPhone 14: 390px); a full-width collapsible nav is the standard touch-friendly pattern at this width |

*See `Research.md` for further context on the breakpoint decisions.*
