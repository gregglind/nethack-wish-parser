import type { Role } from "../parser/types";

export interface CommonWish {
  text: string;
  label: string;
  group: string;
  /** This specific wish fails outright, or gives a wrong/unrelated/silently-degraded result. Rendered with a leading "✗" on its chip. */
  broken?: boolean;
  /** The wizard-vs-normal split is the whole point of this example (only real, or only exists, in wizard mode). Rendered with a leading 🧙 on its chip. */
  wizard?: boolean;
  /** This wish's result genuinely varies by RNG roll -- rerolling can change it. Rendered with a leading 🎲 on its chip. */
  random?: boolean;
  /** Clicking this chip also sets the Luck input to this value -- the example only makes its point at this specific Luck. Rendered as a "🍀N" badge on its chip. */
  luck?: number;
  /** Clicking this chip also sets the Role selector to this value -- this is that role's own quest artifact, always denied outside wizard mode at this Role. Rendered as a "🎭Role" badge on its chip. */
  role?: Role;
}

/**
 * Curated from nethackwiki.com/wiki/Wish#Common_wishes (Strategy > Common
 * wishes, and Customization sections), fetched via a Wayback Machine mirror.
 */
export const COMMON_WISHES: CommonWish[] = [
  // Unexpected and Broken
  {
    text: "blessed greased +2 gray scale mail",
    label:
      'Drop "dragon" and the wish fails outright -- "gray scale mail" matches nothing, wasting every qualifier',
    group: "Unexpected and Broken",
    broken: true,
  },
  {
    text: "blessed greased +2 gray dragon mail",
    label:
      'Drop "scale" and "gray dragon" is stripped as a monster-name prefix, leaving "mail" -- which coincidentally matches the scroll of mail',
    group: "Unexpected and Broken",
    broken: true,
  },
  {
    text: "figuring of an archon",
    label:
      '"figuring" (typo for "figurine") ends in "ring" -- matches RING_CLASS via a pure suffix check, so this gives a random ring, not a figurine of anything',
    group: "Unexpected and Broken",
    broken: true,
    random: true,
  },
  {
    text: "2 amulets of yendor",
    label:
      'Pluralizing "amulet" breaks the deterministic match -- a genuine 50/50 real-or-fake gamble, even in wizard mode',
    group: "Unexpected and Broken",
    broken: true,
    random: true,
  },
  {
    text: "firetrap",
    label:
      'Drop the space from "fire trap" and the wish fails outright, not a trap',
    group: "Unexpected and Broken",
    broken: true,
  },
  {
    text: "3 uncursed poisoned darts",
    label:
      "Works, for contrast: thrown ammo (arrows, darts, bolts, shuriken, boomerangs) is poisonable",
    group: "Unexpected and Broken",
  },
  {
    text: "3 poison darts",
    label:
      'Needs the exact word "poisoned", not "poison" -- there\'s no alt-spelling for it, so the whole wish fails outright',
    group: "Unexpected and Broken",
    broken: true,
  },
  {
    text: "3 uncursed poisoned daggers",
    label:
      'Broken: silently drops "poisoned" -- daggers/spears/javelins aren\'t poisonable in current NetHack',
    group: "Unexpected and Broken",
    broken: true,
  },

  // Dragon scale mail
  {
    text: "blessed greased +2 gray dragon scale mail",
    label: "Magic resistance (early game staple)",
    group: "Dragon scale mail",
  },
  {
    text: "blessed greased +2 silver dragon scale mail",
    label: "Reflection (early game staple)",
    group: "Dragon scale mail",
  },
  {
    text: "blessed greased fireproof +2 cloak of magic resistance",
    label: "Chaotic Monk's magic resistance option",
    group: "Dragon scale mail",
  },

  // Quest artifacts
  {
    text: "blessed rustproof Eye of the Aethiopica",
    label:
      "Neutral: magic resistance + energy regen + telepathy. The Wizard's own quest artifact -- always denied outside wizard mode at that role",
    group: "Quest artifacts",
  },
  {
    text: "blessed fireproof Platinum Yendorian Express Card",
    label:
      "Neutral: magic resistance + telepathy + charging. The Tourist's own quest artifact -- always denied outside wizard mode at that role",
    group: "Quest artifacts",
    role: "Tourist",
    wizard: true,
  },
  {
    text: "blessed Platinum Yendorian Express Card",
    label:
      "Neutral: magic resistance + telepathy + charging. The Tourist's own quest artifact -- always denied outside wizard mode at that role",
    group: "Quest artifacts",
    role: "Wizard",
  },
  {
    text: "blessed Eyes of the Overworld",
    label:
      "Neutral: astral vision + magic resistance. The Monk's own quest artifact -- always denied outside wizard mode at that role",
    group: "Quest artifacts",
  },
  {
    text: "blessed Orb of Fate",
    label:
      "Neutral: half physical/spell damage. The Valkyrie's own quest artifact -- always denied outside wizard mode at that role",
    group: "Quest artifacts",
  },

  // Wand of wishing strategy
  {
    text: "2 blessed scrolls of charging",
    label: "Recharge a wand of wishing with unknown charges",
    group: "Wand-of-wishing strategy",
  },
  {
    text: "uncursed magic marker",
    label: "Write your own blessed scrolls of charging",
    group: "Wand-of-wishing strategy",
  },
  {
    text: "blessed amulet of life saving",
    label: "Classic early wand-of-wishing pick",
    group: "Wand-of-wishing strategy",
  },
  {
    text: "blessed +2 speed boots",
    label: "Classic early wand-of-wishing pick",
    group: "Wand-of-wishing strategy",
  },

  // Qualifier showcase
  {
    text: "the blessed +1 gray dragon scale mail",
    label: "Article + BUC + enchantment + color",
    group: "Qualifier showcase",
  },
  {
    text: "gray dragon scale mail of gray dragon scale mail",
    label:
      'Repeating the full name back-to-back still works -- monster-name stripping peels off "gray dragon" twice and lands back on the same real item',
    group: "Qualifier showcase",
  },
  {
    text: "potion of holy unholy water",
    label:
      '"holy"/"unholy" collide -- whichever is adjacent to "water" wins, not whichever came first',
    group: "Qualifier showcase",
  },
  {
    text: "+2 +3 dagger",
    label:
      'Stack two enchantment prefixes -- only the last one applies, same "last qualifier wins" rule as BUC/holy-water',
    group: "Qualifier showcase",
  },
  {
    text: "2 amulet of yendor",
    label:
      "Not ambiguous -- deterministically the real amulet in wizard mode, the real game's own anti-cheat swap in normal play",
    group: "Qualifier showcase",
    wizard: true,
  },
  {
    text: "very heavy iron ball named hoei",
    label: "Named item + the parser's own worked example",
    group: "Qualifier showcase",
  },
  {
    text: "wand of striking (3) named Zapper",
    label: "Charges + named, in that order",
    group: "Qualifier showcase",
  },
  {
    text: "thoroughly rusty +0 long sword",
    label: 'Max erosion level via "thoroughly"',
    group: "Qualifier showcase",
  },
  {
    text: "potions called whisky",
    label: '"called" sets a player nickname for the type',
    group: "Qualifier showcase",
  },
  {
    text: "scrolls labeled QWERTY",
    label:
      '"labeled" sets the unidentified appearance -- but this tool (like the real game) can\'t know which real scroll a made-up label corresponds to this game, so it resolves to a random scroll',
    group: "Qualifier showcase",
    random: true,
  },
  {
    text: "2 scrolls labeled whatever",
    label:
      "Same mechanism plus quantity -- an arbitrary label never matches a real appearance, so this is a random scroll too, honoring the requested count of 2",
    group: "Qualifier showcase",
    random: true,
  },
  {
    text: "statue of a female gnome ruler",
    label: "Corpse/statue-of monster + gender extraction",
    group: "Qualifier showcase",
  },
  {
    text: "statue of Medusa",
    label:
      "Unlike corpse/tin/figurine, statues have no uniqueness restriction at all -- this works identically in wizard mode and normal play, no denial either way",
    group: "Qualifier showcase",
  },
  {
    text: "tin of spinach",
    label: "Special-cased tin contents",
    group: "Qualifier showcase",
  },
  {
    text: "potion of unholy water",
    label: '"unholy" as a beatitude synonym, inferred from a suffix',
    group: "Qualifier showcase",
  },

  // Randomness showcase -- wishes that resolve to something random rather than
  // the specific thing you might expect, each via a different mechanism.
  {
    text: "blessed",
    label:
      "No class/type at all -- fully random class (13-slot pool, food/spellbook 2x likely), then a rarity-weighted item within it",
    group: "Randomness showcase",
    random: true,
  },
  {
    text: "armor",
    label:
      "Class pinned down, no specific type -- rarity-weighted random item within the armor class",
    group: "Randomness showcase",
    random: true,
  },
  {
    text: "blessed potion",
    label:
      'Same as "armor", for potions -- BUC is honored, the specific potion is random',
    group: "Randomness showcase",
    random: true,
  },
  {
    text: "bag",
    label:
      "Exact class-phrase match (o_ranges) -- random within the bag sub-range (sack/oilskin sack/bag of holding/bag of tricks)",
    group: "Randomness showcase",
    random: true,
  },
  {
    text: "dragon scale mail",
    label:
      "No color given -- random dragon color (same monster-prefix-stripping machinery as the scroll-of-mail case)",
    group: "Randomness showcase",
    random: true,
  },
  {
    text: "glass",
    label:
      "No color given -- random pick among the 9 worthless-glass-gem colors",
    group: "Randomness showcase",
    random: true,
  },
  {
    text: "tin",
    label:
      "No monster named -- a tin always gets some random content at creation, never a blank one",
    group: "Randomness showcase",
    random: true,
  },
  {
    text: "figurine",
    label:
      "No monster named -- a figurine always gets some random (non-human) monster at creation, never a blank one",
    group: "Randomness showcase",
    random: true,
  },
  {
    text: "statue",
    label:
      "No monster named -- a statue always gets some random monster at creation too, never a blank one",
    group: "Randomness showcase",
    random: true,
  },

  // Bad luck showcase -- normal play only (wizard mode is immune to all
  // four of these); clicking sets the Luck input, not just the wish text.
  {
    text: "blessed fireproof +3 long sword",
    label:
      'Negative Luck hits three qualifiers at once in normal play: "blessed" is forced to cursed, +3 flips to -3, and "fireproof" is silently denied -- wizard mode is unaffected by all three',
    group: "Bad luck showcase",
    wizard: true,
    luck: -5,
  },

  // Wizard-only wishes -- these either only exist, or only give the real
  // thing, when wizard mode is on; normal play gets a mundane substitute
  // (or nothing at all).
  {
    text: "fire trap",
    label:
      'Terrain/trap wishes only exist in wizard mode -- normal play gets "Nothing fitting that description exists"',
    group: "Wizard only",
    wizard: true,
  },
  {
    text: "fountain",
    label: 'Same as "fire trap" -- creates a dungeon feature, wizard mode only',
    group: "Wizard only",
    wizard: true,
  },
  {
    text: "altar",
    label:
      "Same mechanism -- a wizard-only dungeon feature, not an inventory item",
    group: "Wizard only",
    wizard: true,
  },
  {
    text: "Candelabrum of Invocation",
    label:
      "The real thing only in wizard mode -- normal play silently substitutes a candle",
    group: "Wizard only",
    wizard: true,
  },
  {
    text: "Bell of Opening",
    label: "Real in wizard mode -- normal play substitutes a plain bell",
    group: "Wizard only",
    wizard: true,
  },
  {
    text: "Book of the Dead",
    label: "Real in wizard mode -- normal play substitutes a blank spellbook",
    group: "Wizard only",
    wizard: true,
  },

  // Other interesting wishes
  {
    text: "nothing",
    label: "Preserve wishless conduct",
    group: "Other interesting wishes",
  },
  {
    text: "0",
    label:
      "The display symbol for iron balls, not a broken quantity -- a working shorthand, deterministically an iron ball",
    group: "Other interesting wishes",
  },
  {
    text: "`",
    label:
      "The display symbol for large stones -- random between boulder and statue (statue is ~9x likelier)",
    group: "Other interesting wishes",
  },
  {
    text: "_",
    label:
      "The display symbol for chains -- deterministically an iron chain (the only wishable member of that class)",
    group: "Other interesting wishes",
  },

  // Everyday items
  {
    text: "blessed potion of object detection",
    label: "Common utility potion",
    group: "Everyday items",
  },
  {
    text: "uncursed ring of slow digestion",
    label: "Food-saving ring",
    group: "Everyday items",
  },
  {
    text: "blessed scroll of identify",
    label: "Common utility scroll",
    group: "Everyday items",
  },
  {
    text: "10000 gold pieces",
    label: "Gold short-circuit, capped at 5000 in normal play",
    group: "Everyday items",
    wizard: true,
  },
];

