/**
 * Continuous engine logic — ported from createContinuousEngine() in the original.
 */

import { useReducer, useEffect, useCallback } from 'react';
import { clamp, parseNumberOrFallback, snapToStep, formatInputNumber } from '../utils/math.js';
import { MASTER_GROUPS } from '../distributions/index.js';

const SEPARATION_FRAC = 0.025;

function getParamDefs(page, params) {
  const defs = page.params;
  return typeof defs === 'function' ? defs(params) : (defs || []);
}

function defaultParams(page) {
  const defs = getParamDefs(page, {});
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

function estimatePeak(page, params, xMin, xMax) {
  let best = 0;
  const n = 700;
  for (let i = 0; i <= n; i++) {
    const x = xMin + (xMax - xMin) * i / n;
    best = Math.max(best, page.pdf(x, params) || 0);
  }
  return best;
}

function getNatRange(page, params) {
  return page.naturalRange(params);
}

function defaultCutoffs(page, params) {
  try {
    return { cutoff1: page.quantile(0.5, params), cutoff2: page.quantile(0.8, params) };
  } catch {
    const { xMin, xMax } = getNatRange(page, params);
    return { cutoff1: (xMin + xMax) / 2, cutoff2: xMin + 0.75 * (xMax - xMin) };
  }
}

const initState = (page, groupKey, tabIndex) => {
  const params = sanitize(page, defaultParams(page));
  const { cutoff1, cutoff2 } = defaultCutoffs(page, params);
  return {
    groupKey,
    tabIndex,
    params,
    mode: 'one',
    cutoff1,
    cutoff2,
    fixedX: true,
    fixedY: true,
    lockedXRange: null,
    lockedYMax: null,
    showPdf: true,
    showCdf: false,
    showCalc: true,
    propsCollapsed: false,
    stdNormalCollapsed: false,
  };
};

function reducer(state, action) {
  switch (action.type) {
    case 'SWITCH_DISTRIBUTION': {
      const { page, groupKey, tabIndex } = action;
      const params = sanitize(page, defaultParams(page));
      const { cutoff1, cutoff2 } = defaultCutoffs(page, params);
      return { ...state, groupKey, tabIndex, params, mode: 'one', cutoff1, cutoff2, fixedX: true, fixedY: true, lockedXRange: null, lockedYMax: null };
    }
    case 'SET_PARAM': {
      const { page, id, value } = action;
      const newParams = sanitize(page, { ...state.params, [id]: value });
      return { ...state, params: newParams };
    }
    case 'SET_MODE':        return { ...state, mode: action.mode };
    case 'SET_CUTOFF1':     return { ...state, cutoff1: action.value };
    case 'SET_CUTOFF2':     return { ...state, cutoff2: action.value };
    case 'TOGGLE_PDF': {
      const next = action.checked;
      if (!next && !state.showCdf) return { ...state, showPdf: true };
      return { ...state, showPdf: next };
    }
    case 'TOGGLE_CDF': {
      const next = action.checked;
      if (!next && !state.showPdf) return { ...state, showPdf: true, showCdf: false };
      return { ...state, showCdf: next };
    }
    case 'TOGGLE_CALC':        return { ...state, showCalc: action.checked };
    case 'TOGGLE_PROPS':       return { ...state, propsCollapsed: !state.propsCollapsed };
    case 'TOGGLE_STD_NORMAL':  return { ...state, stdNormalCollapsed: !state.stdNormalCollapsed };
    case 'SET_X_AUTO':         return { ...state, fixedX: false, lockedXRange: null };
    case 'SET_X_FIXED':        return { ...state, fixedX: true, lockedXRange: action.range };
    case 'SET_Y_AUTO':         return { ...state, fixedY: false, lockedYMax: null };
    case 'SET_Y_FIXED':        return { ...state, fixedY: true, lockedYMax: action.yMax };
    case 'RESET_PARAMS': {
      const { page } = action;
      const params = sanitize(page, defaultParams(page));
      const { cutoff1, cutoff2 } = defaultCutoffs(page, params);
      return { ...state, params, cutoff1, cutoff2 };
    }
    default: return state;
  }
}

export function useContinuousEngine(groupKey, tabIndex) {
  const group = MASTER_GROUPS[groupKey];
  const page  = group?.tabs?.[tabIndex] ?? group?.tabs?.[0];

  const [state, dispatch] = useReducer(reducer, null, () => initState(page, groupKey, tabIndex));

  useEffect(() => {
    if (state.groupKey !== groupKey || state.tabIndex !== tabIndex) {
      dispatch({ type: 'SWITCH_DISTRIBUTION', page, groupKey, tabIndex });
    }
  }, [groupKey, tabIndex]); // eslint-disable-line

  const getXRange = useCallback(() => {
    const nat = page.naturalRange(state.params);
    if (state.fixedX && state.lockedXRange) return state.lockedXRange;
    return nat;
  }, [page, state.params, state.fixedX, state.lockedXRange]);

  const getYMax = useCallback((xRange) => {
    const { xMin, xMax } = xRange ?? getXRange();
    const peak = estimatePeak(page, state.params, xMin, xMax);
    let target = state.showPdf ? peak * 1.18 : 0;
    if (state.showCdf) target = Math.max(target, 1.05);
    const autoY = Math.max(target, 0.1);
    if (state.fixedY && state.lockedYMax) return state.lockedYMax;
    return autoY;
  }, [page, state.params, state.showPdf, state.showCdf, state.fixedY, state.lockedYMax, getXRange]);

  const keepCutoffsReasonable = useCallback((xRange) => {
    const xr = xRange ?? getXRange();
    const sep = (xr.xMax - xr.xMin) * SEPARATION_FRAC;
    let { cutoff1, cutoff2 } = state;
    if (!Number.isFinite(cutoff1)) cutoff1 = clamp(page.quantile(0.5, state.params), xr.xMin, xr.xMax);
    if (!Number.isFinite(cutoff2)) cutoff2 = clamp(page.quantile(0.8, state.params), xr.xMin, xr.xMax);
    cutoff1 = clamp(cutoff1, xr.xMin, xr.xMax);
    cutoff2 = clamp(cutoff2, xr.xMin, xr.xMax);
    if (state.mode === 'two' && Math.abs(cutoff2 - cutoff1) < 1e-9) {
      cutoff2 = clamp(cutoff1 + sep, xr.xMin, xr.xMax);
    }
    return { cutoff1, cutoff2 };
  }, [state, page, getXRange]);

  const getParamDefsForPage = useCallback(() => getParamDefs(page, state.params), [page, state.params]);

  const setParam = useCallback((id, value) => dispatch({ type: 'SET_PARAM', page, id, value }), [page]);
  const resetParams = useCallback(() => dispatch({ type: 'RESET_PARAMS', page }), [page]);

  return {
    page,
    state,
    dispatch,
    getXRange,
    getYMax,
    keepCutoffsReasonable,
    getParamDefs: getParamDefsForPage,
    setParam,
    resetParams,
    formatInputNumber,
    SEPARATION_FRAC,
  };
}
