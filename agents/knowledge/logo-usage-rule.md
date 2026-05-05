# Rule: MiFlujo Logo Usage

Always use an image logo asset for MiFlujo branding. Do not represent the brand with bare text,
a Material Symbol icon, or a generic placeholder mark unless the user explicitly asks for that.

## Available Logo Assets

| Asset | Path | Use when |
|---|---|---|
| Primary icon logo | `public/logo.png` | Compact spaces: mobile header, app icon-sized brand mark, collapsed sidebar, loading states |
| Logo with motto | `public/logo-with-moto.png` | Auth pages, onboarding, empty first-run states, and brand-forward screens where there is enough vertical room |
| Horizontal logo | `public/horizontal-logo.png` | Dashboard sidebar/header, desktop navigation, marketing-style top bars, and any wide layout needing a readable brand lockup |

## Page-Level Selection

- Auth layout (`layout: 'auth'`): prefer `logo-with-moto.png` centered above the auth form.
- Dashboard layout (`layout: 'dashboard'`): prefer `horizontal-logo.png` in expanded navigation/header areas.
- Mobile compact navigation: use `logo.png` when horizontal space cannot preserve the horizontal logo cleanly.
- Loading, splash, or short empty states: use `logo.png` for compact marks; use `logo-with-moto.png` only when the screen is intentionally brand-led.
- Never use a naked `MiFlujo` text label as the logo replacement. If adjacent text is needed, it must accompany an actual logo image.

## Implementation Notes

Use Nuxt public paths directly:

```vue
<img src="/horizontal-logo.png" alt="MiFlujo" class="h-8 w-auto" />
```

Alt text should usually be `MiFlujo`. Do not include the motto in alt text unless the visible image is being used as page content rather than navigation branding.
