import { latexNum, clamp, parseNumberOrFallback } from '../../utils/math.js';

const GAP = 0.2;

export const PAGE_UNIFORM_1 = {
  id: 'uniform.1',
  tabShort: 'Tab 1',
  tabLong: 'Uniform',
  name: 'Uniform distribution',
  variableSymbol: 'X',
  r: { d: 'dunif', p: 'punif', q: 'qunif' },
  display: {
    title: p => `$X\\sim \\mathrm{Unif}(a=${latexNum(p.a, 4)},b=${latexNum(p.b, 4)})$`,
    note:  () => 'Assigns equal density to all values on a fixed interval and is used in random number generation, simulation, Monte Carlo methods, and representing quantities that are equally likely within known bounds.',
    formula: () => '$$f(x)=\\frac{1}{b-a},\\quad a\\le x\\le b$$<div style="height:6px"></div>$$F(x)=P(X\\le x)=\\begin{cases} 0, & x \\lt a \\\\[6pt] \\dfrac{x-a}{b-a}, & a \\le x \\le b \\\\[6pt] 1, & x \\gt b \\end{cases}$$',
  },
  params: param => {
    const rawA = parseNumberOrFallback(param?.a, 0);
    const rawB = parseNumberOrFallback(param?.b, 1);
    const safeB = clamp(rawB, -5 + GAP, 5);
    const safeA = clamp(rawA, -5, 5 - GAP);
    return [
      { id: 'a', label: '$a$', rArg: 'min', note: 'lower bound', min: -5, max: Math.max(-5, safeB - GAP), step: 0.001, value: Math.min(safeA, safeB - GAP) },
      { id: 'b', label: '$b$', rArg: 'max', note: 'upper bound', min: Math.min(5, safeA + GAP), max: 5, step: 0.001, value: Math.max(safeB, safeA + GAP) },
    ];
  },
  sanitize(p) {
    p.a = clamp(parseNumberOrFallback(p.a, 0), -5, 5 - GAP);
    p.b = clamp(parseNumberOrFallback(p.b, 1), -5 + GAP, 5);
    if (p.a > p.b - GAP) {
      if (p.a <= 5 - GAP) p.b = p.a + GAP;
      else p.a = p.b - GAP;
    }
  },
  props: p => [
    { label: 'Support',  formula: '$a\\le x\\le b$',         value: `$[${latexNum(p.a, 2)},${latexNum(p.b, 2)}]$` },
    { label: 'Mean',     formula: '$E(X)=(a+b)/2$',          value: `$${latexNum(0.5 * (p.a + p.b), 4)}$` },
    { label: 'Variance', formula: '$\\mathrm{V}(X)=(b-a)^2/12$', value: `$${latexNum(Math.pow(p.b - p.a, 2) / 12, 4)}$` },
  ],
  pdf:      (x, p) => (x < p.a || x > p.b) ? 0 : 1 / (p.b - p.a),
  cdf:      (x, p) => x <= p.a ? 0 : (x >= p.b ? 1 : (x - p.a) / (p.b - p.a)),
  quantile: (q, p) => p.a + q * (p.b - p.a),
  naturalRange: p => ({ xMin: p.a - 0.2 * (p.b - p.a), xMax: p.b + 0.2 * (p.b - p.a) }),
};

export const PAGE_UNIFORM_2 = {
  id: 'uniform.2',
  tabShort: 'Tab 2',
  tabLong: 'Standard uniform',
  name: 'Uniform distribution',
  variableSymbol: 'Y',
  r: { d: 'dunif', p: 'punif', q: 'qunif' },
  display: {
    title: () => '$Y\\sim \\mathrm{Unif}(0,1)$',
    note:  () => 'Special case of the uniform distribution over the unit interval $[0,1]$.',
    formula: () => '$$f(y)=1,\\quad 0\\le y\\le 1$$<div style="height:6px"></div>$$F(y)=P(Y\\le y)=y,\\quad 0\\le y\\le 1$$',
  },
  params: [],
  props: () => [
    { label: 'Support',  formula: '$y\\in[0,1]$',            value: '$[0,1]$' },
    { label: 'Mean',     formula: '$E(Y)=1/2$',              value: '$0.5$' },
    { label: 'Variance', formula: '$\\mathrm{V}(Y)=1/12$',   value: `$${latexNum(1 / 12, 4)}$` },
  ],
  pdf:      x => (x < 0 || x > 1) ? 0 : 1,
  cdf:      x => x < 0 ? 0 : (x > 1 ? 1 : x),
  quantile: q => clamp(q, 0, 1),
  naturalRange: () => ({ xMin: -0.2, xMax: 1.2 }),
};
