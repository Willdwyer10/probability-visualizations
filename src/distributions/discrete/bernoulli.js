import { jStat, jstatPdfSafe } from '../../utils/jstatHelper.js';
import { latexNum } from '../../utils/math.js';

export const PAGE_BERNOULLI_1 = {
  id: 'bernoulli.1',
  tabShort: 'Tab 1',
  tabLong: 'Bernoulli',
  name: 'Bernoulli distribution',
  variableSymbol: 'X',
  valueSymbol: 'x',
  hideCalculator: false,
  hideTable: false,
  display: {
    title: p => `$X\\sim\\mathrm{Bern}(p=${latexNum(p.p)})$`,
    note: () => 'Models a single trial with success rate $p$.',
    formula: () => `$$\\text{bern}(x; p) = \\begin{cases} 1-p, & \\text{if } x = 0,\\\\ p, & \\text{if } x = 1. \\end{cases}$$`,
  },
  parameters: [
    { id: 'p', label: '$p$', note: 'Success rate', min: 0, max: 1, step: 0.01, value: 0.5 },
  ],
  properties: [
    { id: 'support',     label: 'Support',     formula: () => '$x=0,1$',                                        value: () => '$\\{0,1\\}$' },
    { id: 'mean',        label: 'Mean',         formula: () => '$\\mathrm{E}(X)=p$',                             value: p => `$${latexNum(p.p, 4)}$` },
    { id: 'variance',    label: 'Variance',     formula: () => '$\\mathrm{V}(X)=p(1-p)$',                        value: p => `$${latexNum(p.p * (1 - p.p), 4)}$` },
    { id: 'failure',     label: 'Failure rate', formula: () => '$q=1-p$',                                        value: p => `$${latexNum(1 - p.p, 4)}$` },
    { id: 'equivalence', label: 'Equivalence',  formula: () => '$\\mathrm{Bern}(p)=\\mathrm{Bin}(n=1,p)$',      value: () => '' },
  ],
  theoreticalSupport: () => [0, 1],
  displaySupport:     () => [0, 1],
  mean:     p => p.p,
  variance: p => p.p * (1 - p.p),
  pmf: (x, p) => {
    if (!Number.isInteger(x) || x < 0 || x > 1) return 0;
    return jstatPdfSafe(() => jStat.binomial.pdf(x, 1, p.p));
  },
  rCode: {
    pmf: () => '<code>dbinom(x, size = 1, prob = p)</code>',
    cdf: () => '<code>pbinom(q = x, size = 1, prob = p)</code>',
    q:   () => '<code>qbinom(p = p_L, size = 1, prob = p)</code>',
  },
  fixedAxis: () => ({ xMin: 0, xMax: 1, yMax: 1 }),
};
