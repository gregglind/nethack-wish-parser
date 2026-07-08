import type { ParseStep } from '../parser/types';
import { permalink } from '../parser/sourceRefs';
import { escapeHtml } from './domHelpers';

const CATEGORY_LABELS: Record<ParseStep['category'], string> = {
  lex: 'lex',
  lookup: 'lookup',
  construct: 'construct',
  'resolve-random': 'random',
  finalize: 'finalize',
};

function renderDiff(diff: Record<string, unknown>): string {
  const entries = Object.entries(diff).filter(([, v]) => v !== undefined && v !== null && v !== false && v !== '');
  if (!entries.length) return '';
  return `<table class="step-diff">${entries
    .map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(String(v))}</td></tr>`)
    .join('')}</table>`;
}

export function renderTimeline(steps: ParseStep[]): string {
  if (!steps.length) {
    return '<p class="empty">No steps yet -- type a wish above.</p>';
  }
  return `<ol class="timeline">${steps.map((step, i) => renderStep(step, i)).join('')}</ol>`;
}

function renderStep(step: ParseStep, index: number): string {
  const link = permalink(step.sourceRef);
  const beforeAfter =
    step.inputBefore !== step.inputAfter
      ? `<div class="step-io"><code class="before">${escapeHtml(step.inputBefore || '(empty)')}</code> &rarr; <code class="after">${escapeHtml(step.inputAfter || '(empty)')}</code></div>`
      : '';
  const diffHtml = renderDiff(step.stateDiff as Record<string, unknown>);
  const notesHtml = step.notes?.length
    ? `<ul class="step-notes">${step.notes.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}</ul>`
    : '';
  const rngHtml = step.rngNote
    ? `<div class="rng-note">
        <div class="rng-col"><span class="rng-label">Wizard</span>${escapeHtml(step.rngNote.wizardOutcome)}</div>
        <div class="rng-col"><span class="rng-label">Normal</span>${escapeHtml(step.rngNote.normalModeOutcomeDescription)}${
        step.rngNote.normalModeProbability !== undefined
          ? ` <span class="rng-prob">(p&asymp;${(step.rngNote.normalModeProbability * 100).toFixed(0)}%)</span>`
          : ''
      }</div>
      </div>`
    : '';

  return `<li class="step" data-category="${step.category}">
    <div class="step-header">
      <span class="step-index">${index + 1}</span>
      <span class="step-badge step-badge--${step.category}">${CATEGORY_LABELS[step.category]}</span>
      <span class="step-title">${escapeHtml(step.title)}</span>
      <a class="step-source" href="${link}" target="_blank" rel="noopener noreferrer" title="View source on GitHub">${escapeHtml(step.sourceRef.file)}:${step.sourceRef.startLine}-${step.sourceRef.endLine}</a>
    </div>
    ${beforeAfter}
    ${diffHtml}
    ${notesHtml}
    ${rngHtml}
  </li>`;
}
