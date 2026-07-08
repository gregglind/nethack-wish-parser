export function renderScopeNotice(): string {
  return `<details class="scope-notice">
    <summary>What this tool simplifies</summary>
    <ul>
      <li>Wizard-mode terrain/trap wishes (bear traps, land mines, dungeon features) are not modeled.</li>
      <li>Japanese item name aliases (wakizashi, ninja-to, etc.) are not modeled.</li>
      <li>The full ~400-monster roster is not included -- corpses/statues/figurines/eggs use a curated ~50-monster subset.</li>
      <li>Custom bones-file fruit names aren't reproducible from a bare string; only the default "slime mold" is recognized.</li>
      <li>The full ~46-artifact roster is not included -- a curated subset of ~20 is modeled.</li>
      <li>Pluralization uses a heuristic + exception list, not NetHack's exact <code>makesingular()</code>.</li>
      <li>The seeded PRNG here illustrates probabilities -- it is not a reimplementation of NetHack's own RNG, and does not reproduce any specific real game's rolls.</li>
      <li>Luck is assumed to be 0 (it can't be derived from wish text); real Luck (-13..13) shifts several of the probabilities shown here.</li>
    </ul>
  </details>`;
}
