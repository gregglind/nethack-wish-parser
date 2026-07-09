import type { ParseState, RenderedObject } from './types';
import type { Buc } from './bucAssignment';
import { byOtyp } from './objectLookup';
import { article } from './utils';

export interface FinalFields {
  otyp: string | null;
  quan: number;
  spe: number;
  buc: Buc;
  eroded: number;
  eroded2: number;
  erodeproof: boolean;
  greased: boolean;
  poisoned: boolean;
  mntmp: string | null;
  mgend: ParseState['mgend'];
  halfeaten: boolean;
  rechrg: number;
  isArtifact: boolean;
  artifactName: string | null;
  name: string | null;
  un: string | null;
  color: string | undefined;
  contents: ParseState['contents'];
  rejected: string | null;
  /** Chest/large box only -- undefined means "not specified", not "false". */
  locked?: boolean;
  broken?: boolean;
  /** Chest/large box/tin only -- undefined means "not specified". */
  trapped?: boolean;
}

const ERODE_WORDS_1 = ['', 'rusty', 'very rusty', 'thoroughly rusty'];
const ERODE_WORDS_1_BURN = ['', 'burnt', 'very burnt', 'thoroughly burnt'];
const ERODE_WORDS_2 = ['', 'corroded', 'very corroded', 'thoroughly corroded'];

function erosionWord(level: number, flammable: boolean | undefined): string {
  const words = flammable ? ERODE_WORDS_1_BURN : ERODE_WORDS_1;
  return words[Math.min(level, 3)];
}

export function renderObject(fields: FinalFields): RenderedObject {
  if (fields.rejected) {
    return {
      xname: fields.rejected,
      fields: [{ label: 'Result', value: 'Wish denied' }],
    };
  }
  if (!fields.otyp) {
    return {
      xname: 'Nothing fitting that description exists.',
      fields: [{ label: 'Result', value: 'Parse failed -- no matching object' }],
    };
  }

  const def = byOtyp(fields.otyp);
  const parts: string[] = [];

  const quan = Math.max(fields.quan, 1);
  const isPlural = quan > 1 && def?.stackable;

  if (quan > 1 && def?.stackable) {
    parts.push(String(quan));
  } else if (!fields.isArtifact) {
    parts.push(article(fields.buc));
  }

  parts.push(fields.buc);
  if (fields.greased) parts.push('greased');
  if (fields.eroded) parts.push(erosionWord(fields.eroded, def?.flammable));
  if (fields.eroded2) parts.push(ERODE_WORDS_2[Math.min(fields.eroded2, 3)]);
  if (fields.poisoned) parts.push('poisoned');
  if (fields.halfeaten) parts.push('partly eaten');

  // Enchantment is shown as a "+N" prefix only for armor/weapon/ring; wands
  // and other chargeable tools show the same underlying field as "(N)" /
  // "(N:M)" charges instead, never both (spe and charges share one struct
  // field in the real game).
  const enchantablePrefix = def && (def.class === 'armor' || def.class === 'weapon' || def.class === 'ring');
  if (enchantablePrefix && fields.spe !== 0) {
    parts.push(`${fields.spe >= 0 ? '+' : ''}${fields.spe}`);
  }

  let baseName = def?.actualName ?? fields.otyp;
  if (fields.otyp === 'TIN' && fields.contents === 'spinach') {
    baseName = `tin of spinach`;
  } else if (fields.contents === 'empty' && def) {
    baseName = `empty ${baseName}`;
  }
  if (fields.mntmp && fields.otyp === 'TIN') {
    // "tin of X meat" -- a different construction than corpse/statue/figurine/egg's "X <type>" (eat.c tin_details()).
    baseName = `tin of ${fields.mntmp} meat`;
  } else if (fields.mntmp && (fields.otyp === 'CORPSE' || fields.otyp === 'STATUE' || fields.otyp === 'FIGURINE' || fields.otyp === 'EGG')) {
    const genderPrefix = fields.mgend ? `${fields.mgend} ` : '';
    baseName = `${genderPrefix}${fields.mntmp} ${baseName}`;
  }
  const nameIndex = parts.length;
  parts.push(baseName ?? fields.otyp);

  if (fields.erodeproof && def && (def.rustprone || def.flammable || def.corrodible || def.rottable || fields.otyp === 'CRYSKNIFE')) {
    const proofWord = def.rustprone ? 'rustproof' : def.flammable ? 'fireproof' : def.corrodible ? 'corrodeproof' : 'rotproof';
    parts.push(`(${proofWord})`);
  }

  if (def?.chargeable) {
    parts.push(fields.rechrg ? `(${fields.rechrg}:${fields.spe})` : `(${fields.spe})`);
  }

  if (isPlural) {
    const words = parts[nameIndex].split(' ');
    // "tin of X meat" has its head noun first ("tin"), but the
    // monster-prefixed corpse/statue/figurine/egg construction
    // ("giant ant egg") has it last -- pluralize whichever word is
    // actually the noun, not always the first word of the phrase.
    const pluralIndex = fields.otyp === 'TIN' ? 0 : words.length - 1;
    words[pluralIndex] = pluralize(words[pluralIndex]);
    parts[nameIndex] = words.join(' ');
  }

  let xname = parts.filter(Boolean).join(' ');

  if (fields.isArtifact && fields.artifactName) {
    xname = `${xname} named ${fields.artifactName}`;
  } else if (fields.name) {
    xname = `${xname} named ${fields.name}`;
  } else if (fields.un) {
    xname = `${xname} called ${fields.un}`;
  }

  const renderedFields: RenderedObject['fields'] = [
    { label: 'Object type', value: fields.otyp },
    { label: 'Quantity', value: String(quan) },
    { label: 'Beatitude', value: fields.buc },
    { label: 'Enchantment / charges', value: def ? `${fields.spe >= 0 ? '+' : ''}${fields.spe}` : 'n/a' },
    { label: 'Erosion (rust/burn/crack)', value: String(fields.eroded) },
    { label: 'Erosion (corrode/rot)', value: String(fields.eroded2) },
    { label: 'Erosion-proof', value: String(fields.erodeproof) },
    { label: 'Greased', value: String(fields.greased) },
    { label: 'Poisoned', value: String(fields.poisoned) },
    { label: 'Artifact', value: fields.isArtifact ? fields.artifactName ?? 'yes' : 'no' },
  ];
  if (fields.mntmp) renderedFields.push({ label: 'Monster type', value: fields.mntmp });
  if (def?.chargeable) renderedFields.push({ label: 'Recharges', value: String(fields.rechrg) });
  if (fields.locked !== undefined) renderedFields.push({ label: 'Locked', value: String(fields.locked) });
  if (fields.broken !== undefined) renderedFields.push({ label: 'Broken', value: String(fields.broken) });
  if (fields.trapped !== undefined) renderedFields.push({ label: 'Trapped', value: String(fields.trapped) });

  return { xname, fields: renderedFields };
}

function pluralize(word: string): string {
  if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) return word.slice(0, -1) + 'ies';
  if (/(s|x|z|ch|sh)$/i.test(word)) return word + 'es';
  return word + 's';
}
