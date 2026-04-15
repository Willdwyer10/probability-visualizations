import { jStat, safePdf } from '../../utils/jstatHelper.js';
import { latexNum, clamp, parseNumberOrFallback } from '../../utils/math.js';

const GAP = 0.1;

export const PAGE_BETA_1 = {
  id: 'beta.1',
  tabShort: 'Tab 1',
  tabLong: 'Beta',
  name: 'Beta distribution',
  variableSymbol: 'X',
  r: { d: 'dbeta', p: 'pbeta', q: 'qbeta' },
  display: {
    title: p => `$X\\sim \\mathrm{Beta}(\\alpha=${latexNum(p.alpha, 4)},\\beta=${latexNum(p.beta, 4)};a=${latexNum(p.a, 4)},b=${latexNum(p.b, 4)})$`,
    note:  () => 'Flexible continuous distribution that is commonly used to model proportions, probabilities, and rates, with applications in Bayesian statistics, reliability, order statistics, and random-variable modeling with bounded support.',
    formula: () => '$$f(x)=\\frac{1}{b-a}\\frac{\\left(\\frac{x-a}{b-a}\\right)^{\\alpha-1}\\left(\\frac{b-x}{b-a}\\right)^{\\beta-1}}{B(\\alpha,\\beta)},\\quad a\\lt x\\lt b$$<div style="height:6px"></div>$$F(x)=I_{\\frac{x-a}{b-a}}(\\alpha,\\beta)$$',
  },
  params: param => {
    const rawA = parseNumberOrFallback(param?.a, 0);
    const rawB = parseNumberOrFallback(param?.b, 4);
    const safeB = clamp(rawB, -10 + GAP, 10);
    const safeA = clamp(rawA, -10, 10 - GAP);
    return [
      { id: 'alpha', label: '$\\alpha$', rArg: 'shape1', note: 'shape 1', min: 0.1, max: 10,  step: 0.001, value: param?.alpha ?? 2 },
      { id: 'beta',  label: '$\\beta$',  rArg: 'shape2', note: 'shape 2', min: 0.1, max: 10,  step: 0.001, value: param?.beta ?? 5 },
      { id: 'a',     label: '$a$',                        note: 'left end',  min: -10, max: Math.max(-10, safeB - GAP), step: 0.001, value: Math.min(safeA, safeB - GAP) },
      { id: 'b',     label: '$b$',                        note: 'right end', min: Math.min(10, safeA + GAP), max: 10, step: 0.001, value: Math.max(safeB, safeA + GAP) },
    ];
  },
  sanitize(p) {
    p.alpha = clamp(parseNumberOrFallback(p.alpha, 2), 0.1, 10);
    p.beta  = clamp(parseNumberOrFallback(p.beta,  5), 0.1, 10);
    p.a = clamp(parseNumberOrFallback(p.a, 0), -10, 10 - GAP);
    p.b = clamp(parseNumberOrFallback(p.b, 4), -10 + GAP, 10);
    if (p.a > p.b - GAP) {
      if (p.a <= 10 - GAP) p.b = p.a + GAP;
      else p.a = p.b - GAP;
    }
  },
  props: p => [
    { label: 'Support',  formula: '$x\\in(a,b)$',                                                value: `$[${latexNum(p.a, 2)}, ${latexNum(p.b, 2)}]$` },
    { label: 'Mean',     formula: '$a+(b-a)\\frac{\\alpha}{\\alpha+\\beta}$',                    value: `$${latexNum(p.a + (p.b - p.a) * (p.alpha / (p.alpha + p.beta)), 4)}$` },
    { label: 'Variance', formula: '$(b-a)^2\\frac{\\alpha\\beta}{(\\alpha+\\beta)^2(\\alpha+\\beta+1)}$', value: `$${latexNum(Math.pow(p.b - p.a, 2) * (p.alpha * p.beta) / (Math.pow(p.alpha + p.beta, 2) * (p.alpha + p.beta + 1)), 4)}$` },
  ],
  pdf:      (x, p) => (x <= p.a || x >= p.b) ? 0 : safePdf(() => jStat.beta.pdf((x - p.a) / (p.b - p.a), p.alpha, p.beta) / (p.b - p.a)),
  cdf:      (x, p) => x <= p.a ? 0 : (x >= p.b ? 1 : clamp(jStat.beta.cdf((x - p.a) / (p.b - p.a), p.alpha, p.beta), 0, 1)),
  quantile: (q, p) => p.a + (p.b - p.a) * jStat.beta.inv(q, p.alpha, p.beta),
  naturalRange: p => ({ xMin: p.a - 0.1 * (p.b - p.a), xMax: p.b + 0.1 * (p.b - p.a) }),
};

export const PAGE_BETA_2 = {
  id: 'beta.2',
  tabShort: 'Tab 2',
  tabLong: 'Standard Beta',
  name: 'Beta distribution',
  variableSymbol: 'Y',
  r: { d: 'dbeta', p: 'pbeta', q: 'qbeta' },
  display: {
    title: p => `$Y\\sim \\mathrm{Beta}(\\alpha=${latexNum(p.alpha, 4)},\\beta=${latexNum(p.beta, 4)})$`,
    note:  () => 'Special case of the Beta distribution on $[0,1]$.',
    formula: () => '$$f(y)=\\frac{y^{\\alpha-1}(1-y)^{\\beta-1}}{B(\\alpha,\\beta)},\\quad 0\\lt y\\lt 1$$<div style="height:6px"></div>$$F(y)=I_y(\\alpha,\\beta)$$',
  },
  params: [
    { id: 'alpha', label: '$\\alpha$', rArg: 'shape1', note: 'shape 1', min: 0.1, max: 10, step: 0.001, value: 2 },
    { id: 'beta',  label: '$\\beta$',  rArg: 'shape2', note: 'shape 2', min: 0.1, max: 10, step: 0.001, value: 5 },
  ],
  props: p => [
    { label: 'Support',  formula: '$y\\in(0,1)$',                                                   value: '$(0,1)$' },
    { label: 'Mean',     formula: '$E(Y)=\\frac{\\alpha}{\\alpha+\\beta}$',                         value: `$${latexNum(p.alpha / (p.alpha + p.beta), 4)}$` },
    { label: 'Variance', formula: '$\\mathrm{V}(Y)=\\frac{\\alpha\\beta}{(\\alpha+\\beta)^2(\\alpha+\\beta+1)}$', value: `$${latexNum((p.alpha * p.beta) / (Math.pow(p.alpha + p.beta, 2) * (p.alpha + p.beta + 1)), 4)}$` },
  ],
  pdf:      (x, p) => (x <= 0 || x >= 1) ? 0 : safePdf(() => jStat.beta.pdf(x, p.alpha, p.beta)),
  cdf:      (x, p) => x <= 0 ? 0 : (x >= 1 ? 1 : clamp(jStat.beta.cdf(x, p.alpha, p.beta), 0, 1)),
  quantile: (q, p) => jStat.beta.inv(q, p.alpha, p.beta),
  naturalRange: () => ({ xMin: -0.1, xMax: 1.1 }),
};
