import { runWishPipeline } from "./parser/pipeline";
import {
  readUrlState,
  writeUrlState,
  shareUrl,
  DEFAULT_LUCK,
  type AppState,
} from "./urlState";
import { renderTimeline } from "./ui/renderTimeline";
import { renderResultPanel } from "./ui/renderResult";
import { renderExamples, renderStarterStrip } from "./ui/renderExamples";
import { renderScopeNotice } from "./ui/renderScopeNotice";
import { renderMechanicNotes } from "./ui/renderMechanicNotes";
import { renderTraitsReference } from "./ui/renderTraitsReference";
import { escapeHtml, qs } from "./ui/domHelpers";
import { NETHACK_VERSION, NETHACK_TREE_URL } from "./parser/sourceRefs";
import { ROLES } from "./parser/types";
import { COMMON_WISHES_BY_TEXT } from "./data/commonWishes";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <header class="site-header">
    <h1> Nethack Wish Commands Explained (${escapeHtml(NETHACK_VERSION)})</h1>
    <p class="tagline">
      Type a
      <a href="https://nethackwiki.com/wiki/NetHack" target="_blank" rel="noopener noreferrer" title="NetHackWiki: NetHack">Nethack</a>
      <a href="https://nethackwiki.com/wiki/Wish" target="_blank" rel="noopener noreferrer" title="NetHackWiki: Wish" class="tagline-wish-link"><code>#wish</code></a>
      string and see exactly how NetHack's real parser
      (<code>readobjnam()</code> in <code>src/objnam.c</code>) would walk through it,
      step by step, with links back to the source.
    </p>
  </header>

  <section class="input-section">
    <div class="input-row">
      <input id="wish-input" type="text" placeholder="e.g. blessed greased +2 gray dragon scale mail" autocomplete="off" spellcheck="false" />
      <label class="wizard-toggle">
        <input id="wizard-toggle" type="checkbox" />
        <span>Wizard mode primary</span>
      </label>
      <label class="luck-input" title="Luck can't be derived from wish text -- set it manually. Shifts several normal-play probabilities (BUC, enchantment sign, erosion-proofing, poison).">
        <span>Luck</span>
        <input id="luck-input" type="number" min="-13" max="13" step="1" value="10" />
      </label>
      <label class="role-input" title="Only affects quest artifact wishes in normal play -- your own role's quest artifact is always denied, any other role's just rolls the same generic odds as an ordinary artifact.">
        <span>Role</span>
        <select id="role-input">
          <option value="">(none selected)</option>
          ${ROLES.map((r) => `<option value="${r}">${r}</option>`).join("")}
        </select>
      </label>
      <button id="copy-link" type="button" title="Copy a shareable link to this exact parse">Copy link</button>
    </div>
    ${renderStarterStrip()}
    <div class="examples-header">
      <button id="toggle-examples" type="button" aria-expanded="true">− Hide examples</button>
    </div>
    <div id="examples" class="examples">${renderExamples()}</div>
  </section>

  <section class="output-section">
    <div class="results-toolbar">
      <button id="reroll" type="button" title="Pin a new random seed and re-run this exact wish text -- only changes anything if the result has an RNG component.">🎲 Reroll</button>
      <div id="matched-example-note" class="matched-note" hidden></div>
    </div>
    <div id="results" class="results"></div>
    <div class="timeline-wrap">
      <h2>Parse timeline</h2>
      <div id="timeline"></div>
    </div>
    ${renderScopeNotice()}
  </section>

  <section class="notes-section">
    ${renderMechanicNotes()}
    ${renderTraitsReference()}
  </section>

  <footer class="site-footer">
    <p>
      Source references pin to
      <a href="${NETHACK_TREE_URL}" target="_blank" rel="noopener noreferrer">${escapeHtml(NETHACK_VERSION)}</a>
      (the tagged release, not a moving branch) so line numbers stay accurate.
    </p>
    <p>
      <a href="https://github.com/gregglind/nethack-wish-parser" target="_blank" rel="noopener noreferrer">Source on GitHub</a>
      &middot;
      <a href="https://github.com/gregglind/nethack-wish-parser/issues" target="_blank" rel="noopener noreferrer">Report a bug</a>
      &middot;
      <a href="https://nethackwiki.com/wiki/Wish" target="_blank" rel="noopener noreferrer">NetHackWiki: Wish</a>
    </p>
  </footer>
