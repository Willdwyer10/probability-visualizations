/**
 * Discrete engine logic — ported from createDiscreteEngine() in the original.
 * This hook encapsulates all stateful logic for the discrete distribution view:
 *   - parameter state
 *   - PMF/CDF display cache
 *   - PMF row selection set
 *   - quantile computation
 *   - axis locking
 */

import { useMemo, useReducer, useCallback, useEffect } from 'react';
import { clamp, clampProb, snapToStep, parseNumberOrFallback, latexNum, MAX_INFINITE_SEARCH, QUANTILE_TOL, formatInputNumber } from '../utils/math.js';
import { MASTER_GROUPS } from '../distributions/index.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

function getParamDefs(page, paramState) {
  const defs = page.parameters;
  return typeof defs === 'function' ? defs(paramState) : (defs || []);
}

function defaultParams(page, paramState) {
  const defs = getParamDefs(page, paramState);
  const out = {};
  defs.forEach(d => { out[d.id] = d.value; });
  return out;
}

function sanitize(page, params) {
  const defs = getParamDefs(page, params);
  const out = { ...params };
  defs.forEach(d => {
    let v = parseNumberOrFallback(out[d.id], d.value);
    v = clamp(v, d.min, d.max);
    v = snapToStep(v, d.min, d.step ?? 1);
    if ((d.step ?? 1) >= 1) v = Math.round(v);
    out[d.id] = v;
  });
  if (typeof page.sanitize === 'function') page.sanitize(out);
  return out;
}

function chooseDisplayUpperBound(page, params, maxRows = 200, cdfCutoff = 0.9999) {
  // For distributions with a finite upper bound
  const [aTheo, bTheo] = page.theoreticalSupport(params);
  if (Number.isFinite(bTheo)) return bTheo;
  // For infinite-support distributions find where CDF >= cutoff
  let cum = 0;
  for (let x = aTheo; x <= MAX_INFINITE_SEARCH; x++) {
    cum += (page.pmf(x, params) || 0);
    if (cum >= cdfCutoff) return x;
    if (x - aTheo >= maxRows) return x;
  }
  return aTheo + maxRows;
}

function computeDisplaySupport(page, params, opts) {
  // Pages may supply a custom displaySupport function; otherwise auto-compute
  if (typeof page.displaySupport === 'function') return page.displaySupport(params, opts);
  // Fall back to auto (for infinite-support pages like Geometric, NB, Poisson)
  const [a] = page.theoreticalSupport(params);
  const b = chooseDisplayUpperBound(page, params, opts?.maxRows ?? 200, opts?.cdfCutoff ?? 0.9999);
  return [a, b];
}

function buildCache(page, params, opts) {
  const [aTheo, bTheo] = page.theoreticalSupport(params);
  const [a, b] = computeDisplaySupport(page, params, opts);

  const xs = [], pmf = [], cdf = [];
  let cum = 0, maxP = 0;

  for (let x = a; x <= b; x++) {
    const p = page.pmf(x, params) || 0;
    xs.push(x);
    pmf.push(p);
    cum += p;
    cdf.push(clampProb(cum));
    maxP = Math.max(maxP, p);
  }

  const truncated = !(Number.isFinite(bTheo) && b >= bTheo);
  const valSym = page.valueSymbol || 'x';
  const cdfAtMax = cdf.length ? cdf[cdf.length - 1] : 0;
  const message = truncated
    ? `Display truncated at $${valSym}=${b}$, where $F(${valSym})\\approx ${latexNum(cdfAtMax, 4)}$.`
    : '';

  return {
    displaySupport: [a, b],
    theoreticalSupport: [aTheo, bTheo],
    xs, pmf, cdf, maxP,
    tailInfo: { truncated, maxShown: b, cdfAtMax, message },
  };
}

function discreteCdf(cache, page, params, x) {
  const [aTheo, bTheo] = cache.theoreticalSupport;
  const [a, b] = cache.displaySupport;
  if (x === Infinity) return 1;
  if (x === -Infinity || !Number.isFinite(x)) return 0;
  if (x < aTheo) return 0;
  if (Number.isFinite(bTheo) && x >= bTheo) return 1;
  const xf = Math.floor(x);
  if (Number.isInteger(xf) && xf >= a && xf <= b) {
    return cache.cdf[xf - a] ?? 0;
  }
  // Fallback: sum PMFs
  let s = 0;
  for (let k = a; k <= Math.floor(x); k++) s += (page.pmf(k, params) || 0);
  return clampProb(s);
}

