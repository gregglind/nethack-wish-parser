# Wish-parsing oddities

Notes on real NetHack `#wish` behaviors that are surprising, inconsistent,
or easy to get wrong when reimplementing `readobjnam()`. Each entry was
confirmed against the vendored NetHack 5.0.0 source in `NetHack/` (commit
`16ff59115315917b93185d026aeefea06db9b0f4`, see `src/parser/sourceRefs.ts`)
and is reflected in this tool's behavior.

## Quest artifact wish denial is role-specific, not "all quest artifacts, always"

`is_quest_artifact()` (`questpgr.c:66-70`) only returns true for *your own
role's* quest artifact:

```c
boolean
is_quest_artifact(struct obj *otmp)
{
    return (boolean) (otmp->oartifact == gu.urole.questarti);
}
```

The wish-denial check (`objnam.c:5402-5403`) is:

```c
if ((is_quest_artifact(d.otmp)
     || (d.otmp->oartifact && rn2(nartifact_exist()) > 1)) && !wizard) {
    // "For a moment, you feel X in your hands, but it disappears!"
```

So wishing for *your own* role's quest artifact is unconditionally denied
outside wizard mode -- but wishing for a *different* role's quest artifact
isn't specially denied at all. `is_quest_artifact()` is false for it, so it
falls through to the exact same generic roll as any ordinary artifact
(Excalibur, Stormbringer, etc.): `rn2(nartifact_exist()) > 1`. Alignment
plays no part in this decision at all -- that's a separate mechanic
(`touch_artifact()` in `artifact.c`, gating *picking up* an artifact
already in the game by both role and alignment, with a magic-damage
penalty on mismatch -- unrelated to whether a wish is granted).

This tool previously had no concept of "current role" at all and treated
every quest artifact as always-denied outside wizard mode regardless of
whose it was. Added a `role` field to quest `ArtifactDef` entries
(`src/data/artifacts.ts`), a `Role` type and `ROLES` list
(`src/parser/types.ts`), a role `<select>` in the UI persisted to
`&role=` in the URL (`src/main.ts`, `src/urlState.ts`), and threaded
`currentRole` through `resolveArtifactWish()` (`src/parser/artifactResolution.ts`)
so the two cases are distinguished correctly. Default is "no role
selected," under which every quest artifact rolls generically (none of
them are unconditionally denied) until a role is chosen.

**"Unexpected and Broken" vs. "Qualifier showcase" in the curated list:** a
wish belongs in Unexpected and Broken if it looks reasonable but silently
fails to deliver what was asked, with zero feedback (the wish either fails
outright, hands back something unrelated/wrong, or silently drops a
qualifier the object doesn't support -- no indication anything went
sideways). A wish belongs in Qualifier showcase if it demonstrates a real,
deterministic precedence rule that still produces a coherent, intentional
result (e.g. "last qualifier of a given kind wins" for repeated
enchantment/BUC-like prefixes) — non-obvious, but not actually broken. Both
"amulet of yendor" (singular, deterministic) and "potion of holy unholy
water" / "+2 +3 dagger" (collision-resolution rules) were moved from
Unexpected and Broken into Qualifier showcase on that basis; the plural "2
amulets of yendor" went the other way. "3 uncursed poisoned daggers" lives
here too, paired right next to the working "3 uncursed poisoned darts" (see
below) so the contrast reads in one place instead of a separate
single-purpose "Poisoning" group.