`;

const input = qs<HTMLInputElement>(app, "#wish-input");
const wizardToggle = qs<HTMLInputElement>(app, "#wizard-toggle");
const luckInput = qs<HTMLInputElement>(app, "#luck-input");
const roleInput = qs<HTMLSelectElement>(app, "#role-input");
const rerollBtn = qs<HTMLButtonElement>(app, "#reroll");
const copyLinkBtn = qs<HTMLButtonElement>(app, "#copy-link");
const resultsEl = qs<HTMLDivElement>(app, "#results");
const timelineEl = qs<HTMLDivElement>(app, "#timeline");
const examplesEl = qs<HTMLDivElement>(app, "#examples");
const toggleExamplesBtn = qs<HTMLButtonElement>(app, "#toggle-examples");
const matchedNoteEl = qs<HTMLDivElement>(app, "#matched-example-note");

let state: AppState = readUrlState();
input.value = state.wish;
wizardToggle.checked = state.wizardPrimary;
luckInput.value = String(state.luck);
roleInput.value = state.role ?? "";

const EXAMPLES_HIDDEN_KEY = "nethack-wish-parser:examplesHidden";
function setExamplesHidden(hidden: boolean) {
  examplesEl.hidden = hidden;
  toggleExamplesBtn.textContent = hidden
    ? "+ Show more examples"
    : "− Hide examples";
  toggleExamplesBtn.setAttribute("aria-expanded", String(!hidden));
  localStorage.setItem(EXAMPLES_HIDDEN_KEY, String(hidden));
}
setExamplesHidden(localStorage.getItem(EXAMPLES_HIDDEN_KEY) !== "false");

function renderMatchedNote() {
  const matched = COMMON_WISHES_BY_TEXT.get(state.wish.trim().toLowerCase());
  matchedNoteEl.hidden = !matched;
  matchedNoteEl.innerHTML = matched
    ? `📌 Curated example (<em>${escapeHtml(matched.group)}</em>): ${escapeHtml(matched.label)}`
    : "";
}

function render() {
  if (!state.wish.trim()) {
    resultsEl.innerHTML =
      '<p class="empty">Type a wish, or click an example below, to see the parse.</p>';
    timelineEl.innerHTML = "";
    matchedNoteEl.hidden = true;
    return;
  }

  renderMatchedNote();

  const result = runWishPipeline(
    state.wish,
    state.seed,
    state.luck,
    state.role,
  );
  // A different seed for the same wish text/luck/role: if either xname
  // changes, this result has a genuine RNG component (not just re-hashing
  // the same deterministic outcome under a different number).
  const probeSeed = (state.seed ?? 0) + 0x5bd1e995;
  const probe = runWishPipeline(state.wish, probeSeed, state.luck, state.role);
  const wizardHasRng = probe.wizardObject.xname !== result.wizardObject.xname;
  const normalHasRng = probe.normalObject.xname !== result.normalObject.xname;

  const wizardPanel = renderResultPanel(
    "Wizard mode",
    result.wizardObject,
    state.wizardPrimary,
    wizardHasRng,
  );
  const normalPanel = renderResultPanel(
    "Normal play",
    result.normalObject,
    !state.wizardPrimary,
    normalHasRng,
  );

  resultsEl.innerHTML = state.wizardPrimary
    ? wizardPanel + normalPanel
    : normalPanel + wizardPanel;
  timelineEl.innerHTML = renderTimeline(result.steps);

  if (result.failed) {
    resultsEl.innerHTML += `<p class="failure-note">${escapeHtml(result.failureReason ?? "Parse failed.")}</p>`;
  }
}

function sync() {
  writeUrlState(state);
  render();
}

input.addEventListener("input", () => {
  state = { ...state, wish: input.value, seed: undefined };
  sync();
});

rerollBtn.addEventListener("click", () => {
  state = { ...state, seed: Math.floor(Math.random() * 2 ** 31) };
  sync();
});

toggleExamplesBtn.addEventListener("click", () => {
  setExamplesHidden(!examplesEl.hidden);
});

wizardToggle.addEventListener("change", () => {
  state = { ...state, wizardPrimary: wizardToggle.checked };
  sync();
});

luckInput.addEventListener("input", () => {
  const parsed = Math.max(
    -13,
    Math.min(13, Math.round(Number(luckInput.value) || 0)),
  );
  state = { ...state, luck: parsed };
  sync();
});

roleInput.addEventListener("change", () => {
  state = { ...state, role: (roleInput.value || null) as AppState["role"] };
  sync();
});

app.querySelectorAll<HTMLButtonElement>(".info-icon").forEach((icon) => {
  const description = icon.parentElement?.nextElementSibling;
  if (
    !(description instanceof HTMLElement) ||
    !description.classList.contains("group-description")
  )
    return;
  icon.addEventListener("click", () => {
    const expanded = icon.getAttribute("aria-expanded") === "true";
    icon.setAttribute("aria-expanded", String(!expanded));
    description.hidden = expanded;
  });
});

copyLinkBtn.addEventListener("click", async () => {
  const url = shareUrl(state);
  try {
    await navigator.clipboard.writeText(url);
    const original = copyLinkBtn.textContent;
    copyLinkBtn.textContent = "Copied!";
    setTimeout(() => (copyLinkBtn.textContent = original), 1200);
  } catch {
    window.prompt("Copy this link:", url);
  }
});

app.querySelectorAll<HTMLButtonElement>(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const wish = chip.dataset.wish ?? "";
    input.value = wish;
    // Every chip resets Luck/Role to the neutral defaults its label was
    // written against, unless the chip itself carries an override -- so a
    // prior example's Luck/Role never silently leaks into an unrelated one.
    const luck =
      chip.dataset.luck !== undefined
        ? Number(chip.dataset.luck)
        : DEFAULT_LUCK;
    luckInput.value = String(luck);
    const role = (chip.dataset.role as AppState["role"] | undefined) ?? null;
    roleInput.value = role ?? "";
    // Same fresh random seed the Reroll button pins -- clicking a chip is
    // itself a reroll, not just a reset to the wish text's default seed.
    const seed = Math.floor(Math.random() * 2 ** 31);
    state = { ...state, wish, seed, luck, role };
    sync();
  });
});

render();
