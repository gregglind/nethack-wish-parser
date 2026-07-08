import type { SourceRef } from './types';

/**
 * Pinned to the NetHack 5.0.0 release tag (NetHack-5.0.0_Release), commit
 * 16ff59115315917b93185d026aeefea06db9b0f4 (2026-05-02) on
 * https://github.com/NetHack/NetHack -- a real, citable release rather than
 * an arbitrary development commit. Every line range below was checked
 * against this exact commit with `grep -n` on the literal tokens being
 * cited. Sub-branch ranges inside the big dispatcher functions are accurate
 * to within ~1-3 lines (blank lines/comments); re-verify with the same
 * technique (or `just update-nethack`) if a newer release should be pinned.
 */
export const NETHACK_COMMIT = '16ff59115315917b93185d026aeefea06db9b0f4';
export const NETHACK_VERSION = 'NetHack 5.0.0';
export const NETHACK_TREE_URL = `https://github.com/NetHack/NetHack/tree/${NETHACK_COMMIT}`;

export function permalink(ref: SourceRef): string {
  return `https://github.com/NetHack/NetHack/blob/${NETHACK_COMMIT}/${ref.file}#L${ref.startLine}-L${ref.endLine}`;
}

function ref(
  file: string,
  startLine: number,
  endLine: number,
  functionName: string
): SourceRef {
  return { file, startLine, endLine, functionName };
}