function discreteQuantile(cache, page, params, q) {
  const [a, b] = cache.theoreticalSupport;
  if (q <= 0) return a;
  if (Number.isFinite(b) && q >= 1) return b;
  if (!Number.isFinite(b) && q >= 1) return Infinity;

  if (Number.isFinite(b)) {
    let s = 0;
    for (let x = a; x <= b; x++) {
      s += page.pmf(x, params);
      if (s + QUANTILE_TOL >= q) return x;
    }
    return b;
  }

  let s = 0;
  for (let x = a; x <= MAX_INFINITE_SEARCH; x++) {
    s += page.pmf(x, params);
    if (s + QUANTILE_TOL >= q) return x;
  }
  return Infinity;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

const initState = (page, groupKey, tabIndex) => {
  const params = sanitize(page, defaultParams(page, {}));
  const cache  = buildCache(page, params);
  const fAxis  = typeof page.fixedAxis === 'function' ? page.fixedAxis(params) : (page.fixedAxis ?? {});
  return {
    groupKey,
    tabIndex,
    params,
    cache,
    selectedXs: new Set(cache.xs),
    xAxisMode: 'auto',
    xLockedRange: null,
    yAxisMode: 'fixed',
    yLockedMax: fAxis.yMax ?? 1,
    showPMF: true,
    showCDF: false,
    showCalc: true,
    propsCollapsed: false,
    tableCollapsed: false,
  };
};

function reducer(state, action) {
  switch (action.type) {
    case 'SWITCH_DISTRIBUTION': {
      const { page, groupKey, tabIndex } = action;
      const params = sanitize(page, defaultParams(page, {}));
      const cache  = buildCache(page, params);
      const fAxis  = typeof page.fixedAxis === 'function' ? page.fixedAxis(params) : (page.fixedAxis ?? {});
      return {
        ...state,
        groupKey,
        tabIndex,
        params,
        cache,
        selectedXs: new Set(cache.xs),
        xAxisMode: 'auto',
        xLockedRange: null,
        yAxisMode: 'fixed',
        yLockedMax: fAxis.yMax ?? 1,
      };
    }
    case 'SET_PARAM': {
      const { page } = action;
      const newParams = sanitize(page, { ...state.params, [action.id]: action.value });
      const newCache  = buildCache(page, newParams);
      // Prune out-of-range selected values
      const xs = new Set(newCache.xs);
      const selectedXs = new Set([...state.selectedXs].filter(x => xs.has(x)));
      let yLockedMax = state.yLockedMax;
      if (state.yAxisMode === 'fixed') {
        const fAxis = typeof page.fixedAxis === 'function' ? page.fixedAxis(newParams) : (page.fixedAxis ?? {});
        yLockedMax = fAxis.yMax ?? state.yLockedMax;
      }
      return { ...state, params: newParams, cache: newCache, selectedXs, yLockedMax };
    }
    case 'TOGGLE_SHOW_PMF': {
      const next = action.checked;
      if (!next && !state.showCDF) return { ...state, showPMF: true };
      return { ...state, showPMF: next };
    }
    case 'TOGGLE_SHOW_CDF': {
      const next = action.checked;
      if (!next && !state.showPMF) return { ...state, showPMF: true, showCDF: false };
      return { ...state, showCDF: next };
    }
    case 'TOGGLE_SHOW_CALC':   return { ...state, showCalc: action.checked };
    case 'TOGGLE_PROPS':       return { ...state, propsCollapsed: !state.propsCollapsed };
    case 'TOGGLE_TABLE':       return { ...state, tableCollapsed: !state.tableCollapsed };
    case 'SET_X_AUTO':         return { ...state, xAxisMode: 'auto', xLockedRange: null };
    case 'SET_X_FIXED': {
      if (state.xAxisMode === 'fixed') return { ...state, xAxisMode: 'auto', xLockedRange: null };
      const [a, b] = state.cache.displaySupport;
      return { ...state, xAxisMode: 'fixed', xLockedRange: { minX: a, maxX: b } };
    }
    case 'SET_Y_AUTO':         return { ...state, yAxisMode: 'auto', yLockedMax: null };
    case 'SET_Y_FIXED': {
      if (state.yAxisMode === 'fixed') return { ...state, yAxisMode: 'auto', yLockedMax: null };
      // compute current yMax then lock it
      const yMax = action.currentYMax;
      return { ...state, yAxisMode: 'fixed', yLockedMax: yMax };
    }
    case 'SELECT_X':      { const s = new Set(state.selectedXs); s.add(action.x);    return { ...state, selectedXs: s }; }
    case 'DESELECT_X':    { const s = new Set(state.selectedXs); s.delete(action.x); return { ...state, selectedXs: s }; }
    case 'CLEAR_SELECT':  return { ...state, selectedXs: new Set() };
    case 'INVERT_SELECT': {
      const all = new Set(state.cache.xs);
      const inv = new Set([...all].filter(x => !state.selectedXs.has(x)));
      return { ...state, selectedXs: inv };
    }
    case 'RESET_SELECT':  return { ...state, selectedXs: new Set(state.cache.xs) };
    case 'RESET_PARAMS': {
      const { page } = action;
      const params = sanitize(page, defaultParams(page, {}));
      const cache  = buildCache(page, params);
      return { ...state, params, cache, selectedXs: new Set(cache.xs) };
    }
    default: return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDiscreteEngine(groupKey, tabIndex) {
  const group = MASTER_GROUPS[groupKey];
  const page  = group?.tabs?.[tabIndex] ?? group?.tabs?.[0];

  const [state, dispatch] = useReducer(reducer, null, () => initState(page, groupKey, tabIndex));

  // Sync when external navigation changes group/tab
  useEffect(() => {
    if (state.groupKey !== groupKey || state.tabIndex !== tabIndex) {
      dispatch({ type: 'SWITCH_DISTRIBUTION', page, groupKey, tabIndex });
    }
  }, [groupKey, tabIndex]); // eslint-disable-line

  // ── Derived values ──────────────────────────────────────────────────────────
  const displayXRange = useMemo(() => {
    if (state.xAxisMode === 'fixed' && state.xLockedRange) return state.xLockedRange;
    const [a, b] = state.cache.displaySupport;
    return { minX: a, maxX: b };
  }, [state.xAxisMode, state.xLockedRange, state.cache]);

  const displayYMax = useMemo(() => {
    if (state.yAxisMode === 'fixed' && state.yLockedMax != null) return state.yLockedMax;
    if (state.showCDF) return 1.05;
    const { maxP } = state.cache;
    return Math.max((maxP || 0) * 1.25, 0.05);
  }, [state.yAxisMode, state.yLockedMax, state.showCDF, state.cache]);

  const selectedTotal = useMemo(() => {
    let total = 0;
    const { pmf, displaySupport: [a] } = state.cache;
    for (const x of state.selectedXs) {
      const idx = x - a;
      total += (idx >= 0 && idx < pmf.length) ? pmf[idx] : (page?.pmf(x, state.params) || 0);
    }
    return clampProb(total);
  }, [state.selectedXs, state.cache, state.params, page]);

  const getCdf = useCallback((x) => discreteCdf(state.cache, page, state.params, x), [state.cache, state.params, page]);
  const getQuantile = useCallback((q) => discreteQuantile(state.cache, page, state.params, q), [state.cache, state.params, page]);

  const getParamDefsForPage = useCallback(() => getParamDefs(page, state.params), [page, state.params]);

  const setParam = useCallback((id, value) => dispatch({ type: 'SET_PARAM', page, id, value }), [page]);
  const resetParams = useCallback(() => dispatch({ type: 'RESET_PARAMS', page }), [page]);

  const getFullCache = useCallback(() => buildCache(page, state.params, { maxRows: 2500, cdfCutoff: 0.9999999 }), [page, state.params]);

  return {
    page,
    state,
    dispatch,
    displayXRange,
    displayYMax,
    selectedTotal,
    getCdf,
    getQuantile,
    getParamDefs: getParamDefsForPage,
    setParam,
    resetParams,
    getFullCache,
    formatInputNumber,
  };
}
