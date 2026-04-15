import { jStat, safePdf } from '../../utils/jstatHelper.js';
import { latexNum, clamp } from '../../utils/math.js';

export const PAGE_T_1 = {
  id: 't.1',
  tabShort: 'Tab 1',
  tabLong: "Student t",
  name: "Student's t distribution",
  variableSymbol: 'T',
  r: { d: 'dt', p: 'pt', q: 'qt' },
  display: {
    title: p => `$T\\sim t(\\nu=${latexNum(p.nu, 4)})$`,
    note:  () => "Symmetric, bell-shaped continuous distribution with heavier tails than the normal distribution, making it especially useful for inference about means when sample sizes are small or the population standard deviation is unknown.",
    formula: () => '$$f(t)=\\frac{\\Gamma\\left((\\nu+1)/2\\right)}{\\sqrt{\\nu\\pi}\\,\\Gamma(\\nu/2)}\\left(1+\\frac{t^2}{\\nu}\\right)^{-(\\nu+1)/2}$$<div style="height:6px"></div>$$F(t)=P(T\\le t)=\\int_{-\\infty}^{t}\\frac{\\Gamma\\left((\\nu+1)/2\\right)}{\\sqrt{\\nu\\pi}\\,\\Gamma(\\nu/2)}\\left(1+\\frac{u^2}{\\nu}\\right)^{-(\\nu+1)/2}du$$',
  },
  params: [
    { id: 'nu', rArg: 'df', label: '$\\nu$', note: 'degrees of freedom', min: 1, max: 60, step: 1, value: 10 },
  ],
  props: p => [
    { label: 'Support',  formula: '$t\\in(-\\infty,\\infty)$',                           value: '$(-\\infty,\\infty)$' },
    { label: 'Mean',     formula: '$E(T)=0$ for $\\nu\\gt 1$',                           value: p.nu > 1 ? '$0$' : 'undefined' },
    { label: 'Variance', formula: '$\\mathrm{V}(T)=\\nu/(\\nu-2)$ for $\\nu\\gt 2$',    value: p.nu > 2 ? `$${latexNum(p.nu / (p.nu - 2), 4)}$` : '$\\infty$' },
    { label: 'Symmetry', formula: '$f(-t)=f(t)$',                                        value: '' },
  ],
  pdf:      (x, p) => safePdf(() => jStat.studentt.pdf(x, p.nu)),
  cdf:      (x, p) => clamp(jStat.studentt.cdf(x, p.nu), 0, 1),
  quantile: (q, p) => jStat.studentt.inv(q, p.nu),
  naturalRange: () => ({ xMin: -5, xMax: 5 }),
};

export const PAGE_T_2 = {
  id: 't.2',
  tabShort: 'Tab 2',
  tabLong: "Skewed Student's t",
  name: "Student's t distribution",
  variableSymbol: 'T',
  r: { d: 'dsstd', p: 'psstd', q: 'qsstd' },
  display: {
    title: p => `$T\\sim \\mathrm{SST}(\\mu=${latexNum(p.mu, 4)},\\sigma=${latexNum(p.sigma, 4)},\\nu=${latexNum(p.nu, 4)},\\lambda=${latexNum(p.lambda, 4)})$`,
    note:  () => "Flexible continuous distribution that extends the ordinary Student's t distribution by allowing both asymmetry (skewness) and heavy tails, making it especially useful in finance and econometrics for modeling asset returns, volatility innovations, and risk measures such as Value-at-Risk when data are not well described by a symmetric t or normal distribution.",
    formula: () => '$$f(t)=\\begin{cases} \\dfrac{1}{\\sigma}f_{\\nu}\\!\\left(\\dfrac{t-\\mu}{\\sigma(1-\\lambda)}\\right), & t\\le\\mu\\\\[6pt] \\dfrac{1}{\\sigma}f_{\\nu}\\!\\left(\\dfrac{t-\\mu}{\\sigma(1+\\lambda)}\\right), & t\\gt\\mu \\end{cases}$$',
  },
  params: [
    { id: 'mu',     label: '$\\mu$',     note: 'location',          min: -5,   max: 5,    step: 0.001, value: 0 },
    { id: 'sigma',  label: '$\\sigma$',  note: 'scale',             min: 0.1,  max: 5,    step: 0.001, value: 1 },
    { id: 'nu',     label: '$\\nu$',     note: 'degrees of freedom', min: 1,   max: 60,   step: 1,     value: 10 },
    { id: 'lambda', label: '$\\lambda$', note: 'skewness',          min: -0.95, max: 0.95, step: 0.001, value: 0.3 },
  ],
  props: p => [
    { label: 'Support',       formula: '$t\\in(-\\infty,\\infty)$',               value: '$(-\\infty,\\infty)$' },
    { label: 'Mode',          formula: '$\\mu$',                                   value: `$${latexNum(p.mu, 4)}$` },
    { label: 'Special cases', formula: "$\\lambda=0$ (Student's t)",               value: '' },
  ],
  pdf: (x, p) => {
    const s = Math.sign(x - p.mu);
    const scale = p.sigma * (1 + p.lambda * s);
    const z = (x - p.mu) / scale;
    return safePdf(() => jStat.studentt.pdf(z, p.nu) / p.sigma);
  },
  cdf: (x, p) => {
    if (x === p.mu) return (1 - p.lambda) / 2;
    if (x < p.mu) {
      const z = (x - p.mu) / (p.sigma * (1 - p.lambda));
      return clamp((1 - p.lambda) * jStat.studentt.cdf(z, p.nu), 0, 1);
    }
    const z = (x - p.mu) / (p.sigma * (1 + p.lambda));
    return clamp(-p.lambda + (1 + p.lambda) * jStat.studentt.cdf(z, p.nu), 0, 1);
  },
  quantile: (q, p) => {
    if (q <= 0) return -Infinity;
    if (q >= 1) return Infinity;
    const leftProb = (1 - p.lambda) / 2;
    if (Math.abs(q - leftProb) < 1e-12) return p.mu;
    if (q < leftProb) {
      const z = jStat.studentt.inv(q / (1 - p.lambda), p.nu);
      return p.mu + p.sigma * (1 - p.lambda) * z;
    }
    const z = jStat.studentt.inv((q + p.lambda) / (1 + p.lambda), p.nu);
    return p.mu + p.sigma * (1 + p.lambda) * z;
  },
  naturalRange: p => ({ xMin: p.mu - 5 * p.sigma * (1 - p.lambda), xMax: p.mu + 5 * p.sigma * (1 + p.lambda) }),
};
