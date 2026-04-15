import { jStat, safePdf } from '../../utils/jstatHelper.js';
import { latexNum, clamp } from '../../utils/math.js';

export const PAGE_CHISQUARE_1 = {
  id: 'chisquare.1',
  tabShort: 'Tab 1',
  tabLong: 'Chi-squared',
  name: 'Chi-squared distribution',
  variableSymbol: 'X',
  r: { d: 'dchisq', p: 'pchisq', q: 'qchisq' },
  display: {
    title: p => `$X\\sim \\chi^2(\\nu=${latexNum(p.nu, 4)})$`,
    note:  () => 'Continuous distribution on nonnegative values, determined by its degrees of freedom, that is widely used in statistical inference for variance estimation, goodness-of-fit tests, tests of independence, and confidence intervals or hypothesis tests involving normal-population variances.',
    formula: () => '$$f(x)=\\frac{1}{2^{\\nu/2}\\Gamma(\\nu/2)}x^{\\nu/2-1}e^{-x/2},\\quad x\\gt 0$$<div style="height:6px"></div>$$F(x)=\\frac{\\gamma(\\nu/2, x/2)}{\\Gamma(\\nu/2)}$$',
  },
  params: [
    { id: 'nu', rArg: 'df', label: '$\\nu$', note: 'degrees of freedom', min: 1, max: 50, step: 1, value: 4 },
  ],
  props: p => [
    { label: 'Support',  formula: '$x\\gt 0$',                                    value: '$(0,\\infty)$' },
    { label: 'Mean',     formula: '$E(X)=\\nu$',                                   value: `$${latexNum(p.nu, 4)}$` },
    { label: 'Variance', formula: '$\\mathrm{V}(X)=2\\nu$',                        value: `$${latexNum(2 * p.nu, 4)}$` },
  ],
  pdf:      (x, p) => x <= 0 ? 0 : safePdf(() => jStat.chisquare.pdf(x, p.nu)),
  cdf:      (x, p) => x <= 0 ? 0 : clamp(jStat.chisquare.cdf(x, p.nu), 0, 1),
  quantile: (q, p) => jStat.chisquare.inv(q, p.nu),
  naturalRange: p => ({ xMin: -0.1, xMax: p.nu + 4 * Math.sqrt(2 * p.nu) }),
};
