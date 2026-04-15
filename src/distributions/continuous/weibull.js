import { jStat, safePdf } from '../../utils/jstatHelper.js';
import { latexNum, clamp } from '../../utils/math.js';

export const PAGE_WEIBULL_1 = {
  id: 'weibull.1',
  tabShort: 'Tab 1',
  tabLong: 'Weibull',
  name: 'Weibull distribution',
  variableSymbol: 'X',
  r: { d: 'dweibull', p: 'pweibull', q: 'qweibull' },
  display: {
    title: p => `$X\\sim \\mathrm{Weibull}(\\alpha=${latexNum(p.alpha, 4)},\\beta=${latexNum(p.beta, 4)})$`,
    note:  () => 'Models lifetimes and failure times, with applications in reliability analysis, survival analysis, and industrial quality control.',
    formula: () => '$$f(x)=\\frac{\\alpha}{\\beta}\\left(\\frac{x}{\\beta}\\right)^{\\alpha-1}e^{-(x/\\beta)^\\alpha},\\quad x\\ge 0$$<div style="height:6px"></div>$$F(x)=1-e^{-(x/\\beta)^\\alpha},\\quad x\\ge 0$$',
  },
  params: [
    { id: 'alpha', label: '$\\alpha$', rArg: 'shape', note: 'shape', min: 0.5, max: 10, step: 0.001, value: 1.5 },
    { id: 'beta',  label: '$\\beta$',  rArg: 'scale', note: 'scale', min: 0.5, max: 10, step: 0.001, value: 1 },
  ],
  props: p => [
    { label: 'Support',  formula: '$x\\ge 0$',                                                                                                 value: '$[0,\\infty)$' },
    { label: 'Mean',     formula: '$\\beta\\Gamma(1+1/\\alpha)$',                                                                              value: `$${latexNum(p.beta * jStat.gammafn(1 + 1 / p.alpha), 4)}$` },
    { label: 'Variance', formula: '$\\beta^2\\left[\\Gamma(1+2/\\alpha)-(\\Gamma(1+1/\\alpha))^2\\right]$',                                    value: `$${latexNum(p.beta * p.beta * (jStat.gammafn(1 + 2 / p.alpha) - Math.pow(jStat.gammafn(1 + 1 / p.alpha), 2)), 4)}$` },
  ],
  // jStat.weibull uses (x, scale, shape) ordering — note argument swap
  pdf:      (x, p) => x < 0 ? 0 : safePdf(() => jStat.weibull.pdf(x, p.beta, p.alpha)),
  cdf:      (x, p) => x < 0 ? 0 : clamp(jStat.weibull.cdf(x, p.beta, p.alpha), 0, 1),
  quantile: (q, p) => jStat.weibull.inv(q, p.beta, p.alpha),
  naturalRange: p => ({ xMin: -0.1, xMax: Math.max(p.beta * 4, 2) }),
};

export const PAGE_WEIBULL_2 = {
  id: 'weibull.2',
  tabShort: 'Tab 2',
  tabLong: 'Standard Weibull',
  name: 'Weibull distribution',
  variableSymbol: 'Y',
  r: { d: 'dweibull', p: 'pweibull', q: 'qweibull' },
  display: {
    title: p => `$Y\\sim \\mathrm{Weibull}(\\alpha=${latexNum(p.alpha, 4)},\\beta=1)$`,
    note:  () => 'Special case of the Weibull distribution with scale parameter = 1.',
    formula: () => '$$f(y)=\\alpha y^{\\alpha-1}e^{-y^\\alpha},\\quad y\\ge 0$$<div style="height:6px"></div>$$F(y)=1-e^{-y^\\alpha},\\quad y\\ge 0$$',
  },
  params: [
    { id: 'alpha', label: '$\\alpha$', rArg: 'shape', note: 'shape', min: 0.5, max: 10, step: 0.001, value: 1.5 },
  ],
  props: p => [
    { label: 'Support',  formula: '$y\\ge 0$',                                                                                  value: '$[0,\\infty)$' },
    { label: 'Mean',     formula: '$E(Y)=\\Gamma(1+1/\\alpha)$',                                                                value: `$${latexNum(jStat.gammafn(1 + 1 / p.alpha), 4)}$` },
    { label: 'Variance', formula: '$\\mathrm{V}(Y)=\\Gamma(1+2/\\alpha)-(\\Gamma(1+1/\\alpha))^2$',                            value: `$${latexNum((jStat.gammafn(1 + 2 / p.alpha) - Math.pow(jStat.gammafn(1 + 1 / p.alpha), 2)), 4)}$` },
  ],
  pdf:      (x, p) => x < 0 ? 0 : safePdf(() => jStat.weibull.pdf(x, 1, p.alpha)),
  cdf:      (x, p) => x < 0 ? 0 : clamp(jStat.weibull.cdf(x, 1, p.alpha), 0, 1),
  quantile: (q, p) => jStat.weibull.inv(q, 1, p.alpha),
  naturalRange: () => ({ xMin: -0.1, xMax: 4 }),
};
