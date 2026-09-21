# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working rules

1. Never modify any code without the user's explicit permission first — no exceptions, even for changes that look obviously correct or trivial.
2. After the user gives an instruction or reports a problem, first respond with an explanation of the issue and the possible solutions/options (trade-offs included) — do not implement anything until the user picks one.

## Commands

```bash
yarn dev      # start dev server (http://localhost:3000)
yarn build    # production build (next build)
yarn start    # run production build
yarn lint     # next lint (eslint-config-next)
```

There is no test suite configured in this repo — do not assume `yarn test` exists.

Package manager is Yarn (`yarn.lock` is committed; a `package-lock.json` should not be added).

Environment variables are loaded from `.env.development` (dev) and read via `process.env.REACT_APP_API_URL`, `REACT_APP_API_GRAPHQL_URL`, `REACT_APP_API_WS` — these must also be whitelisted in `next.config.js`'s `env` block to be available client-side, since Next.js does not expose arbitrary `process.env` vars to the browser by default.

## Architecture

This is a Next.js 14 (Pages Router) real-estate marketplace frontend ("Nestar") talking to a separate GraphQL backend over HTTP + WebSocket.

### Apollo Client setup (`apollo/`)

- `apollo/client.ts` — builds a singleton Apollo Client (`initializeApollo`/`useApollo` pattern for SSR-safe reuse). `createIsomorphicLink()` composes: an auth link (injects `Authorization: Bearer <jwt>` from local storage), an upload link (`apollo-upload-client`, for file uploads), a WebSocket link (subscriptions), an error link (logs GraphQL/network errors), and a token-refresh link — then `split()`s traffic so subscription operations go over the WS link and everything else goes over HTTP.
- `apollo/store.ts` — Apollo reactive variables (`makeVar`) used as global client state, notably `userVar` which holds the decoded JWT claims for the current logged-in member (`CustomJwtPayload` shape).
- `apollo/user/{query,mutation}.ts` and `apollo/admin/{query,mutation}.ts` — GraphQL documents split by audience: public/member-facing operations vs. `_admin` operations. When adding a new query/mutation, put it in the file matching who calls it, not by feature area.

### Auth (`libs/auth/index.ts`)

Auth is JWT-based, not session/cookie-based:
- `logIn` / `signUp` call the corresponding Apollo mutation, then `updateStorage` (persists the token to `localStorage` under `accessToken` and stamps a `login`/`logout` timestamp key — used to sync auth state across browser tabs) and `updateUserInfo` (decodes the JWT and pushes claims into `userVar`).
- `logOut` clears storage and resets `userVar` to its empty shape.
- `getJwtToken()` guards on `typeof window !== 'undefined'` since it's also imported from code that can run during SSR.
- Login/signup failures are matched against specific backend GraphQL error messages (e.g. `"Definer: login and password do not match"`) to show tailored `sweetMixinErrorAlert` (SweetAlert2, see `libs/sweetAlert.ts`) messages — when the backend adds new error variants, add a matching `case` rather than falling through to a generic message.

### Pages (Pages Router, `pages/`)

Route groups: `property`, `agent`, `community`, `member`, `mypage`, `cs`, `about`, `account`, and a separate `_admin/**` tree for the admin console (community/cs/properties/users). `pages/_app.tsx` wraps every page in `ApolloProvider` → MUI `ThemeProvider` (custom theme from `scss/MaterialTheme`) → `appWithTranslation` (next-i18next).

### Components (`libs/components/`)

Mirrors the `pages` route groups (`admin`, `agent`, `common`, `community`, `cs`, `homepage`, `layout`, `member`, `mypage`, `property`) — a feature's UI lives under the folder matching its route group, with cross-cutting UI in `common`/`layout`.

### Types & enums (`libs/types/`, `libs/enums/`)

`libs/types/<domain>/` (e.g. `member`, `property`, `board-article`, `comment`, `like`, `follow`, `view`) holds TS interfaces mirroring backend GraphQL types, generally split into `input`/output shapes per domain. `libs/enums/<domain>.enum.ts` mirrors backend enums (member/property/board-article/comment/like/view/notice/notification/common status & type enums) — keep these in sync with the backend schema rather than redefining ad hoc string unions.

### i18n

`next-i18next` with locales `en` (default), `kr`, `ru` configured in `next-i18next.config.js`; `localeDetection` is disabled.

### Styling

Sass under `scss/` (`scss/app.scss`, `scss/pc/main.scss`, `scss/mobile/main.scss` imported globally in `_app.tsx`, i.e. separate desktop/mobile stylesheets rather than pure responsive CSS) plus MUI theming (`scss/MaterialTheme`) and Emotion/styled-components for component-level styles. Formatting is enforced via Prettier (`.prettierrc`: tabs, single quotes, semicolons, 120 print width) — match this style rather than the default Prettier config.

### TypeScript notes

- `tsconfig.json` targets `es5` with `strict: true` and classic (`node`) module resolution.
- `types/` holds project-local ambient module declarations (e.g. `types/swiper.d.ts`) for third-party packages whose own type exports don't resolve cleanly under this project's TS/module-resolution setup — add new shims here rather than sprinkling `// @ts-ignore` (note: a `// @ts-ignore` trailing on the same import line has no effect in TS; it only suppresses the line below it).
