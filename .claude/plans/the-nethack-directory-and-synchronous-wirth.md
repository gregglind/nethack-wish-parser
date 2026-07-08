# NetHack Wish Parser — Single-Page Web App

## Context

The user wants a single-page web app (deployable to GitHub Pages or Vercel) that
demonstrates how NetHack parses a `#wish` string, showing the intermediate parse
steps and the final resulting object — for learning/exploration purposes. A full
NetHack 5.0 source checkout already exists at `NetHack/` (clone of
`https://github.com/NetHack/NetHack.git`, pinned at commit
`ac151181d2e5f322a0f0e5c7f36c3859aa55161c` on branch `NetHack-5.0`), and the real
wish-parsing logic lives in `NetHack/src/objnam.c`'s `readobjnam()` (called from
`makewish()` in `src/zap.c`). The app should reimplement that parsing logic in
client-side TypeScript, faithfully mirroring the C parser's order of operations,
and every displayed step should link back to the exact line(s) in the real source
on GitHub (pinned to that commit) for verification/education. The user also wants
a wizard-mode toggle reflected in a query arg, and the wish string itself in a
query arg, so specific parses are shareable via URL.

`NetHack/` and any wiki-mirror scratch files are reference-only and should not be
vendored into the deployed app (gitignored, not committed).

## Pipeline being reimplemented (verified against the pinned commit)

`readobjnam()` (objnam.c:4938-5429) breaks into a dispatcher over these ordered
stages — this order is what the UI timeline must reflect:

1. `makewish()` preprocessing (zap.c:6327-6436) — trim/collapse whitespace,
   short-circuit on "nothing"/"nil"/"none".
2. `readobjnam_init()` (objnam.c:3961-3990) — zero parse state.
3. `readobjnam_preparse()` (objnam.c:3994-4204) — loop stripping ONE recognized
   qualifier per iteration from the front of the string, first-match-wins, in
   priority order: article/quantity → enchantment sign+number → blessed/cursed/
   uncursed (incl. holy/unholy) → erodeproof synonyms → lit/unlit → wetness →
   unlabeled → poisoned → trapped/untrapped → locked/unlocked/broken/open/closed/
   doorless → looted → greased → zombifying → very/thoroughly (deferred intensity)
   → erosion bucket 1 (rusty/burnt/cracked) → erosion bucket 2 (corroded/rotted)
   → partly eaten → historic → diluted → empty → glob size → real/fake → gender →
   "corpse/statue/figurine of" lookahead. Qualifiers-only input still produces a
   random object carrying those qualifiers.
4. `readobjnam_parse_charges()` (objnam.c:4206-4266) — trailing `(N)` / `(N:M)` /
   `(lit)`.
5. `readobjnam_postparse1()` (objnam.c:4268-4692) — named/called/labeled, spinach,
   Amulet of Yendor real/fake, pair/set doubling, glob-of-monster, corpse monster
   extraction, pluralization (implies cnt=2), alt-spellings, dragon scales,
   holy/unholy water suffix, paperback, blank scroll/spellbook, gold-piece
   short-circuit, single-char class symbol, class-name table.
6. `readobjnam_postparse2()` (objnam.c:4694-4753) — `o_ranges[]` exact match,
   stone/gem suffix, glass suffix.
7. `readobjnam_postparse3()` (objnam.c:4755-4928) — real gem scan, main
   `wishymatch()`/`rnd_otyp_by_namedesc()` fuzzy lookup (weighted-random among
   ambiguous matches), armor "+mail" retry, spinach fallback, fruit/slime-mold
   matching (last, on untouched original string), artifact fuzzy match,
   class-constrained alt-spelling retry.
8. Object construction (`any:`/`typfnd:`, objnam.c:5023-5066) — random class
   pick if unresolved, non-wizard substitutions (Amulet of Yendor→fake,
   Candelabrum→candle, Bell of Opening→bell, Book of the Dead→blank paper, Magic
   Lamp→oil lamp, `oc_nowish` rejection), pudding-corpse→glob, base object roll.
9. Quantity resolution — stackable-count honored only if wizard, or
   `cnt < rnd(6)`, or type-specific exceptions (candles ≤7, ammo ≤20).
10. Enchantment resolution — wizard: `SPE_LIM=99` cap only; non-wizard:
    `rnd(5)`-gated for armor/weapon/ring, negative-Luck sign flip above +2,
    capped to the object's own natural roll for everything else (you generally
    can't out-wish the random roll in normal play).
