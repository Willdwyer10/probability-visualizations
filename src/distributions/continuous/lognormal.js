import { jStat, safePdf } from '../../utils/jstatHelper.js';
import { latexNum, clamp } from '../../utils/math.js';

export const PAGE_LOGNORMAL_1 = {
  id: 'lognormal.1',
  tabShort: 'Tab 1',
  tabLong: 'Log-normal',
  name: 'Log-normal distribution',
  variableSymbol: 'X',
  r: { d: 'dlnorm', p: 'plnorm', q: 'qlnorm' },
  display: {
    title: p => `$X\\sim \\mathrm{LN}(\\mu=${latexNum(p.mu, 4)},\\sigma=${latexNum(p.sigma, 4)})$`,
    note:  () => 'Positive, right-skewed distribution with $\\log X\\sim N(\\mu,\\sigma)$, making it useful for modeling nonnegative quantities that grow multiplicatively and often exhibit a long right tail, such as in finance, insurance and risk analysis, survival and reliability analysis, and extreme value theory.',
    formula: () => '$$f(x)=\\frac{1}{x\\sigma\\sqrt{2\\pi}}\\exp\\!\\left(-\\frac{(\\ln x-\\mu)^2}{2\\sigma^2}\\right),\\quad x\\gt 0$$<div style="height:6px"></div>$$F(x)=P(X\\le x)=\\Phi\\!\\left(\\frac{\\ln x-\\mu}{\\sigma}\\right),\\quad x\\gt 0$$',
  },
  params: [
    { id: 'mu',    label: '$\\mu$',     rArg: 'meanlog', note: 'log-mean', min: -2, max: 3,   step: 0.001, value: 0 },
    { id: 'sigma', label: '$\\sigma$',  rArg: 'sdlog',   note: 'log-sd',   min: 0.1, max: 2,  step: 0.001, value: 0.6 },
  ],
  props: p => [
    { label: 'Support',  formula: '$x\\gt 0$',                                                                            value: '$(0,\\infty)$' },
    { label: 'Mean',     formula: '$E(X)=e^{\\mu+\\sigma^2/2}$',                                                          value: `$${latexNum(Math.exp(p.mu + 0.5 * p.sigma * p.sigma), 4)}$` },
    { label: 'Variance', formula: '$\\mathrm{V}(X)=e^{2\\mu+\\sigma^2}(e^{\\sigma^2}-1)$',                                value: `$${latexNum((Math.exp(p.sigma * p.sigma) - 1) * Math.exp(2 * p.mu + p.sigma * p.sigma), 4)}$` },
  ],
  pdf:      (x, p) => x <= 0 ? 0 : safePdf(() => jStat.lognormal.pdf(x, p.mu, p.sigma)),
  cdf:      (x, p) => x <= 0 ? 0 : clamp(jStat.lognormal.cdf(x, p.mu, p.sigma), 0, 1),
  quantile: (q, p) => jStat.lognormal.inv(q, p.mu, p.sigma),
  naturalRange: p => ({ xMin: 0, xMax: Math.exp(p.mu + 4 * p.sigma) }),
};
