export interface CommonWish {
  text: string;
  label: string;
  group: string;
}

/**
 * Curated from nethackwiki.com/wiki/Wish#Common_wishes (Strategy > Common
 * wishes, and Customization sections), fetched via a Wayback Machine mirror.
 */
export const COMMON_WISHES: CommonWish[] = [
  // Dragon scale mail
  { text: 'blessed greased +2 gray dragon scale mail', label: 'Magic resistance (early game staple)', group: 'Dragon scale mail' },
  { text: 'blessed greased +2 silver dragon scale mail', label: 'Reflection (early game staple)', group: 'Dragon scale mail' },
  { text: 'blessed greased fireproof +2 cloak of magic resistance', label: "Chaotic Monk's magic resistance option", group: 'Dragon scale mail' },

  // Quest artifacts
  { text: 'blessed rustproof Eye of the Aethiopica', label: 'Neutral: magic resistance + energy regen + telepathy', group: 'Quest artifacts' },
  { text: 'blessed fireproof Platinum Yendorian Express Card', label: 'Neutral: magic resistance + telepathy + charging', group: 'Quest artifacts' },
  { text: 'blessed Eyes of the Overworld', label: 'Neutral: astral vision + magic resistance', group: 'Quest artifacts' },
  { text: 'blessed Orb of Fate', label: 'Neutral: half physical/spell damage', group: 'Quest artifacts' },

  // Wand of wishing strategy
  { text: '2 blessed scrolls of charging', label: 'Recharge a wand of wishing with unknown charges', group: 'Wand-of-wishing strategy' },
  { text: 'uncursed magic marker', label: 'Write your own blessed scrolls of charging', group: 'Wand-of-wishing strategy' },
  { text: 'blessed amulet of life saving', label: 'Classic early wand-of-wishing pick', group: 'Wand-of-wishing strategy' },
  { text: 'blessed +2 speed boots', label: 'Classic early wand-of-wishing pick', group: 'Wand-of-wishing strategy' },

  // Qualifier showcase
  { text: 'the blessed +1 gray dragon scale mail', label: 'Article + BUC + enchantment + color', group: 'Qualifier showcase' },
  { text: '3 uncursed poisoned daggers', label: 'Quantity + BUC + poisoned + stackable weapon', group: 'Qualifier showcase' },
  { text: 'very heavy iron ball named hoei', label: "Named item + the parser's own worked example", group: 'Qualifier showcase' },
  { text: 'wand of striking (3) named Zapper', label: 'Charges + named, in that order', group: 'Qualifier showcase' },
  { text: 'thoroughly rusty +0 long sword', label: 'Max erosion level via "thoroughly"', group: 'Qualifier showcase' },
  { text: 'potions called whisky', label: '"called" sets a player nickname for the type', group: 'Qualifier showcase' },
  { text: 'scrolls labeled QWERTY', label: '"labeled" sets the unidentified appearance', group: 'Qualifier showcase' },
  { text: 'statue of a female gnome ruler', label: 'Corpse/statue-of monster + gender extraction', group: 'Qualifier showcase' },
  { text: 'tin of spinach', label: 'Special-cased tin contents', group: 'Qualifier showcase' },
  { text: 'potion of unholy water', label: '"unholy" as a beatitude synonym, inferred from a suffix', group: 'Qualifier showcase' },

  // Nothing / edge cases
  { text: 'nothing', label: 'Preserve wishless conduct', group: 'Edge cases' },
  { text: '0', label: "A literal \"0\" isn't treated as a quantity", group: 'Edge cases' },
  { text: 'broken glass', label: 'Deliberately not a real item', group: 'Edge cases' },
  { text: 'paperback spellbook', label: 'Deliberately rejected combination', group: 'Edge cases' },

  // Everyday items
  { text: 'blessed potion of object detection', label: 'Common utility potion', group: 'Everyday items' },
  { text: 'uncursed ring of slow digestion', label: 'Food-saving ring', group: 'Everyday items' },
  { text: 'blessed scroll of identify', label: 'Common utility scroll', group: 'Everyday items' },
  { text: '5000 gold pieces', label: 'Gold short-circuit, capped at 5000 in normal play', group: 'Everyday items' },
];

export const COMMON_WISH_GROUPS: string[] = Array.from(
  new Set(COMMON_WISHES.map((w) => w.group))
);
