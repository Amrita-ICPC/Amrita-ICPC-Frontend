---
trigger: always_on
---

# Coding Agent Instructions

## UI Theme Tokens

Use semantic theme variables for all UI colors. Do not hard-code palette colors in components unless there is a narrow external-branding requirement.

- Page surfaces: use `bg-background text-foreground`.
- Cards and framed panels: use `bg-card text-card-foreground`.
- Popovers, dropdowns, menus, sheets, and dialogs: use `bg-popover text-popover-foreground` unless the component primitive already applies it.
- Primary actions: use `bg-primary text-primary-foreground`; use `text-primary` only on neutral/light surfaces where contrast is checked.
- Secondary actions: use `bg-secondary text-secondary-foreground`.
- Muted supporting UI: use `bg-muted text-muted-foreground`; do not put `muted-foreground` on dark or colored surfaces unless contrast is verified.
- Accent affordances: use `bg-accent text-accent-foreground`.
- Status UI: pair `bg-destructive text-destructive-foreground`, `bg-success text-success-foreground`, `bg-warning text-warning-foreground`, and `bg-info text-info-foreground`.
- Borders, inputs, and focus rings: use `border-border`, `border-input`, and `ring-ring`/`focus-visible:ring-ring`.
- Sidebar UI must use only `sidebar-*` tokens: `bg-sidebar`, `text-sidebar-foreground`, `border-sidebar-border`, `bg-sidebar-accent`, `text-sidebar-accent-foreground`, `ring-sidebar-ring`. Do not use `primary-foreground`, `card`, or hard-coded white/black for sidebar text.
- If a hover state changes only the background, keep the hover text color equal to the normal text color. Only change hover text color when the new background/text pair is explicitly token-paired and readable.
- For selected/active states, use a complete semantic pair such as `bg-sidebar-accent text-sidebar-foreground` or `bg-primary text-primary-foreground`.
- When adding a theme, define every token in `src/app/globals.css`, register it in `src/lib/providers/provider.tsx`, expose it in `src/components/global/theme-switcher.tsx`, and include it in chart theme selectors in `src/components/ui/chart.tsx`.
