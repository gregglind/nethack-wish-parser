# NetHack Wish Parser

[Repo](https://github.com/gregglind/nethack-wish-parser) &middot;
[Issues](https://github.com/gregglind/nethack-wish-parser/issues)

A single-page app that shows, step by step, how NetHack's `#wish` prompt
(`readobjnam()` in [`src/objnam.c`](https://github.com/NetHack/NetHack/blob/ac151181d2e5f322a0f0e5c7f36c3859aa55161c/src/objnam.c))
parses a wish string into an object — with every step linked back to the
exact line(s) of the real source.

## Features

- Faithful reimplementation of the parse pipeline (article/quantity, beatitude,
  erosion, enchantment, charges, class/name lookup, artifacts, BUC/erosion/
  quantity resolution) in TypeScript, mirroring the C function names.
- **Wizard mode vs. normal play** shown side by side, since a lot of wish
  behavior is gated by wizard mode (enchantment caps, quantity honoring,
  artifact denial, wand-of-wishing charges, etc).
- **Shareable URLs** — `?wish=<text>&wizard=1` fully reproduces a given parse.
- A curated set of example wishes sourced from the
  [NetHackWiki Wish page](https://nethackwiki.com/wiki/Wish#Common_wishes).

See the in-app "What this tool simplifies" panel for known scope limitations
(the object table is the full, mechanically-extracted ~450-entry
`objects[]` roster, but it does not model the full ~400-monster roster, and
uses a seeded PRNG that illustrates probabilities rather than reproducing
NetHack's own RNG).

## Development

Requires [pnpm](https://pnpm.io) and [just](https://github.com/casey/just).

```sh
just install        # pnpm install
just dev             # start the Vite dev server
just build           # typecheck + production build to dist/
just test            # run the Vitest suite once
just test-watch      # run Vitest in watch mode
just preview         # preview the production build locally
just deploy-check    # install + build + test, mirrors what CI runs
just update-nethack  # fetch the latest NetHack/ release tag and check whether
                     # src/parser/sourceRefs.ts needs re-pinning
```

## Deployment

The build is a static site (`dist/`) with no backend, deployable to either:

- **GitHub Pages** — push to `main`; `.github/workflows/deploy.yml` builds and
  deploys automatically (enable Settings → Pages → Source: GitHub Actions).
- **Vercel** — import the repo; `vercel.json` sets the build/output config.
