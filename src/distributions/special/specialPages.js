import { jStat } from '../../utils/jstatHelper.js';

// ── Gamma Function special page ──────────────────────────────────────────────
export const SPECIAL_GAMMA_FN = {
  key: 'gammaFunction',
  label: 'Gamma function',
  note: 'Fundamental special function that extends the factorial to positive real and complex numbers. This page is included as a special function page rather than a probability distribution.',
  formula: '$$\\Gamma(\\alpha)=\\int_0^{\\infty} x^{\\alpha-1}e^{-x}\\,dx,\\qquad \\alpha>0$$',
  inputs: [
    { key: 'alpha', label: 'Input', symbol: '$\\alpha$', min: 0.05, max: 6, step: 0.01, value: 2.5 },
  ],
  outputFormula: '$y=\\Gamma(\\alpha)$',
  rCode: '<code>gamma(alpha)</code>',
  props: [
    ['Domain',         '$\\alpha>0$ (in basic courses, though it can be extended much further)'],
    ['Positivity',     '$\\Gamma(\\alpha)>0$ for $\\alpha>0$'],
    ['Recurrence',     '$\\Gamma(\\alpha+1)=\\alpha\\Gamma(\\alpha)$'],
    ['Factorial link', '$\\Gamma(n)=(n-1)!$ for integers $n\\ge 1$'],
    ['Special value',  '$\\Gamma\\!\\left(\\tfrac12\\right)=\\sqrt{\\pi}$'],
    ['Shape',          'Positive, smooth; reaches a minimum near $\\alpha\\approx 1.4616$'],
  ],
  evaluate(values) {
    const a = values.alpha;
    if (!Number.isFinite(a) || a <= 0) return NaN;
    return jStat.gammafn(a);
  },
  getRanges() {
    return { xMin: 0.001, xMax: 6.2, yMin: 0, yMax: 78 };
  },
  plotY(x) {
    if (!Number.isFinite(x) || x <= 0) return NaN;
    return jStat.gammafn(x);
  },
  xAxisLabel: 'α',
  yAxisLabel: 'Γ(α)',
  annotations(ctx, X, Y) {
    ctx.save();
    ctx.strokeStyle = 'rgba(124,58,237,.42)';
    ctx.setLineDash([4, 4]);
    for (let n = 1; n <= 5; n++) {
      const y = jStat.gammafn(n);
      ctx.beginPath();
      ctx.moveTo(X(n), Y(0));
      ctx.lineTo(X(n), Y(y));
      ctx.stroke();
    }
    ctx.restore();
    ctx.font = '11px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    for (let n = 1; n <= 5; n++) {
      const y = jStat.gammafn(n);
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      ctx.arc(X(n), Y(y), 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5b21b6';
      const label = n === 1 ? 'Γ(1)=0!=1' : `Γ(${n})=${n - 1}!`;
      const tx = X(n) + (n >= 4 ? -64 : 8);
      const ty = Y(y) - 6;
      ctx.fillText(label, tx, ty);
    }
  },
};

// ── Beta Function special page ───────────────────────────────────────────────
export const SPECIAL_BETA_FN = {
  key: 'betaFunction',
  label: 'Beta function',
  note: 'Fundamental two-parameter special function closely tied to the Gamma function and the Beta distribution. This page is included as a special function page rather than a probability distribution.',
  formula: '$$B(\\alpha,\\beta)=\\int_0^1 x^{\\alpha-1}(1-x)^{\\beta-1}\\,dx=\\frac{\\Gamma(\\alpha)\\Gamma(\\beta)}{\\Gamma(\\alpha+\\beta)},\\qquad \\alpha,\\beta>0$$',
  inputs: [
    { key: 'alpha', label: 'Input 1', symbol: '$\\alpha$', min: 0.05, max: 6, step: 0.01, value: 2.5 },
    { key: 'beta',  label: 'Input 2', symbol: '$\\beta$',  min: 0.05, max: 6, step: 0.01, value: 2.5 },
  ],
  outputFormula: '$y=B(\\alpha,\\beta)$',
  rCode: '<code>beta(alpha, beta)</code>',
  props: [
    ['Domain',            '$\\alpha>0,\\;\\beta>0$'],
    ['Symmetry',          '$B(\\alpha,\\beta)=B(\\beta,\\alpha)$'],
    ['Gamma relation',    '$B(\\alpha,\\beta)=\\dfrac{\\Gamma(\\alpha)\\Gamma(\\beta)}{\\Gamma(\\alpha+\\beta)}$'],
    ['Special values',    '$B(1,\\beta)=1/\\beta,\\quad B(\\alpha,1)=1/\\alpha$'],
    ['Distribution link', 'Normalization constant for the Beta distribution density'],
  ],
  evaluate(values) {
    const a = values.alpha, b = values.beta;
    if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) return NaN;
    return jStat.betafn(a, b);
  },
  getRanges(values) {
    const xMin = 0.05, xMax = 6.2, yMin = 0;
    let maxY = 0;
    const b = values.beta;
    for (let i = 0; i <= 1000; i++) {
      const x = xMin + (xMax - xMin) * i / 1000;
      const y = (!Number.isFinite(b) || b <= 0) ? NaN : jStat.betafn(x, b);
      if (Number.isFinite(y) && y >= 0) maxY = Math.max(maxY, y);
    }
    const yMax = Math.max(1, Math.min(60, maxY * 1.08 || 5));
    return { xMin, xMax, yMin, yMax };
  },
  plotY(x, values) {
    const b = values.beta;
    if (!Number.isFinite(x) || !Number.isFinite(b) || x <= 0 || b <= 0) return NaN;
    return jStat.betafn(x, b);
  },
  xAxisLabel: 'α',
  yAxisLabel: 'B(α,β)',
  annotations() {},
};

export const SPECIAL_PAGES = {
  gammaFunction: SPECIAL_GAMMA_FN,
  betaFunction:  SPECIAL_BETA_FN,
};
