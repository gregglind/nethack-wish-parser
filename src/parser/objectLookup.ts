import { OBJECTS } from '../data/objects';
import { fuzzyEquals, invertOf } from './utils';
import type { ObjectDef, ObjClass } from './types';
import type { Rng } from './rng';

function nameMatches(o: ObjectDef, name: string): boolean {
  if (fuzzyEquals(o.actualName, name)) return true;
  const inv = invertOf(o.actualName);
  if (inv && fuzzyEquals(inv, name)) return true;
  if (o.description && fuzzyEquals(o.description, name)) return true;
  if (!name.toLowerCase().includes(' of ')) {
    const partial = o.actualName.split(' of ')[1];
    if (partial && fuzzyEquals(partial, name)) return true;
    const dpartial = o.description?.split(' of ')[1];
    if (dpartial && fuzzyEquals(dpartial, name)) return true;
  }
  return false;
}

export interface LookupResult {
  obj: ObjectDef;
  candidates: ObjectDef[];
}

/** Mirrors rnd_otyp_by_namedesc()/wishymatch(): fuzzy match, weighted-random if ambiguous. */
export function findFuzzy(name: string, oclass: ObjClass | null, rng: Rng): LookupResult | undefined {
  const trimmed = name.trim();
  if (!trimmed) return undefined;
  const pool = OBJECTS.filter((o) => !oclass || o.class === oclass);
  const candidates = pool.filter((o) => nameMatches(o, trimmed));
  if (!candidates.length) return undefined;
  if (candidates.length === 1) return { obj: candidates[0], candidates };
  const obj = rng.weightedPick(candidates, (o) => Math.max(o.prob, 1));
  return { obj, candidates };
}

export function byOtyp(otyp: string): ObjectDef | undefined {
  return OBJECTS.find((o) => o.otyp === otyp);
}