11. Type-specific `spe` reassignment (tin/towel/slime-mold/statue/figurine/
    corpse/wand-of-wishing — the latter forced to `rn2(10)?-1:0` unless wizard).
12. BUC assignment — `iscursed` → cursed; `uncursed` → uncursed
    (cursed if Luck<0 && !wizard); `blessed` → blessed (only if Luck≥0||wizard);
    negative enchantment implies cursed; else the object's natural roll stands.
13. Erosion assignment — material-gated (`oeroded`/`oeroded2`), erodeproof
    gated on Luck≥0||wizard.
14. Recharge count (wands); wand of wishing forced `rechrg=1` unless wizard.
15. Poison (Luck-gated), trapped (containers/tin), empty-container handling,
    lock state, greased, diluted, tin variety (25% chance unless wizard).
16. Naming (`oname()`), artifact-name resolution forces `quan=1`.
17. Artifact wish denial (non-wizard) — quest artifacts of other roles always
    denied; non-quest artifacts denied with probability scaling by
    `nartifact_exist()`.
18. Halfeaten adjustment, final weight recompute (`xname()`-equivalent render).

Constants: `MAXWISHTRY=5` (zap.c:6174), `SPE_LIM=99` (obj.h:49),
`MAX_ERODE=3` (obj.h:129), `BUFSZ=256`.

Wizard-mode vs normal-play differences to model explicitly (11 total): trapped
prefix honored, gold cap lifted (5000→unlimited), venom-class symbol allowed,
terrain/trap wishes available, `oc_nowish` substitutions skipped, enchantment
capped only by `SPE_LIM`, glob weight override, BUC not forced by negative Luck,
erodeproof always honored, wand of wishing gets full requested charges, artifact
wishes always granted, quantity always honored.

## Tech stack

**Vite + TypeScript, vanilla DOM rendering (no UI framework).** The app is a pure
`input string → WishResult → render` derivation with no complex state machine or
component tree — a virtual-DOM framework buys nothing here. Vite gives free TS,
HMR, and trivial static output for both GitHub Pages and Vercel. TypeScript is
worth it given the ~30-field parse state and many mutually-exclusive branches —
discriminated unions and exhaustive `switch`/`never` checks catch the same class
of bugs the C code is full of. `strict: true`, ES2020 target.

**Package manager: pnpm.** **Task runner: `just`** (a `justfile` wrapping the
common commands — `just dev`, `just build`, `just test`, `just deploy` — so
GitHub Pages CI, Vercel, and local workflows all call the same recipes instead
of duplicating `pnpm` invocations, making future deploy-target changes a
one-file edit).

## Project structure

```
nethack-wishparser/
  index.html
  package.json / tsconfig.json / vite.config.ts (base: './')
  pnpm-lock.yaml
  justfile                       # dev/build/test/deploy task runner
  .github/workflows/deploy.yml   # GitHub Pages Actions deploy
  vercel.json                    # optional, explicit build/output for clarity
  src/
    main.ts                      # wiring: input/toggle <-> URL state <-> pipeline <-> render
    style.css
    urlState.ts                  # ?wish= / ?wizard= <-> app state sync (see below)
    parser/
      types.ts                   # ParseState, ParseStep, SourceRef, WishResult
      sourceRefs.ts               # line-range catalog (pinned commit) + permalink()
      pipeline.ts                 # runWishPipeline(input, mode, seed) orchestrator
      rng.ts                      # seeded PRNG + rn2/rnd/d helpers
      utils.ts                    # mungspaces/makesingularApprox/fuzzy match helpers
      makewish.ts
      readobjnamInit.ts
      readobjnamPreparse.ts       # array of ordered qualifier-matcher objects
      readobjnamParseCharges.ts
      readobjnamPostparse1.ts
      readobjnamPostparse2.ts
      readobjnamPostparse3.ts
      objectConstruction.ts
      quantityResolution.ts
      enchantmentResolution.ts
      typeSpecificResolution.ts
      bucAssignment.ts
      erosionAssignment.ts
      artifactResolution.ts
      xname.ts                   # final human-readable render
    data/
      objects.ts                 # curated ObjectDef[]
      spellings.ts / classNames.ts / oRanges.ts / artifacts.ts / monsters.ts
      commonWishes.ts             # curated wiki example strings
    ui/
      renderTimeline.ts / renderResult.ts / renderExamples.ts
      renderModeToggle.ts / renderScopeNotice.ts / domHelpers.ts
  test/
    fixtures/commonWishes.spec.ts
    preparse.spec.ts / postparse.spec.ts / enchantment.spec.ts
```

