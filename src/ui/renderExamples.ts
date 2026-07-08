import { COMMON_WISHES, COMMON_WISH_GROUPS } from '../data/commonWishes';
import { escapeHtml } from './domHelpers';

export function renderExamples(): string {
  return COMMON_WISH_GROUPS.map((group) => {
    const items = COMMON_WISHES.filter((w) => w.group === group);
    return `<div class="example-group">
      <div class="example-group-title">${escapeHtml(group)}</div>
      <div class="example-chips">
        ${items
          .map(
            (w) =>
              `<button type="button" class="chip" data-wish="${escapeHtml(w.text)}" title="${escapeHtml(w.label)}">${escapeHtml(w.text)}</button>`
          )
          .join('')}
      </div>
    </div>`;
  }).join('');
}
