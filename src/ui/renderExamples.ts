import {
  COMMON_WISHES,
  COMMON_WISH_GROUPS,
  COMMON_WISHES_BY_TEXT,
  STARTER_WISHES,
  type CommonWish,
} from "../data/commonWishes";
import { escapeHtml } from "./domHelpers";

function renderChip(wish: CommonWish): string {
  const markers = [
    wish.wizard
      ? '<span class="chip-marker chip-marker--wizard" aria-label="Wizard only">🧙</span>'
      : "",
    wish.broken
      ? '<span class="chip-marker chip-marker--broken" aria-label="Broken">✗</span>'
      : "",
    wish.random
      ? '<span class="chip-marker chip-marker--random" aria-label="Random">🎲</span>'
      : "",
  ].join("");
  const luckmarker =
    wish.luck !== undefined
      ? `<span class="chip-marker chip-marker--luck" aria-label="Sets Luck to ${wish.luck}">🍀${wish.luck}</span>`
      : "";
  const rolemarker = wish.role
    ? `<span class="chip-marker chip-marker--role" aria-label="Sets Role to ${wish.role}">🎭${wish.role}</span>`
    : "";

  const classes = [
    "chip",
    wish.broken ? "chip--broken" : "",
    wish.wizard ? "chip--wizard" : "",
    wish.random ? "chip--random" : "",
    wish.luck !== undefined ? "chip--luck" : "",
    wish.role ? "chip--role" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const luckAttr = wish.luck !== undefined ? ` data-luck="${wish.luck}"` : "";
  const roleAttr = wish.role ? ` data-role="${wish.role}"` : "";
  return `<button type="button" class="${classes}" data-wish="${escapeHtml(wish.text)}"${luckAttr}${roleAttr} title="${escapeHtml(wish.label)}">${markers}${escapeHtml(wish.text)} ${luckmarker} ${rolemarker}</button>`;
}

/** The always-visible "greatest hits" strip -- one per teaching category, shown above the full (toggleable) example groups. */
export function renderStarterStrip(): string {
  const chips = STARTER_WISHES.map((text) =>
    COMMON_WISHES_BY_TEXT.get(text.toLowerCase()),
  )
    .filter((w): w is NonNullable<typeof w> => !!w)
    .map((w) => renderChip(w))
    .join("");
  return `<div class="starter-strip">${chips}</div>`;
}

/** One-sentence explanation of what each curated group is demonstrating, shown via an info icon next to its heading. */
const GROUP_DESCRIPTIONS: Record<string, string> = {
  "Dragon scale mail":
    "Classic early wishes for the strongest armor most players ever get, one per popular color.",
  "Quest artifacts":
    "Your own role's quest artifact -- normally earned on the quest, not handed out by a wish. Clicking these chips also sets the Role selector so the denial actually shows up in normal play.",
  "Wand-of-wishing strategy":
    "Efficient picks when you only have one or two wishes to spend.",
  "Qualifier showcase":
    "Deterministic, if non-obvious, precedence rules -- each resolves consistently, just not necessarily to what you'd first guess.",
  "Randomness showcase":
    "Wishes that resolve to something random rather than one specific thing, via several different mechanisms (random class, random-within-class, an o_ranges sub-range, glass color, tin/figurine creation-time content).",
  "Wizard only":
    "Either don't exist at all outside wizard mode, or silently substitute a mundane item in normal play.",
  "Other interesting wishes":
    "Single-character class symbols and other odds and ends worth knowing about.",
  "Unexpected and Broken":
    "Looks reasonable, but silently fails to deliver what was asked -- no error, no warning, just the wrong (or no) result.",
  "Bad luck showcase":
    "Negative Luck silently denies qualifiers in normal play (forces cursed, flips high enchantment negative, denies erodeproofing/poison) -- wizard mode is immune to all of it. Clicking these chips also sets the Luck input.",
  "Everyday items":
    "Common, unremarkable wand-of-wishing picks for routine play.",
  "Eggs":
    "Egg wishes only work when the monster is both recognized and actually oviparous -- an unrecognized name fails outright rather than falling back to something generic, unlike corpses/tins/figurines/statues.",
};

export function renderExamples(): string {
  return COMMON_WISH_GROUPS.map((group) => {
    const items = COMMON_WISHES.filter((w) => w.group === group);
    const description = GROUP_DESCRIPTIONS[group];
    return `<div class="example-group">
      <div class="example-group-title">
        <span>${escapeHtml(group)}</span>
        ${description ? `<button type="button" class="info-icon" aria-expanded="false" aria-label="What this section demonstrates">&#9432;</button>` : ""}
      </div>
      ${description ? `<div class="group-description" hidden>${escapeHtml(description)}</div>` : ""}
      <div class="example-chips">
        ${items.map((w) => renderChip(w)).join("")}
      </div>
    </div>`;
  }).join("");
}
