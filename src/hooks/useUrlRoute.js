import { useState, useEffect, useCallback } from 'react';
import { MASTER_GROUPS, DEFAULT_GROUP } from '../distributions/index.js';

function parseHash(hash) {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const group = params.get('group') || DEFAULT_GROUP;
  const tab   = parseInt(params.get('tab') || '0', 10);
  return { group, tab: isNaN(tab) ? 0 : tab };
}

function buildHash(group, tab) {
  return `#group=${group}&tab=${tab}`;
}

/**
 * URL hash routing hook.
 * Reads and writes #group=xxx&tab=n.
 * Returns { groupKey, tabIndex, setRoute }.
 */
export function useUrlRoute() {
  const [route, setRouteState] = useState(() => {
    const parsed = parseHash(window.location.hash);
    const group = MASTER_GROUPS[parsed.group] ? parsed.group : DEFAULT_GROUP;
    const maxTab = (MASTER_GROUPS[group]?.tabs?.length ?? 1) - 1;
    return { groupKey: group, tabIndex: Math.min(parsed.tab, Math.max(0, maxTab)) };
  });

  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHash(window.location.hash);
      const group = MASTER_GROUPS[parsed.group] ? parsed.group : DEFAULT_GROUP;
      const maxTab = (MASTER_GROUPS[group]?.tabs?.length ?? 1) - 1;
      setRouteState({ groupKey: group, tabIndex: Math.min(parsed.tab, Math.max(0, maxTab)) });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const setRoute = useCallback((groupKey, tabIndex = 0, push = false) => {
    const hash = buildHash(groupKey, tabIndex);
    if (push) {
      window.location.hash = hash;
    } else {
      history.replaceState(null, '', hash);
    }
    setRouteState({ groupKey, tabIndex });
  }, []);

  return { ...route, setRoute };
}
