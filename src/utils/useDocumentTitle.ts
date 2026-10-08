import { useEffect } from 'react';

export const DEFAULT_TITLE = 'Wilson Rodrigues — Full-Stack Engineer & Product Architect';

/**
 * Keeps document.title in sync with the current route. Every page that can be
 * reached directly (or navigated to from another titled page) should call this
 * so browser tabs / history entries never show a stale title.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
