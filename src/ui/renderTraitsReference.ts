import { escapeHtml } from './domHelpers';

interface Trait {
  words: string;
  effect: string;
}

interface TraitGroup {
  title: string;
  traits: Trait[];
}

const GROUPS: TraitGroup[] = [
  {
    title: 'Beatitude & enchantment',
    traits: [
      { words: 'blessed, holy', effect: 'Beatitude: blessed.' },
      { words: 'cursed, unholy', effect: 'Beatitude: cursed.' },
      { words: 'uncursed', effect: 'Beatitude: uncursed.' },
      { words: '+N / -N', effect: 'Enchantment (or charge count for wands/tools).' },
    ],
  },
  {
    title: 'Erosion',
    traits: [
      { words: 'rustproof, fireproof, corrodeproof, rotproof, erodeproof, fixed, tempered, crackproof', effect: "All the same one flag -- NetHack doesn't track which erosion type is being protected against." },
      { words: 'rusty / rusted, burnt / burned, cracked', effect: 'Erosion level 1 (rust/burn/crack bucket).' },
      { words: 'corroded, rotted', effect: 'Erosion level 1 (corrode/rot bucket) -- a separate counter from rust/burn/crack.' },
      { words: 'very, thoroughly', effect: 'Intensifies the next erosion word to level 3 (max) instead of 1.' },
    ],
  },
  {
    title: 'Quantity & identity',
    traits: [
      { words: 'a, an, the', effect: 'Article -- "a"/"an" pins quantity to 1.' },
      { words: '(a number)', effect: 'Requested quantity -- see the Quantity section above for how often it\'s actually honored.' },
      { words: 'named X', effect: 'Personal name (or artifact name, if X matches one).' },
      { words: 'called X', effect: 'Player-assigned nickname for the whole object type, not just this one item.' },
      { words: 'labeled X', effect: "Sets the unidentified appearance -- doesn't identify a real scroll/potion from a made-up label." },
      { words: '(N) or (N:M)', effect: 'Charge count (and recharge count) for wands and chargeable tools.' },
    ],
  },
  {
    title: 'Monster-based objects',
    traits: [
      { words: 'X <type>, <type> of X', effect: 'Monster type for corpse/statue/figurine/tin/egg -- see the Monster-name matching section above for the stripping mechanics.' },
      { words: 'female, male, neuter', effect: 'Gender prefix on the monster name.' },
    ],
  },
  {
    title: 'Per-class flags',
    traits: [
      { words: 'poisoned', effect: 'Only thrown ammo (arrows/bolts/darts/shuriken/boomerangs) can actually take this.' },
      { words: 'greased', effect: 'Slippery -- resists sticking/stealing.' },
      { words: 'lit, burning / unlit, extinguished', effect: 'Lit state for candles and lamps.' },
      { words: 'moist / wet', effect: 'Wetness for towels -- moist rolls 1-2, wet rolls 3-5.' },
      { words: 'unlabeled, unlabelled, blank', effect: 'Blank scroll or spellbook.' },
      { words: 'diluted', effect: 'Diluted potion.' },
      { words: 'empty', effect: 'Empty tin/container -- but see the Tins & figurines section: some contents are never actually blank.' },
      { words: 'partly eaten, partially eaten', effect: 'Half-eaten food.' },
      { words: 'small/medium/large/very large glob', effect: 'Glob size (puddings and similar).' },
      { words: 'historic', effect: 'Historic flag on certain special items.' },
      { words: 'real / fake, cheap, plastic, imitation', effect: 'Authenticity synonyms -- only meaningfully changes anything for the Amulet of Yendor.' },
      { words: 'zombifying', effect: 'Wizard-mode-only: turns a corpse wish into its zombie monster instead.' },
    ],
  },
  {
    title: 'Containers, doors & traps (wizard mode)',
    traits: [
      { words: 'locked, unlocked, broken, open, closed, doorless', effect: 'Container/door state.' },
      { words: 'looted, disturbed', effect: 'Box/chest looted flag.' },
      { words: 'trapped', effect: 'Only honored in wizard mode -- silently ignored in normal play.' },
      { words: 'untrapped', effect: 'Honored in both modes.' },
    ],
  },
];

export function renderTraitsReference(): string {
  const groups = GROUPS.map(
    (g) => `<div class="note-topic">
      <h4>${escapeHtml(g.title)}</h4>
      <table class="traits-table">
        ${g.traits
          .map(
            (t) =>
              `<tr><td>${escapeHtml(t.words)}</td><td>${escapeHtml(t.effect)}</td></tr>`,
          )
          .join('')}
      </table>
    </div>`,
  ).join('');

  return `<details class="mechanic-notes traits-reference">
    <summary>Every wish qualifier (trait) this tool recognizes</summary>
    <p class="traits-intro">Every keyword <code>readobjnam()</code> matches while walking through a wish string, grouped by what it affects. Not every trait applies to every object class -- e.g. "poisoned" only sticks to thrown ammo.</p>
    ${groups}
  </details>`;
}
