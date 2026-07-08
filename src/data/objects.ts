import type { ObjectDef } from '../parser/types';

/**
 * Hand-curated subset of NetHack's objects[] table (include/objects.h).
 * Not exhaustive (~450 real entries) -- covers every item referenced by the
 * curated "common wishes" examples plus a representative spread per class so
 * the parser has interesting, realistic paths to walk through. See the
 * ScopeNotice in the UI for what's intentionally left out.
 */
export const OBJECTS: ObjectDef[] = [
  // ---- Dragon scale mail (o_ranges "dragon scale mail" subrange) ----
  { otyp: 'GRAY_DRAGON_SCALE_MAIL', actualName: 'gray dragon scale mail', class: 'armor', prob: 2, cost: 2200, weight: 40, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: true, material: 'dragonhide', color: 'gray' },
  { otyp: 'SILVER_DRAGON_SCALE_MAIL', actualName: 'silver dragon scale mail', class: 'armor', prob: 2, cost: 2200, weight: 40, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: true, material: 'dragonhide', color: 'silver' },
  { otyp: 'RED_DRAGON_SCALE_MAIL', actualName: 'red dragon scale mail', class: 'armor', prob: 2, cost: 2200, weight: 40, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: true, material: 'dragonhide', color: 'red' },
  { otyp: 'WHITE_DRAGON_SCALE_MAIL', actualName: 'white dragon scale mail', class: 'armor', prob: 2, cost: 2200, weight: 40, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: true, material: 'dragonhide', color: 'white' },
  { otyp: 'ORANGE_DRAGON_SCALE_MAIL', actualName: 'orange dragon scale mail', class: 'armor', prob: 2, cost: 2200, weight: 40, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: true, material: 'dragonhide', color: 'orange' },
  { otyp: 'BLACK_DRAGON_SCALE_MAIL', actualName: 'black dragon scale mail', class: 'armor', prob: 2, cost: 2200, weight: 40, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: true, material: 'dragonhide', color: 'black' },
  { otyp: 'BLUE_DRAGON_SCALE_MAIL', actualName: 'blue dragon scale mail', class: 'armor', prob: 2, cost: 2200, weight: 40, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: true, material: 'dragonhide', color: 'blue' },
  { otyp: 'GREEN_DRAGON_SCALE_MAIL', actualName: 'green dragon scale mail', class: 'armor', prob: 2, cost: 2200, weight: 40, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: true, material: 'dragonhide', color: 'green' },
  { otyp: 'YELLOW_DRAGON_SCALE_MAIL', actualName: 'yellow dragon scale mail', class: 'armor', prob: 2, cost: 2200, weight: 40, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: true, material: 'dragonhide', color: 'yellow' },

  // ---- Other armor ----
  { otyp: 'CLOAK_OF_MAGIC_RESISTANCE', actualName: 'cloak of magic resistance', description: 'opera cloak', class: 'armor', prob: 25, cost: 1000, weight: 10, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'cloth', flammable: true },
  { otyp: 'LEATHER_ARMOR', actualName: 'leather armor', class: 'armor', prob: 100, cost: 5, weight: 150, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'leather', rottable: true },
  { otyp: 'STUDDED_LEATHER_ARMOR', actualName: 'studded leather armor', class: 'armor', prob: 100, cost: 15, weight: 200, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'leather', rustprone: true, rottable: true },
  { otyp: 'PLATE_MAIL', actualName: 'plate mail', description: 'shiny armor', class: 'armor', prob: 24, cost: 600, weight: 450, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: true, material: 'iron', rustprone: true },
  { otyp: 'MITHRIL_COAT', actualName: 'mithril-coat', class: 'armor', prob: 40, cost: 240, weight: 150, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'mithril' },
  { otyp: 'HELM_OF_BRILLIANCE', actualName: 'helm of brilliance', description: 'etched helmet', class: 'armor', prob: 40, cost: 50, weight: 50, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'iron', rustprone: true },
  { otyp: 'HELM_OF_TELEPATHY', actualName: 'helm of telepathy', description: 'etched helmet', class: 'armor', prob: 30, cost: 50, weight: 50, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'iron', rustprone: true },
  { otyp: 'GAUNTLETS_OF_POWER', actualName: 'gauntlets of power', description: 'old gloves', class: 'armor', prob: 40, cost: 50, weight: 30, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'iron', rustprone: true },
  { otyp: 'GAUNTLETS_OF_DEXTERITY', actualName: 'gauntlets of dexterity', description: 'old gloves', class: 'armor', prob: 40, cost: 50, weight: 30, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'leather' },
  { otyp: 'LEATHER_GLOVES', actualName: 'leather gloves', description: 'old gloves', class: 'armor', prob: 100, cost: 8, weight: 10, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'leather', rottable: true },
  { otyp: 'SPEED_BOOTS', actualName: 'speed boots', description: 'combat boots', class: 'armor', prob: 20, cost: 300, weight: 20, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'leather', rottable: true },
  { otyp: 'FUMBLE_BOOTS', actualName: 'fumble boots', description: 'combat boots', class: 'armor', prob: 20, cost: 300, weight: 20, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'leather', rottable: true },
  { otyp: 'AMULET_OF_LIFE_SAVING', actualName: 'amulet of life saving', class: 'amulet', prob: 15, cost: 150, weight: 20, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'AMULET_OF_REFLECTION', actualName: 'amulet of reflection', class: 'amulet', prob: 8, cost: 150, weight: 20, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'AMULET_OF_STRANGULATION', actualName: 'amulet of strangulation', class: 'amulet', prob: 10, cost: 150, weight: 20, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'AMULET_VERSUS_POISON', actualName: 'amulet versus poison', class: 'amulet', prob: 12, cost: 150, weight: 20, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'AMULET_OF_ESP', actualName: 'amulet of ESP', class: 'amulet', prob: 12, cost: 150, weight: 20, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'AMULET_OF_GUARDING', actualName: 'amulet of guarding', class: 'amulet', prob: 10, cost: 150, weight: 20, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'AMULET_OF_YENDOR', actualName: 'Amulet of Yendor', class: 'amulet', prob: 0, cost: 30000, weight: 20, stackable: false, chargeable: false, magic: true, unique: true, noWish: false, big: false, material: 'metal' },
  { otyp: 'FAKE_AMULET_OF_YENDOR', actualName: 'Amulet of Yendor', description: 'Amulet of Yendor', class: 'amulet', prob: 12, cost: 150, weight: 20, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'metal' },

  // ---- Rings ----
  { otyp: 'RING_OF_SLOW_DIGESTION', actualName: 'ring of slow digestion', class: 'ring', prob: 40, cost: 200, weight: 3, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'RING_OF_PROTECTION', actualName: 'ring of protection', class: 'ring', prob: 100, cost: 100, weight: 3, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'RING_OF_FREE_ACTION', actualName: 'ring of free action', class: 'ring', prob: 15, cost: 200, weight: 3, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'RING_OF_CONFLICT', actualName: 'ring of conflict', class: 'ring', prob: 15, cost: 300, weight: 3, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'RING_OF_INVISIBILITY', actualName: 'ring of invisibility', class: 'ring', prob: 30, cost: 100, weight: 3, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'metal' },

  // ---- Wands ----
  { otyp: 'WAN_WISHING', actualName: 'wand of wishing', class: 'wand', prob: 1, cost: 500, weight: 7, stackable: false, chargeable: true, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'WAN_STRIKING', actualName: 'wand of striking', class: 'wand', prob: 43, cost: 150, weight: 7, stackable: false, chargeable: true, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'WAN_DEATH', actualName: 'wand of death', class: 'wand', prob: 3, cost: 500, weight: 7, stackable: false, chargeable: true, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'WAN_DIGGING', actualName: 'wand of digging', class: 'wand', prob: 65, cost: 150, weight: 7, stackable: false, chargeable: true, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'WAN_POLYMORPH', actualName: 'wand of polymorph', class: 'wand', prob: 19, cost: 150, weight: 7, stackable: false, chargeable: true, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'WAN_SLEEP', actualName: 'wand of sleep', class: 'wand', prob: 45, cost: 150, weight: 7, stackable: false, chargeable: true, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'WAN_MAGIC_MISSILE', actualName: 'wand of magic missile', class: 'wand', prob: 55, cost: 175, weight: 7, stackable: false, chargeable: true, magic: true, unique: false, noWish: false, big: false, material: 'metal' },

  // ---- Tools ----
  { otyp: 'BAG_OF_HOLDING', actualName: 'bag of holding', class: 'tool', prob: 12, cost: 100, weight: 15, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'cloth', flammable: true },
  { otyp: 'BAG_OF_TRICKS', actualName: 'bag of tricks', class: 'tool', prob: 12, cost: 100, weight: 15, stackable: false, chargeable: true, magic: true, unique: false, noWish: false, big: false, material: 'cloth', flammable: true },
  { otyp: 'MAGIC_MARKER', actualName: 'magic marker', class: 'tool', prob: 10, cost: 150, weight: 2, stackable: false, chargeable: true, magic: true, unique: false, noWish: false, big: false, material: 'plastic' },
  { otyp: 'HORN_OF_PLENTY', actualName: 'horn of plenty', description: 'brass horn', class: 'tool', prob: 10, cost: 200, weight: 15, stackable: false, chargeable: true, magic: true, unique: false, noWish: false, big: false, material: 'copper', corrodible: true },
  { otyp: 'CRYSTAL_BALL', actualName: 'crystal ball', class: 'tool', prob: 10, cost: 3000, weight: 150, stackable: false, chargeable: true, magic: true, unique: false, noWish: false, big: false, material: 'glass' },
  { otyp: 'MAGIC_LAMP', actualName: 'magic lamp', description: 'oil lamp', class: 'tool', prob: 5, cost: 50, weight: 20, stackable: false, chargeable: true, magic: true, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'OIL_LAMP', actualName: 'oil lamp', class: 'tool', prob: 30, cost: 10, weight: 20, stackable: false, chargeable: true, magic: false, unique: false, noWish: false, big: false, material: 'metal' },
  { otyp: 'CANDELABRUM_OF_INVOCATION', actualName: 'Candelabrum of Invocation', description: 'candelabrum', class: 'tool', prob: 0, cost: 5000, weight: 20, stackable: false, chargeable: true, magic: true, unique: true, noWish: false, big: false, material: 'gold' },
  { otyp: 'WAX_CANDLE', actualName: 'wax candle', class: 'tool', prob: 33, cost: 10, weight: 2, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'wax', flammable: true },
  { otyp: 'BELL_OF_OPENING', actualName: 'Bell of Opening', description: 'silver bell', class: 'tool', prob: 0, cost: 5000, weight: 10, stackable: false, chargeable: false, magic: true, unique: true, noWish: false, big: false, material: 'silver' },
  { otyp: 'BELL', actualName: 'bell', description: 'silver bell', class: 'tool', prob: 2, cost: 100, weight: 10, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'silver' },
  { otyp: 'CREDIT_CARD', actualName: 'credit card', class: 'tool', prob: 12, cost: 10, weight: 1, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'plastic' },
  { otyp: 'LENSES', actualName: 'lenses', class: 'tool', prob: 5, cost: 10, weight: 3, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'glass' },
  { otyp: 'UNICORN_HORN', actualName: 'unicorn horn', class: 'tool', prob: 16, cost: 100, weight: 20, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'bone' },
  { otyp: 'PICK_AXE', actualName: 'pick-axe', class: 'tool', prob: 12, cost: 50, weight: 100, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: true, material: 'iron', rustprone: true },
  { otyp: 'SKELETON_KEY', actualName: 'skeleton key', class: 'tool', prob: 65, cost: 10, weight: 3, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'iron', rustprone: true },
  { otyp: 'LOCK_PICK', actualName: 'lock pick', class: 'tool', prob: 65, cost: 10, weight: 3, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'iron', rustprone: true },
  { otyp: 'TIN_OPENER', actualName: 'tin opener', class: 'tool', prob: 50, cost: 5, weight: 4, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'iron', rustprone: true },
  { otyp: 'TOWEL', actualName: 'towel', class: 'tool', prob: 32, cost: 50, weight: 1, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'cloth', flammable: true },
  { otyp: 'HEAVY_IRON_BALL', actualName: 'heavy iron ball', class: 'tool', prob: 20, cost: 10, weight: 480, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: true, material: 'iron', rustprone: true },
  { otyp: 'IRON_CHAIN', actualName: 'iron chain', class: 'tool', prob: 15, cost: 10, weight: 20, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'iron', rustprone: true },
  { otyp: 'FIGURINE', actualName: 'figurine', class: 'tool', prob: 20, cost: 40, weight: 10, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'wood', flammable: true },
  { otyp: 'STATUE', actualName: 'statue', class: 'tool', prob: 0, cost: 100, weight: 400, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: true, material: 'mineral' },

  // ---- Potions ----
  { otyp: 'POT_HEALING', actualName: 'potion of healing', class: 'potion', prob: 65, cost: 100, weight: 20, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'glass' },
  { otyp: 'POT_EXTRA_HEALING', actualName: 'potion of extra healing', class: 'potion', prob: 30, cost: 200, weight: 20, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'glass' },
  { otyp: 'POT_FULL_HEALING', actualName: 'potion of full healing', class: 'potion', prob: 9, cost: 400, weight: 20, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'glass' },
  { otyp: 'POT_GAIN_LEVEL', actualName: 'potion of gain level', class: 'potion', prob: 3, cost: 300, weight: 20, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'glass' },
  { otyp: 'POT_GAIN_ENERGY', actualName: 'potion of gain energy', class: 'potion', prob: 15, cost: 300, weight: 20, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'glass' },
  { otyp: 'POT_OBJECT_DETECTION', actualName: 'potion of object detection', class: 'potion', prob: 16, cost: 250, weight: 20, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'glass' },
  { otyp: 'POT_SPEED', actualName: 'potion of speed', class: 'potion', prob: 12, cost: 200, weight: 20, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'glass' },
  { otyp: 'POT_WATER', actualName: 'potion of water', class: 'potion', prob: 30, cost: 100, weight: 20, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'glass' },
  { otyp: 'POT_SICKNESS', actualName: 'potion of sickness', class: 'potion', prob: 45, cost: 50, weight: 20, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'glass' },
  { otyp: 'POT_BOOZE', actualName: 'potion of booze', class: 'potion', prob: 30, cost: 50, weight: 20, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'glass' },
  { otyp: 'POT_OIL', actualName: 'potion of oil', class: 'potion', prob: 8, cost: 250, weight: 20, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'glass' },

  // ---- Scrolls ----
  { otyp: 'SCR_IDENTIFY', actualName: 'scroll of identify', class: 'scroll', prob: 178, cost: 20, weight: 5, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'paper', flammable: true },
  { otyp: 'SCR_CHARGING', actualName: 'scroll of charging', class: 'scroll', prob: 26, cost: 100, weight: 5, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'paper', flammable: true },
  { otyp: 'SCR_ENCHANT_ARMOR', actualName: 'scroll of enchant armor', class: 'scroll', prob: 32, cost: 100, weight: 5, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'paper', flammable: true },
  { otyp: 'SCR_ENCHANT_WEAPON', actualName: 'scroll of enchant weapon', class: 'scroll', prob: 48, cost: 100, weight: 5, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'paper', flammable: true },
  { otyp: 'SCR_REMOVE_CURSE', actualName: 'scroll of remove curse', class: 'scroll', prob: 40, cost: 50, weight: 5, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'paper', flammable: true },
  { otyp: 'SCR_GENOCIDE', actualName: 'scroll of genocide', class: 'scroll', prob: 19, cost: 300, weight: 5, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'paper', flammable: true },
  { otyp: 'SCR_MAGIC_MAPPING', actualName: 'scroll of magic mapping', class: 'scroll', prob: 26, cost: 100, weight: 5, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'paper', flammable: true },
  { otyp: 'SCR_TELEPORTATION', actualName: 'scroll of teleportation', class: 'scroll', prob: 29, cost: 100, weight: 5, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'paper', flammable: true },
  { otyp: 'SCR_BLANK_PAPER', actualName: 'blank scroll', description: 'blank scroll', class: 'scroll', prob: 1, cost: 25, weight: 5, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'paper', flammable: true },
  { otyp: 'SCR_MAIL', actualName: 'scroll of mail', description: 'stamped scroll', class: 'scroll', prob: 0, cost: 0, weight: 5, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'paper', flammable: true },

  // ---- Spellbooks ----
  { otyp: 'SPE_BOOK_OF_THE_DEAD', actualName: 'Book of the Dead', class: 'spellbook', prob: 0, cost: 0, weight: 50, stackable: false, chargeable: false, magic: true, unique: true, noWish: false, big: false, material: 'paper', flammable: true },
  { otyp: 'SPE_IDENTIFY', actualName: 'spellbook of identify', class: 'spellbook', prob: 62, cost: 100, weight: 50, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'paper', flammable: true },
  { otyp: 'SPE_FINGER_OF_DEATH', actualName: 'spellbook of finger of death', class: 'spellbook', prob: 5, cost: 1000, weight: 50, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'paper', flammable: true },
  { otyp: 'SPE_MAGIC_MISSILE', actualName: 'spellbook of magic missile', class: 'spellbook', prob: 42, cost: 200, weight: 50, stackable: false, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'paper', flammable: true },
  { otyp: 'SPE_BLANK_PAPER', actualName: 'blank spellbook', description: 'blank spellbook', class: 'spellbook', prob: 1, cost: 25, weight: 50, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'paper', flammable: true },
  { otyp: 'SPE_NOVEL', actualName: 'paperback book', class: 'spellbook', prob: 0, cost: 0, weight: 50, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'paper', flammable: true },

  // ---- Weapons ----
  { otyp: 'LONG_SWORD', actualName: 'long sword', class: 'weapon', prob: 175, cost: 6, weight: 40, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'iron', rustprone: true },
  { otyp: 'DAGGER', actualName: 'dagger', class: 'weapon', prob: 292, cost: 4, weight: 10, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'iron', rustprone: true, poisonable: true },
  { otyp: 'CRYSKNIFE', actualName: 'crysknife', class: 'weapon', prob: 5, cost: 100, weight: 20, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'mineral' },
  { otyp: 'DWARVISH_MATTOCK', actualName: 'dwarvish mattock', class: 'weapon', prob: 10, cost: 50, weight: 120, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: true, material: 'iron', rustprone: true },
  { otyp: 'BULLWHIP', actualName: 'bullwhip', class: 'weapon', prob: 15, cost: 4, weight: 20, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'leather', rottable: true },
  { otyp: 'SILVER_SABER', actualName: 'silver saber', class: 'weapon', prob: 30, cost: 75, weight: 40, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'silver' },
  { otyp: 'ATHAME', actualName: 'athame', class: 'weapon', prob: 40, cost: 4, weight: 10, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'iron', rustprone: true },
  { otyp: 'AKLYS', actualName: 'aklys', class: 'weapon', prob: 30, cost: 4, weight: 15, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'iron', rustprone: true },
  { otyp: 'FLAIL', actualName: 'flail', class: 'weapon', prob: 100, cost: 4, weight: 15, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'iron', rustprone: true },
  { otyp: 'GLAIVE', actualName: 'glaive', class: 'weapon', prob: 52, cost: 6, weight: 150, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: true, material: 'iron', rustprone: true },
  { otyp: 'SHORT_SWORD', actualName: 'short sword', class: 'weapon', prob: 82, cost: 8, weight: 30, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'iron', rustprone: true },
  { otyp: 'BROADSWORD', actualName: 'broadsword', class: 'weapon', prob: 50, cost: 10, weight: 70, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'iron', rustprone: true },
  { otyp: 'KNIFE', actualName: 'knife', class: 'weapon', prob: 148, cost: 4, weight: 5, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'iron', rustprone: true, poisonable: true },

  // ---- Food ----
  { otyp: 'FOOD_RATION', actualName: 'food ration', class: 'food', prob: 750, cost: 25, weight: 20, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'organic' },
  { otyp: 'FORTUNE_COOKIE', actualName: 'fortune cookie', class: 'food', prob: 10, cost: 25, weight: 1, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'organic' },
  { otyp: 'CREAM_PIE', actualName: 'cream pie', class: 'food', prob: 10, cost: 15, weight: 10, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'organic' },
  { otyp: 'ORANGE', actualName: 'orange', class: 'food', prob: 12, cost: 5, weight: 4, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'organic' },
  { otyp: 'TIN', actualName: 'tin', class: 'food', prob: 45, cost: 5, weight: 10, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'iron', rustprone: true },
  { otyp: 'CORPSE', actualName: 'corpse', class: 'food', prob: 0, cost: 0, weight: 0, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'organic' },
  { otyp: 'GLOB_OF_GRAY_OOZE', actualName: 'glob of gray ooze', class: 'food', prob: 0, cost: 0, weight: 200, stackable: false, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'organic', isGlobSource: true },
  { otyp: 'EGG', actualName: 'egg', class: 'food', prob: 12, cost: 5, weight: 1, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'organic' },
  { otyp: 'SLIME_MOLD', actualName: 'slime mold', class: 'food', prob: 8, cost: 10, weight: 5, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'organic' },
  { otyp: 'LEMBAS_WAFER', actualName: 'lembas wafer', class: 'food', prob: 20, cost: 10, weight: 5, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'organic' },

  // ---- Gems / stones ----
  { otyp: 'DIAMOND', actualName: 'diamond', class: 'gem', prob: 15, cost: 4000, weight: 1, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'mineral', color: 'white' },
  { otyp: 'RUBY', actualName: 'ruby', class: 'gem', prob: 15, cost: 3500, weight: 1, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'mineral', color: 'red' },
  { otyp: 'EMERALD', actualName: 'emerald', class: 'gem', prob: 15, cost: 3000, weight: 1, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'mineral', color: 'green' },
  { otyp: 'SAPPHIRE', actualName: 'sapphire', class: 'gem', prob: 15, cost: 2500, weight: 1, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'mineral', color: 'blue' },
  { otyp: 'LUCKSTONE', actualName: 'luckstone', class: 'gem', prob: 16, cost: 60, weight: 10, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'mineral', color: 'gray' },
  { otyp: 'LOADSTONE', actualName: 'loadstone', class: 'gem', prob: 16, cost: 60, weight: 500, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'mineral', color: 'gray' },
  { otyp: 'TOUCHSTONE', actualName: 'touchstone', class: 'gem', prob: 12, cost: 50, weight: 10, stackable: true, chargeable: false, magic: true, unique: false, noWish: false, big: false, material: 'mineral', color: 'blue' },
  { otyp: 'FLINT', actualName: 'flint stone', class: 'gem', prob: 8, cost: 1, weight: 10, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'mineral', color: 'gray' },
  { otyp: 'WORTHLESS_PIECE_OF_GLASS', actualName: 'worthless piece of glass', class: 'gem', prob: 0, cost: 0, weight: 1, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'glass' },

  // ---- Coin ----
  { otyp: 'GOLD_PIECE', actualName: 'gold piece', class: 'coin', prob: 0, cost: 1, weight: 1, stackable: true, chargeable: false, magic: false, unique: false, noWish: false, big: false, material: 'gold' },
];

export const OBJECTS_BY_OTYP: Map<string, ObjectDef> = new Map(
  OBJECTS.map((o) => [o.otyp, o])
);

export const DRAGON_SCALE_MAIL_COLORS = [
  'gray',
  'silver',
  'red',
  'white',
  'orange',
  'black',
  'blue',
  'green',
  'yellow',
] as const;
