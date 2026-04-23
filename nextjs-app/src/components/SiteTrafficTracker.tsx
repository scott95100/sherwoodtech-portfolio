'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const EXCLUDED_PREFIXES = ['/api', '/admin', '/dashboard', '/client-portal', '/_next'];
const SESSION_KEY = 'stc-site-traffic-session';

function isTrackablePath(pathname: string) {
  return pathname !== '' && !EXCLUDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function getSessionId() {
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const sessionId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.sessionStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

export default function SiteTrafficTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || !isTrackablePath(pathname) || lastTrackedPath.current === pathname) {
      return;
    }

    const trackingKey = `site-traffic:${pathname}`;
    if (window.sessionStorage.getItem(trackingKey)) {
      lastTrackedPath.current = pathname;
      return;
    }

    lastTrackedPath.current = pathname;
    window.sessionStorage.setItem(trackingKey, '1');

    fetch('/api/site-traffic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        sessionId: getSessionId(),
      }),
      keepalive: true,
    }).catch(() => {
      window.sessionStorage.removeItem(trackingKey);
    });
  }, [pathname]);

  return null;
}