## Data model (`parser/types.ts`)

`ParseState` mirrors `struct _readobjnam_data` (objnam.c:13-33) field-for-field
(cnt, spe, spesgn, typ, blessed/uncursed/iscursed as three separate booleans —
not collapsed, to preserve the same resolution ambiguity the C code has, eroded/
eroded2, erodeproof, mgend, wetness, gsize, ftype, etc.).

```ts
interface ParseStep {
  id: string;                    // e.g. "preparse:beatitude"
  stage: PipelineStage;
  title: string;
  matched: boolean;
  inputBefore: string; inputAfter: string;
  stateDiff: Partial<ParseState>;
  sourceRef: SourceRef;          // { file, startLine, endLine, functionName }
  category: 'lex' | 'lookup' | 'construct' | 'resolve-random' | 'finalize';
  rngNote?: { description: string; wizardOutcome: string;
              normalModeProbability?: number; normalModeOutcomeDescription: string };
}

interface WishResult {
  steps: ParseStep[];
  wizardObject: RenderedObject;   // { xname, fields }
  normalObject: RenderedObject;
  failed: boolean; failureReason?: string;
}
```

Steps are structured data the UI renders as a timeline/accordion — never string
concatenation. `sourceRefs.ts` holds one entry per stage/sub-branch with a
`permalink()` helper:

```ts
const COMMIT = 'ac151181d2e5f322a0f0e5c7f36c3859aa55161c';
const permalink = (ref: SourceRef) =>
  `https://github.com/NetHack/NetHack/blob/${COMMIT}/${ref.file}#L${ref.startLine}-L${ref.endLine}`;
