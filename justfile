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

# NetHack/ is a plain git clone kept outside the app's tracked files (see
# .gitignore) -- it exists only as local reference material for verifying
# source-line links, never vendored or committed. This just fetches new
# commits/tags into that existing clone in place; nothing new is written to
# the app repo. If the latest release moved, it prints a ready-to-paste
# prompt for re-pinning src/parser/sourceRefs.ts.
update-nethack:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ ! -d NetHack/.git ]; then
        echo "NetHack/ not found -- clone it first:"
        echo "  git clone https://github.com/NetHack/NetHack.git"
        exit 1
    fi
    cd NetHack
    git fetch --quiet --tags origin
    latest_tag=$(git tag -l '*_Release' --sort=-creatordate | head -1)
    latest_sha=$(git rev-list -n 1 "$latest_tag")
    latest_date=$(git log -1 --format=%cd --date=short "$latest_sha")
    current_sha=$(grep -oE "NETHACK_COMMIT = '[0-9a-f]+'" ../src/parser/sourceRefs.ts | grep -oE '[0-9a-f]{40}')
    echo "Fetched NetHack/. Latest release tag: $latest_tag ($latest_sha, $latest_date)"
    if [ "$latest_sha" = "$current_sha" ]; then
        echo "Already pinned to the latest release -- nothing to do."
        exit 0
    fi
    echo "Currently pinned: $current_sha"
    echo ""
    echo "--- Prompt to feed to Claude ---"
    printf '%s\n' \
        "The NetHack source in NetHack/ was just fetched. Re-pin src/parser/sourceRefs.ts" \
        "from commit $current_sha to the new release tag $latest_tag (commit $latest_sha, $latest_date):" \
        "" \
        "1. Diff src/objnam.c, src/zap.c, and include/obj.h between the two commits" \
        "   (e.g. git -C NetHack diff $current_sha $latest_sha -- src/objnam.c src/zap.c include/obj.h)" \
        "   to see what moved or changed." \
        "2. Re-verify every line range in SOURCE_REFS against $latest_sha, the same" \
        "   way it was done last time: git -C NetHack show $latest_sha:src/objnam.c" \
        "   and grep -n on the literal tokens named in each entry." \
        "3. Update NETHACK_COMMIT and NETHACK_VERSION in sourceRefs.ts." \
        "4. Run pnpm exec tsc --noEmit and pnpm vitest run, then spot-check a few" \
        "   wishes in the dev server and confirm the source links resolve to the" \
        "   right GitHub lines."
