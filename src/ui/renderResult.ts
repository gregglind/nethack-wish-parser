import type { RenderedObject } from '../parser/types';
import { escapeHtml } from './domHelpers';

export function renderResultPanel(label: string, obj: RenderedObject, primary: boolean, hasRngComponent: boolean): string {
  return `<div class="result-panel ${primary ? 'result-panel--primary' : ''}">
    <div class="result-label">
      ${escapeHtml(label)}
      ${hasRngComponent ? '<span class="rng-badge" title="This result depends on a random roll -- click Reroll to see another possible outcome for the same wish text.">🎲 RNG-dependent</span>' : ''}
    </div>
    <div class="result-xname">${escapeHtml(obj.xname)}</div>
    ${
      obj.fields.length
        ? `<table class="result-fields">${obj.fields
            .map((f) => `<tr><td>${escapeHtml(f.label)}</td><td>${escapeHtml(f.value)}</td></tr>`)
            .join('')}</table>`
        : ''
    }
  </div>`;
}
