import { useKaTeX } from '../hooks/useKaTeX.js';
import { latexNum, clamp, clampProb } from '../utils/math.js';

/**
 * Continuous probability calculator with left/right/two-sided modes.
 */
export function ContinuousCalculator({ page, params, paramDefs, mode, cutoffs, xRange, onModeChange, onCutoff1Change, onCutoff2Change }) {
  const { cutoff1, cutoff2 } = cutoffs;
  const { xMin, xMax } = xRange;

  const cdf1    = page?.cdf?.(cutoff1, params) ?? 0;
  const cdf1m1  = page?.cdf?.(cutoff2, params) ?? 0;
  const pLeft   = clampProb(cdf1);
  const pRight  = clampProb(1 - cdf1);
  const pBetween = mode === 'two' ? clampProb(cdf1m1 - cdf1) : null;

  const qResult = (() => {
    try { return page?.quantile?.(clamp(pLeft, 1e-9, 1 - 1e-9), params) ?? NaN; }
    catch { return NaN; }
  })();

  const varSym = page?.variableSymbol || 'X';
  const rCode  = page?.r ?? {};
  
  const rArgsStr = (paramDefs || [])
    .filter(d => Boolean(d.rArg))
    .map(d => `${d.rArg} = ${params[d.id]}`)
    .join(', ');

  const getRHtml = (type, qVal) => {
    const fn = rCode[type];
    if (!fn) return null;
    const prefix = type === 'q' ? 'p' : 'q';
    return `${fn}(${prefix} = ${latexNum(qVal, 4)}${rArgsStr ? `, ${rArgsStr}` : ''})`;
  };

  const katexRef = useKaTeX([cutoff1, cutoff2, mode, pLeft, pRight, pBetween, varSym]);

  const step = (xMax - xMin) / 1000;

  return (
    <div className="calc-wrap" style={{ marginTop: 0 }} ref={katexRef}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <span className="sec-label" style={{ marginBottom: 0 }}>GRAPHICAL CALCULATOR WITH R CODE</span>
        <div style={{ flex: 1 }} />
        <div className="cont-mode-bar">
          <span style={{ fontSize: '11px', fontWeight: 'bold', marginRight: 8, letterSpacing: '0.05em' }}>MODE:</span>
          {[
            { id: 'one',   label: '1 cutoff · areas'  },
            { id: 'two',   label: '2 cutoffs · areas'  },
            { id: 'area',  label: 'areas · cutoff'}
          ].map(m => (
            <button
              key={m.id}
              type="button"
              className={'mode-btn' + (mode === m.id ? ' active' : '')}
              onClick={() => onModeChange(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="calc-panels">
        {/* ── Cutoff inputs ── */}
        <div className="calc-panel">
          <div className="calc-input-row">
            <label>$c_1$</label>
            <input
              type="range"
              min={xMin} max={xMax} step={step}
              value={cutoff1}
              onChange={e => onCutoff1Change(parseFloat(e.target.value))}
            />
            <input
              type="number"
              min={xMin} max={xMax} step={step}
              value={latexNum(cutoff1, 4)}
              onChange={e => {
                const v = parseFloat(e.target.value);
                if (Number.isFinite(v)) onCutoff1Change(clamp(v, xMin, xMax));
              }}
            />
          </div>
          {mode === 'two' && (
            <div className="calc-input-row">
              <label>$c_2$</label>
              <input
                type="range"
                min={xMin} max={xMax} step={step}
                value={cutoff2}
                onChange={e => onCutoff2Change(parseFloat(e.target.value))}
              />
              <input
                type="number"
                min={xMin} max={xMax} step={step}
                value={latexNum(cutoff2, 4)}
                onChange={e => {
                  const v = parseFloat(e.target.value);
                  if (Number.isFinite(v)) onCutoff2Change(clamp(v, xMin, xMax));
                }}
              />
            </div>
          )}
          {mode === 'area' && (
            <>
              <div className="calc-input-row">
                <label>$p_L$</label>
                <input
                  type="range"
                  min={0.001} max={0.999} step={0.001}
                  value={pLeft}
                  onChange={e => {
                    const p = parseFloat(e.target.value);
                    const q = page?.quantile?.(p, params);
                    if (Number.isFinite(q)) onCutoff1Change(clamp(q, xMin, xMax));
                  }}
                />
                <input
                  type="number"
                  min={0.001} max={0.999} step={0.001}
                  value={latexNum(pLeft, 4)}
                  onChange={e => {
                    const p = parseFloat(e.target.value);
                    if (Number.isFinite(p)) {
                      const q = page?.quantile?.(clamp(p, 0.001, 0.999), params);
                      if (Number.isFinite(q)) onCutoff1Change(clamp(q, xMin, xMax));
                    }
                  }}
                />
              </div>
              <div className="calc-input-row">
                <label>$p_R$</label>
                <input
                  type="range"
                  min={0.001} max={0.999} step={0.001}
                  value={pRight}
                  onChange={e => {
                    const p = parseFloat(e.target.value);
                    const q = page?.quantile?.(1 - p, params);
                    if (Number.isFinite(q)) onCutoff1Change(clamp(q, xMin, xMax));
                  }}
                />
                <input
                  type="number"
                  min={0.001} max={0.999} step={0.001}
                  value={latexNum(pRight, 4)}
                  onChange={e => {
                    const p = parseFloat(e.target.value);
                    if (Number.isFinite(p)) {
                      const q = page?.quantile?.(1 - clamp(p, 0.001, 0.999), params);
                      if (Number.isFinite(q)) onCutoff1Change(clamp(q, xMin, xMax));
                    }
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* ── Probability results ── */}
        <div className="calc-panel">
          {mode === 'one' && (
            <>
              <div className="calc-result-row">
                <div className="calc-result-top">
                  <div className="calc-result-meaning">
                    {'$P(' + varSym + '\\le c_1 = ' + latexNum(cutoff1, 4) + ')$'}
                  </div>
                  <div className="calc-result-value">
                    <span className="result-val">{latexNum(pLeft, 4)}</span>
                  </div>
                </div>
                {rCode.p && <div className="calc-code-row"><span className="calc-code-inline"><code>{getRHtml('p', cutoff1)}</code></span></div>}
              </div>
              <div className="calc-result-row">
                <div className="calc-result-top">
                  <div className="calc-result-meaning">
                    {'$P(' + varSym + '\\gt c_1 = ' + latexNum(cutoff1, 4) + ')$'}
                  </div>
                  <div className="calc-result-value">
                    <span className="result-val">{latexNum(pRight, 4)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
          {mode === 'right' && (
            <div className="calc-result-row">
              <div className="calc-result-top">
                <div className="calc-result-meaning">
                  {'$P(' + varSym + '\\gt c_1 = ' + latexNum(cutoff1, 4) + ')$'}
                </div>
                <div className="calc-result-value">
                  <span className="result-val">{latexNum(pRight, 4)}</span>
                </div>
              </div>
            </div>
          )}
          {mode === 'two' && pBetween !== null && (
            <div className="calc-result-row">
              <div className="calc-result-top">
                <div className="calc-result-meaning">
                  {'$P(c_1 \\le ' + varSym + ' \\le c_2)$'}
                </div>
                <div className="calc-result-value">
                  <span className="result-val">{latexNum(pBetween, 4)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quantile */}
          <div className="calc-result-row" style={{ marginTop: 8, borderTop: '1px dashed #e0e0e0', paddingTop: 8 }}>
            <div className="calc-result-top">
              <div className="calc-result-meaning">
                {'$Q(p_L = ' + latexNum(pLeft, 4) + ') =$'}
              </div>
              <div className="calc-result-value">
                <span className="result-val">{latexNum(qResult, 4)}</span>
              </div>
            </div>
            {rCode.q && (
              <div className="calc-code-row">
                <span className="calc-code-inline"><code>{getRHtml('q', pLeft)}</code></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
