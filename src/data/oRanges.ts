/**
 * Curated subset of o_ranges[] (objnam.c:3375-3397) -- exact-match class
 * words that resolve to a weighted-random otyp within a named subrange,
 * rather than a single object.
 */
export const O_RANGES: Record<string, string[]> = {
  bag: ['BAG_OF_HOLDING', 'BAG_OF_TRICKS'],
  lamp: ['OIL_LAMP', 'MAGIC_LAMP'],
  helm: ['HELM_OF_BRILLIANCE', 'HELM_OF_TELEPATHY'],
  helmet: ['HELM_OF_BRILLIANCE', 'HELM_OF_TELEPATHY'],
  gloves: ['LEATHER_GLOVES', 'GAUNTLETS_OF_POWER', 'GAUNTLETS_OF_DEXTERITY'],
  gauntlets: ['LEATHER_GLOVES', 'GAUNTLETS_OF_POWER', 'GAUNTLETS_OF_DEXTERITY'],
  boots: ['SPEED_BOOTS', 'FUMBLE_BOOTS'],
  shoes: ['SPEED_BOOTS', 'FUMBLE_BOOTS'],
  'dragon scale mail': [
    'GRAY_DRAGON_SCALE_MAIL',
    'SILVER_DRAGON_SCALE_MAIL',
    'RED_DRAGON_SCALE_MAIL',
    'WHITE_DRAGON_SCALE_MAIL',
    'ORANGE_DRAGON_SCALE_MAIL',
    'BLACK_DRAGON_SCALE_MAIL',
    'BLUE_DRAGON_SCALE_MAIL',
    'GREEN_DRAGON_SCALE_MAIL',
    'YELLOW_DRAGON_SCALE_MAIL',
  ],
  sword: ['LONG_SWORD', 'SHORT_SWORD', 'BROADSWORD', 'SILVER_SABER'],
};
