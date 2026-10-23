import { useEffect, useRef } from 'react';

export function useQuickLinkDialog(onClose) {
  const container = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const root = container.current;
    (root?.querySelector('input:not([type="file"]), select') || root?.querySelector('button'))?.focus();
    const keydown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); }
      if (event.key !== 'Tab') return;
      const items = [...root.querySelectorAll('button:not(:disabled), input:not(:disabled):not([tabindex="-1"]), select:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]')].filter((el) => el.getClientRects().length);
      if (!items.length) return;
      if (event.shiftKey && (document.activeElement === items[0] || !root.contains(document.activeElement))) { event.preventDefault(); items.at(-1).focus(); }
      else if (!event.shiftKey && (document.activeElement === items.at(-1) || !root.contains(document.activeElement))) { event.preventDefault(); items[0].focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); if (previous?.isConnected) previous.focus(); };
  }, []);
  return container;
}
