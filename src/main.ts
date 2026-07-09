import { runWishPipeline } from './parser/pipeline';
import { readUrlState, writeUrlState, shareUrl, type AppState } from './urlState';
import { renderTimeline } from './ui/renderTimeline';
import { renderResultPanel } from './ui/renderResult';
import { renderExamples } from './ui/renderExamples';
import { renderScopeNotice } from './ui/renderScopeNotice';
import { escapeHtml, qs } from './ui/domHelpers';
import { NETHACK_VERSION, NETHACK_TREE_URL } from './parser/sourceRefs';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <header class="site-header">
    <h1>🧞 NetHack Wish Parser</h1>
    <p class="tagline">
      Type a <code>#wish</code> string and see exactly how NetHack's real parser
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
      <button id="copy-link" type="button" title="Copy a shareable link to this exact parse">Copy link</button>
    </div>
    <div class="examples">${renderExamples()}</div>
  </section>

  <section class="output-section">
    <div id="results" class="results"></div>
    <div class="timeline-wrap">
      <h2>Parse timeline</h2>
      <div id="timeline"></div>
    </div>
    ${renderScopeNotice()}
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
    </p>
  </footer>
`;

const input = qs<HTMLInputElement>(app, '#wish-input');
const wizardToggle = qs<HTMLInputElement>(app, '#wizard-toggle');
const luckInput = qs<HTMLInputElement>(app, '#luck-input');
const copyLinkBtn = qs<HTMLButtonElement>(app, '#copy-link');
const resultsEl = qs<HTMLDivElement>(app, '#results');
const timelineEl = qs<HTMLDivElement>(app, '#timeline');

let state: AppState = readUrlState();
input.value = state.wish;
wizardToggle.checked = state.wizardPrimary;
luckInput.value = String(state.luck);

function render() {
  if (!state.wish.trim()) {
    resultsEl.innerHTML = '<p class="empty">Type a wish, or click an example below, to see the parse.</p>';
    timelineEl.innerHTML = '';
    return;
  }

  const result = runWishPipeline(state.wish, undefined, state.luck);
  const wizardPanel = renderResultPanel('Wizard mode', result.wizardObject, state.wizardPrimary);
  const normalPanel = renderResultPanel('Normal play', result.normalObject, !state.wizardPrimary);

  resultsEl.innerHTML = state.wizardPrimary ? wizardPanel + normalPanel : normalPanel + wizardPanel;
  timelineEl.innerHTML = renderTimeline(result.steps);

  if (result.failed) {
    resultsEl.innerHTML += `<p class="failure-note">${escapeHtml(result.failureReason ?? 'Parse failed.')}</p>`;
  }
}

function sync() {
  writeUrlState(state);
  render();
}

input.addEventListener('input', () => {
  state = { ...state, wish: input.value };
  sync();
});

wizardToggle.addEventListener('change', () => {
  state = { ...state, wizardPrimary: wizardToggle.checked };
  sync();
});

luckInput.addEventListener('input', () => {
  const parsed = Math.max(-13, Math.min(13, Math.round(Number(luckInput.value) || 0)));
  state = { ...state, luck: parsed };
  sync();
});

copyLinkBtn.addEventListener('click', async () => {
  const url = shareUrl(state);
  try {
    await navigator.clipboard.writeText(url);
    const original = copyLinkBtn.textContent;
    copyLinkBtn.textContent = 'Copied!';
    setTimeout(() => (copyLinkBtn.textContent = original), 1200);
  } catch {
    window.prompt('Copy this link:', url);
  }
});

app.querySelectorAll<HTMLButtonElement>('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    const wish = chip.dataset.wish ?? '';
    input.value = wish;
    state = { ...state, wish };
    sync();
  });
});

render();
