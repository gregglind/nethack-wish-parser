export type ObjClass =
  | 'weapon'
  | 'armor'
  | 'ring'
  | 'amulet'
  | 'tool'
  | 'food'
  | 'potion'
  | 'scroll'
  | 'spellbook'
  | 'wand'
  | 'coin'
  | 'gem'
  | 'rock';

export type Material =
  | 'wood'
  | 'leather'
  | 'cloth'
  | 'iron'
  | 'metal'
  | 'silver'
  | 'copper'
  | 'gold'
  | 'glass'
  | 'mineral'
  | 'paper'
  | 'plastic'
  | 'bone'
  | 'dragonhide'
  | 'mithril'
  | 'wax'
  | 'organic';

export type Gender = 'male' | 'female' | 'neuter';
export type GlobSize = 'small' | 'medium' | 'large' | 'very large';

/** Mirrors struct _readobjnam_data (objnam.c:13-33) field-for-field. */
export interface ParseState {
  input: string;
  origInput: string;
  fruitbuf: string;

  oclass: ObjClass | null;
  un: string | null; // "called" name -> oc_uname
  dn: string | null; // "labeled" name -> oc_descr
  actualn: string | null; // real object name candidate
  name: string | null; // "named" personal name
  otyp: string | null; // resolved object type id

  cnt: number;
  spe: number;
  spesgn: 1 | -1;
  spesgnExplicit: boolean;
  very: boolean;
  rechrg: number;

  blessed: boolean;
  uncursed: boolean;
  iscursed: boolean;

  ispoisoned: boolean;
  isgreased: boolean;

  eroded: number; // 0-3
  eroded2: number; // 0-3
  erodeproof: boolean;

  locked: boolean;
  unlocked: boolean;
  broken: boolean;
  open: boolean;
  closed: boolean;
  doorless: boolean;
  looted: boolean;

  real: boolean;
  fake: boolean;
  halfeaten: boolean;

  mntmp: string | null; // monster type (corpse/statue/figurine/tin/glob/egg)
  mgend: Gender | null;
  contents: 'empty' | 'spinach' | null;

  islit: boolean;
  unlabeled: boolean;
  ishistoric: boolean;
  isdiluted: boolean;
  trapped: 0 | 1 | 2; // 0 unset, 1 trapped (wizard only), 2 untrapped

  wetness: number;
  gsize: GlobSize | null;
  ftype: string | null; // fruit name (slime mold)
  zombify: boolean;

  isArtifact: boolean;
  artifactName: string | null;

  /** Wizard-mode-only terrain/trap wish match (not an inventory object). */
  terrainMatch: { kind: 'trap' | 'terrain'; name: string; note: string } | null;
}

export type PipelineStage =
  | 'makewish'
  | 'init'
  | 'preparse'
  | 'charges'
  | 'postparse1'
  | 'postparse2'
  | 'postparse3'
  | 'construction'
  | 'terrainTrap'
  | 'quantity'
  | 'enchantment'
  | 'typeSpecific'
  | 'buc'
  | 'erosion'
  | 'artifact'
  | 'finalize';

export type StepCategory =
  | 'lex'
  | 'lookup'
  | 'construct'
  | 'resolve-random'
  | 'finalize';

export interface SourceRef {
  file: string; // relative to NetHack repo root, e.g. "src/objnam.c"
  startLine: number;
  endLine: number;
  functionName: string;
}

export interface RngNote {
  description: string;
  wizardOutcome: string;
  normalModeProbability?: number; // 0-1, when expressible as a single number
  normalModeOutcomeDescription: string;
}

export interface ParseStep {
  id: string;
  stage: PipelineStage;
  title: string;
  matched: boolean;
  inputBefore: string;
  inputAfter: string;
  stateDiff: Partial<ParseState>;
  sourceRef: SourceRef;
  category: StepCategory;
  rngNote?: RngNote;
  notes?: string[];
}

export interface RenderedObjectField {
  label: string;
  value: string;
}

export interface RenderedObject {
  xname: string;
  fields: RenderedObjectField[];
}

export interface WishResult {
  input: string;
  steps: ParseStep[];
  wizardObject: RenderedObject;
  normalObject: RenderedObject;
  failed: boolean;
  failureReason?: string;
}

export interface ObjectDef {
  otyp: string;
  actualName: string;
  description?: string;
  plural?: string;
  class: ObjClass;
  prob: number;
  cost: number;
  weight: number;
  stackable: boolean;
  chargeable: boolean;
  magic: boolean;
  unique: boolean;
  noWish: boolean;
  big: boolean;
  material: Material;
  isArtifact?: boolean;
  isGlobSource?: boolean;
  color?: string;
  /** erosion susceptibility */
  rustprone?: boolean;
  flammable?: boolean;
  corrodible?: boolean;
  rottable?: boolean;
  poisonable?: boolean;
  permapoisoned?: boolean;
}

export const ROLES = [
  'Archeologist', 'Barbarian', 'Caveman', 'Healer', 'Knight', 'Monk',
  'Priest', 'Ranger', 'Rogue', 'Samurai', 'Tourist', 'Valkyrie', 'Wizard',
] as const;
export type Role = (typeof ROLES)[number];

export interface ArtifactDef {
  name: string;
  baseOtyp: string;
  alignment: 'lawful' | 'neutral' | 'chaotic' | 'unaligned';
  isQuestArtifact: boolean;
  /** Only set for quest artifacts -- the one role whose quest artifact this is (questpgr.c's is_quest_artifact()). */
  role?: Role;
}

export interface MonsterDef {
  name: string;
  plural?: string;
  hasCorpse: boolean;
  isUnique: boolean;
  isHuman: boolean;
  oviparous: boolean;
  isDragon: boolean;
  isPudding: boolean;
  genocidable: boolean;
}
