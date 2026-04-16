import { useCallback } from 'react';
import { useKaTeX } from '../hooks/useKaTeX.js';
import { ensureTrailingColon, clamp, snapToStep, formatInputNumber } from '../utils/math.js';
import { BufferedNumberInput } from './BufferedNumberInput.jsx';

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

  const handleCommit = useCallback((raw, def) => {
    let v = clamp(raw, def.min, def.max);
    v = snapToStep(v, def.min, def.step ?? 1);
    if ((def.step ?? 1) >= 1) v = Math.round(v);
    onParamChange(def.id, v);
  }, [onParamChange]);

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
                  <BufferedNumberInput
                    id={`param-num-${def.id}`}
                    min={def.min}
                    max={def.max}
                    step={def.step ?? 1}
                    value={val}
                    displayFormatter={(v) => formatInputNumber(v, def.step ?? 1)}
                    onCommit={(raw) => handleCommit(raw, def)}
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
