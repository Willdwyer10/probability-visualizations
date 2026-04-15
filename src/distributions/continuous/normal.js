import { jStat, safePdf } from '../../utils/jstatHelper.js';
import { latexNum, clamp } from '../../utils/math.js';

export const PAGE_NORMAL_1 = {
  id: 'normal.1',
  tabShort: 'Tab 1',
  tabLong: 'Normal',
  name: 'Normal distribution',
  variableSymbol: 'X',
  r: { d: 'dnorm', p: 'pnorm', q: 'qnorm' },
  display: {
    title: p => `$X\\sim N(\\mu=${latexNum(p.mu, 4)},\\sigma=${latexNum(p.sigma, 4)})$`,
    note:  () => 'Symmetric, bell-shaped continuous probability distribution, determined by its mean and standard deviation. It is widely used to model data clustering around an average, and its ubiquity is underpinned by the Central Limit Theorem.',
    formula: () => '$$f(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}}\\exp\\!\\left(-\\frac{(x-\\mu)^2}{2\\sigma^2}\\right)$$<div style="height:6px"></div>$$F(x)=P(X\\le x)=\\int_{-\\infty}^{x}\\frac{1}{\\sigma\\sqrt{2\\pi}}\\exp\\!\\left(-\\frac{(t-\\mu)^2}{2\\sigma^2}\\right)dt$$',
  },
  params: [
    { id: 'mu',    label: '$\\mu$',     rArg: 'mean', note: 'mean',     min: -5,  max: 5, step: 0.001, value: 0 },
    { id: 'sigma', label: '$\\sigma$',  rArg: 'sd',   note: 'std. dev.', min: 0.1, max: 5, step: 0.001, value: 1 },
  ],
  props: p => [
    { label: 'Support',  formula: '$x\\in(-\\infty,\\infty)$', value: '$(-\\infty,\\infty)$' },
    { label: 'Mean',     formula: '$E(X)=\\mu$',               value: `$${latexNum(p.mu, 4)}$` },
    { label: 'Variance', formula: '$\\mathrm{V}(X)=\\sigma^2$', value: `$${latexNum(p.sigma * p.sigma, 4)}$` },
  ],
  pdf:      (x, p) => safePdf(() => jStat.normal.pdf(x, p.mu, p.sigma)),
  cdf:      (x, p) => clamp(jStat.normal.cdf(x, p.mu, p.sigma), 0, 1),
  quantile: (q, p) => jStat.normal.inv(q, p.mu, p.sigma),
  naturalRange: p => ({ xMin: p.mu - 4.5 * p.sigma, xMax: p.mu + 4.5 * p.sigma }),
};

export const PAGE_NORMAL_2 = {
  id: 'normal.2',
  tabShort: 'Tab 2',
  tabLong: 'Standard normal',
  name: 'Normal distribution',
  variableSymbol: 'Z',
  table: true,
  r: { d: 'dnorm', p: 'pnorm', q: 'qnorm' },
  display: {
    title: () => '$Z\\sim N(0,1)$',
    note:  () => 'Special case of the normal distribution with mean 0 and standard deviation 1. Widely used as a reference scale for standardizing and comparing values through z-scores.',
    formula: () => '$$\\phi(z)=\\frac{1}{\\sqrt{2\\pi}}e^{-z^2/2}$$<div style="height:6px"></div>$$\\Phi(z)=P(Z\\le z)=\\int_{-\\infty}^{z}\\frac{1}{\\sqrt{2\\pi}}e^{-t^2/2}\\,dt$$',
  },
  params: [],
  props: () => [
    { label: 'Support',  formula: '$z\\in(-\\infty,\\infty)$',  value: '$(-\\infty,\\infty)$' },
    { label: 'Mean',     formula: '$E(Z)=0$',                   value: '$0$' },
    { label: 'Variance', formula: '$\\mathrm{V}(Z)=1$',         value: '$1$' },
    { label: 'Symmetry', formula: '$\\phi(-z)=\\phi(z)$',       value: '' },
  ],
  pdf:      x => safePdf(() => jStat.normal.pdf(x, 0, 1)),
  cdf:      x => clamp(jStat.normal.cdf(x, 0, 1), 0, 1),
  quantile: q => jStat.normal.inv(q, 0, 1),
  naturalRange: () => ({ xMin: -4.5, xMax: 4.5 }),
};