Two more groups exist for the same reason: "Randomness showcase" collects
wishes that resolve to something random through five distinct mechanisms
(fully random class, random-within-class, `o_ranges` sub-range picks,
unspecified worthless-glass color, and — as of the tin fix below — a tin's
always-random creation-time content), and "Wizard only" collects wishes
that either don't exist at all outside wizard mode (terrain/trap wishes)
or silently substitute a mundane item in normal play (Candelabrum/Bell/Book
of the Dead). "Edge cases" was renamed to "Other interesting wishes" and
now holds the single-character class-symbol wishes (`0`, `` ` ``, `_`)
alongside "nothing"; "broken glass" and "paperback spellbook" were dropped
from the curated list entirely (both just reject with the same generic
"Nothing fitting" message as any other unmatched text, once patched to use
that real message — not distinctive enough to be worth curating).

## "amulet of yendor" is deterministic; "amulets of yendor" (plural) is a coin flip

`objnam.c`'s `readobjnam_postparse1()` has a dedicated special case
(~4311-4338) that does a literal substring search for the exact text
`"Amulet of Yendor"`. If found, it sets the type directly:

```c
d->real = !d->fake;
d->typ = d->real ? AMULET_OF_YENDOR : FAKE_AMULET_OF_YENDOR;
```

So plain "amulet of yendor" (no qualifier) always means the *real* amulet
here — not an ambiguous name/description match. Whether it survives to the
final object is a wizard-mode question, resolved later in the main
`readobjnam()` body (~5030-5035):

```c
case AMULET_OF_YENDOR:
    d.typ = FAKE_AMULET_OF_YENDOR;   /* only reached if (!wizard) */
    break;
```

**But this special case requires an exact substring match.** "amulet**s** of
yendor" (grammatically-correct plural) does *not* contain the substring
"Amulet of Yendor" (the extra "s" breaks it), so the special case is skipped
entirely. Singularization (`makesingular()`) does turn "amulets" into
"amulet" later in the very same function — but only *after* the special
case has already been passed over; there's no loop-back. So the plural form
falls through to the generic fuzzy matcher (`rnd_otyp_by_namedesc()` /
`wishymatch()`), which finds *both* the real amulet (matches by name) and
the fake one (matches by description) and picks between them with equal
weight (`xtra_prob` bumps both 0-probability items to weight 1) — a genuine
50/50, **unaffected by wizard mode**.

Net effect: `wish for "2 amulet of yendor"` (singular) deterministically
gives the real amulet in wizard mode / the fake in normal play. `wish for
"2 amulets of yendor"` (plural) is a coin flip in *both* modes. This is real
game behavior, not a parser bug — implemented in
`src/parser/readobjnamPostparse1.ts` (the deterministic singular check) vs.
`src/parser/readobjnamPostparse3.ts` (the ambiguous fuzzy fallback that
plural text lands in).

## Non-wizard substitution vs. hard rejection are different code paths — don't conflate them

`readobjnam()`'s final wizard-mode gate (~5030-5053) is a `switch` with
dedicated cases for five types, each of which *substitutes* a mundane
item and `break`s:

```c
switch (d.typ) {
case AMULET_OF_YENDOR:        d.typ = FAKE_AMULET_OF_YENDOR; break;
case CANDELABRUM_OF_INVOCATION: d.typ = rnd_class(TALLOW_CANDLE, WAX_CANDLE); break;
case BELL_OF_OPENING:         d.typ = BELL; break;
case SPE_BOOK_OF_THE_DEAD:    d.typ = SPE_BLANK_PAPER; break;
case MAGIC_LAMP:              d.typ = OIL_LAMP; break;
default:
    if (objects[d.typ].oc_nowish)
        return (struct obj *) 0;   /* true rejection -- only for the default case */
    break;
}
```

The `oc_nowish` hard-rejection only fires for types with **no** dedicated
case above — and in the current object table, `oc_nowish` is never actually
set on anything (`grep -rn oc_nowish NetHack/include NetHack/src` shows the
bit exists but no object in `objects.h` sets it; it's vestigial). This
tool's `applyModeSubstitution()` originally checked its own `noWish` flag
*before* the substitution table, which meant any object marked both
`noWish: true` and present in the substitution map (Amulet of Yendor,
Candelabrum, Bell of Opening, Book of the Dead) got the wrong outright
"cannot be wished for outside wizard mode" rejection in normal play instead
of the correct silent substitute. Fixed by checking the substitution table
first (`src/parser/objectConstruction.ts`).

## Unmatched non-empty text fails; the random-fallback only fires for genuinely empty text

`readobjnam()`'s `any:` label (a uniformly random class, then a
rarity-weighted random type within it) is reached in exactly two ways:

1. `readobjnam(NULL, ...)` — called with no string at all (used internally
   after `MAXWISHTRY` failed retries, or for wizkit filling).
2. `readobjnam_preparse()` strips known qualifier prefixes down to an empty
   remaining string (`goto any` when nothing is left to match against).

Every *other* unmatched case — text that doesn't parse as a null string but
also doesn't match any class, type, name, or description — falls through
to `if (!d.oclass) return (struct obj *) 0;`, which `makewish()` in
`zap.c` turns into: `pline("Nothing fitting that description exists in the
game."); ... goto retry;` (re-prompting the player, not handing them a
consolation random item).

This tool previously conflated the two paths (`pickedRandomClass = !s.otyp
&& !s.oclass`, regardless of whether there was unconsumed text), so any
garbled/typo'd wish silently resolved to *some* random object instead of
failing. Fixed in `src/parser/pipeline.ts` by gating the random fallback on
`preparseResult.exhausted` (leftover text is empty) and returning the
generic failure message otherwise. This also corrected several
previously-mislabeled fixture entries — `firetrap`, `eyes` (bare), `0`
(*before* the ball-symbol fix below was found), and two "drop a word and
get a random item" broken-wish examples — which had all been documented as
"resolves to something random" when they should fail outright.

## "broken glass" and "paperback spellbook" have no special error text

Both are dedicated rejections in `objnam.c` (`d->otmp = (struct obj *) 0;
return 3;` at ~4718-4723 and ~4538-4541 respectively) that return `NULL`
through the exact same path as any other unmatched wish. There is no
type-specific error message anywhere in the real game — `makewish()` always
prints the one generic string, "Nothing fitting that description exists in
the game." This tool originally invented explanatory custom messages for
these two cases; fixed to emit the real generic message in
`src/parser/readobjnamPostparse1.ts` / `readobjnamPostparse2.ts`.

## "holy"/"unholy" collide based on adjacency to "water", not on which word appears first

The blessed/cursed adjective-prefix loop in `readobjnam_preparse()` only
strips qualifiers from the *front* of the string and stops at the first
non-qualifier word — so "potion of holy unholy water" never reaches
"holy"/"unholy" there (it stops at "potion"). Instead, a dedicated suffix
check further down in `readobjnam_postparse1()` (~4517-4530) inspects only
the two characters *immediately preceding* "holy water":

```c
if (!BSTRNCMPI(d->bp, d->p - 10 - 2, "un", 2))
    d->iscursed = 1, ...;   /* unholy water */
else
    d->blessed = 1, ...;    /* holy water */
```

So in "potion of **holy unholy** water", "un" is immediately before "holy
water" → cursed wins. Swap the order to "unholy holy water" and blessed
would win instead — it's positional, not "cursed always wins." (Also: the
resulting potion doesn't display as "holy"/"unholy" water, since wishing
doesn't set `bknown` — BUC stays hidden until quaffed/identified/blessed by
a priest, same as in real NetHack.) Already correctly modeled in
`src/parser/readobjnamPostparse1.ts`.

