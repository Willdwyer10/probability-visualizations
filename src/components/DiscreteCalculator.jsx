import { useState, useEffect, useCallback } from 'react';
import { useKaTeX } from '../hooks/useKaTeX.js';
import { latexNum, clamp, clampProb } from '../utils/math.js';
import { BufferedNumberInput } from './BufferedNumberInput.jsx';

/**
 * Discrete probability calculator.
 */
export function DiscreteCalculator({ page, params, cache, getCdf, getQuantile }) {
  const [x, setX] = useState(() => cache.displaySupport[0]);
  const [pL, setPL] = useState(0.95);

  const [a, b] = cache.displaySupport;
  useEffect(() => {
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
      <div className="sec-label">GRAPHICAL CALCULATOR WITH R CODE</div>
      <div className="calc-panels">

        {/* ── PMF / CDF panel ── */}
        <div className="calc-panel">
          <div className="calc-input-row">
            <label>{'Cutoff: $' + valSym + '$'}</label>
            <input
              type="range"
              min={a} max={b} step={1}
              value={xClamped}
              onChange={e => setX(parseInt(e.target.value, 10))}
            />
            <BufferedNumberInput
              min={a} max={b} step={1}
              value={xClamped}
              onCommit={v => setX(clamp(Math.round(v), a, b))}
            />
          </div>
          <div className="calc-results">
            <div className="calc-result-row">
              <div className="calc-result-top">
                <div className="calc-result-meaning">
                  <div key={xClamped}><b>PMF:</b> {'$p(' + xClamped + ') = P(' + varSym + ' = ' + xClamped + ')$'}</div>
                  {rCode.pmf && (
                    <div className="calc-code-row" style={{ marginTop: '4px' }}>
                      <span className="calc-code-inline" dangerouslySetInnerHTML={{ __html: 'R code: ' + (rCode.pmf(params)) }} />
                    </div>
                  )}
                </div>
                <div className="calc-result-value">
                  <span className="result-val">{latexNum(pmfVal, 4)}</span>
                </div>
              </div>
            </div>

            <div className="calc-result-row">
              <div className="calc-result-top">
                <div className="calc-result-meaning">
                  <div key={xClamped}><b>CDF:</b> {'$F(' + xClamped + ') = P(' + varSym + ' \\le ' + xClamped + ')$'}</div>
                  {rCode.cdf && (
                    <div className="calc-code-row" style={{ marginTop: '4px' }}>
                      <span className="calc-code-inline" dangerouslySetInnerHTML={{ __html: 'R code: ' + (rCode.cdf(params)) }} />
                    </div>
                  )}
                </div>
                <div className="calc-result-value">
                  <span className="result-val">{latexNum(cdfVal, 4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quantile panel ── */}
        <div className="calc-panel">
          <div className="calc-input-row">
            <label>{'Left prob: $p_L$'}</label>
            <input
              type="range"
              min={0} max={1} step={0.001}
              value={pL}
              onChange={e => setPL(parseFloat(e.target.value))}
            />
            <BufferedNumberInput
              min={0} max={1} step={0.001}
              value={pL}
              displayFormatter={v => latexNum(v, 4)}
              onCommit={v => setPL(clamp(v, 0, 1))}
            />
          </div>
          <div className="calc-results">
            <div className="calc-result-row">
              <div className="calc-result-top">
                <div className="calc-result-meaning">
                  <div><b>Quantile:</b> {'$Q(p_L = ' + latexNum(pL, 4) + ') = \\min \\{ ' + valSym + ' : P(' + varSym + ' \\le ' + valSym + ') \\ge ' + latexNum(pL, 4) + ' \\} $'}</div>
                  {rCode.q && (
                    <div className="calc-code-row" style={{ marginTop: '4px' }}>
                      <span className="calc-code-inline" dangerouslySetInnerHTML={{ __html: 'R code: ' + (rCode.q(params)) }} />
                    </div>
                  )}
                </div>
                <div className="calc-result-value">
                  <span className="result-val">
                    {qVal === Infinity ? '∞' : String(qVal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
