'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  getSiteTrafficOptOut,
  isTrackableSitePath,
  setSiteTrafficOptOut,
  SITE_TRAFFIC_OPTOUT_KEY,
  SITE_TRAFFIC_SESSION_KEY,
} from '@/lib/siteTraffic';

function getSessionId() {
  const existing = window.sessionStorage.getItem(SITE_TRAFFIC_SESSION_KEY);
  if (existing) return existing;

  const sessionId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.sessionStorage.setItem(SITE_TRAFFIC_SESSION_KEY, sessionId);
  return sessionId;
}

export default function SiteTrafficTracker() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const isAdminSession = session?.user?.role === 'ADMIN';
    if (isAdminSession) {
      setSiteTrafficOptOut(true);
    }

    if (!pathname || !isTrackableSitePath(pathname) || lastTrackedPath.current === pathname || getSiteTrafficOptOut()) {
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
  }, [pathname, session?.user?.role]);

  useEffect(() => {
    const syncOptOut = () => {
      if (getSiteTrafficOptOut()) {
        lastTrackedPath.current = pathname || lastTrackedPath.current;
      }
    };

    window.addEventListener('storage', syncOptOut);
    window.addEventListener(SITE_TRAFFIC_OPTOUT_KEY, syncOptOut as EventListener);
    return () => {
      window.removeEventListener('storage', syncOptOut);
      window.removeEventListener(SITE_TRAFFIC_OPTOUT_KEY, syncOptOut as EventListener);
    };
  }, [pathname]);

  return null;
}