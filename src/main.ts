import { runWishPipeline } from './parser/pipeline';
import { readUrlState, writeUrlState, shareUrl, type AppState } from './urlState';
import { renderTimeline } from './ui/renderTimeline';
import { renderResultPanel } from './ui/renderResult';
import { renderExamples } from './ui/renderExamples';
import { renderScopeNotice } from './ui/renderScopeNotice';
import { escapeHtml, qs } from './ui/domHelpers';
import { NETHACK_VERSION, NETHACK_TREE_URL } from './parser/sourceRefs';

const app = document.querySelector<HTMLDivElement>('#app')!;

const initialState: AppState = readUrlState();

// `?wish=...&json=1` renders a raw JSON dump instead of the interactive UI.
// This is a static site with no backend (deployable to plain GitHub Pages,
// not just Vercel), so a real `/api/...` route isn't portable across both
// hosts -- a query flag is, since it's still just client-side JS producing
// static-servable HTML with no server involved.
if (initialState.json && initialState.wish.trim()) {
  const result = runWishPipeline(initialState.wish);
  const pre = document.createElement('pre');
  pre.id = 'json-output';
  pre.textContent = JSON.stringify(result, null, 2);
  app.innerHTML = '';
  app.appendChild(pre);
} else {
  renderApp(initialState);
}

function renderApp(initialState: AppState) {
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
      <button id="copy-link" type="button" title="Copy a shareable link to this exact parse">Copy link</button>
      <a id="json-link" href="#" title="View this parse as raw JSON">View as JSON</a>
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
  </footer>
`;

  const input = qs<HTMLInputElement>(app, '#wish-input');
  const wizardToggle = qs<HTMLInputElement>(app, '#wizard-toggle');
  const copyLinkBtn = qs<HTMLButtonElement>(app, '#copy-link');
  const jsonLink = qs<HTMLAnchorElement>(app, '#json-link');
  const resultsEl = qs<HTMLDivElement>(app, '#results');
  const timelineEl = qs<HTMLDivElement>(app, '#timeline');

  let state: AppState = initialState;
  input.value = state.wish;
  wizardToggle.checked = state.wizardPrimary;

  function render() {
    jsonLink.href = shareUrl({ ...state, json: true });

    if (!state.wish.trim()) {
      resultsEl.innerHTML = '<p class="empty">Type a wish, or click an example below, to see the parse.</p>';
      timelineEl.innerHTML = '';
      return;
    }

    const result = runWishPipeline(state.wish);
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
}
