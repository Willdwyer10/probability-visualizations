// ─── Distribution Registry ───────────────────────────────────────────────────
// MASTER_GROUPS maps every group key to its metadata and engine type.
// MASTER_ORDER defines the dropdown display order.

import { PAGE_BERNOULLI_1 }                       from './discrete/bernoulli.js';
import { PAGE_BINOMIAL_1 }                         from './discrete/binomial.js';
import { PAGE_HYPERGEOM_1 }                        from './discrete/hypergeometric.js';
import { PAGE_GEOMETRIC_1, PAGE_GEOMETRIC_2 }      from './discrete/geometric.js';
import { PAGE_NB_1, PAGE_NB_2 }                   from './discrete/negativeBinomial.js';
import { PAGE_POISSON_1, PAGE_POISSON_2 }          from './discrete/poisson.js';

import { PAGE_NORMAL_1, PAGE_NORMAL_2 }            from './continuous/normal.js';
import { PAGE_LOGNORMAL_1 }                         from './continuous/lognormal.js';
import { PAGE_GED_1, PAGE_SGED_1 }                 from './continuous/ged.js';
import { PAGE_T_1, PAGE_T_2 }                      from './continuous/studentT.js';
import { PAGE_UNIFORM_1, PAGE_UNIFORM_2 }          from './continuous/uniform.js';
import { PAGE_BETA_1, PAGE_BETA_2 }                from './continuous/beta.js';
import { PAGE_EXPONENTIAL_1 }                      from './continuous/exponential.js';
import { PAGE_GAMMA_1, PAGE_GAMMA_2 }              from './continuous/gamma.js';
import { PAGE_WEIBULL_1, PAGE_WEIBULL_2 }          from './continuous/weibull.js';
import { PAGE_CHISQUARE_1 }                        from './continuous/chisquare.js';

import { SPECIAL_PAGES }                           from './special/specialPages.js';

// ── Master groups ─────────────────────────────────────────────────────────────
export const MASTER_GROUPS = {
  // ---- Discrete ---------------------------------------------------------------
  bernoulli:       { key: 'bernoulli',       label: 'Bernoulli distribution',                                engine: 'discrete',   tabs: [PAGE_BERNOULLI_1] },
  binomial:        { key: 'binomial',        label: 'Binomial distribution',                                 engine: 'discrete',   tabs: [PAGE_BINOMIAL_1] },
  hypergeometric:  { key: 'hypergeometric',  label: 'Hypergeometric distribution',                          engine: 'discrete',   tabs: [PAGE_HYPERGEOM_1] },
  geometric:       { key: 'geometric',       label: 'Geometric distribution (with 2 versions)',              engine: 'discrete',   tabs: [PAGE_GEOMETRIC_1, PAGE_GEOMETRIC_2] },
  negativeBinomial:{ key: 'negativeBinomial',label: 'Negative binomial distribution (with 2 versions)',     engine: 'discrete',   tabs: [PAGE_NB_1, PAGE_NB_2] },
  poisson:         { key: 'poisson',         label: 'Poisson distribution and process (with 2 tabs)',        engine: 'discrete',   tabs: [PAGE_POISSON_1, PAGE_POISSON_2] },

  // ---- Continuous -------------------------------------------------------------
  normal:          { key: 'normal',          label: 'Normal distribution (with 2 tabs)',                     engine: 'continuous', tabs: [PAGE_NORMAL_1, PAGE_NORMAL_2] },
  lognormal:       { key: 'lognormal',       label: 'Log-normal distribution',                               engine: 'continuous', tabs: [PAGE_LOGNORMAL_1] },
  ged:             { key: 'ged',             label: 'GED distribution (with 2 tabs, optional in STAT311)',   engine: 'continuous', tabs: [PAGE_GED_1, PAGE_SGED_1] },
  t:               { key: 't',               label: "Student's t distribution (with 2 tabs, optional in STAT311)", engine: 'continuous', tabs: [PAGE_T_1, PAGE_T_2] },
  uniform:         { key: 'uniform',         label: 'Uniform distribution (with 2 tabs)',                    engine: 'continuous', tabs: [PAGE_UNIFORM_1, PAGE_UNIFORM_2] },
  beta:            { key: 'beta',            label: 'Beta distribution (with 2 tabs, optional in STAT311)', engine: 'continuous', tabs: [PAGE_BETA_1, PAGE_BETA_2] },
  exponential:     { key: 'exponential',     label: 'Exponential distribution',                              engine: 'continuous', tabs: [PAGE_EXPONENTIAL_1] },
  gamma:           { key: 'gamma',           label: 'Gamma distribution (with 2 tabs)',                      engine: 'continuous', tabs: [PAGE_GAMMA_1, PAGE_GAMMA_2] },
  weibull:         { key: 'weibull',         label: 'Weibull distribution (with 2 tabs)',                    engine: 'continuous', tabs: [PAGE_WEIBULL_1, PAGE_WEIBULL_2] },
  chisquare:       { key: 'chisquare',       label: 'Chi-squared distribution',                              engine: 'continuous', tabs: [PAGE_CHISQUARE_1] },

  // ---- Special ----------------------------------------------------------------
  gammaFunction:   { key: 'gammaFunction',   label: 'Gamma function',                                       engine: 'special',    special: SPECIAL_PAGES.gammaFunction },
  betaFunction:    { key: 'betaFunction',    label: 'Beta function',                                         engine: 'special',    special: SPECIAL_PAGES.betaFunction },
};

// ── Display order and category groupings ─────────────────────────────────────
export const MASTER_ORDER = [
  {
    category: 'Discrete distributions',
    keys: ['bernoulli', 'binomial', 'hypergeometric', 'geometric', 'negativeBinomial', 'poisson'],
  },
  {
    category: 'Continuous distributions',
    keys: ['normal', 'lognormal', 'ged', 't', 'uniform', 'beta', 'exponential', 'gamma', 'weibull', 'chisquare'],
  },
  {
    category: 'Special function pages',
    keys: ['gammaFunction', 'betaFunction'],
  },
];

/** Resolve the current PAGE object from groupKey + tabIndex. */
export function resolveCurrentPage(groupKey, tabIndex) {
  const group = MASTER_GROUPS[groupKey];
  if (!group) return null;
  if (group.engine === 'special') return group.special;
  return group.tabs?.[tabIndex] ?? group.tabs?.[0] ?? null;
}

/** Default group to show on first load. */
export const DEFAULT_GROUP = 'binomial';
