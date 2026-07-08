export interface AppState {
  wish: string;
  wizardPrimary: boolean;
  json: boolean;
}

export function readUrlState(): AppState {
  const params = new URLSearchParams(location.search);
  return {
    wish: params.get('wish') ?? '',
    wizardPrimary: params.get('wizard') === '1',
    json: params.get('json') === '1',
  };
}

function buildParams(state: AppState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.wish) params.set('wish', state.wish);
  if (state.wizardPrimary) params.set('wizard', '1');
  if (state.json) params.set('json', '1');
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
