export const SITE_TRAFFIC_OPTOUT_KEY = 'stc-site-traffic-optout';
export const SITE_TRAFFIC_SESSION_KEY = 'stc-site-traffic-session';

const EXCLUDED_PREFIXES = ['/api', '/admin', '/dashboard', '/client-portal', '/_next'];
const EXCLUDED_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export function isTrackableSitePath(pathname: string) {
  return pathname !== ''
    && !EXCLUDED_PATHS.includes(pathname)
    && !EXCLUDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function getSiteTrafficOptOut() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(SITE_TRAFFIC_OPTOUT_KEY) === '1';
}

export function setSiteTrafficOptOut(value: boolean) {
  if (typeof window === 'undefined') return;

  if (value) {
    window.localStorage.setItem(SITE_TRAFFIC_OPTOUT_KEY, '1');
    return;
  }

  window.localStorage.removeItem(SITE_TRAFFIC_OPTOUT_KEY);
}