---
covers: ["tailwind.config.ts", "app/globals.css", "app/layout.tsx", "hoc/theme.js", "components/AppWrapper.tsx", "components/Chatbot/hooks/useColor.ts", "utils/themeUtility.js", "hooks/useDynamicMessageStyles.ts", "components/Interface-Chatbot/**/*.css"]
verified_at: c7ace0c
verified_on: 2026-10-20
---
# Design system

The UI has no design-token file of its own. Colors come from three places:
- the host's brand color, turned into an MUI theme at runtime;
- daisyUI's theme variables for neutral surfaces;
- a few host-supplied overrides sent over postMessage.

Styling is Tailwind 3 + daisyUI 4 + `@tailwindcss/typography`, plus MUI 6 for a handful of controls. How chat components apply these is in [chat-ui](../modules/chat-ui.md#styling).

## Tokens

| Token | Defined in | How to use it |
|---|---|---|
| Primary (brand) color | `hoc/theme.js:generateTheme` from the host's `themeColor` | `useColor()` (`components/Chatbot/hooks/useColor.ts`) for `backgroundColor` + a black/white `textColor` chosen by `utils/themeUtility.js:isColorLight`; or MUI `useTheme().palette.primary.main`. Applied with inline `style`, not a Tailwind class. |
| Surfaces and text | daisyUI theme variables | `bg-base-100` / `bg-base-200` / `bg-base-300`, `text-base-content` with an alpha (`/60`). |
| Status colors | daisyUI | `text-success`, `text-error`, `text-warning`, `text-primary`; in inline styles `oklch(var(--su))` and similar. |
| Page background / foreground | `app/globals.css` (`--background`, `--foreground`), exposed as Tailwind `background` / `foreground` in `tailwind.config.ts` | Rarely used by the chat. |
| Message bubble overrides | `hooks/useDynamicMessageStyles.ts` (`MessageStyles`) | Sent by the host as `messageStyles`; keys such as `containerBg`, `textFieldBg`, `userBubbleBg`. Only the legacy Human/Bot bubbles read the bubble keys. |

daisyUI themes are declared in `tailwind.config.ts`: a custom `mytheme` plus `light`, `dark` and `cupcake`.

> [!WARNING]
> Classes like `bg-base-50` or `bg-base-700` appear in the planning, accordion and table code, but daisyUI 4 only defines `base-100`, `base-200`, `base-300` and `base-content`. Those classes generate no CSS. Use the defined steps or an alpha on `base-content`.

## Theming

1. The loader sends `themeColor` and `theme` (`light`, `dark` or `system`) in `config`. `app/chatbot/layout.tsx:ChatbotLayout` calls `handleThemeChange` and, unless a session theme exists, `handleColorSchemeChange`.
2. `components/AppWrapper.tsx` builds the MUI theme with `generateTheme(themeColor, colorScheme)` and sets `data-theme` on `<html>`.
3. Dark mode keeps the brand hue but raises its lightness to 55–75% (`getDarkModePrimary` in `hoc/theme.js`, c7ace0c), so a dark brand color stays readable on a dark background.
4. `tailwind.config.ts` sets `darkMode: ["class", '[data-theme="dark"]']`, so `dark:` utilities and daisyUI both follow `data-theme`.

Priority: the sessionStorage `chatbotTheme` value (see [state](state.md#browser-storage-keys)) wins over `config.theme`, which wins over the OS setting. `handleColorSchemeChange` always writes `chatbotTheme`, so a theme applied from config also becomes the session theme.

> [!WARNING]
> `app/layout.tsx` loads the Tailwind Play CDN (`https://cdn.tailwindcss.com`) at runtime. It exists so that Tailwind classes inside host-supplied component overrides work, because the build-time Tailwind pass never sees that code (12ff552). Removing the script silently unstyles those overrides. A host with a strict CSP that blocks it gets the same result.

## Rules

- Brand color goes through `useColor()` or the MUI theme. Never hard-code a hex for anything that should follow the host's color.
- Light/dark pairs that daisyUI does not cover are switched on `theme.palette.mode`, for example card backgrounds `'#ffffff'` versus `palette.background.paper`.
- Put `not-prose` on any card rendered inside assistant markdown (`prose`) content.
- Plain CSS is limited to `components/Interface-Chatbot/InterfaceChatbot.css` and `components/Interface-Chatbot/Messages/Message.css` (scrollbars, loading dots, keyframes). There are no CSS modules; prefer Tailwind classes.
- `public/chatbot-style.css` and `public/rag.css` style the host page, not the iframe. Their selectors are global on the customer's site, so prefix new ones (`rag-`, `chatbot-`) to avoid restyling host elements.
