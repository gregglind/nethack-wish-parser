default:
    @just --list

install:
    pnpm install

dev:
    pnpm vite

build:
    pnpm run build

test:
    pnpm vitest run

test-watch:
    pnpm vitest

preview:
    pnpm vite preview

# Deploy target is decided at repo-setup time (GitHub Pages Actions workflow
# or Vercel project import both call `just build`); this recipe is a local
# sanity check that mirrors what CI runs.
deploy-check: install build test
    @echo "Build + tests OK. Push to main (GitHub Pages) or 'vercel --prod' (Vercel)."
