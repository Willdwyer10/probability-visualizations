import jStat from 'jstat';
import { clampProb } from '../utils/math.js';

/** Safely evaluate a jStat PDF, returning 0 for non-finite/negative results. */
export function safePdf(fn) {
  try {
    const v = fn();
    return Number.isFinite(v) && v >= 0 ? v : 0;
  } catch {
    return 0;
  }
}

/** Discrete PMF wrapper: clamps result to [0,1]. */
export function jstatPdfSafe(fn) {
  try {
    const v = fn();
    if (!Number.isFinite(v)) return 0;
    return clampProb(v);
  } catch {
    return 0;
  }
}

export { jStat };
