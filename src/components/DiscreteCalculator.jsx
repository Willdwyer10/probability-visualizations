import { useState, useEffect } from 'react';
import { useKaTeX } from '../hooks/useKaTeX.js';
import { latexNum, clamp, clampProb } from '../utils/math.js';

/**
 * Discrete probability calculator.
 * Shows P(X = x), P(X ≤ x), P(X ≥ x), and quantile.
 */
export function DiscreteCalculator({ page, params, cache, getCdf, getQuantile }) {
  const [x, setX] = useState(() => cache.displaySupport[0]);
  const [pL, setPL] = useState(0.95);

  // Reset x when the display range changes (e.g. after parameter update)
  const [a, b] = cache.displaySupport;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setX(prev => clamp(Math.round(prev), a, b));
  }, [a, b]);

  const varSym = page?.variableSymbol || 'X';
  const valSym = page?.valueSymbol    || 'x';

  const { pmf } = cache;
  const xClamped = clamp(Math.round(x), a, b);
  const idx       = xClamped - a;
  const pmfVal    = (idx >= 0 && idx < pmf.length) ? pmf[idx] : (page?.pmf?.(xClamped, params) || 0);
  const cdfVal    = getCdf(xClamped);
  const ccdfVal   = clampProb(1 - getCdf(xClamped - 1));
  const qVal      = getQuantile(pL);

  const rCode = page?.rCode ?? {};

  const katexRef = useKaTeX([x, pL, pmfVal, cdfVal, ccdfVal, qVal, varSym, valSym]);

  return (
    <div className="calc-wrap" ref={katexRef}>
      <div className="sec-label">Calculator</div>
      <div className="calc-panels">

        {/* ── PMF / CDF panel ── */}
        <div className="calc-panel">
          <div className="calc-input-row">
            <label>{'$' + valSym + '$'}</label>
            <input
              type="range"
              min={a} max={b} step={1}
              value={xClamped}
              onChange={e => setX(parseInt(e.target.value, 10))}
            />
            <input
              type="number"
              min={a} max={b} step={1}
              value={xClamped}
              onChange={e => {
                const v = parseInt(e.target.value, 10);
                if (Number.isFinite(v)) setX(v);
              }}
            />
          </div>
          <div className="calc-results">
            <div className="calc-result-row">
              <div className="calc-result-top">
                <div className="calc-result-meaning">
                  {'$P(' + varSym + ' = ' + xClamped + ')$'}
                </div>
                <div className="calc-result-value">
                  <span className="result-val">{latexNum(pmfVal, 4)}</span>
                </div>
              </div>
              {rCode.pmf && (
                <div className="calc-code-row">
                  <span className="calc-code-inline" dangerouslySetInnerHTML={{ __html: rCode.pmf(params) }} />
                </div>
              )}
            </div>

            <div className="calc-result-row">
              <div className="calc-result-top">
                <div className="calc-result-meaning">
                  {'$P(' + varSym + ' \\le ' + xClamped + ')$'}
                </div>
                <div className="calc-result-value">
                  <span className="result-val">{latexNum(cdfVal, 4)}</span>
                </div>
              </div>
              {rCode.cdf && (
                <div className="calc-code-row">
                  <span className="calc-code-inline" dangerouslySetInnerHTML={{ __html: rCode.cdf(params) }} />
                </div>
              )}
            </div>

            <div className="calc-result-row">
              <div className="calc-result-top">
                <div className="calc-result-meaning">
                  {'$P(' + varSym + ' \\ge ' + xClamped + ')$'}
                </div>
                <div className="calc-result-value">
                  <span className="result-val">{latexNum(ccdfVal, 4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quantile panel ── */}
        <div className="calc-panel">
          <div className="calc-input-row">
            <label>$p_L$</label>
            <input
              type="range"
              min={0} max={1} step={0.001}
              value={pL}
              onChange={e => setPL(parseFloat(e.target.value))}
            />
            <input
              type="number"
              min={0} max={1} step={0.001}
              value={pL}
              onChange={e => {
                const v = parseFloat(e.target.value);
                if (Number.isFinite(v)) setPL(clamp(v, 0, 1));
              }}
            />
          </div>
          <div className="calc-results">
            <div className="calc-result-row">
              <div className="calc-result-top">
                <div className="calc-result-meaning">
                  {'Smallest $' + valSym + '$ such that $P(' + varSym + '\\le ' + valSym + ')\\ge p_L = ' + latexNum(pL, 4) + '$'}
                </div>
                <div className="calc-result-value">
                  <span className="result-val">
                    {qVal === Infinity ? '∞' : String(qVal)}
                  </span>
                </div>
              </div>
              {rCode.q && (
                <div className="calc-code-row">
                  <span className="calc-code-inline" dangerouslySetInnerHTML={{ __html: rCode.q(params) }} />
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
