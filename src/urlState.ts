export interface AppState {
  wish: string;
  wizardPrimary: boolean;
  luck: number;
}

/** A well-prepared character's practical luck (luckstone + some altar sacrifice), not the 0-luck default a brand-new character has. */
export const DEFAULT_LUCK = 10;

function clampLuck(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(-13, Math.min(13, Math.round(n)));
}

export function readUrlState(): AppState {
  const params = new URLSearchParams(location.search);
  return {
    wish: params.get('wish') ?? '',
    wizardPrimary: params.get('wizard') === '1',
    luck: clampLuck(Number(params.get('luck') ?? DEFAULT_LUCK)),
  };
}

function buildParams(state: AppState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.wish) params.set('wish', state.wish);
  if (state.wizardPrimary) params.set('wizard', '1');
  if (state.luck !== DEFAULT_LUCK) params.set('luck', String(state.luck));
  return params;
}

export function writeUrlState(state: AppState): void {
  const query = buildParams(state).toString();
  const newUrl = `${location.pathname}${query ? `?${query}` : ''}${location.hash}`;
  history.replaceState(null, '', newUrl);
}

export function shareUrl(state: AppState): string {
  const query = buildParams(state).toString();
  return `${location.origin}${location.pathname}${query ? `?${query}` : ''}`;
}
