import { useState, useCallback, useEffect } from 'react';
import { useDiscreteEngine } from '../hooks/useDiscreteEngine.js';
import { useKaTeX } from '../hooks/useKaTeX.js';
import { ParameterControls } from './ParameterControls.jsx';
import { PropertiesTable } from './PropertiesTable.jsx';
import { PmfTable } from './PmfTable.jsx';
import { DiscreteChart } from './DiscreteChart.jsx';
import { DiscreteCalculator } from './DiscreteCalculator.jsx';

import { DistributionSelector } from './DistributionSelector.jsx';

/**
 * Full discrete distribution view with sidebar (left) and chart area (right).
 * Props: groupKey, tabIndex, onTitleChange, onGroupSelect
 */
export function DiscreteView({ groupKey, tabIndex, onTitleChange, onGroupSelect }) {
  const {
    page, state, dispatch,
    displayXRange, displayYMax,
    selectedTotal, getCdf, getQuantile,
    getParamDefs, setParam, resetParams, getFullCache
  } = useDiscreteEngine(groupKey, tabIndex);

  const [showPopup, setShowPopup] = useState(false);

  const paramDefs = getParamDefs();
  const formulaRef = useKaTeX([page, state.params]);
  const noteRef    = useKaTeX([page, state.params]);

  // Push live title update to App header whenever params change
  useEffect(() => {
    if (!page || !onTitleChange) return;
    const title = page.display?.title?.(state.params) ?? '';
    const version = (page.tabLong && page.name && !page.name.includes(page.tabLong)) ? ` (${page.tabLong})` : '';
    const prefix = page.name ? `${page.name}${version}: ` : '';
    onTitleChange(prefix + title);
  }, [page, state.params, onTitleChange]);

  // Axis toggles
  const toggleXFixed = useCallback(() => {
    dispatch({ type: state.xAxisMode === 'fixed' ? 'SET_X_AUTO' : 'SET_X_FIXED' });
  }, [state.xAxisMode, dispatch]);

  const toggleYFixed = useCallback(() => {
    if (state.yAxisMode === 'fixed') dispatch({ type: 'SET_Y_AUTO' });
    else dispatch({ type: 'SET_Y_FIXED', currentYMax: displayYMax });
  }, [state.yAxisMode, displayYMax, dispatch]);

  if (!page) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <>
      {/* ── Left sidebar ────────────────────────────────────────────────── */}
      <div className="left">
        {/* Distributions & Note */}
        <div className="card" id="step-dist-selector">
          <div className="sec-label">Distributions</div>
          <DistributionSelector groupKey={groupKey} onSelect={onGroupSelect} />
          {page.display?.note && (
            <div className="dist-note" style={{ marginTop: '8px' }} ref={noteRef}>
              <div dangerouslySetInnerHTML={{ __html: page.display.note(state.params) }} />
            </div>
          )}
        </div>

        {/* Parameters */}
        {paramDefs.length > 0 && (
          <div className="card" id="step-parameters">
            <div className="section-head">
              <span className="sec-label">Parameters</span>
            </div>
            <ParameterControls
              page={page}
              params={state.params}
              paramDefs={paramDefs}
              onParamChange={setParam}
            />
          </div>
        )}

        {/* PMF formula */}
        <div className="card" id="step-formula">
          <div className="sec-label">PMF FORMULA</div>
          <div className="formula-box" ref={formulaRef}>
            <div dangerouslySetInnerHTML={{ __html: page.display?.formula?.(state.params) ?? '' }} />
          </div>
        </div>

        {/* Properties */}
        <PropertiesTable
          page={page}
          params={state.params}
          collapsed={state.propsCollapsed}
          onToggle={() => dispatch({ type: 'TOGGLE_PROPS' })}
          onReset={resetParams}
        />

        {/* PMF table */}
        {!page.hideTable && (
          <PmfTable
            cache={state.cache}
            selectedXs={state.selectedXs}
            selectedTotal={selectedTotal}
            page={page}
            onSelect={(x, checked) => dispatch({ type: checked ? 'SELECT_X' : 'DESELECT_X', x })}
            onClear={() => dispatch({ type: 'CLEAR_SELECT' })}
            onInvert={() => dispatch({ type: 'INVERT_SELECT' })}
            onPopout={() => setShowPopup(true)}
            collapsed={state.tableCollapsed}
            onToggle={() => dispatch({ type: 'TOGGLE_TABLE' })}
          />
        )}
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────── */}
      <div className="right">
        <div className="chart-wrap">
          <div className="topbar" id="step-chart-controls">
            <div className="chart-left">
              <span className="sec-label">VISUALIZATION</span>
              <div className="series-toggle">
                <label className="series-item">
                  <input
                    type="checkbox"
                    checked={state.showPMF}
                    onChange={e => dispatch({ type: 'TOGGLE_SHOW_PMF', checked: e.target.checked })}
                  />
                  <span className="series-swatch pmf-swatch"></span>
                  PMF
                </label>
                <label className="series-item" style={{ color: 'var(--cdf)' }}>
                  <input
                    type="checkbox"
                    checked={state.showCDF}
                    onChange={e => dispatch({ type: 'TOGGLE_SHOW_CDF', checked: e.target.checked })}
                  />
                  <span className="series-swatch cdf-swatch"></span>
                  CDF
                </label>
              </div>
            </div>
            <div className="axis-controls">
              <div className="axis-btn-group">
                <span>x-axis:</span>
                <button className={`axis-btn${state.xAxisMode === 'auto'  ? ' active' : ''}`} type="button" onClick={() => dispatch({ type: 'SET_X_AUTO' })}>Auto</button>
                <button className={`axis-btn${state.xAxisMode === 'fixed' ? ' active' : ''}`} type="button" onClick={toggleXFixed}>Lock current</button>
              </div>
              <div className="axis-btn-group">
                <span>y-axis:</span>
                <button className={`axis-btn${state.yAxisMode === 'auto'  ? ' active' : ''}`} type="button" onClick={() => dispatch({ type: 'SET_Y_AUTO' })}>Auto</button>
                <button className={`axis-btn${state.yAxisMode === 'fixed' ? ' active' : ''}`} type="button" onClick={toggleYFixed}>Fixed [0, 1]</button>
              </div>
            </div>
          </div>
          <div className="canvas-holder">
            <DiscreteChart
              cache={state.cache}
              selectedXs={state.selectedXs}
              displayXRange={displayXRange}
              displayYMax={displayYMax}
              showPMF={state.showPMF}
              showCDF={state.showCDF}
            />
          </div>
        </div>

        {/* Calculator with show/hide toggle */}
        {!page.hideCalculator && (
          <div id="step-calculator">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <label className="show-calc-toggle">
                <input
                  type="checkbox"
                  checked={state.showCalc}
                  onChange={e => dispatch({ type: 'TOGGLE_SHOW_CALC', checked: e.target.checked })}
                />
                Show Calculator
              </label>
            </div>
            {state.showCalc && (
              <DiscreteCalculator
                page={page}
                params={state.params}
                cache={state.cache}
                getCdf={getCdf}
                getQuantile={getQuantile}
              />
            )}
          </div>
        )}
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-window" onClick={e => e.stopPropagation()}>
            <div className="popup-head">
              <span className="popup-title">PMF / CDF Table</span>
              <div className="popup-actions">
                <button className="mini-btn" type="button" onClick={() => dispatch({ type: 'CLEAR_SELECT' })}>Clear</button>
                <button className="mini-btn" type="button" onClick={() => dispatch({ type: 'INVERT_SELECT' })}>Invert</button>
                <button className="mini-btn" type="button" onClick={() => setShowPopup(false)}>Close ✕</button>
              </div>
            </div>
            <div className="popup-body">
              <div className="popup-table-scroll">
                <PmfTable
                  cache={getFullCache()}
                  selectedXs={state.selectedXs}
                  selectedTotal={selectedTotal}
                  page={page}
                  onSelect={(x, checked) => dispatch({ type: checked ? 'SELECT_X' : 'DESELECT_X', x })}
                  isPopup={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
