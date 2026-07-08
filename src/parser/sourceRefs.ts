import type { SourceRef } from './types';

/**
 * Every line range below was checked against this exact commit of
 * https://github.com/NetHack/NetHack (branch NetHack-5.0) with
 * `grep -n` on the literal tokens being cited. Sub-branch ranges inside
 * the big dispatcher functions are accurate to within ~1-2 lines (blank
 * lines/comments); re-verify with the same technique if upstream moves.
 */
export const NETHACK_COMMIT = 'ac151181d2e5f322a0f0e5c7f36c3859aa55161c';

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
  makewish: ref('src/zap.c', 6327, 6436, 'makewish'),
  readobjnamInit: ref('src/objnam.c', 3961, 3990, 'readobjnam_init'),
  preparseLoop: ref('src/objnam.c', 3994, 4204, 'readobjnam_preparse'),
  preparseArticleQuantity: ref('src/objnam.c', 4007, 4017, 'readobjnam_preparse'),
  preparseEnchantment: ref('src/objnam.c', 4018, 4025, 'readobjnam_preparse'),
  preparseBlessed: ref('src/objnam.c', 4026, 4028, 'readobjnam_preparse'),
  preparseCursed: ref('src/objnam.c', 4029, 4031, 'readobjnam_preparse'),
  preparseUncursed: ref('src/objnam.c', 4032, 4033, 'readobjnam_preparse'),
  preparseErodeproof: ref('src/objnam.c', 4034, 4042, 'readobjnam_preparse'),
  preparseLit: ref('src/objnam.c', 4043, 4049, 'readobjnam_preparse'),
  preparseWetness: ref('src/objnam.c', 4051, 4057, 'readobjnam_preparse'),
  preparseUnlabeled: ref('src/objnam.c', 4059, 4062, 'readobjnam_preparse'),
  preparsePoisoned: ref('src/objnam.c', 4063, 4066, 'readobjnam_preparse'),
  preparseTrapped: ref('src/objnam.c', 4067, 4075, 'readobjnam_preparse'),
  preparseLockState: ref('src/objnam.c', 4076, 4095, 'readobjnam_preparse'),
  preparseLooted: ref('src/objnam.c', 4096, 4100, 'readobjnam_preparse'),
  preparseGreased: ref('src/objnam.c', 4101, 4102, 'readobjnam_preparse'),
  preparseZombifying: ref('src/objnam.c', 4103, 4104, 'readobjnam_preparse'),
  preparseIntensity: ref('src/objnam.c', 4105, 4109, 'readobjnam_preparse'),
  preparseErodedBucket1: ref('src/objnam.c', 4110, 4116, 'readobjnam_preparse'),
  preparseErodedBucket2: ref('src/objnam.c', 4117, 4120, 'readobjnam_preparse'),
  preparsePartlyEaten: ref('src/objnam.c', 4121, 4123, 'readobjnam_preparse'),
  preparseHistoric: ref('src/objnam.c', 4124, 4125, 'readobjnam_preparse'),
  preparseDiluted: ref('src/objnam.c', 4126, 4127, 'readobjnam_preparse'),
  preparseEmpty: ref('src/objnam.c', 4128, 4129, 'readobjnam_preparse'),
  preparseGlobSize: ref('src/objnam.c', 4130, 4153, 'readobjnam_preparse'),
  preparseRealFake: ref('src/objnam.c', 4154, 4164, 'readobjnam_preparse'),
  preparseGender: ref('src/objnam.c', 4165, 4177, 'readobjnam_preparse'),
  preparseCorpseOfLookahead: ref('src/objnam.c', 4179, 4195, 'readobjnam_preparse'),

  parseCharges: ref('src/objnam.c', 4206, 4266, 'readobjnam_parse_charges'),

  postparse1: ref('src/objnam.c', 4268, 4692, 'readobjnam_postparse1'),
  postparse1Named: ref('src/objnam.c', 4282, 4286, 'readobjnam_postparse1'),
  postparse1Called: ref('src/objnam.c', 4287, 4299, 'readobjnam_postparse1'),
  postparse1Labeled: ref('src/objnam.c', 4300, 4306, 'readobjnam_postparse1'),
  postparse1Spinach: ref('src/objnam.c', 4307, 4372, 'readobjnam_postparse1'),
  postparse1Glob: ref('src/objnam.c', 4373, 4476, 'readobjnam_postparse1'),
  postparse1Singular: ref('src/objnam.c', 4477, 4508, 'readobjnam_postparse1'),
  postparse1DragonScales: ref('src/objnam.c', 4509, 4517, 'readobjnam_postparse1'),
  postparse1HolyWater: ref('src/objnam.c', 4518, 4531, 'readobjnam_postparse1'),
  postparse1Paperback: ref('src/objnam.c', 4532, 4561, 'readobjnam_postparse1'),
  postparse1Gold: ref('src/objnam.c', 4562, 4577, 'readobjnam_postparse1'),
  postparse1ClassSymbol: ref('src/objnam.c', 4578, 4583, 'readobjnam_postparse1'),
  postparse1ClassName: ref('src/objnam.c', 4584, 4692, 'readobjnam_postparse1'),

  postparse2: ref('src/objnam.c', 4694, 4753, 'readobjnam_postparse2'),
  postparse2ORanges: ref('src/objnam.c', 4700, 4705, 'readobjnam_postparse2'),
  postparse2StoneGem: ref('src/objnam.c', 4706, 4713, 'readobjnam_postparse2'),
  postparse2Glass: ref('src/objnam.c', 4714, 4753, 'readobjnam_postparse2'),

  postparse3: ref('src/objnam.c', 4755, 4928, 'readobjnam_postparse3'),
  postparse3GemScan: ref('src/objnam.c', 4755, 4768, 'readobjnam_postparse3'),
  postparse3MainLookup: ref('src/objnam.c', 4778, 4790, 'wishymatch / rnd_otyp_by_namedesc'),
  postparse3ArmorMailRetry: ref('src/objnam.c', 4820, 4840, 'readobjnam_postparse3'),
  postparse3Fruit: ref('src/objnam.c', 4870, 4900, 'readobjnam_postparse3'),
  postparse3Artifact: ref('src/objnam.c', 4901, 4918, 'readobjnam_postparse3'),

  objectConstruction: ref('src/objnam.c', 5023, 5066, 'readobjnam (any:/typfnd:)'),
  quantity: ref('src/objnam.c', 5068, 5113, 'readobjnam'),
  enchantment: ref('src/objnam.c', 5123, 5149, 'readobjnam'),
  typeSpecificSpe: ref('src/objnam.c', 5152, 5218, 'readobjnam'),
  corpsenmFinalize: ref('src/objnam.c', 5220, 5282, 'readobjnam'),
  buc: ref('src/objnam.c', 5284, 5297, 'readobjnam'),
  erosion: ref('src/objnam.c', 5299, 5317, 'readobjnam'),
  recharge: ref('src/objnam.c', 5319, 5325, 'readobjnam'),
  poison: ref('src/objnam.c', 5327, 5334, 'readobjnam'),
  trapped: ref('src/objnam.c', 5335, 5339, 'readobjnam'),
  emptyContainer: ref('src/objnam.c', 5340, 5351, 'readobjnam'),
  naming: ref('src/objnam.c', 5375, 5395, 'readobjnam'),
  artifactDenial: ref('src/objnam.c', 5400, 5410, 'readobjnam'),
  finalWeight: ref('src/objnam.c', 5424, 5428, 'readobjnam'),

  constants: ref('include/obj.h', 49, 129, 'SPE_LIM / MAX_ERODE'),
} satisfies Record<string, SourceRef>;
