import { jStat, safePdf } from '../../utils/jstatHelper.js';
import { latexNum, clamp } from '../../utils/math.js';

export const PAGE_GED_1 = {
  id: 'ged.1',
  tabShort: 'Tab 1',
  tabLong: 'GED',
  name: 'GED distribution',
  variableSymbol: 'X',
  r: { d: 'dged', p: 'pged', q: 'qged' },
  display: {
    title: p => `$X\\sim \\mathrm{GED}(\\mu=${latexNum(p.mu, 4)},\\sigma=${latexNum(p.sigma, 4)},\\nu=${latexNum(p.nu, 4)})$`,
    note:  () => 'Symmetric continuous distribution that extends the normal distribution by adding a shape parameter so it can model heavier or lighter tails and different peakedness, and it is commonly used in finance and econometrics for return/error modeling, as well as in signal and image processing and other settings where data are roughly symmetric but not well fit by a normal distribution.',
    formula: () => '$$f(x)=\\frac{\\nu}{2\\sigma\\Gamma(1/\\nu)}\\exp\\!\\left(-\\left|\\frac{x-\\mu}{\\sigma}\\right|^\\nu\\right)$$<div style="height:6px"></div>$$F(x)=0.5+0.5\\operatorname{sgn}(x-\\mu)\\frac{\\gamma(1/\\nu, |(x-\\mu)/\\sigma|^\\nu)}{\\Gamma(1/\\nu)}$$',
  },
  params: [
    { id: 'mu',    label: '$\\mu$',     note: 'location', min: -5,  max: 5,  step: 0.001, value: 0 },
    { id: 'sigma', label: '$\\sigma$',  note: 'scale',    min: 0.1, max: 5,  step: 0.001, value: 1 },
    { id: 'nu',    label: '$\\nu$',     note: 'shape',    min: 0.5, max: 10, step: 0.001, value: 2 },
  ],
  props: p => [
    { label: 'Support',       formula: '$x\\in(-\\infty,\\infty)$',                                     value: '$(-\\infty,\\infty)$' },
    { label: 'Mean',          formula: '$\\mu$',                                                         value: `$${latexNum(p.mu, 4)}$` },
    { label: 'Variance',      formula: '$\\sigma^2\\frac{\\Gamma(3/\\nu)}{\\Gamma(1/\\nu)}$',           value: `$${latexNum((p.sigma * p.sigma) * (jStat.gammafn(3 / p.nu) / jStat.gammafn(1 / p.nu)), 4)}$` },
    { label: 'Special cases', formula: '$\\nu=2$ (Normal)',                                              value: '' },
  ],
  pdf: (x, p) => {
    const z = Math.abs(x - p.mu) / p.sigma;
    const c = p.nu / (2 * p.sigma * jStat.gammafn(1 / p.nu));
    return safePdf(() => c * Math.exp(-Math.pow(z, p.nu)));
  },
  cdf: (x, p) => {
    if (x === p.mu) return 0.5;
    const z = Math.abs(x - p.mu) / p.sigma;
    const tail = clamp(jStat.gamma.cdf(Math.pow(z, p.nu), 1 / p.nu, 1), 0, 1);
    return 0.5 + 0.5 * Math.sign(x - p.mu) * tail;
  },
  quantile: (q, p) => {
    if (q <= 0) return -Infinity;
    if (q >= 1) return Infinity;
    if (q === 0.5) return p.mu;
    const tail = jStat.gamma.inv(Math.abs(2 * q - 1), 1 / p.nu, 1);
    return p.mu + Math.sign(q - 0.5) * p.sigma * Math.pow(tail, 1 / p.nu);
  },
  naturalRange: p => ({ xMin: p.mu - p.sigma * Math.pow(4, 1 / p.nu), xMax: p.mu + p.sigma * Math.pow(4, 1 / p.nu) }),
};