## "0" is the display symbol for iron balls — not just a quantity edge case

`readobjnam_preparse()` explicitly excludes a literal `"0"` from being
consumed as a quantity (`digit(*d->bp) && strcmp(d->bp, "0")`), so it
survives as object-name text. But a separate, later check
(`readobjnam_postparse1()`, ~4577-4582) recognizes any single character that
matches a real object-class display symbol:

```c
if (strlen(d->bp) == 1 && (i = def_char_to_objclass(*d->bp)) < MAXOCLASSES
    && i > ILLOBJ_CLASS && (i != VENOM_CLASS || wizard)) {
    d->oclass = i;
    return 4; /* goto any -- random object of this class */
}
```

`'0'` is `BALL_CLASS`'s symbol (`defsym.h`), and `'_'` is `CHAIN_CLASS`'s.
Both classes have exactly one wishable member with `oc_prob 1000` (the only
choice), so the "random pick within class" step is deterministic: `'0'` →
heavy iron ball, `'_'` → iron chain. Neither is wizard-gated — only `'.'`
(`VENOM_CLASS`) has the `|| wizard` escape hatch, and this tool
intentionally has no venom objects modeled (see the scope note in
`src/data/objects.ts`). `` ` `` (`ROCK_CLASS`, boulder/statue) was also
missing from this tool's single-character symbol table. All three are now
handled in `src/parser/readobjnamPostparse1.ts`.

## "gray dragon mail" (drop "scale") becomes a scroll of mail — confirmed against a real game session, not just source-reading

This one was initially reported wrong: my first pass through the source
concluded "gray dragon mail" simply fails, the same as "gray scale mail"
(drop "dragon" instead). A real NetHack session proved that guess wrong —
the wish yields `a greased stamped scroll` (unidentified `SCR_MAIL`), later
confirmed as `a blessed greased scroll of mail`. Re-reading the source
turned up the actual two-step mechanism:

1. **`readobjnam_postparse1()`'s "find corpse type w/o 'of'" block**
   (`objnam.c:4427-4462`, comment literally says *"red dragon scale mail,
   yeti corpse"*) runs `name_to_monplus()` — a longest-prefix match against
   every monster name — against the *entire* remaining text, not just
   inside an explicit `corpse of`/`tin of` construct. `"gray dragon"` is a
   real monster name and a prefix of `"gray dragon mail"`, so it gets
   split off: `d->mntmp = PM_GRAY_DRAGON`, `d->bp` becomes `"mail"`.
   Guarded by literal-prefix exceptions (`"samurai sword"`, `"wizard
   lock"`, `"death wand"`, `"master key"`, `"ninja-to"`, `"magenta"`) and
   substring exclusions (`"wand "`, `"spellbook "`, `"gauntlets "`,
   `"gloves "`, `"finger "`) so those aren't misparsed the same way.