export const SOURCE_REFS = {
  makewish: ref('src/zap.c', 6314, 6422, 'makewish'),
  readobjnamInit: ref('src/objnam.c', 3933, 3963, 'readobjnam_init'),
  preparseLoop: ref('src/objnam.c', 3966, 4175, 'readobjnam_preparse'),
  preparseArticleQuantity: ref('src/objnam.c', 3978, 3988, 'readobjnam_preparse'),
  preparseEnchantment: ref('src/objnam.c', 3989, 3996, 'readobjnam_preparse'),
  preparseBlessed: ref('src/objnam.c', 3997, 3999, 'readobjnam_preparse'),
  preparseCursed: ref('src/objnam.c', 4000, 4002, 'readobjnam_preparse'),
  preparseUncursed: ref('src/objnam.c', 4003, 4004, 'readobjnam_preparse'),
  preparseErodeproof: ref('src/objnam.c', 4005, 4013, 'readobjnam_preparse'),
  preparseLit: ref('src/objnam.c', 4014, 4021, 'readobjnam_preparse'),
  preparseWetness: ref('src/objnam.c', 4022, 4029, 'readobjnam_preparse'),
  preparseUnlabeled: ref('src/objnam.c', 4030, 4033, 'readobjnam_preparse'),
  preparsePoisoned: ref('src/objnam.c', 4034, 4037, 'readobjnam_preparse'),
  preparseTrapped: ref('src/objnam.c', 4038, 4046, 'readobjnam_preparse'),
  preparseLockState: ref('src/objnam.c', 4047, 4066, 'readobjnam_preparse'),
  preparseLooted: ref('src/objnam.c', 4067, 4071, 'readobjnam_preparse'),
  preparseGreased: ref('src/objnam.c', 4072, 4073, 'readobjnam_preparse'),
  preparseZombifying: ref('src/objnam.c', 4074, 4075, 'readobjnam_preparse'),
  preparseIntensity: ref('src/objnam.c', 4076, 4080, 'readobjnam_preparse'),
  preparseErodedBucket1: ref('src/objnam.c', 4081, 4087, 'readobjnam_preparse'),
  preparseErodedBucket2: ref('src/objnam.c', 4088, 4091, 'readobjnam_preparse'),
  preparsePartlyEaten: ref('src/objnam.c', 4092, 4094, 'readobjnam_preparse'),
  preparseHistoric: ref('src/objnam.c', 4095, 4096, 'readobjnam_preparse'),
  preparseDiluted: ref('src/objnam.c', 4097, 4098, 'readobjnam_preparse'),
  preparseEmpty: ref('src/objnam.c', 4099, 4100, 'readobjnam_preparse'),
  preparseGlobSize: ref('src/objnam.c', 4101, 4124, 'readobjnam_preparse'),
  preparseRealFake: ref('src/objnam.c', 4125, 4135, 'readobjnam_preparse'),
  preparseGender: ref('src/objnam.c', 4136, 4148, 'readobjnam_preparse'),
  preparseCorpseOfLookahead: ref('src/objnam.c', 4149, 4172, 'readobjnam_preparse'),

  parseCharges: ref('src/objnam.c', 4178, 4239, 'readobjnam_parse_charges'),

  postparse1: ref('src/objnam.c', 4240, 4665, 'readobjnam_postparse1'),
  postparse1Named: ref('src/objnam.c', 4253, 4257, 'readobjnam_postparse1'),
  postparse1Called: ref('src/objnam.c', 4258, 4273, 'readobjnam_postparse1'),
  postparse1Labeled: ref('src/objnam.c', 4274, 4277, 'readobjnam_postparse1'),
  postparse1Spinach: ref('src/objnam.c', 4278, 4311, 'readobjnam_postparse1'),
  postparse1Glob: ref('src/objnam.c', 4312, 4447, 'readobjnam_postparse1'),
  postparse1Singular: ref('src/objnam.c', 4448, 4488, 'readobjnam_postparse1'),
  postparse1DragonScales: ref('src/objnam.c', 4483, 4488, 'readobjnam_postparse1'),
  postparse1HolyWater: ref('src/objnam.c', 4489, 4501, 'readobjnam_postparse1'),
  postparse1Paperback: ref('src/objnam.c', 4502, 4532, 'readobjnam_postparse1'),
  postparse1Gold: ref('src/objnam.c', 4533, 4548, 'readobjnam_postparse1'),
  postparse1ClassSymbol: ref('src/objnam.c', 4549, 4567, 'readobjnam_postparse1'),
  postparse1ClassName: ref('src/objnam.c', 4568, 4665, 'readobjnam_postparse1'),

  postparse2: ref('src/objnam.c', 4666, 4726, 'readobjnam_postparse2'),
  postparse2ORanges: ref('src/objnam.c', 4670, 4676, 'readobjnam_postparse2'),
  postparse2StoneGem: ref('src/objnam.c', 4677, 4682, 'readobjnam_postparse2'),
  postparse2Glass: ref('src/objnam.c', 4683, 4726, 'readobjnam_postparse2'),

  postparse3: ref('src/objnam.c', 4727, 4909, 'readobjnam_postparse3'),
  postparse3GemScan: ref('src/objnam.c', 4727, 4748, 'readobjnam_postparse3'),
  postparse3MainLookup: ref('src/objnam.c', 4749, 4762, 'wishymatch / rnd_otyp_by_namedesc'),
  postparse3ArmorMailRetry: ref('src/objnam.c', 4774, 4781, 'readobjnam_postparse3'),
  postparse3Fruit: ref('src/objnam.c', 4787, 4875, 'readobjnam_postparse3'),
  postparse3Artifact: ref('src/objnam.c', 4876, 4895, 'readobjnam_postparse3'),

  objectConstruction: ref('src/objnam.c', 4994, 5041, 'readobjnam (any:/typfnd:)'),
  quantity: ref('src/objnam.c', 5042, 5093, 'readobjnam'),
  enchantment: ref('src/objnam.c', 5094, 5122, 'readobjnam'),
  typeSpecificSpe: ref('src/objnam.c', 5123, 5204, 'readobjnam'),
  corpsenmFinalize: ref('src/objnam.c', 5205, 5257, 'readobjnam'),
  buc: ref('src/objnam.c', 5258, 5270, 'readobjnam'),
  erosion: ref('src/objnam.c', 5271, 5294, 'readobjnam'),
  recharge: ref('src/objnam.c', 5295, 5298, 'readobjnam'),
  poison: ref('src/objnam.c', 5299, 5308, 'readobjnam'),
  trapped: ref('src/objnam.c', 5309, 5311, 'readobjnam'),
  emptyContainer: ref('src/objnam.c', 5312, 5319, 'readobjnam'),
  naming: ref('src/objnam.c', 5344, 5361, 'readobjnam'),
  artifactDenial: ref('src/objnam.c', 5373, 5382, 'readobjnam'),
  finalWeight: ref('src/objnam.c', 5390, 5398, 'readobjnam'),

  wizterrainwish: ref('src/objnam.c', 3583, 3945, 'wizterrainwish'),
  wiztrapLabel: ref('src/objnam.c', 5004, 5009, 'readobjnam (wiztrap:)'),
  japaneseItems: ref('src/objnam.c', 105, 120, 'Japanese_items[]'),

  constants: ref('include/obj.h', 49, 129, 'SPE_LIM / MAX_ERODE'),
} satisfies Record<string, SourceRef>;
