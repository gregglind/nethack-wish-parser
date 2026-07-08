export function renderScopeNotice(): string {
  return `<details class="scope-notice">
    <summary>What this tool simplifies</summary>
    <ul>
      <li>Custom bones-file fruit names aren't reproducible from a bare string (there's no persistent game state to read); only the default "slime mold" is recognized.</li>
      <li>Pluralization uses a heuristic + exception list, not NetHack's exact <code>makesingular()</code> -- a handful of irregular monster plurals may look slightly off.</li>
      <li>The seeded PRNG here illustrates probabilities -- it is not a reimplementation of NetHack's own RNG, and does not reproduce any specific real game's rolls.</li>
      <li>Luck can't be derived from wish text, so it defaults to 0 -- set it manually with the Luck field to see how it shifts BUC, enchantment sign, erosion-proofing, and poison probabilities.</li>
      <li>Wizard-mode terrain/trap wishes create a dungeon feature or floor trap, not an inventory object -- shown as a description rather than the full object field-dump.</li>
      <li>The curated object database (~140 items) covers every class and every item referenced by the example wishes, but is not the full ~450-object table.</li>
    </ul>
  </details>`;
}
