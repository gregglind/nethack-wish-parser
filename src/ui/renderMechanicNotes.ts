import { escapeHtml } from './domHelpers';

interface NoteTopic {
  title: string;
  points: string[];
  code?: string;
}

const LUCK_CODE = `luck < 0 && !wizard                    // BUC forced cursed
spe > 2 && luck < 0                    // enchantment flip
erodeproof && ... && (luck >= 0 || wizard)  // erodeproofing denied
mode === 'wizard' || luck >= 0         // poison denied`;

const TOPICS: NoteTopic[] = [
  {
    title: 'Luck',
    points: [
      'Only the <em>sign</em> matters for wish-time effects, not the magnitude -- Luck -1 and Luck -13 do exactly the same thing (force cursed, flip enchantment, deny erodeproofing/poison). Luck matters by degree elsewhere in the game (prayer, trap detection), just not here.',
      'All four effects are normal-play only -- wizard mode is immune to every one of them, regardless of Luck.',
    ],
    code: LUCK_CODE,
  },
  {
    title: 'Wizard mode',
    points: [
      'Quest artifacts are only <em>unconditionally</em> denied for your own role. Wishing for a different role\'s quest artifact in normal play rolls the exact same odds as any ordinary (non-quest) artifact -- set the Role selector to see the difference.',
      '"amulet of yendor" (singular) is deterministic: the real amulet in wizard mode, silently swapped for the fake in normal play. Terrain/trap wishes and the Candelabrum/Bell/Book of the Dead work the same way -- real (or existing at all) only in wizard mode.',
    ],
  },
  {
    title: 'Poison',
    points: [
      'Only thrown ammo (arrows, crossbow bolts, darts, shuriken, boomerangs) can be poisoned. Daggers, spears, and javelins can\'t -- "poisoned" is silently dropped no matter how you ask.',
    ],
  },
  {
    title: 'Monster-name matching',
    points: [
      'A monster name recognized right after "of" gets stripped along with everything that follows it, regardless of what came before "of" -- and regardless of whether the word before it makes any sense. That\'s how a typo like "figuring of an archon" (meant to be "figurine") ends up giving a random ring instead of a figurine, and how "gray dragon mail" (missing "scale") coincidentally resolves to a scroll of mail.',
      'Pluralizing "amulet of yendor" to "amulets of yendor" breaks its usual determinism into a genuine 50/50 real-or-fake gamble, even in wizard mode.',
    ],
  },
  {
    title: 'Tins & figurines',
    points: [
      'Never left blank. An unspecified, unrecognized, or otherwise-invalid monster substitutes a real random one -- matching how the object actually gets its contents the moment it\'s created, not a placeholder.',
    ],
  },
];

const MARKER_LEGEND: { icon: string; label: string }[] = [
  { icon: '✗', label: 'Broken -- fails outright, or gives a wrong/unrelated/silently-degraded result' },
  { icon: '🧙', label: 'Wizard only -- the wizard-vs-normal split is the whole point of this example' },
  { icon: '🎲', label: 'Random -- this result genuinely varies by RNG roll; Reroll can change it' },
  { icon: '🍀N', label: 'Clicking this chip also sets the Luck input to N' },
  { icon: '🎭Role', label: "Clicking this chip also sets the Role selector -- this is that role's own quest artifact" },
];

export function renderMechanicNotes(): string {
  const topics = TOPICS.map(
    (t) => `<div class="note-topic">
      <h4>${t.title}</h4>
      <ul>${t.points.map((p) => `<li>${p}</li>`).join('')}</ul>
      ${t.code ? `<pre class="note-code"><code>${escapeHtml(t.code)}</code></pre>` : ''}
    </div>`
  ).join('');

  const legend = `<div class="note-topic">
    <h4>Chip markers</h4>
    <ul>${MARKER_LEGEND.map((m) => `<li><span class="legend-icon">${m.icon}</span> ${m.label}</li>`).join('')}</ul>
  </div>`;

  return `<details class="mechanic-notes">
    <summary>Notes on tricky mechanics</summary>
    ${legend}
    ${topics}
  </details>`;
}