2. The leftover `"mail"` then goes through the normal fuzzy name search
   (`rnd_otyp_by_namedesc()` in `readobjnam_postparse3`) and matches
   `SCR_MAIL` directly — its stored canonical name is literally `"mail"`
   (`objects.h:1263`: `SCROLL("mail", "stamped", ...)`).

The same mechanism is *also* how plain `"gray dragon scale mail"` actually
works, which is not obvious from just reading the object table: stripping
`"gray dragon"` the same way leaves `"scale mail"` — a real, separate,
ordinary (non-dragon) armor object (`objects.h:583`,
`ARMOR("scale mail", ...)`, `oc_prob 66`, mundane iron armor). That generic
match is then *upgraded* to the specific dragon-colored variant by a later
finalization step (`objnam.c:5275-5280`):

```c
case SCALE_MAIL:
    /* Dragon mail - depends on the order of objects & dragons. */
    if (d.mntmp >= PM_GRAY_DRAGON && d.mntmp <= PM_YELLOW_DRAGON)
        d.otmp->otyp = GRAY_DRAGON_SCALE_MAIL + d.mntmp - PM_GRAY_DRAGON;
```

So "gray dragon scale mail" is never matched as one literal string at
all — it's monster-prefix-stripped to "scale mail" (ordinary armor) and
then re-colored based on the stripped-off monster name arithmetic
(`mons[]`'s dragon ordering — gray, gold, silver, red, white, orange,
black, blue, green, yellow — matches `objects.h`'s dragon-scale-mail
ordering 1:1). Drop "scale" and there's no `SCALE_MAIL` object left to
upgrade — the leftover "mail" just matches the unrelated scroll instead.

This tool previously had no equivalent of the general prefix-stripping
step at all (only literal `"X corpse"`/`"tin of X"`/etc. keyword patterns);
added in `src/parser/readobjnamPostparse1.ts` (`stripMonsterNamePrefix`)
plus the `SCALE_MAIL` → dragon-color upgrade in
`src/parser/typeSpecificResolution.ts`.

## "poisoned daggers" is a stale wiki-ism — daggers/spears/javelins aren't poisonable in current NetHack

The NetHack wiki's "Common wishes" page (this tool's curated-list source)
lists "3 uncursed poisoned daggers" as a classic wand-of-wishing pick. In the
pinned 5.0.0 source, `is_poisonable()` no longer matches daggers at all:

```c
#define is_poisonable(otmp)                          \
    ((otmp->oclass == WEAPON_CLASS                   \
      && objects[otmp->otyp].oc_skill >= -P_SHURIKEN \
      && objects[otmp->otyp].oc_skill <= -P_BOW)     \
     || permapoisoned(otmp))
```

(`include/obj.h:264-268`). The `oc_skill >= -P_SHURIKEN && <= -P_BOW` range
only matches objects whose skill constant is stored *negative* in
`objects.h` — the "multigen"/ammo weapons (`-P_BOW` for all arrow variants,
`-P_CROSSBOW` for bolts, `-P_DART`, `-P_SHURIKEN`, `-P_BOOMERANG`). Daggers,
spears, and javelins are melee weapons stored with a *positive* skill
constant (`P_DAGGER`, `P_SPEAR`) and so fail the range check — they are
simply not poisonable via wish (or via any other means) in this version.
`readobjnam()`'s poison-setting code (~5327-5334) silently no-ops when
`is_poisonable()` is false — no rejection, no message, the wish just quietly
drops the "poisoned" qualifier and hands you a perfectly ordinary dagger.

