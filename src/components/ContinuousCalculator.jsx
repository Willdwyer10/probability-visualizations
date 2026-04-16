import { useKaTeX } from '../hooks/useKaTeX.js';
import { latexNum, clamp, clampProb } from '../utils/math.js';
import { BufferedNumberInput } from './BufferedNumberInput.jsx';

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span className="sec-label" style={{ marginBottom: 0 }}>GRAPHICAL CALCULATOR WITH R CODE</span>
        <div style={{ flex: 1 }} />
        <div className="cont-mode-bar">
          <span style={{ fontSize: '11px', fontWeight: 'bold', marginRight: 8, letterSpacing: '0.05em' }}>MODE:</span>
          {[
            { id: 'one',   label: '1 cutoff → areas'  },
            { id: 'two',   label: '2 cutoffs → areas'  },
            { id: 'area',  label: 'areas → cutoff'}
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* ── Top Row: Inputs ── */}
        <div className="calc-panel" style={{ background: 'transparent', border: 'none', padding: 0 }}>
          {mode === 'area' ? (
            <div className="calc-input-row">
              <label style={{ minWidth: '100px' }}>{'Left prob: $p_L$'}</label>
              <BufferedNumberInput
                min={0.001} max={0.999} step={0.001}
                value={pLeft}
                displayFormatter={v => latexNum(v, 4)}
                onCommit={v => {
                  const q = page?.quantile?.(clamp(v, 0.001, 0.999), params);
                  if (Number.isFinite(q)) onCutoff1Change(clamp(q, xMin, xMax));
                }}
              />
            </div>
          ) : (
            <>
              <div className="calc-input-row">
                <label style={{ minWidth: '80px' }}>{'Cutoff: $' + (mode === 'two' ? 'c_1' : 'x') + '$'}</label>
                <BufferedNumberInput
                  min={xMin} max={xMax} step={step}
                  value={cutoff1}
                  displayFormatter={v => latexNum(v, 4)}
                  onCommit={v => onCutoff1Change(clamp(v, xMin, xMax))}
                />
              </div>
              {mode === 'two' && (
                <div className="calc-input-row">
                  <label style={{ minWidth: '80px' }}>$c_2$</label>
                  <BufferedNumberInput
                    min={xMin} max={xMax} step={step}
                    value={cutoff2}
                    displayFormatter={v => latexNum(v, 4)}
                    onCommit={v => onCutoff2Change(clamp(v, xMin, xMax))}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Bottom Row: Results ── */}
        <div style={{ display: 'flex', gap: 12 }}>
          {mode === 'one' && (
            <>
              <div className="calc-panel" style={{ flex: 1 }}>
                <div className="calc-result-top">
                  <div className="calc-result-meaning" key={cutoff1}>
                    <div><b>Left:</b> {'$P(' + varSym + '\\le ' + latexNum(cutoff1, 4) + ')$'}</div>
                    {rCode.p && (
                      <div className="calc-code-row" style={{ marginTop: '4px' }}>
                        <span className="calc-code-inline" dangerouslySetInnerHTML={{ __html: 'R code: ' + (getRHtml('p', cutoff1)) }} />
                      </div>
                    )}
                  </div>
                  <div className="calc-result-value">
                    <span className="result-val">{latexNum(pLeft, 4)}</span>
                  </div>
                </div>
              </div>
              <div className="calc-panel" style={{ flex: 1 }}>
                <div className="calc-result-top">
                  <div className="calc-result-meaning" key={cutoff1}>
                    <div><b>Right:</b> {'$P(' + varSym + '\\gt ' + latexNum(cutoff1, 4) + ')$'}</div>
                    {rCode.p && (
                      <div className="calc-code-row" style={{ marginTop: '4px' }}>
                        <span className="calc-code-inline" dangerouslySetInnerHTML={{ __html: 'R code: 1 - ' + (getRHtml('p', cutoff1)) }} />
                      </div>
                    )}
                  </div>
                  <div className="calc-result-value">
                    <span className="result-val">{latexNum(pRight, 4)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
          {mode === 'two' && pBetween !== null && (
            <div className="calc-panel" style={{ flex: 1 }}>
              <div className="calc-result-top">
                <div className="calc-result-meaning">
                  <div><b>Between:</b> {'$P(c_1 \\le ' + varSym + ' \\le c_2)$'}</div>
                </div>
                <div className="calc-result-value">
                  <span className="result-val">{latexNum(pBetween, 4)}</span>
                </div>
              </div>
            </div>
          )}
          {mode === 'area' && (
            <div className="calc-panel" style={{ flex: 1 }}>
              <div className="calc-result-top">
                <div className="calc-result-meaning">
                  <div><b>Quantile:</b> {'$Q(p_L = ' + latexNum(pLeft, 4) + ') = ' + (page.valueSymbol || 'x') + '$'}</div>
                  {rCode.q && (
                    <div className="calc-code-row" style={{ marginTop: '4px' }}>
                      <span className="calc-code-inline" dangerouslySetInnerHTML={{ __html: 'R code: ' + (getRHtml('q', pLeft)) }} />
                    </div>
                  )}
                </div>
                <div className="calc-result-value">
                  <span className="result-val">{latexNum(qResult, 4)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