export const PAGE_SGED_1 = {
  id: 'sged.1',
  tabShort: 'Tab 2',
  tabLong: 'Skewed GED',
  name: 'GED distribution',
  variableSymbol: 'X',
  r: { d: 'dsged', p: 'psged', q: 'qsged' },
  display: {
    title: p => `$X\\sim \\mathrm{SGED}(\\mu=${latexNum(p.mu, 4)},\\sigma=${latexNum(p.sigma, 4)},\\nu=${latexNum(p.nu, 4)},\\lambda=${latexNum(p.lambda, 4)})$`,
    note:  () => 'Flexible continuous distribution that extends the GED by allowing both asymmetry and tail-shape control, making it useful for modeling skewed, heavy- or light-tailed data, especially in finance, econometrics, and risk modeling.',
    formula: () => '$$f(x)=\\frac{\\nu}{2\\sigma\\Gamma(1/\\nu)}\\exp\\!\\left(-\\left|\\frac{x-\\mu}{\\sigma(1+\\lambda\\operatorname{sgn}(x-\\mu))}\\right|^\\nu\\right)$$',
  },
  params: [
    { id: 'mu',     label: '$\\mu$',       note: 'location', min: -5,   max: 5,    step: 0.001, value: 0 },
    { id: 'sigma',  label: '$\\sigma$',    note: 'scale',    min: 0.1,  max: 5,    step: 0.001, value: 1 },
    { id: 'nu',     label: '$\\nu$',       note: 'shape',    min: 0.5,  max: 10,   step: 0.001, value: 2 },
    { id: 'lambda', label: '$\\lambda$',   note: 'skewness', min: -0.95, max: 0.95, step: 0.001, value: 0.5 },
  ],
  props: p => [
    { label: 'Support',       formula: '$x\\in(-\\infty,\\infty)$',    value: '$(-\\infty,\\infty)$' },
    { label: 'Mode',          formula: '$\\mu$ if $\\nu\\gt 1$',       value: p.nu > 1 ? `$${latexNum(p.mu, 4)}$` : '–' },
    { label: 'Special cases', formula: '$\\lambda=0$ (GED)',            value: '' },
  ],
  pdf: (x, p) => {
    const s = Math.sign(x - p.mu);
    const z = Math.abs(x - p.mu) / (p.sigma * (1 + p.lambda * s));
    const c = p.nu / (2 * p.sigma * jStat.gammafn(1 / p.nu));
    return safePdf(() => c * Math.exp(-Math.pow(z, p.nu)));
  },
  cdf: (x, p) => {
    if (x === p.mu) return (1 - p.lambda) / 2;
    const s = Math.sign(x - p.mu);
    const z = Math.abs(x - p.mu) / (p.sigma * (1 + p.lambda * s));
    const tail = clamp(jStat.gamma.cdf(Math.pow(z, p.nu), 1 / p.nu, 1), 0, 1);
    if (x < p.mu) return ((1 - p.lambda) / 2) * (1 - tail);
    return ((1 - p.lambda) / 2) + ((1 + p.lambda) / 2) * tail;
  },
  quantile: (q, p) => {
    if (q <= 0) return -Infinity;
    if (q >= 1) return Infinity;
    const leftProb = (1 - p.lambda) / 2;
    if (Math.abs(q - leftProb) < 1e-9) return p.mu;
    if (q < leftProb) {
      const tail = 1 - q / leftProb;
      const val = jStat.gamma.inv(tail, 1 / p.nu, 1);
      return p.mu - p.sigma * (1 - p.lambda) * Math.pow(val, 1 / p.nu);
    }
    const tail = (q - leftProb) / ((1 + p.lambda) / 2);
    const val = jStat.gamma.inv(tail, 1 / p.nu, 1);
    return p.mu + p.sigma * (1 + p.lambda) * Math.pow(val, 1 / p.nu);
  },
  naturalRange: p => ({ xMin: p.mu - p.sigma * (1 - p.lambda) * Math.pow(4, 1 / p.nu), xMax: p.mu + p.sigma * (1 + p.lambda) * Math.pow(4, 1 / p.nu) }),
};
