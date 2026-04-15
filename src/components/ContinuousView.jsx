import { useCallback, useEffect } from 'react';
import { useContinuousEngine } from '../hooks/useContinuousEngine.js';
import { useKaTeX } from '../hooks/useKaTeX.js';
import { ParameterControls } from './ParameterControls.jsx';
import { PropertiesTable } from './PropertiesTable.jsx';
import { ContinuousChart } from './ContinuousChart.jsx';
import { ContinuousCalculator } from './ContinuousCalculator.jsx';
import { DistributionSelector } from './DistributionSelector.jsx';

export function ContinuousView({ groupKey, tabIndex, onTitleChange, onGroupSelect }) {
  const {
    page, state, dispatch,
    getXRange, getYMax,
    keepCutoffsReasonable,
    getParamDefs, setParam, resetParams,
  } = useContinuousEngine(groupKey, tabIndex);

  const paramDefs = getParamDefs();
  const xRange   = getXRange();
  const { cutoff1, cutoff2 } = keepCutoffsReasonable(xRange);
  const yMax     = getYMax(xRange);
  const formulaRef = useKaTeX([page, state.params]);

  // Push live title update to App header whenever params change
  useEffect(() => {
    if (!page || !onTitleChange) return;
    const html = page.display?.title?.(state.params) ?? '';
    onTitleChange(html);
  }, [page, state.params, onTitleChange]);

  const onCutoff1Change = useCallback((v) => dispatch({ type: 'SET_CUTOFF1', value: v }), [dispatch]);
  const onCutoff2Change = useCallback((v) => dispatch({ type: 'SET_CUTOFF2', value: v }), [dispatch]);

  if (!page) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <>
      <div className="left">
        <div className="card">
          <div className="sec-label">Distributions</div>
          <DistributionSelector groupKey={groupKey} onSelect={onGroupSelect} />
          {page.display?.note && (
            <div className="dist-note" style={{ marginTop: '8px' }}>{page.display.note(state.params)}</div>
          )}
        </div>

        <div className="card">
          <div className="sec-label">PDF & CDF Formulas</div>
          <div className="formula-box" ref={formulaRef}>
            <div dangerouslySetInnerHTML={{ __html: page.display?.formula?.(state.params) ?? '' }} />
          </div>
        </div>

        {paramDefs.length > 0 && (
          <div className="card">
            <div className="section-head">
              <span className="sec-label">Parameters</span>
              <button className="mini-btn" type="button" onClick={resetParams}>Reset</button>
            </div>
            <ParameterControls
              page={page}
              params={state.params}
              paramDefs={paramDefs}
              onParamChange={setParam}
            />
          </div>
        )}

        <PropertiesTable
          page={page}
          params={state.params}
          collapsed={state.propsCollapsed}
          onToggle={() => dispatch({ type: 'TOGGLE_PROPS' })}
        />
      </div>

      <div className="right">
        <div className="chart-wrap">
          <div className="topbar">
            <div className="chart-left">
              <span className="sec-label">VISUALIZATION</span>
              <div className="series-toggle">
                <label className="series-item">
                  <input
                    type="checkbox"
                    checked={state.showPdf}
                    onChange={e => dispatch({ type: 'TOGGLE_PDF', checked: e.target.checked })}
                  />
                  <span className="series-swatch pmf-swatch"></span>
                  PDF
                </label>
                <label className="series-item" style={{ color: 'var(--cdf)' }}>
                  <input
                    type="checkbox"
                    checked={state.showCdf}
                    onChange={e => dispatch({ type: 'TOGGLE_CDF', checked: e.target.checked })}
                  />
                  <span className="series-swatch cdf-swatch"></span>
                  CDF
                </label>
              </div>
            </div>
            <div className="axis-controls">
              <div className="axis-btn-group">
                <span>x-axis:</span>
                <button className={`axis-btn${!state.fixedX ? ' active' : ''}`} type="button" onClick={() => dispatch({ type: 'SET_X_AUTO' })}>Auto</button>
                <button className={`axis-btn${state.fixedX  ? ' active' : ''}`} type="button" onClick={() => dispatch({ type: 'SET_X_FIXED', range: xRange })}>Lock current</button>
              </div>
              <div className="axis-btn-group">
                <span>y-axis:</span>
                <button className={`axis-btn${!state.fixedY ? ' active' : ''}`} type="button" onClick={() => dispatch({ type: 'SET_Y_AUTO' })}>Auto</button>
                <button className={`axis-btn${state.fixedY  ? ' active' : ''}`} type="button" onClick={() => dispatch({ type: 'SET_Y_FIXED', yMax })}>Lock current</button>
              </div>
            </div>
          </div>
          <div className="canvas-holder">
            <ContinuousChart
              page={page}
              params={state.params}
              xRange={xRange}
              yMax={yMax}
              mode={state.mode}
              cutoffs={{ cutoff1, cutoff2 }}
              showPdf={state.showPdf}
              showCdf={state.showCdf}
              onCutoff1Change={onCutoff1Change}
              onCutoff2Change={onCutoff2Change}
            />
          </div>
        </div>

        {/* Calculator with show/hide toggle */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <label className="show-calc-toggle">
              <input
                type="checkbox"
                checked={state.showCalc}
                onChange={e => dispatch({ type: 'TOGGLE_CALC', checked: e.target.checked })}
              />
              Show Calculator
            </label>
          </div>
          {state.showCalc && (
            <ContinuousCalculator
              page={page}
              params={state.params}
              paramDefs={paramDefs}
              mode={state.mode}
              cutoffs={{ cutoff1, cutoff2 }}
              xRange={xRange}
              onModeChange={m => dispatch({ type: 'SET_MODE', mode: m })}
              onCutoff1Change={onCutoff1Change}
              onCutoff2Change={onCutoff2Change}
            />
          )}
        </div>
      </div>
    </>
  );
}