export const COMMON_WISH_GROUPS: string[] = Array.from(
  new Set(COMMON_WISHES.map((w) => w.group)),
);

export const COMMON_WISHES_BY_TEXT: Map<string, CommonWish> = new Map(
  COMMON_WISHES.map((w) => [w.text.trim().toLowerCase(), w]),
);

/**
 * A "greatest hits" cross-section shown up front, one per teaching category,
 * so a first-time visitor sees the range of what this tool demonstrates
 * without opening the full example list. Deliberately overlaps with entries
 * in COMMON_WISHES above -- referenced by text, not duplicated by hand, so
 * labels/groups can't drift out of sync.
 */
export const STARTER_WISHES: string[] = [
  "blessed greased +2 gray dragon scale mail", // practical: why people actually wish
  "blessed greased +2 gray dragon mail", // unexpected/broken: the scroll-of-mail surprise
  "3 uncursed poisoned darts", // poisoning: works
  "3 uncursed poisoned daggers", // poisoning: silently doesn't
  "fire trap", // wizard only
  "armor", // randomness
  "figuring of an archon", // typo -> random ring
  "potion of holy unholy water", // qualifier collision / precedence rule
  "blessed fireproof +3 long sword", // luck
  "blessed fireproof Platinum Yendorian Express Card", // denied as Tourist
];
