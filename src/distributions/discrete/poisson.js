import { jStat, jstatPdfSafe } from '../../utils/jstatHelper.js';
import { latexNum, clamp, snapToStep, parseNumberOrFallback } from '../../utils/math.js';

export const PAGE_POISSON_1 = {
  id: 'poisson.1',
  tabShort: 'Tab 1',
  tabLong: 'Poisson distribution',
  name: 'Poisson distribution',
  variableSymbol: 'X',
  valueSymbol: 'x',
  hideCalculator: false,
  hideTable: false,
  display: {
    title: p => `$X\\sim\\mathrm{Pois}(\\mu=${latexNum(p.mu)})$`,
    note:  () => 'Models # of independent events occurring with a constant average rate in a fixed region of time or space. Infinite support.',
    formula: () => '$$\\mathrm{pois}(x;\\mu)=e^{-\\mu}\\frac{\\mu^x}{x!}$$',
  },
  parameters: [
    { id: 'mu', label: '$\\mu\\ (\\text{or }\\lambda)$', note: 'Average # of occurrence', min: 0.2, max: 60, step: 0.1, value: 8 },
  ],
  properties: [
    { id: 'support',  label: 'Support',  formula: () => '$x=0,1,2,\\dots$',  value: () => '$\\{0,1,2,\\dots\\}$' },
    { id: 'mean',     label: 'Mean',     formula: () => '$\\mathrm{E}(X)=\\mu$', value: p => `$${latexNum(p.mu, 4)}$` },
    { id: 'variance', label: 'Variance', formula: () => '$\\mathrm{V}(X)=\\mu$', value: p => `$${latexNum(p.mu, 4)}$` },
  ],
  sanitize(p) {
    p.mu = clamp(parseNumberOrFallback(p.mu, 8), 0.2, 60);
    p.mu = snapToStep(p.mu, 0.2, 0.1);
  },
  theoreticalSupport: () => [0, Infinity],
  displaySupport: null,
  mean:     p => p.mu,
  variance: p => p.mu,
  pmf: (x, p) => {
    if (!Number.isInteger(x) || x < 0) return 0;
    return jstatPdfSafe(() => jStat.poisson.pdf(x, p.mu));
  },
  rCode: {
    pmf: () => '<code>dpois(x, lambda = mu)</code>',
    cdf: () => '<code>ppois(q = x, lambda = mu)</code>',
    q:   () => '<code>qpois(p = p_L, lambda = mu)</code>',
  },
  fixedAxis: p => ({ xMin: 0, xMax: Math.max(20, Math.ceil(p.mu + 4 * Math.sqrt(p.mu))), yMax: 1 }),
};

export const PAGE_POISSON_2 = {
  id: 'poisson.2',
  tabShort: 'Tab 2',
  tabLong: 'Poisson process',
  name: 'Poisson distribution',
  variableSymbol: 'N(t)',
  valueSymbol: 'x',
  hideCalculator: false,
  hideTable: false,
  display: {
    title: p => `$N(t)\\sim\\mathrm{Pois}(\\mu=${latexNum(p.alpha * p.time)})$`,
    note:  () => 'Models # of independent events occurring with a constant average rate $\\alpha$ in a fixed region of time or space with measurement $t$. Infinite support.',
    formula: () => '$$\\mathrm{pois}(x;\\alpha, t)=e^{-\\mu}\\frac{\\mu^x}{x!},\\quad \\mu=\\alpha t$$',
  },
  parameters: [
    { id: 'alpha', label: '$\\alpha$', note: 'Intensity rate', min: 0.1, max: 30, step: 0.1, value: 2 },
    { id: 'time',  label: '$t$',       note: 'Measurement',    min: 0.1, max: 30, step: 0.1, value: 4 },
  ],
  properties: [
    { id: 'support',    label: 'Support',                            formula: () => '$x=0,1,2,\\dots$',         value: () => '$\\{0,1,2,\\dots\\}$' },
    { id: 'mean',       label: 'Mean',                               formula: () => '$\\mathrm{E}(N(t))=\\alpha t$', value: p => `$${latexNum(p.alpha * p.time, 4)}$` },
    { id: 'variance',   label: 'Variance',                           formula: () => '$\\mathrm{Var}(N(t))=\\alpha t$', value: p => `$${latexNum(p.alpha * p.time, 4)}$` },
    { id: 'rateParam',  label: 'Average # of occurrence over region', formula: () => '$\\mu=\\alpha t$',          value: p => `$${latexNum(p.alpha * p.time, 4)}$` },
  ],
  sanitize(p) {
    p.alpha = snapToStep(clamp(parseNumberOrFallback(p.alpha, 2), 0.1, 30), 0.1, 0.1);
    p.time  = snapToStep(clamp(parseNumberOrFallback(p.time, 4), 0.1, 30),  0.1, 0.1);
  },
  theoreticalSupport: () => [0, Infinity],
  displaySupport: null,
  mean:     p => p.alpha * p.time,
  variance: p => p.alpha * p.time,
  pmf: (x, p) => {
    const mu = p.alpha * p.time;
    if (!Number.isInteger(x) || x < 0) return 0;
    return jstatPdfSafe(() => jStat.poisson.pdf(x, mu));
  },
  rCode: {
    pmf: () => '<code>dpois(x, lambda = alpha * t)</code>',
    cdf: () => '<code>ppois(q = x, lambda = alpha * t)</code>',
    q:   () => '<code>qpois(p = p_L, lambda = alpha * t)</code>',
  },
  fixedAxis: p => {
    const mu = p.alpha * p.time;
    return { xMin: 0, xMax: Math.max(20, Math.ceil(mu + 4 * Math.sqrt(mu))), yMax: 1 };
  },
};
