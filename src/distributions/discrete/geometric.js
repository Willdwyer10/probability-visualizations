import { jStat, jstatPdfSafe } from '../../utils/jstatHelper.js';
import { latexNum } from '../../utils/math.js';

export const PAGE_GEOMETRIC_1 = {
  id: 'geometric.1',
  tabShort: 'Ver 1',
  tabLong: 'Failures before success',
  name: 'Geometric distribution',
  variableSymbol: 'X',
  valueSymbol: 'x',
  hideCalculator: false,
  hideTable: false,
  display: {
    title: p => `$X\\sim\\mathrm{Geom}(p=${latexNum(p.p)})$`,
    note:  () => 'Version 1: $X = Y-1$ (see $Y$ in Ver 2) counts failures before the first success. Infinite support.',
    formula: () => '$$\\text{geom}(x; p) = (1-p)^x p$$',
  },
  parameters: [
    { id: 'p', label: '$p$', note: 'Success rate', min: 0.01, max: 1, step: 0.01, value: 0.35 },
  ],
  properties: [
    { id: 'support',     label: 'Support',     formula: () => '$x=0,1,2,\\dots$',                                   value: () => '$\\{0,1,2,\\dots\\}$' },
    { id: 'mean',        label: 'Mean',         formula: () => '$\\mathrm{E}(X)=\\dfrac{1-p}{p}$',                   value: p => `$${latexNum((1 - p.p) / p.p, 4)}$` },
    { id: 'variance',    label: 'Variance',     formula: () => '$\\mathrm{V}(X)=\\dfrac{1-p}{p^2}$',                 value: p => `$${latexNum((1 - p.p) / (p.p * p.p), 4)}$` },
    { id: 'failure',     label: 'Failure rate', formula: () => '$q=1-p$',                                            value: p => `$${latexNum(1 - p.p, 4)}$` },
    { id: 'memoryless',  label: 'Memoryless',   formula: () => '$P(X>s+t\\mid X>s)=P(X>t)$',                        value: () => '' },
    { id: 'equivalence', label: 'Equivalence',  formula: () => '$\\mathrm{Geom}(p)=\\mathrm{NB}(r=1,p)$',           value: () => '' },
  ],
  theoreticalSupport: () => [0, Infinity],
  displaySupport: null, // computed dynamically
  mean:     p => (1 - p.p) / p.p,
  variance: p => (1 - p.p) / (p.p * p.p),
  pmf: (x, p) => {
    if (!Number.isInteger(x) || x < 0) return 0;
    return jstatPdfSafe(() => jStat.negbin.pdf(x, 1, p.p));
  },
  rCode: {
    pmf: () => '<code>dgeom(x, prob = p)</code>',
    cdf: () => '<code>pgeom(q = x, prob = p)</code>',
    q:   () => '<code>qgeom(p = p_L, prob = p)</code>',
  },
  fixedAxis: p => {
    const variance = (1 - p.p) / (p.p * p.p);
    const mean = (1 - p.p) / p.p;
    return { xMin: 0, xMax: Math.max(20, Math.ceil(mean + 4 * Math.sqrt(variance))), yMax: 1 };
  },
};

export const PAGE_GEOMETRIC_2 = {
  id: 'geometric.2',
  tabShort: 'Ver 2',
  tabLong: 'Trials until success',
  name: 'Geometric distribution',
  variableSymbol: 'Y',
  valueSymbol: 'y',
  hideCalculator: false,
  hideTable: false,
  display: {
    title: p => `$Y\\sim\\mathrm{Geom2}(p=${latexNum(p.p)})$`,
    note:  () => 'Version 2: $Y=X+1$ (see $X$ in Ver 1) counts total trials until the first success. Infinite support.',
    formula: () => '$$\\text{geom2}(y; p) = (1-p)^{y-1} p$$',
  },
  parameters: [
    { id: 'p', label: '$p$', note: 'Success rate', min: 0.01, max: 1, step: 0.01, value: 0.35 },
  ],
  properties: [
    { id: 'support',     label: 'Support',     formula: () => '$y=1,2,3,\\dots$',                                  value: () => '$\\{1,2,3,\\dots\\}$' },
    { id: 'mean',        label: 'Mean',         formula: () => '$\\mathrm{E}(Y)=\\dfrac{1}{p}$',                   value: p => `$${latexNum(1 / p.p, 4)}$` },
    { id: 'variance',    label: 'Variance',     formula: () => '$\\mathrm{V}(Y)=\\dfrac{1-p}{p^2}$',               value: p => `$${latexNum((1 - p.p) / (p.p * p.p), 4)}$` },
    { id: 'failure',     label: 'Failure rate', formula: () => '$q=1-p$',                                          value: p => `$${latexNum(1 - p.p, 4)}$` },
    { id: 'memoryless',  label: 'Memoryless',   formula: () => '$P(Y>s+t\\mid Y>s)=P(Y>t)$',                      value: () => '' },
    { id: 'equivalence', label: 'Equivalence',  formula: () => '$\\mathrm{Geom2}(p)=\\mathrm{NB2}(r=1,p)$',       value: () => '' },
  ],
  theoreticalSupport: () => [1, Infinity],
  displaySupport: null, // computed dynamically
  mean:     p => 1 / p.p,
  variance: p => (1 - p.p) / (p.p * p.p),
  pmf: (y, p) => {
    if (!Number.isInteger(y) || y < 1) return 0;
    return jstatPdfSafe(() => jStat.negbin.pdf(y - 1, 1, p.p));
  },
  rCode: {
    pmf: () => '<code>dgeom(x = y - 1, prob = p)</code>',
    cdf: () => '<code>pgeom(q = y - 1, prob = p)</code>',
    q:   () => '<code>qgeom(p = p_L, prob = p) + 1</code>',
  },
  fixedAxis: p => {
    const variance = (1 - p.p) / (p.p * p.p);
    const mean = 1 / p.p;
    return { xMin: 1, xMax: Math.max(21, Math.ceil(mean + 4 * Math.sqrt(variance))), yMax: 1 };
  },
};
