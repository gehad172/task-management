# Design System Document: The Editorial Kanban

## 1. Overview & Creative North Star
**Creative North Star: "The Disciplined Curator"**

This design system transcends the "utility-first" clutter of traditional productivity tools. Instead of a rigid grid of boxes, we treat task management as a high-end editorial experience. We achieve a "Modern Kanban" aesthetic by leaning into **Atmospheric Depth** and **Intentional Asymmetry**. 

The goal is to make the user feel like they are organizing a premium gallery rather than managing a spreadsheet. We move beyond the "template" look by utilizing breathing room (negative space) as a structural element and replacing harsh borders with tonal shifts.

## 2. Colors: Tonal Architecture
Our palette is rooted in a sophisticated Indigo core, supported by a "Soft White" architectural base.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off your layout. In this system, boundaries are defined exclusively through background color shifts.
*   **The Canvas:** Use `surface` (#fcf8fe) for the main application background.
*   **The Columns:** Use `surface-container-low` (#f6f2fa) for Kanban columns. The slight shift from the canvas creates a "carved out" look without a single line.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper.
*   **Base Layer:** `surface` (Main background)
*   **Secondary Layer:** `surface-container` (Sidebar or navigation)
*   **Interactive Layer:** `surface-container-lowest` (#ffffff) - Reserved specifically for **Cards**. This creates a natural "pop" against the lower-tier column backgrounds.

### Glass & Signature Textures
*   **Floating Elements:** For Modals or Popovers, use a semi-transparent `surface-container-lowest` with a `backdrop-blur-xl`.
*   **The "Indigo Soul":** For primary CTAs, do not use a flat color. Apply a subtle linear gradient from `primary` (#4e45e4) to `primary-container` (#6760fd) at a 135-degree angle. This adds a "lithographic" depth that feels premium.

## 3. Typography: Editorial Authority
We pair the geometric precision of **Manrope** for high-level structure with the functional clarity of **Inter** for utility.

*   **Display & Headlines (Manrope):** Use `display-md` and `headline-sm` for project titles and board names. These should feel authoritative and "set" in stone.
*   **The Body (Inter):** Use `body-md` for task descriptions. The high x-height of Inter ensures readability at small scales.
*   **Micro-Copy (Inter):** `label-sm` is reserved for metadata (dates, tags). Use `on-surface-variant` (#5f5e68) to ensure these don't compete with task titles.

**Hierarchy Note:** Always maintain at least a 2-step jump in the type scale between a Task Title (`title-sm`) and its Description (`body-sm`) to create a clear visual entry point.

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are a fallback; tonal layering is the standard.

*   **The Layering Principle:** To lift a task card, place a `surface-container-lowest` card on a `surface-container-low` column. The contrast in "purity" (white vs. tinted off-white) creates light.
*   **Ambient Shadows:** If a card is being dragged, apply an extra-diffused shadow: `shadow-[0_20px_50px_rgba(78,69,228,0.08)]`. Note the 8% opacity and the use of the `primary` tint in the shadow—this prevents the UI from looking "dirty" with grey shadows.
*   **The "Ghost Border":** If accessibility requires a stroke (e.g., in high-contrast modes), use `outline-variant` (#b3b0bc) at **15% opacity**. It should be felt, not seen.

## 5. Components: Refined Primitives

### Kanban Cards
*   **Container:** `surface-container-lowest` (#ffffff) with `rounded-xl`.
*   **Constraint:** No dividers. Use `8px` of vertical space between the task title and the tag list.
*   **Hover State:** Transition to `surface-bright` with a subtle `primary` tint in the ambient shadow.

### Buttons (The "Jewel" Approach)
*   **Primary:** Gradient of `primary` to `primary-container`. `rounded-lg`. White text (`on-primary`).
*   **Tertiary (Ghost):** No background or border. Use `primary` text. On hover, use a 5% opacity `primary` background.

### Chips & Tags
*   **Visual Style:** Use `secondary-container` (#e3e0f9) backgrounds with `on-secondary-container` (#515064) text. 
*   **Shape:** `rounded-full` (pill shape) to contrast against the `rounded-xl` of the cards.

### Input Fields
*   **Default:** `surface-container-high` background. No border.
*   **Focus:** A "glow" effect using a 2px outer ring of `primary` at 20% opacity. Never use a 100% opaque focus ring.

### Additional Layout Components
*   **The "Workstream" Header:** A sticky top bar using a "Frosted" effect (Semi-transparent `surface` + `backdrop-blur`). This allows the Kanban cards to "ghost" through as they scroll under, reinforcing the layering concept.

## 6. Do's and Don'ts

### Do
*   **DO** use varying font weights (Medium vs Regular) instead of different colors to show hierarchy.
*   **DO** leave generous "logical" padding. A card should have at least `p-6` (1.5rem) to feel premium.
*   **DO** use the `tertiary` (#755478) color sparingly for "Contextual Information" like 'Assigned to me' or 'Due Soon' to break the Indigo monotony.

### Don't
*   **DON'T** use `border-gray-200` or any standard Tailwind border colors. Use background color steps.
*   **DON'T** use pure black (#000000) for text. Use `on-surface` (#32313b) to maintain the soft editorial feel.
*   **DON'T** crowd the columns. If a column has more than 5 cards, ensure the `surface-dim` scrollbar is styled to be nearly invisible until hovered.