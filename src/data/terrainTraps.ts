/**
 * Wizard-mode-only terrain/trap wishes, from wizterrainwish() (src/objnam.c,
 * pinned commit) and the bear-trap/land-mine disambiguation in
 * readobjnam_postparse1(). Only ever consulted when no ordinary object/class
 * matched the wish text and the game is in wizard mode -- in normal play
 * the identical text just fails to match anything ("Nothing fitting that
 * description exists").
 */

/** Checked in order: wish text must START WITH the keyword (case-insensitive). */
export const TRAP_KEYWORDS: { keyword: string; name: string }[] = [
  { keyword: 'arrow trap', name: 'arrow trap' },
  { keyword: 'dart trap', name: 'dart trap' },
  { keyword: 'falling rock trap', name: 'falling rock trap' },
  { keyword: 'squeaky board', name: 'squeaky board' },
  { keyword: 'rolling boulder trap', name: 'rolling boulder trap' },
  { keyword: 'sleeping gas trap', name: 'sleeping gas trap' },
  { keyword: 'rust trap', name: 'rust trap' },
  { keyword: 'fire trap', name: 'fire trap' },
  { keyword: 'spiked pit', name: 'spiked pit' },
  { keyword: 'pit', name: 'pit' },
  { keyword: 'hole', name: 'hole (or rock trap if there is no level below)' },
  { keyword: 'trap door', name: 'trap door (or rock trap if there is no level below)' },
  { keyword: 'teleportation trap', name: 'teleportation trap' },
  { keyword: 'level teleporter', name: 'level teleporter' },
  { keyword: 'magic portal', name: 'magic portal to nowhere' },
  { keyword: 'web', name: 'web' },
  { keyword: 'statue trap', name: 'statue trap' },
  { keyword: 'anti magic trap', name: 'anti-magic field' },
  { keyword: 'anti-magic', name: 'anti-magic field' },
  { keyword: 'magic trap', name: 'magic trap' },
  { keyword: 'polymorph trap', name: 'polymorph trap' },
  { keyword: 'vibrating square', name: 'vibrating square' },
];

/** Checked in order: wish text must END WITH the keyword (case-insensitive). Longer/more specific first. */
export const TERRAIN_KEYWORDS: { keyword: string; name: string }[] = [
  { keyword: 'wall of water', name: 'wall of water' },
  { keyword: 'wall of lava', name: 'wall of lava' },
  { keyword: 'molten lava', name: 'lava pool' },
  { keyword: 'lava', name: 'lava pool' },
  { keyword: 'secret door', name: 'secret door' },
  { keyword: 'doorway', name: 'doorless doorway' },
  { keyword: 'door', name: 'door' },
  { keyword: 'secret corridor', name: 'secret corridor (only where a corridor already exists)' },
  { keyword: 'magic fountain', name: 'blessed fountain' },
  { keyword: 'fountain', name: 'fountain' },
  { keyword: 'throne', name: 'throne' },
  { keyword: 'sink', name: 'sink' },
  { keyword: 'moat', name: 'moat' },
  { keyword: 'pool', name: 'pool (not near a drawbridge)' },
  { keyword: 'ice', name: 'ice' },
  { keyword: 'altar', name: 'altar' },
  { keyword: 'headstone', name: 'grave' },
  { keyword: 'grave', name: 'grave' },
  { keyword: 'tree', name: 'tree' },
  { keyword: 'iron bars', name: 'iron bars' },
  { keyword: 'bars', name: 'iron bars' },
  { keyword: 'cloud', name: 'cloud' },
  { keyword: 'wall', name: 'wall (auto-oriented horizontal/vertical)' },
  { keyword: 'floor', name: 'room floor (only over existing room/furniture/ice/pool/lava)' },
  { keyword: 'ground', name: 'room floor (only over existing room/furniture/ice/pool/lava)' },
  { keyword: 'room', name: 'room floor (only over existing room/furniture/ice/pool/lava)' },
];

/** Door/trap-state prefixes parsed earlier in readobjnam_preparse(); reused here for the message. */
export function doorStateNote(state: {
  trapped: 0 | 1 | 2;
  locked: boolean;
  unlocked: boolean;
  broken: boolean;
  open: boolean;
  closed: boolean;
  doorless: boolean;
  looted: boolean;
}): string | null {
  if (state.trapped === 1) return 'trapped';
  if (state.trapped === 2) return 'untrapped';
  if (state.locked) return 'locked';
  if (state.unlocked) return 'unlocked';
  if (state.broken) return 'broken';
  if (state.open) return 'open';
  if (state.closed) return 'closed';
  if (state.doorless) return 'doorless';
  if (state.looted) return 'looted/disturbed';
  return null;
}
