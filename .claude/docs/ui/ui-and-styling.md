## UI components and styling — shadcn + Tailwind are mandatory

This is the highest-priority UI rule in the repo: **every UI surface uses shadcn/ui
primitives and Tailwind CSS.** Do not hand-roll HTML/CSS for something shadcn already
provides, and do not introduce another styling approach (CSS modules, styled-components,
inline `style={{}}`, plain CSS files, etc.).

### shadcn/ui

- Always reach for a shadcn primitive first — `Button`, `Card`, `Input`, `Select`,
  `Dialog`, `Sheet`, `Badge`, `Skeleton`, `Tabs`, `Tooltip`, `Accordion`, etc. — from
  `src/components/ui/*` before writing custom markup.
- Never hand-edit a file inside `src/components/ui/*`. Add new primitives with
  `pnpm ui add <component>`; customize existing ones via Tailwind `className` or by
  composing/wrapping — or by extending the base component's variants if the same
  style recurs across the app (e.g. adding a variant to `button.tsx`).
- Do not build a custom modal/dropdown/tooltip/etc. when `Dialog`/`Sheet`/`Popover`/
  `DropdownMenu`/`Tooltip` already exist.

### Tailwind CSS — semantic tokens only

- Use semantic design tokens, never raw color values:

  | Use | Token | Not |
  |---|---|---|
  | Page/section background | `bg-background` | `bg-white` |
  | Card surface | `bg-card` | `bg-white` / `bg-gray-50` |
  | Body text | `text-foreground` | `text-black` |
  | Secondary text/labels | `text-muted-foreground` | `text-gray-500` |
  | Dividers/input borders | `border-border` / `border-input` | `border-gray-200` |
  | Primary action | `bg-primary` / `text-primary-foreground` | brand hex values |
  | Destructive action/error | `bg-destructive` / `text-destructive-foreground` | `bg-red-500` |
  | Focus ring | `ring-ring` | custom outline colors |

- Never hardcode hex values or Tailwind's raw grey/blue/etc. color scales in a
  `className`. Never use inline `style={{ color: ... }}` for something Tailwind can
  express.
- Spacing follows the Tailwind 4px grid (`gap-1`/`p-1` = 4px, up through `gap-12`/`p-12`
  = 48px). Avoid arbitrary values (`gap-[13px]`, `p-[18px]`) unless there's a hard
  pixel-perfect constraint — if you reach for arbitrary values often, that's a sign to
  add the value to the design system instead.
- Typography: `text-2xl font-bold`/`text-3xl font-bold` for page titles,
  `text-xl font-semibold` for section headings, `text-lg font-medium` for subsections,
  `text-base` for body copy, `text-sm text-muted-foreground` for labels/descriptions,
  `text-xs text-muted-foreground` for captions/timestamps. Don't override `leading-*`
  without a specific reason.
- Mobile-first responsive design: base styles target small screens, then layer
  `sm:`/`md:`/`lg:`. Test at ~375px, ~768px, and ~1280px.
- Use `<Separator />` (`@/components/ui/separator`) for in-content dividers, or
  `border-t border-border` for a simple section border. Don't use raw `<hr />`.
- Use `cn()` from `src/lib/utils.ts` for conditional class composition.

### Cards, badges, dialogs

- Group related content in `Card` (`CardHeader`/`CardTitle`/`CardDescription`,
  `CardContent`, `CardFooter`). Don't nest a `Card` inside a `Card` more than one level.
- `Badge` `variant` only accepts `default | secondary | destructive | outline`
  (`src/components/ui/badge.tsx`). Map a status to one of these explicitly — never
  invent a variant name and never cast to `any` to bypass the type.
- Use `Dialog` for confirmations/short forms, `Sheet` for slide-in panels or longer
  forms. Always include `DialogHeader`/`DialogTitle` for accessibility.

### Images and icons

- `<Image>` from `next/image` for every image — never a raw `<img>`. Always pass
  explicit `width`/`height` to prevent layout shift.
- Icons from `lucide-react` (size `16` inline with text, size `20` for UI actions) or
  `react-icons` when a shape isn't in Lucide. Import icons directly — never paste raw
  inline SVGs. Icon-only buttons need an `aria-label`.

### Accessibility

- All interactive elements must be keyboard-accessible. Use Radix-based shadcn
  primitives for dialogs/dropdowns/menus — they already wire up ARIA roles and
  keyboard nav.
- Every form input needs an associated `<FormLabel>`.
- Never put `onClick` on a non-interactive element (`div`, `span`) — use a `button` or
  a `role="button"` element with keyboard support.
