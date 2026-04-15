import { jStat, safePdf } from '../../utils/jstatHelper.js';
import { latexNum, clamp } from '../../utils/math.js';

export const PAGE_GAMMA_1 = {
  id: 'gamma.1',
  tabShort: 'Tab 1',
  tabLong: 'Gamma',
  name: 'Gamma distribution',
  variableSymbol: 'X',
  r: { d: 'dgamma', p: 'pgamma', q: 'qgamma' },
  display: {
    title: p => `$X\\sim \\mathrm{Gamma}(\\alpha=${latexNum(p.alpha, 4)},\\beta=${latexNum(p.beta, 4)})$`,
    note:  () => 'Models waiting times, lifetimes, and other positive right-skewed data, with applications in reliability, survival analysis, and queueing.',
    formula: () => '$$f(x)=\\frac{x^{\\alpha-1}e^{-x/\\beta}}{\\Gamma(\\alpha)\\beta^{\\alpha}},\\quad x\\gt 0$$<div style="height:6px"></div>$$F(x)=P(X\\le x)=\\int_{0}^{x}\\frac{t^{\\alpha-1}e^{-t/\\beta}}{\\Gamma(\\alpha)\\beta^{\\alpha}}dt$$',
  },
  params: [
    { id: 'alpha', label: '$\\alpha$', rArg: 'shape', note: 'shape', min: 0.5, max: 12, step: 0.001, value: 3 },
    { id: 'beta',  label: '$\\beta$',  rArg: 'scale', note: 'scale', min: 0.2, max: 5,  step: 0.001, value: 1 },
  ],
  props: p => [
    { label: 'Support',  formula: '$x\\gt 0$',                value: '$(0,\\infty)$' },
    { label: 'Mean',     formula: '$E(X)=\\alpha\\beta$',     value: `$${latexNum(p.alpha * p.beta, 4)}$` },
    { label: 'Variance', formula: '$\\mathrm{V}(X)=\\alpha\\beta^2$', value: `$${latexNum(p.alpha * p.beta * p.beta, 4)}$` },
  ],
  pdf:      (x, p) => x <= 0 ? 0 : safePdf(() => jStat.gamma.pdf(x, p.alpha, p.beta)),
  cdf:      (x, p) => x <= 0 ? 0 : clamp(jStat.gamma.cdf(x, p.alpha, p.beta), 0, 1),
  quantile: (q, p) => jStat.gamma.inv(q, p.alpha, p.beta),
  naturalRange: p => ({ xMin: -0.1, xMax: Math.max(p.alpha * p.beta + 4 * Math.sqrt(p.alpha) * p.beta, 2) }),
};

export const PAGE_GAMMA_2 = {
  id: 'gamma.2',
  tabShort: 'Tab 2',
  tabLong: 'Standard Gamma',
  name: 'Gamma distribution',
  variableSymbol: 'Y',
  r: { d: 'dgamma', p: 'pgamma', q: 'qgamma' },
  display: {
    title: p => `$Y\\sim \\mathrm{Gamma}(\\alpha=${latexNum(p.alpha, 4)},\\beta=1)$`,
    note:  () => 'Special case of the Gamma distribution with scale parameter = 1.',
    formula: () => '$$f(y)=\\frac{y^{\\alpha-1}e^{-y}}{\\Gamma(\\alpha)},\\quad y\\gt 0$$<div style="height:6px"></div>$$F(y)=P(Y\\le y)=\\int_{0}^{y}\\frac{t^{\\alpha-1}e^{-t}}{\\Gamma(\\alpha)}dt$$',
  },
  params: [
    { id: 'alpha', label: '$\\alpha$', rArg: 'shape', note: 'shape', min: 0.5, max: 12, step: 0.001, value: 3 },
  ],
  props: p => [
    { label: 'Support',  formula: '$y\\gt 0$',              value: '$(0,\\infty)$' },
    { label: 'Mean',     formula: '$E(Y)=\\alpha$',         value: `$${latexNum(p.alpha, 4)}$` },
    { label: 'Variance', formula: '$\\mathrm{V}(Y)=\\alpha$', value: `$${latexNum(p.alpha, 4)}$` },
  ],
  pdf:      (x, p) => x <= 0 ? 0 : safePdf(() => jStat.gamma.pdf(x, p.alpha, 1)),
  cdf:      (x, p) => x <= 0 ? 0 : clamp(jStat.gamma.cdf(x, p.alpha, 1), 0, 1),
  quantile: (q, p) => jStat.gamma.inv(q, p.alpha, 1),
  naturalRange: p => ({ xMin: -0.1, xMax: Math.max(p.alpha + 4 * Math.sqrt(p.alpha), 2) }),
};
