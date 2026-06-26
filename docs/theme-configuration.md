# Theme and Color Configuration Guide

This document describes the color variables architecture, the migration from hardcoded utility styles to semantic custom properties, and instructions on how to modify the application color system.

---

## 1. Architectural Comparison

### The Previous Approach (Scattered Hardcoding)

Previously, the codebase relied on hardcoded hex colors or custom arbitrary Tailwind utility values dispersed across components:

- Scattered hex colors such as `bg-[#6E1F2A]` or `text-[#003A70]` in markup files.
- No uniform support for dark-mode contrast shifts on brand colors.
- High maintenance cost when modifying the institutional branding, requiring extensive search-and-replace operations.

### The Current Approach (Centralized Semantic Tokens)

The current implementation centralizes all brand and status colors in a single stylesheet.

- **Single Source of Truth**: All colors are defined in `globals.css` as standard CSS custom properties.
- **Contextual Swapping**: Variables automatically update depending on whether the system or user selection resolves to light or dark mode.
- **Tailwind Integration**: Tailwind CSS v4 registers these variables via `@theme inline`, making them available as standard Tailwind utility classes (e.g., `text-competition`, `bg-maroon`).

---

## 2. Color System Architecture

### CSS Definitions

The colors are split between the light mode scope (`:root`) and the dark mode scope (`.dark`) in `src/app/globals.css`:

```css
:root {
    /* Brand Identity Colors */
    --maroon: #6e1f2a; /* Amrita Maroon */
    --blue: #003a70; /* ICPC Blue */
    --red: #d62828; /* ICPC Red */
    --gold: #f4b400; /* ICPC Gold */

    /* Semantic Application Tokens */
    --competition: #003a70; /* Theme primary color for platform context */
    --action: #d62828; /* Target color for buttons, actions, and focus rings */
    --highlight: #f4b400; /* Accents and highlight indicators */
    --divider: #eceef1; /* Border boundaries */
}

.dark {
    /* Muted brand identity variants optimized for dark background contrast */
    --maroon: #a84b5b;
    --blue: #4f8fd6;
    --red: #ff5a5f;
    --gold: #ffd54a;

    /* Semantic Application Tokens */
    --competition: #4f8fd6;
    --action: #ff5a5f;
    --highlight: #ffd54a;
    --divider: #2a2f36;
}
```

### Tailwind Registration

The CSS custom properties are exposed to the Tailwind compiler in the same stylesheet:

```css
@theme inline {
    --color-competition: var(--competition);
    --color-action: var(--action);
    --color-highlight: var(--highlight);
    --color-divider: var(--divider);

    --color-maroon: var(--maroon);
    --color-blue: var(--blue);
    --color-red: var(--red);
    --color-gold: var(--gold);
}
```

This mapping allows components to use standard Tailwind utility class prefixes combined with the color tokens:

- `bg-maroon`
- `text-competition`
- `border-divider`
- `ring-action`

---

## 3. How to Update or Swap Colors

To change any color across the entire application:

### Step 1: Open the Stylesheet

Navigate to the root global stylesheet at `src/app/globals.css`.

### Step 2: Update Hex Codes

Modify the hex values under both the `:root` (Light Mode) and `.dark` (Dark Mode) selectors.

For example, to swap the main brand color from Maroon to Crimson:

```css
/* src/app/globals.css */
:root {
    --maroon: #a91d22; /* New Light Mode Crimson */
}

.dark {
    --maroon: #e53e3e; /* New Dark Mode Crimson */
}
```

### Step 3: Verify the Changes

Because Tailwind resolves color configurations through custom property pointers dynamically:

- The compilation process does not need to rebuild utilities.
- The browser immediately updates all elements referencing the token (`text-maroon`, `bg-maroon`, etc.).
- Light-to-dark switching remains fully automated and handles the contrast adjustment.
