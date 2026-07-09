import { COMMON_WISHES, COMMON_WISH_GROUPS, COMMON_WISHES_BY_TEXT, STARTER_WISHES, type CommonWish } from '../data/commonWishes';
import { escapeHtml } from './domHelpers';

function renderChip(wish: CommonWish): string {
  const marker = wish.broken ? '<span class="chip-marker chip-marker--broken" aria-label="Broken">✗</span>' : wish.wizard ? '<span class="chip-marker chip-marker--wizard" aria-label="Wizard only">🧙</span>' : '';
  const classes = ['chip', wish.broken ? 'chip--broken' : '', wish.wizard ? 'chip--wizard' : ''].filter(Boolean).join(' ');
  return `<button type="button" class="${classes}" data-wish="${escapeHtml(wish.text)}" title="${escapeHtml(wish.label)}">${marker}${escapeHtml(wish.text)}</button>`;
}

/** The always-visible "greatest hits" strip -- one per teaching category, shown above the full (toggleable) example groups. */
export function renderStarterStrip(): string {
  const chips = STARTER_WISHES.map((text) => COMMON_WISHES_BY_TEXT.get(text.toLowerCase()))
    .filter((w): w is NonNullable<typeof w> => !!w)
    .map((w) => renderChip(w))
    .join('');
  return `<div class="starter-strip">${chips}</div>`;
}

/** One-sentence explanation of what each curated group is demonstrating, shown via an info icon next to its heading. */
const GROUP_DESCRIPTIONS: Record<string, string> = {
  'Dragon scale mail': 'Classic early wishes for the strongest armor most players ever get, one per popular color.',
  'Quest artifacts': "Your own role's quest artifact -- normally earned on the quest, not handed out by a wish.",
  'Wand-of-wishing strategy': 'Efficient picks when you only have one or two wishes to spend.',
  'Qualifier showcase': "Deterministic, if non-obvious, precedence rules -- each resolves consistently, just not necessarily to what you'd first guess.",
  'Randomness showcase': 'Wishes that resolve to something random rather than one specific thing, via five different mechanisms (random class, random-within-class, an o_ranges sub-range, glass color, tin content).',
  'Wizard only': "Either don't exist at all outside wizard mode, or silently substitute a mundane item in normal play.",
  'Other interesting wishes': 'Single-character class symbols and other odds and ends worth knowing about.',
  'Unexpected and Broken': 'Looks reasonable, but silently fails to deliver what was asked -- no error, no warning, just the wrong (or no) result.',
  'Everyday items': 'Common, unremarkable wand-of-wishing picks for routine play.',
};

export function renderExamples(): string {
  return COMMON_WISH_GROUPS.map((group) => {
    const items = COMMON_WISHES.filter((w) => w.group === group);
    const description = GROUP_DESCRIPTIONS[group];
    return `<div class="example-group">
      <div class="example-group-title">
        <span>${escapeHtml(group)}</span>
        ${description ? `<button type="button" class="info-icon" aria-expanded="false" aria-label="What this section demonstrates">&#9432;</button>` : ''}
      </div>
      ${description ? `<div class="group-description" hidden>${escapeHtml(description)}</div>` : ''}
      <div class="example-chips">
        ${items.map((w) => renderChip(w)).join('')}
      </div>
    </div>`;
  }).join('');
}
