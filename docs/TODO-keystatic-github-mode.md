# TODO: Keystatic GitHub Mode on Vercel

## Goal
Enable Keystatic admin UI at `bitguru.vercel.app/keystatic` so content editors can edit directly from the browser without running dev server locally.

## Current State
- Keystatic works perfectly in **local mode** (`localhost:4321/keystatic`)
- All collections configured: courses (JSON), testimonials (JSON), blog (MDX), site settings (singleton)
- GitHub App created: env vars exist in `.env` and are added to Vercel project

## What Was Tried

### Attempt 1: Direct GitHub mode
- Changed `keystatic.config.ts` storage to `kind: "github", repo: "sethraj14/bitguru"`
- **Result:** White screen on `bitguru.vercel.app/keystatic` — no console errors, empty HTML response
- Serverless function at `/api/keystatic/github/login` returns HTTP 500

### Attempt 2: SSR external config
- Added `vite.ssr.external: ['@keystatic/core', '@keystatic/astro']` to astro config
- **Result:** Vercel build failed with `Invalid URL` error in rollup

### Attempt 3: Vercel env vars
- Initially env vars didn't save because Vercel project wasn't linked
- Fixed by running `vercel link --scope sethraj14s-projects` then re-adding all 4 vars
- Verified all 4 vars are set: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
- Redeployed with `vercel deploy --prod`
- **Result:** Still white screen

### Attempt 4: Vite transform error during local dev
- After GitHub App creation redirect, got: `TypeError: Cannot read properties of undefined (reading 'call')` at `EnvironmentPluginContainer.transform`
- This is a conflict between `@tailwindcss/vite` plugin and Keystatic's client-side code
- The GitHub App was created successfully despite this error (`.env` file was generated)

## Root Cause Hypothesis
The issue is likely one of:
1. **Astro 6 compatibility** — Astro 6 removed `output: "hybrid"` and changed how server routes work. Keystatic's Astro integration may not be fully compatible with Astro 6 yet.
2. **Tailwind CSS v4 Vite plugin conflict** — The `@tailwindcss/vite` plugin's transform pipeline conflicts with Keystatic's client-side React app rendering.
3. **Vercel serverless function bundling** — The Keystatic server routes may not be bundled correctly by `@astrojs/vercel` adapter.

## Research Needed
- [ ] Check Keystatic GitHub issues for Astro 6 compatibility: https://github.com/Thinkmill/keystatic/issues
- [ ] Check if `@keystatic/astro` v5.0.6 supports Astro 6
- [ ] Test with Tailwind CSS v3 (PostCSS approach instead of Vite plugin) to isolate the conflict
- [ ] Check the reference repo: https://github.com/m4rrc0/keystatic-deploy-test — their Vercel deployment config
- [ ] Try Keystatic's `cloud` storage mode as an alternative to `github` mode

## Env Vars (already on Vercel)
```
KEYSTATIC_GITHUB_CLIENT_ID=<set>
KEYSTATIC_GITHUB_CLIENT_SECRET=<set>
KEYSTATIC_SECRET=<set>
PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=<set>
```

## GitHub App
- Created via Keystatic's guided flow
- App has access to `sethraj14/bitguru` repo
- Callback URLs currently set to `https://bitguru.vercel.app`

## Workaround (Current)
Keystatic runs in local mode. Content editing flow:
1. `bun run dev` → `localhost:4321/keystatic`
2. Edit content visually
3. `git push` → Vercel auto-deploys

## Alternative: Keystatic Cloud
Keystatic offers a hosted cloud mode (https://keystatic.cloud) that might bypass the self-hosted GitHub mode issues entirely. Worth investigating.
