import { jStat, jstatPdfSafe } from '../../utils/jstatHelper.js';
import { latexNum } from '../../utils/math.js';

export const PAGE_NB_1 = {
  id: 'negativeBinomial.1',
  tabShort: 'Ver 1',
  tabLong: 'Failures before goal',
  name: 'Negative binomial distribution',
  variableSymbol: 'X',
  valueSymbol: 'x',
  hideCalculator: false,
  hideTable: false,
  display: {
    title: p => `$X\\sim\\mathrm{NB}(r=${latexNum(p.r)},p=${latexNum(p.p)})$`,
    note:  () => 'Version 1: $X=Y-r$ (see $Y$ in Ver 2) counts failures before the $r$-th success. Infinite support.',
    formula: () => '$$\\text{nb}(x;r,p) = \\binom{x+r-1}{x}(1-p)^x p^r$$',
  },
  parameters: [
    { id: 'r', label: '$r$', note: 'Target # of successes', min: 1,    max: 40, step: 1,    value: 5 },
    { id: 'p', label: '$p$', note: 'Success rate',          min: 0.01, max: 1,  step: 0.01, value: 0.45 },
  ],
  properties: [
    { id: 'support',  label: 'Support',      formula: () => '$x=0,1,2,\\dots$',                              value: () => '$\\{0,1,2,\\dots\\}$' },
    { id: 'mean',     label: 'Mean',         formula: () => '$\\mathrm{E}(X)=\\dfrac{r(1-p)}{p}$',          value: p => `$${latexNum(p.r * (1 - p.p) / p.p, 4)}$` },
    { id: 'variance', label: 'Variance',     formula: () => '$\\mathrm{V}(X)=\\dfrac{r(1-p)}{p^2}$',        value: p => `$${latexNum(p.r * (1 - p.p) / (p.p * p.p), 4)}$` },
    { id: 'failure',  label: 'Failure rate', formula: () => '$q=1-p$',                                      value: p => `$${latexNum(1 - p.p, 4)}$` },
    { id: 'special',  label: 'Special case', formula: () => '$\\mathrm{NB}(r=1,p)=\\mathrm{Geom}(p)$',     value: () => '' },
  ],
  theoreticalSupport: () => [0, Infinity],
  displaySupport: null,
  mean:     p => p.r * (1 - p.p) / p.p,
  variance: p => p.r * (1 - p.p) / (p.p * p.p),
  pmf: (x, p) => {
    if (!Number.isInteger(x) || x < 0) return 0;
    return jstatPdfSafe(() => jStat.negbin.pdf(x, p.r, p.p));
  },
  rCode: {
    pmf: () => '<code>dnbinom(x, size = r, prob = p)</code>',
    cdf: () => '<code>pnbinom(q = x, size = r, prob = p)</code>',
    q:   () => '<code>qnbinom(p = p_L, size = r, prob = p)</code>',
  },
  fixedAxis: p => {
    const variance = p.r * (1 - p.p) / (p.p * p.p);
    const mean = p.r * (1 - p.p) / p.p;
    return { xMin: 0, xMax: Math.max(20, Math.ceil(mean + 4 * Math.sqrt(variance))), yMax: 1 };
  },
};

export const PAGE_NB_2 = {
  id: 'negativeBinomial.2',
  tabShort: 'Ver 2',
  tabLong: 'Trials until goal',
  name: 'Negative binomial distribution',
  variableSymbol: 'Y',
  valueSymbol: 'y',
  hideCalculator: false,
  hideTable: false,
  display: {
    title: p => `$Y\\sim\\mathrm{NB2}(r=${latexNum(p.r)},p=${latexNum(p.p)})$`,
    note:  () => 'Version 2: $Y=X+r$ (see $X$ in Ver 1) counts total trials until the $r$-th success. Infinite support.',
    formula: () => '$$\\text{nb2}(y;r,p) = \\binom{y-1}{r-1}(1-p)^{y-r}p^r$$',
  },
  parameters: [
    { id: 'r', label: '$r$', note: 'Target # of successes', min: 1,    max: 40, step: 1,    value: 5 },
    { id: 'p', label: '$p$', note: 'Success rate',          min: 0.01, max: 1,  step: 0.01, value: 0.45 },
  ],
  properties: [
    { id: 'support',  label: 'Support',      formula: () => '$y=r,r+1,r+2,\\dots$',                         value: p => `$\\{${p.r},${p.r + 1},${p.r + 2},\\dots\\}$` },
    { id: 'mean',     label: 'Mean',         formula: () => '$\\mathrm{E}(Y)=\\dfrac{r}{p}$',               value: p => `$${latexNum(p.r / p.p, 4)}$` },
    { id: 'variance', label: 'Variance',     formula: () => '$\\mathrm{V}(Y)=\\dfrac{r(1-p)}{p^2}$',        value: p => `$${latexNum(p.r * (1 - p.p) / (p.p * p.p), 4)}$` },
    { id: 'failure',  label: 'Failure rate', formula: () => '$q=1-p$',                                      value: p => `$${latexNum(1 - p.p, 4)}$` },
    { id: 'special',  label: 'Special case', formula: () => '$\\mathrm{NB2}(r=1,p)=\\mathrm{Geom2}(p)$',   value: () => '' },
  ],
  theoreticalSupport: p => [p.r, Infinity],
  displaySupport: null,
  mean:     p => p.r / p.p,
  variance: p => p.r * (1 - p.p) / (p.p * p.p),
  pmf: (y, p) => {
    if (!Number.isInteger(y) || y < p.r) return 0;
    return jstatPdfSafe(() => jStat.negbin.pdf(y - p.r, p.r, p.p));
  },
  rCode: {
    pmf: () => '<code>dnbinom(x = y - r, size = r, prob = p)</code>',
    cdf: () => '<code>pnbinom(q = y - r, size = r, prob = p)</code>',
    q:   () => '<code>qnbinom(p = p_L, size = r, prob = p) + r</code>',
  },
  fixedAxis: p => {
    const variance = p.r * (1 - p.p) / (p.p * p.p);
    const mean = p.r / p.p;
    return { xMin: p.r, xMax: Math.max(p.r + 20, Math.ceil(mean + 4 * Math.sqrt(variance))), yMax: 1 };
  },
};
