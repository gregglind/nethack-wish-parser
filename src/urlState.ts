export interface AppState {
  wish: string;
  wizardPrimary: boolean;
}

export function readUrlState(): AppState {
  const params = new URLSearchParams(location.search);
  return {
    wish: params.get('wish') ?? '',
    wizardPrimary: params.get('wizard') === '1',
  };
}

export function writeUrlState(state: AppState): void {
  const params = new URLSearchParams();
  if (state.wish) params.set('wish', state.wish);
  if (state.wizardPrimary) params.set('wizard', '1');
  const query = params.toString();
  const newUrl = `${location.pathname}${query ? `?${query}` : ''}${location.hash}`;
  history.replaceState(null, '', newUrl);
}

export function shareUrl(state: AppState): string {
  const params = new URLSearchParams();
  if (state.wish) params.set('wish', state.wish);
  if (state.wizardPrimary) params.set('wizard', '1');
  const query = params.toString();
  return `${location.origin}${location.pathname}${query ? `?${query}` : ''}`;
}
