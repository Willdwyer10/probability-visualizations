import { jStat, jstatPdfSafe } from '../../utils/jstatHelper.js';
import { latexNum } from '../../utils/math.js';

export const PAGE_BINOMIAL_1 = {
  id: 'binomial.1',
  tabShort: 'Tab 1',
  tabLong: 'Binomial',
  name: 'Binomial distribution',
  variableSymbol: 'X',
  valueSymbol: 'x',
  hideCalculator: false,
  hideTable: false,
  display: {
    title: p => `$X\\sim\\mathrm{Bin}(n=${latexNum(p.n)},p=${latexNum(p.p)})$`,
    note:  () => 'Models the number of successes in $n$ independent Bernoulli trials.',
    formula: () => '$$\\text{b}(x;n, p)=\\binom{n}{x}p^x(1-p)^{n-x}$$',
  },
  parameters: [
    { id: 'n', label: '$n$', note: '# of trials',  min: 1,  max: 80, step: 1,    value: 25 },
    { id: 'p', label: '$p$', note: 'Success rate',  min: 0,  max: 1,  step: 0.01, value: 0.5 },
  ],
  properties: [
    { id: 'support',    label: 'Support',      formula: () => '$x=0,\\dots,n$',                                                                                  value: p => `$\\{0,\\dots,${p.n}\\}$` },
    { id: 'mean',       label: 'Mean',         formula: () => '$\\mathrm{E}(X)=np$',                                                                              value: p => `$${latexNum(p.n * p.p, 4)}$` },
    { id: 'variance',   label: 'Variance',     formula: () => '$\\mathrm{V}(X)=np(1-p)$',                                                                         value: p => `$${latexNum(p.n * p.p * (1 - p.p), 4)}$` },
    { id: 'failure',    label: 'Failure rate', formula: () => '$q=1-p$',                                                                                           value: p => `$${latexNum(1 - p.p, 4)}$` },
    { id: 'special',    label: 'Special case', formula: () => '$\\mathrm{Bin}(n=1,p)=\\mathrm{Bern}(p)$',                                                         value: () => '' },
    { id: 'approx',     label: 'Approximation', formula: () => '$n>50, np<5\\implies\\\\\\\\\\mathrm{Bin}(n,p)\\approx\\mathrm{Pois}(\\lambda=np)$',              value: () => '' },
  ],
  theoreticalSupport: p => [0, p.n],
  displaySupport:     p => [0, p.n],
  mean:     p => p.n * p.p,
  variance: p => p.n * p.p * (1 - p.p),
  pmf: (x, p) => {
    if (!Number.isInteger(x) || x < 0 || x > p.n) return 0;
    return jstatPdfSafe(() => jStat.binomial.pdf(x, p.n, p.p));
  },
  rCode: {
    pmf: () => '<code>dbinom(x, size = n, prob = p)</code>',
    cdf: () => '<code>pbinom(q = x, size = n, prob = p)</code>',
    q:   () => '<code>qbinom(p = p_L, size = n, prob = p)</code>',
  },
  fixedAxis: p => ({ xMin: 0, xMax: Math.max(20, p.n), yMax: 1 }),
};
