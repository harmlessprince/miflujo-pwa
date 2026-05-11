# Rule: MiFlujo Design System — Colors, Typography, and Component Tokens

Always use the design system tokens defined in `tailwind.config.ts` and `assets/css/main.css`.
Never use arbitrary hex values, `slate-*`, `gray-*`, or `rose-*` Tailwind classes — map everything to
MiFlujo tokens instead.

---

## Color Tokens

| Token | Hex | Tailwind class | When to use |
|---|---|---|---|
| Primary (MiFlujo Red) | `#ED2E23` | `bg-primary` / `text-primary` / `border-primary` | Primary CTAs, active nav, selected controls, upload/save/confirm buttons |
| Navy (Deep Navy) | `#02163B` | `bg-navy` / `text-navy` / `border-navy` | Body text, headings, dark surfaces, secondary borders |
| Grey (Light Grey) | `#CCCCCC` | `bg-grey` / `text-secondary` / `border-grey` | Borders, dividers, placeholder text, disabled states, hint text |
| Surface | `#FCFCFC` | `bg-surface` | App background, dropdown/input background fills |
| Error | `#DC2626` | `bg-error` / `text-error` / `border-error` | Validation errors, invalid field states |
| White | `#FFFFFF` | `bg-white` | Elevated surfaces, cards, drawer panels |

### Primary vs Error — critical rule

`bg-primary` is **only** for primary actions (buttons that submit, upload, confirm, process).
Error states must use `text-error` or `border-error` — **never** `bg-primary` on an error message.
This keeps destructive/error feedback visually distinct from positive CTAs.

### Replacing external palette classes

| Replace this | With this |
|---|---|
| `text-slate-700`, `text-gray-700` | `text-navy` |
| `text-slate-400`, `text-gray-400` | `text-secondary` |
| `border-slate-200`, `border-gray-200` | `border-grey` |
| `bg-slate-50`, `bg-gray-50` | `bg-surface` |
| `bg-slate-100`, `bg-gray-100` | `bg-grey/20` |
| `hover:bg-slate-50` | `hover:bg-surface` |
| `hover:bg-slate-100` | `hover:bg-grey/10` |
| `text-rose-500`, `text-red-500` | `text-error` |
| `border-rose-500`, `border-red-500` | `border-error` |
| `focus:ring-rose-500` | `focus:ring-error` |
| `bg-[#003366]`, `border-[#003366]` | `bg-primary` / `border-navy` |
| `text-[#1B1B19]` | `text-navy` |
| `border-[#E0E0E0]` | `border-grey` |
| `text-[#616161]`, `placeholder-[#616161]` | `text-secondary` / `placeholder:text-secondary` |

---

## Typography Scale

All typography uses **Azo-Sans** (loaded locally in `assets/css/fonts.css`, set as `font-sans` in Tailwind).
The named `text-*` utilities below are defined in `tailwind.config.ts` under `theme.extend.fontSize`.

| Scale | Tailwind class | Size | Weight class | Line height | Letter spacing | When to use |
|---|---|---|---|---|---|---|
| Display large | `text-display-lg` | 32px | `font-semibold` | 1.2 | −0.02em | Page titles, splash headings |
| Headline medium | `text-headline-md` | 20px | `font-semibold` | 1.3 | — | Section headings, card titles, modal headers |
| Title small | `text-title-sm` | 16px | `font-medium` | 1.4 | — | Sub-headings, button labels, form section titles |
| Body medium | `text-body-md` | 14px | `font-normal` | 1.5 | — | General body copy, input text, dropdown items, labels |
| Body small | `text-body-sm` | 12px | `font-normal` | 1.4 | — | Helper text, captions, secondary metadata |
| Data mono | `text-data-mono` | 14px | `font-medium` | 1.0 | — | Financial values — always pair with `tabular-nums` |
| Label caps | `text-label-caps` | 10px | `font-bold` | 1.0 | 0.05em | Section labels, hint text, badge labels — always pair with `uppercase` |

### Font weight classes for each scale

Font weight is **not** baked into the `text-*` utility — apply it separately every time:

```html
<!-- Display -->
<h1 class="text-display-lg font-semibold">...</h1>

<!-- Headline -->
<h2 class="text-headline-md font-semibold">...</h2>

<!-- Title -->
<h3 class="text-title-sm font-medium">...</h3>

<!-- Body -->
<p class="text-body-md font-normal">...</p>

<!-- Small body / helper / error -->
<p class="text-body-sm font-normal text-error">Validation message</p>

<!-- Financial value -->
<span class="text-data-mono font-medium tabular-nums">₦1,234,567.00</span>

<!-- Hint / label cap -->
<span class="text-label-caps font-bold uppercase tracking-widest text-secondary">Statement Period</span>
```

### Do NOT use these old patterns

| Old pattern | Replace with |
|---|---|
| `text-[1.6rem]` (25.6px in a form label/button) | `text-title-sm` or `text-body-md` |
| `text-sm` for body copy | `text-body-md` (14px, named and configurable) |
| `text-xs` for helper text | `text-body-sm` (12px) |
| `text-[10px] uppercase font-bold tracking-widest` | `text-label-caps font-bold uppercase` |
| Inline `leading-[22.5px]` | Remove — line-height is set by the scale |
| `font-[700]` | `font-bold` or `font-semibold` |
| `font-[400]` | `font-normal` |

---

## Interactive Element Dimensions

Keep interactive elements consistent across the app:

| Element | Height | Border radius | Notes |
|---|---|---|---|
| Text inputs | `h-[47px]` | `rounded-[10px]` | `BaseInput`, `PhoneNumberInput` |
| Select / dropdown trigger | `h-[47px]` | `rounded-[10px]` | `SearchableSelectInput` |
| Primary buttons | `h-[47px]` | `rounded-[10px]` | `BaseButton`, `SubmitButton` |
| Google / outline buttons | `h-[47px]` | `rounded-[10px]` | `GoogleButton` |

---

## Focus and Interaction States

- Focus ring: `focus:ring-2 focus:ring-primary focus:border-transparent`
- Error focus ring: `focus:ring-2 focus:ring-error focus:border-transparent`
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`
- Hover on light surface: `hover:bg-grey/10` or `hover:bg-surface`

---

## Financial Data Formatting

- Always use `formatToMoney(value)` from `utils/helpers.js` — produces `₦1,234.56`
- Pair all money, balance, date, and confidence score text with `tabular-nums` (CSS class or `font-variant-numeric: tabular-nums`)
- Use `text-data-mono font-medium tabular-nums` for inline financial figures

---

## Key Components Reference

| Component | Path | Purpose |
|---|---|---|
| `BaseButton` | `components/BaseButton.vue` | Generic `bg-primary` action button |
| `SubmitButton` | `components/SubmitButton.vue` | Form submit with loading state |
| `BaseInput` | `components/BaseInput.vue` | vee-validate text input |
| `BaseInputLabel` | `components/BaseInputLabel.vue` | Form field label |
| `GoogleButton` | `components/GoogleButton.vue` | "Continue with Google" OAuth button |
| `BaseDrawer` | `components/BaseDrawer.vue` | Slide-in drawer from any side |
| `PhoneNumberInput` | `components/PhoneNumberInput.vue` | Phone input with country code picker |
| `SearchableSelectInput` | `components/SearchableSelectInput.vue` | Searchable dropdown select |
| `TitleMeta` | `components/TitleMeta.vue` | Head/meta wrapper for pages |
