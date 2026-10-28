import { useEffect } from 'react';
import { useRouterState } from '@tanstack/react-router';

type TawkApi = {
  onLoad?: () => void;
  showWidget?: () => void;
  hideWidget?: () => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}

/** Load visitor support once, after hydration; never send profile or account data. */
export function LiveChat() {
  const isAdmin = useRouterState({
    select: state => state.location.pathname === '/admin' || state.location.pathname.startsWith('/admin/'),
  });

  useEffect(() => {
    if (isAdmin) {
      window.Tawk_API?.hideWidget?.();
      return;
    }

    window.Tawk_API?.showWidget?.();
    if (document.getElementById('axiom-tawk-chat')) return;

    const api = window.Tawk_API ?? {};
    window.Tawk_API = api;
    window.Tawk_LoadStart = new Date();
    api.onLoad = () => {
      if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')) {
        api.hideWidget?.();
      } else {
        api.showWidget?.();
      }
    };

    const script = document.createElement('script');
    script.id = 'axiom-tawk-chat';
    script.async = true;
    script.src = 'https://embed.tawk.to/6ae2294774f6483475d75622/1k61n2ggn';
    script.charset = 'UTF-8';
    document.head.appendChild(script);
  }, [isAdmin]);

  return null;
}