```

Sub-range line numbers for the preparse loop and postparse stages were verified
against the pinned commit during planning (spot-checked, accurate to within ~1
line); use the same `grep -n '"token'` technique against `NetHack/src/objnam.c`
to fill in/verify any remaining sub-branch ranges during implementation.

## Wizard-mode toggle + shareable URLs

Single `urlState.ts` module syncs app state with `URLSearchParams`:

- `?wish=<url-encoded wish string>` — the input text.
- `?wizard=1` — sets the wizard-mode toggle's initial position (absent/`0` =
  normal).
- On load: parse `location.search`; if `wish` is present, populate the input,
  set the toggle, and auto-run the pipeline immediately (no click required).
- On every input/toggle change: recompute, then `history.replaceState` (not
  `pushState`, to avoid flooding browser history per keystroke) with the updated
  `URLSearchParams`.
- A small "Copy link" button next to the input copies `location.href` (already
  fully synced) to the clipboard.

Both wizard and normal results are always computed and shown side-by-side (per
the pipeline's own recommendation) — the toggle does **not** hide either panel;
it only sets which one is visually primary/first and which mode's charge/
enchantment gating is used as the "headline" object. This preserves the core
educational value (comparing wizard vs. real-play outcomes for the same string)
while still making the toggle meaningful and shareable.

## Object database

Hand-curated `data/objects.ts` (not generated from `include/objects.h` at build
time — that's a C macro table not worth reimplementing, and vendoring the C
source into the build would bloat/complicate deploys). Coverage:

- Every item in the wiki's common-wishes examples: all 10 dragon scale mail
  colors, cloak of magic resistance, wand of wishing, magic marker, scrolls of
  charging, and the 4 named artifacts (Eye of the Aethiopica, Platinum
  Yendorian Express Card, Eyes of the Overworld, Orb of Fate) plus ~10-15 more
  iconic artifacts (Excalibur, Stormbringer, Mjollnir, Sunsword, Magicbane...)
  for breadth.
- ~8-15 representative items per object class (11 classes) chosen to exercise
  interesting paths: alt-spellings, erosion-susceptible vs. not, stackable vs.
  not, chargeable, `o_ranges` subrange members (bag/lamp/helm/dragon scale mail
  at minimum).
- Companion tables: `spellings.ts` (alt-spelling subset), `classNames.ts`
  (`wrp[]`/`wrpsym[]` subset + false-positive exclusion list like "ring mail"),
  `oRanges.ts`, `monsters.ts` (~40-60 curated, for corpse/statue/figurine/glob),
  `commonWishes.ts` (literal curated example strings for the UI's clickable
  chips, grouped by theme).

A documented, manually-run (not CI) `scripts/extract-objects.mjs` may assist a
maintainer in cross-checking `data/objects.ts` against a real NetHack checkout,
but the shipped build has no dependency on the C source tree being present.

## Randomness handling

Two kinds, shown differently:
- **Lookup ambiguity** (e.g. "bag" matching multiple otyps): show the weighted
  candidate set with `oc_prob`-derived percentages in that step's notes, with a
  seeded RNG resolving one concrete pick and a per-step "reroll this match"
  control.
- **Outcome-gating randomness** (quantity/enchantment/BUC/artifact-denial/wand-
  of-wishing-charges gates): wizard mode shows the deterministic upper bound;
  normal mode shows inline probability annotations per gated field plus a
  global seeded "Roll it" button that runs one concrete normal-mode simulation
  with a visible seed and a note that other rolls may differ. Default Luck = 0
  (can't be derived from wish text alone); note this in a tooltip. The seeded
  PRNG (mulberry32-style) is explicitly not a reimplementation of NetHack's own
  RNG — call this out in the scope notice.

## Scope: in vs. out

**In:** full preparse qualifier loop, charges parsing, named/called/labeled,
gold short-circuit, class-name table, alt-spelling subset, `o_ranges` weighted
resolution, gem/stone/glass suffixes, main fuzzy lookup, slime-mold matching
(default fruit only), artifact fuzzy match (curated subset), pair/set doubling,
plural→cnt=2, full BUC/enchantment/erosion/quantity resolution incl. Luck- and
wizard-gated branches, `xname`-equivalent rendering, wizard/normal toggle,
shareable URLs.

**Out (surfaced via a ScopeNotice panel, not hidden):** wizard-mode terrain/trap
wishes, Japanese item aliases, full ~400-monster roster (curated subset
instead), custom player-defined fruit names (session-dependent, not
reproducible from a bare string), full ~46-artifact roster (curated subset),
exact C `makesingular()` irregular handling (heuristic + exception list
instead), bit-exact NetHack RNG.

## Testing

Vitest. Per-stage specs with literal before/after fixtures (e.g.
`preparse.spec.ts` asserts the exact ordered step-id sequence and resulting
`ParseState` for `"blessed +2 gray dragon scale mail"`). A golden-file suite
iterates every entry in `commonWishes.ts`, asserting no throw, a hand-verified
expected wizard-mode `xname` string, and key structured fields.

## Deployment

- `vite.config.ts`: `base: './'` so one build works unmodified on both a GitHub
  Pages project subpath and a Vercel root domain.
- `justfile` recipes: `dev` (`pnpm vite`), `build` (`pnpm vite build`), `test`
  (`pnpm vitest run`), `deploy` (documents/wraps whichever of GitHub Pages or
  Vercel the user ultimately picks — kept as one indirection point).
- GitHub Pages: `.github/workflows/deploy.yml` (checkout → setup-node →
  setup-pnpm → `pnpm install --frozen-lockfile` → `just build` →
  `upload-pages-artifact` on `dist/` → `deploy-pages`, triggered on push to
  `main`); repo Settings → Pages → Source: GitHub Actions.
- Vercel: set install command to `pnpm install` and build command to
  `just build` (or `pnpm vite build`) in project settings, output `dist`. No
  SPA rewrites needed (single static page).

## Verification

- `just build` succeeds and `just test` (Vitest) passes, including the
  golden-file suite over all curated common-wishes examples.
- `just dev`, manually try: a plain item (`"potion of healing"`), a fully
  loaded wish (`"blessed greased +2 gray dragon scale mail"`), an artifact
  (`"Excalibur"`), a corpse/statue with gender (`"statue of a female gnome
  ruler"`), a failure case (garbage text), and `"nothing"` — confirm the
  timeline order matches the pipeline order above, source links resolve to the
  correct GitHub lines, and wizard/normal panels diverge appropriately (e.g.
  enchantment and wand-of-wishing charges).
- Toggle wizard mode and confirm the URL updates (`?wizard=1`); edit the input
  and confirm `?wish=` updates; reload a copied URL and confirm it reproduces
  the exact same displayed parse without extra clicks.
- Click through the example chips; confirm each one matches its wiki-sourced
  description.
