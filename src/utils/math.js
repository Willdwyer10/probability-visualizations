// ─── math utilities ────────────────────────────────────────────────────────
// Ported 1-to-1 from the original monolithic HTML file.

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export function clampProb(v) {
  return Math.max(0, Math.min(1, v));
}

export function snapToStep(v, min, step) {
  const k = Math.round((v - min) / step);
  return min + k * step;
}

export function parseNumberOrFallback(raw, fallback) {
  const v = parseFloat(raw);
  return Number.isFinite(v) ? v : fallback;
}

export function isAlmostInteger(v, tol = 1e-10) {
  return Number.isFinite(v) && Math.abs(v - Math.round(v)) <= tol;
}

export function cleanRounded(v, d = 4) {
  if (!Number.isFinite(v)) return v;
  const f = Math.pow(10, d);
  const r = Math.round(v * f) / f;
  return Math.abs(r) < 0.5 / f ? 0 : r;
}

/** LaTeX-formatted number. Returns '\\infty', '-\\infty', or a rounded string. */
export function latexNum(v, digits = 4) {
  if (v === Infinity) return '\\infty';
  if (v === -Infinity) return '-\\infty';
  if (!Number.isFinite(v)) return '\\mathrm{NA}';
  if (Math.abs(v) < 1e-12) return '0';
  const r = cleanRounded(v, digits);
  if (isAlmostInteger(r)) return String(Math.round(r));
  return Number(r).toFixed(digits);
}

/** Human-readable number (for display, not LaTeX). */
export function fmt(v, d = 4) {
  if (v === null || v === undefined) return '—';
  if (!Number.isFinite(v)) return v < 0 ? '-∞' : '∞';
  const r = cleanRounded(v, d);
  if (isAlmostInteger(r)) return String(Math.round(r));
  return Number(r).toFixed(d);
}

/** Format for number inputs (respects step precision). */
export function formatInputNumber(v, step = 1) {
  if (!Number.isFinite(v)) return '';
  if (step >= 1) return Math.round(v).toString();
  const s = String(step);
  if (s.includes('e-')) {
    const decimals = Math.min(4, parseInt(s.split('e-')[1], 10));
    return cleanRounded(v, decimals).toFixed(decimals);
  }
  const dot = s.indexOf('.');
  const precision = Math.min(4, dot < 0 ? 0 : s.length - dot - 1);
  const r = cleanRounded(v, precision);
  if (isAlmostInteger(r)) return String(Math.round(r));
  return Number(r).toFixed(precision);
}

export function ensureTrailingColon(s) {
  const t = String(s ?? '').trim();
  if (!t) return '';
  return /[:：]\s*$/.test(t) ? t : `${t}:`;
}

export const DISPLAY_CDF_CUTOFF = 0.9999;
export const MIN_TOTAL_TABLE_ROWS = 6;
export const MAX_DISPLAY_ROWS = 200;
export const QUANTILE_TOL = 1e-9;
export const MAX_INFINITE_SEARCH = 2000;
export const EPS = 1e-10;
