import { useCallback } from 'react';
import { useKaTeX } from '../hooks/useKaTeX.js';
import { ensureTrailingColon, clamp, snapToStep, formatInputNumber } from '../utils/math.js';

/**
 * Renders a table of parameter sliders + number inputs.
 * Props:
 *   page           — the current distribution PAGE object
 *   params         — current parameter state object
 *   paramDefs      — array of param definition objects (already resolved if fn params)
 *   onParamChange  — (id, newValue) => void
 */
export function ParameterControls({ params, paramDefs, onParamChange }) {
  const katexRef = useKaTeX([paramDefs]);

  const handleSlider = useCallback((e, def) => {
    let v = parseFloat(e.target.value);
    if (!Number.isFinite(v)) return;
    v = clamp(v, def.min, def.max);
    v = snapToStep(v, def.min, def.step ?? 1);
    if ((def.step ?? 1) >= 1) v = Math.round(v);
    onParamChange(def.id, v);
  }, [onParamChange]);

  const handleNumberBlur = useCallback((e, def) => {
    const raw = parseFloat(e.target.value);
    const prev = params[def.id];
    if (!Number.isFinite(raw) || raw < def.min || raw > def.max) {
      e.target.value = formatInputNumber(prev, def.step ?? 1);
      return;
    }
    let v = clamp(raw, def.min, def.max);
    v = snapToStep(v, def.min, def.step ?? 1);
    if ((def.step ?? 1) >= 1) v = Math.round(v);
    onParamChange(def.id, v);
  }, [params, onParamChange]);

  const handleNumberKey = useCallback((e, def) => {
    if (e.key === 'Enter') { e.preventDefault(); handleNumberBlur(e, def); e.target.blur(); }
  }, [handleNumberBlur]);

  if (!paramDefs || paramDefs.length === 0) {
    return (
      <table className="param-table">
        <tbody>
          <tr><td colSpan={3} className="small-note">No free parameters in this version.</td></tr>
        </tbody>
      </table>
    );
  }

  return (
    <table className="param-table" ref={katexRef}>
      <tbody>
        {paramDefs.map(def => {
          const val = params[def.id];
          const fmtVal = formatInputNumber(val, def.step ?? 1);
          return (
            <tr key={def.id}>
              <td><b>{ensureTrailingColon(def.note || '')}</b></td>
              <td>{def.label}</td>
              <td>
                <div className="param-control">
                  <input
                    type="range"
                    id={`param-slider-${def.id}`}
                    min={def.min}
                    max={def.max}
                    step={def.step ?? 1}
                    value={val}
                    onChange={e => handleSlider(e, def)}
                  />
                  <input
                    type="number"
                    id={`param-num-${def.id}`}
                    min={def.min}
                    max={def.max}
                    step={def.step ?? 1}
                    defaultValue={fmtVal}
                    key={fmtVal}
                    onBlur={e => handleNumberBlur(e, def)}
                    onKeyDown={e => handleNumberKey(e, def)}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
