import { jStat, jstatPdfSafe } from '../../utils/jstatHelper.js';
import { latexNum, clamp } from '../../utils/math.js';

export const PAGE_HYPERGEOM_1 = {
  id: 'hypergeometric.1',
  tabShort: 'Tab 1',
  tabLong: 'Hypergeometric',
  name: 'Hypergeometric distribution',
  variableSymbol: 'X',
  valueSymbol: 'x',
  hideCalculator: false,
  hideTable: false,
  display: {
    title: p => `$X\\sim\\mathrm{Hypergeom}(n=${latexNum(p.n)},M=${latexNum(p.M)},N=${latexNum(p.N)})$`,
    note:  () => 'Models the number of successes in $n$ draws without replacement from a population of size $N$ with $M$ successes.',
    formula: () => '$$\\text{h}(x;n,M,N) = \\frac{\\binom{M}{x}\\binom{N-M}{n-x}}{\\binom{N}{n}}$$',
  },
  parameters: (param) => {
    const N = Math.max(2, Math.round(parseFloat(param?.N) || 40));
    const defaultM = Math.min(18, N);
    const defaultn = Math.min(12, N);
    return [
      { id: 'N', label: '$N$', note: 'Population size',         min: 2, max: 200, step: 1, value: N },
      { id: 'M', label: '$M$', note: '# of successes in pop.',  min: 0, max: N,   step: 1, value: param?.M ?? defaultM },
      { id: 'n', label: '$n$', note: 'Sample size',             min: 1, max: N,   step: 1, value: param?.n ?? defaultn },
    ];
  },
  properties: [
    {
      id: 'support',
      label: 'Support',
      formula: () => '$x=\\max(0,n-(N-M)),\\\\\\\\\\dots,\\min(n,M)$',
      value: p => {
        const a = Math.max(0, p.n - (p.N - p.M));
        const b = Math.min(p.n, p.M);
        return `$\\{${a},\\dots,${b}\\}$`;
      },
    },
    { id: 'mean',     label: 'Mean',        formula: () => '$\\mathrm{E}(X)=n\\cdot \\frac{M}{N}$',                                                  value: p => `$${latexNum(p.n * p.M / p.N, 4)}$` },
    { id: 'variance', label: 'Variance',    formula: () => '$\\mathrm{V}(X)=\\frac{N-n}{N-1}\\cdot n\\cdot \\frac{M}{N}\\Bigl(1-\\frac{M}{N}\\Bigr)$', value: p => `$${latexNum(p.n * (p.M / p.N) * (1 - p.M / p.N) * ((p.N - p.n) / (p.N - 1)), 4)}$` },
    { id: 'failure',  label: '# of failures in pop.', formula: () => '$K=N-M$',                                                              value: p => `${p.N - p.M}` },
    { id: 'ratioN',   label: 'Ratio',       formula: () => '$\\frac{n}{N}$',                                                                          value: p => `$${latexNum(p.n / p.N, 4)}$` },
    { id: 'approx',   label: 'Approximation', formula: () => '$\\frac{n}{N}<0.05\\implies\\mathrm{Hypergeom}(n,M,N)\\approx\\mathrm{Bin}(n,\\frac{M}{N})$', value: () => '' },
  ],
  sanitize(p) {
    p.N = Math.max(2, Math.round(p.N));
    p.M = clamp(Math.round(p.M), 0, p.N);
    p.n = clamp(Math.round(p.n), 1, p.N);
  },
  theoreticalSupport: p => [Math.max(0, p.n - (p.N - p.M)), Math.min(p.n, p.M)],
  displaySupport:     p => [Math.max(0, p.n - (p.N - p.M)), Math.min(p.n, p.M)],
  mean:     p => p.n * p.M / p.N,
  variance: p => p.n * (p.M / p.N) * (1 - p.M / p.N) * ((p.N - p.n) / (p.N - 1)),
  pmf: (x, p) => {
    const a = Math.max(0, p.n - (p.N - p.M));
    const b = Math.min(p.n, p.M);
    if (!Number.isInteger(x) || x < a || x > b) return 0;
    return jstatPdfSafe(() => jStat.hypgeom.pdf(x, p.N, p.M, p.n));
  },
  rCode: {
    pmf: () => '<code>dhyper(x, m = M, n = N - M, k = n)</code>',
    cdf: () => '<code>phyper(q = x, m = M, n = N - M, k = n)</code>',
    q:   () => '<code>qhyper(p = p_L, m = M, n = N - M, k = n)</code>',
  },
  fixedAxis: p => ({ xMin: 0, xMax: Math.max(20, p.n), yMax: 1 }),
};