This tool's object table already modeled this correctly for every ammo type
except `BOOMERANG`, which was missing its `poisonable: true` flag (now
fixed in `src/data/objects.ts`) despite genuinely being poisonable
(`-P_BOOMERANG`). Rather than filing this under either Broken wishes or
Qualifier showcase alone, the curated list has a dedicated "Poisoning"
group (`src/data/commonWishes.ts`) pairing "3 uncursed poisoned darts"
(works) directly against "3 uncursed poisoned daggers" (silently drops the
qualifier), so the contrast is visible side by side.

## "tin of a" / "tin of archon" — an unrecognized or no-corpse monster doesn't reject or echo back, it keeps the tin's random creation-time content

`mksobj(TIN, ...)` (`mkobj.c:925-932`) always gives a fresh tin *some*
content up front, before `readobjnam()` ever looks at what the player
typed: 1-in-6 chance of spinach, otherwise up to 200 tries picking a random
corpse-eligible monster via `rndmonnum()`. Only *afterward* does
`readobjnam()` try to override that with whatever monster the player named
(`objnam.c:5234-5243`):

```c
case TIN:
    if (dead_species(d.mntmp, FALSE)) {
        d.otmp->corpsenm = NON_PM; /* it's empty */
    } else if ((!(mons[d.mntmp].geno & G_UNIQ) || wizard)
               && !(svm.mvitals[d.mntmp].mvflags & G_NOCORPSE)
               && mons[d.mntmp].cnutrit != 0) {
        d.otmp->corpsenm = d.mntmp;
    }
    break;
```

Note there's no `else` branch. If the named monster doesn't qualify — not
recognized, or `G_NOCORPSE` (no corpse, e.g. Archons), or unique outside
wizard mode — the override is skipped entirely and the tin keeps whatever
random content it already got from `mksobj()`. So "tin of a" (unparseable
monster text) and "tin of archon" (a real monster with no corpse) both
produce a tin of some unrelated, genuinely random monster's meat — never
"empty," and never a literal echo of the unmatched text. This tool
previously stored the raw unvalidated text as `mntmp` and printed it
directly (`"an uncursed a tin"`, `"an uncursed archon tin"` — also using the
wrong naming construction entirely; real tins are named "tin of X meat" per
`eat.c`'s `tin_details()`, not "X tin" like corpses/statues/figurines).
Fixed in `src/parser/typeSpecificResolution.ts` (validate + random
corpse-eligible fallback, excluding unique monsters) and
`src/parser/xname.ts` (naming format). The same "no override -> keep the
random creation-time content" logic applies when *no* monster is named at
all (plain "tin") — `ismnum(d.mntmp)` is false either way — so bare "tin"
was extended to the same fallback rather than rendering a contentless
generic "tin".

## The tool's BUC roll is class-agnostic; the real game's isn't

When no `blessed`/`cursed`/`uncursed` qualifier is given (and no negative
enchantment sign), `readobjnam()` never touches beatitude at all — the
object keeps whatever `mksobj()` rolled at creation time via
`blessorcurse(otmp, chance)`, and `chance` varies a lot by class:

| class / case | `blessorcurse` chance | odds of blessed / cursed / uncursed |
|---|---|---|
| amulets (except 3 bad ones) | 10 | 5% / 5% / 90% |
| potions, scrolls | 4 | 12.5% / 12.5% / 75% |
| spellbooks | 17 | ~2.9% / ~2.9% / ~94% |
| crystal ball, can of grease | 2 | 25% / 25% / 50% |
| most weapons/armor/rings/wands (generic default) | 10 | 5% / 5% / 90% |

This tool's `rollBaseBuc()` (`src/parser/bucAssignment.ts`) uses one flat
`rn2(6)` for every object in the game — 16.7% blessed / 16.7% cursed /
66.7% uncursed — regardless of class. So "cursed"/"blessed" results aren't
*wrong*, but they show up roughly 3x more often than the real game would
produce for a plain "amulet of yendor" (or most other classes). Flagged but
**not yet fixed** — would require pulling the real per-class chance
parameter into the object table, which touches BUC odds for every item in
the tool, not just this one case.
