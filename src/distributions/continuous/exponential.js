import { jStat, safePdf } from '../../utils/jstatHelper.js';
import { latexNum, clamp } from '../../utils/math.js';

export const PAGE_EXPONENTIAL_1 = {
  id: 'exponential.1',
  tabShort: 'Tab 1',
  tabLong: 'Exponential',
  name: 'Exponential distribution',
  variableSymbol: 'X',
  r: { d: 'dexp', p: 'pexp', q: 'qexp' },
  display: {
    title: p => `$X\\sim \\mathrm{Exp}(\\lambda=${latexNum(p.lambda, 4)})$`,
    note:  () => 'Models nonnegative waiting times with the memoryless property, is widely used in queueing, reliability, and survival analysis, and arises naturally in a Poisson process as the distribution of interarrival times.',
    formula: () => '$$f(x)=\\lambda e^{-\\lambda x},\\quad x\\ge 0$$<div style="height:6px"></div>$$F(x)=P(X\\le x)=1-e^{-\\lambda x},\\quad x\\ge 0$$',
  },
  params: [
    { id: 'lambda', label: '$\\lambda$', rArg: 'rate', note: 'rate', min: 0.1, max: 5, step: 0.001, value: 1 },
  ],
  props: p => [
    { label: 'Support',    formula: '$x\\ge 0$',                                        value: '$[0,\\infty)$' },
    { label: 'Mean',       formula: '$E(X)=1/\\lambda$',                                value: `$${latexNum(1 / p.lambda, 4)}$` },
    { label: 'Variance',   formula: '$\\mathrm{V}(X)=1/\\lambda^2$',                   value: `$${latexNum(1 / (p.lambda * p.lambda), 4)}$` },
    { label: 'Memoryless', formula: '$P(X\\gt s+t\\mid X\\gt s)=P(X\\gt t)$',          value: '' },
  ],
  pdf:      (x, p) => x < 0 ? 0 : safePdf(() => jStat.exponential.pdf(x, p.lambda)),
  cdf:      (x, p) => x < 0 ? 0 : clamp(jStat.exponential.cdf(x, p.lambda), 0, 1),
  quantile: (q, p) => jStat.exponential.inv(q, p.lambda),
  naturalRange: p => ({ xMin: -0.1, xMax: Math.max(6 / p.lambda, 2) }),
};
