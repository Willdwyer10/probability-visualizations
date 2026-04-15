import { useState, useRef, useCallback, useEffect } from 'react';
import { useKaTeX } from '../hooks/useKaTeX.js';
import { latexNum, clamp } from '../utils/math.js';
import { MASTER_GROUPS } from '../distributions/index.js';
import { DistributionSelector } from './DistributionSelector.jsx';

const PAD = { L: 52, R: 20, T: 20, B: 32 };

function drawSpecialChart(canvas, page, values) {
  const holder = canvas.parentElement;
  if (!holder) return;
  const rect   = holder.getBoundingClientRect();
  const dpr    = window.devicePixelRatio || 1;
  const W = Math.max(200, Math.floor(rect.width));
  const H = Math.max(180, Math.floor(rect.height));

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const ranges = page.getRanges(values);
  const { xMin, xMax, yMin = 0, yMax } = ranges;
  const gW = W - PAD.L - PAD.R;
  const gH = H - PAD.T - PAD.B;

  const X = v => PAD.L + ((v - xMin) / (xMax - xMin)) * gW;
  const Y = v => PAD.T + PAD.B + gH - ((v - yMin) / (yMax - yMin)) * gH;
  const clampedY = v => clamp(v, yMin, yMax * 1.05);

  // Axes
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD.L, H - PAD.B);
  ctx.lineTo(W - PAD.R, H - PAD.B);
  ctx.moveTo(PAD.L, PAD.T);
  ctx.lineTo(PAD.L, H - PAD.B);
  ctx.stroke();

  // Y grid + labels
  ctx.font = '10px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const v = yMin + (i / 5) * (yMax - yMin);
    ctx.fillStyle = '#999';
    ctx.fillText(latexNum(v, 2), PAD.L - 5, Y(v));
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.L, Y(v));
    ctx.lineTo(W - PAD.R, Y(v));
    ctx.stroke();
  }

  // X labels
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let i = 0; i <= 8; i++) {
    const v = xMin + (i / 8) * (xMax - xMin);
    ctx.fillStyle = '#999';
    ctx.fillText(latexNum(v, 2), X(v), H - PAD.B + 4);
  }

  // Axis labels
  ctx.fillStyle = '#555';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(page.xAxisLabel, PAD.L + gW / 2, H - 2);
  ctx.save();
  ctx.translate(12, PAD.T + gH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(page.yAxisLabel, 0, 0);
  ctx.restore();

  // Curve
  const steps = gW * 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(PAD.L, PAD.T, gW, gH + PAD.B - 2);
  ctx.clip();
  ctx.strokeStyle = '#045275';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  let first = true;
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    const y = page.plotY(x, values);
    if (!Number.isFinite(y) || y < 0) { first = true; continue; }
    const cy = Y(clampedY(y));
    if (first) { ctx.moveTo(X(x), cy); first = false; }
    else ctx.lineTo(X(x), cy);
  }
  ctx.stroke();
  ctx.restore();

  // Vertical indicator line + dot
  const xi = values[page.inputs[0].key];
  if (Number.isFinite(xi) && xi > xMin) {
    const yi = page.evaluate(values);
    if (Number.isFinite(yi) && yi >= 0) {
      const cx = X(clamp(xi, xMin, xMax));
      const cy = Y(clamp(yi, yMin, yMax));
      ctx.save();
      ctx.strokeStyle = 'rgba(21,128,61,.38)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, H - PAD.B);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#15803d';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // Annotations (e.g., integer ticks for Gamma function)
  if (typeof page.annotations === 'function') {
    page.annotations(ctx, X, Y);
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SpecialView({ groupKey, onTitleChange, onGroupSelect }) {
  const group = MASTER_GROUPS[groupKey];
  const page  = group?.special;

  if (!page) return <div style={{ padding: 24 }}>Unknown special page.</div>;

  return <SpecialViewInner page={page} key={page.key} onTitleChange={onTitleChange} onGroupSelect={onGroupSelect} groupKey={groupKey} />;
}

function SpecialViewInner({ page, onTitleChange, onGroupSelect, groupKey }) {
  const [values, setValues] = useState(() => {
    const v = {};
    page.inputs.forEach(inp => { v[inp.key] = inp.value; });
    return v;
  });

  // Set header title to the special page label
  useEffect(() => {
    if (onTitleChange) onTitleChange(page.label ?? '');
  }, [page, onTitleChange]);

  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    if (canvasRef.current) drawSpecialChart(canvasRef.current, page, values);
  }, [page, values]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const obs = new ResizeObserver(draw);
    if (canvasRef.current?.parentElement) obs.observe(canvasRef.current.parentElement);
    return () => obs.disconnect();
  }, [draw]);

  const sidebarRef  = useKaTeX([page, values]);
  const result      = page.evaluate(values);

  const setVal = (key, v) => setValues(prev => ({ ...prev, [key]: v }));

  return (
    <>
      {/* ── Left sidebar ─────────────────────────────────────────────── */}
      <div className="left" ref={sidebarRef}>
        <div className="card">
          <div className="sec-label">Distributions</div>
          <DistributionSelector groupKey={groupKey} onSelect={onGroupSelect} />
          <div className="small-note" style={{ marginTop: '8px' }}>{page.note}</div>
        </div>

        <div className="card">
          <div className="sec-label">Definition</div>
          <div className="formula-box">
            <div dangerouslySetInnerHTML={{ __html: page.formula }} />
          </div>
        </div>

        <div className="card">
          <div className="sec-label">Properties</div>
          <table className="prop-table">
            <tbody>
              {(page.props ?? []).map(([label, val], i) => (
                <tr key={i}>
                  <td><b>{label}:</b></td>
                  <td dangerouslySetInnerHTML={{ __html: val }} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Right panel ──────────────────────────────────────────────── */}
      <div className="right">
        <div className="chart-wrap">
          <div className="topbar">
            <div className="chart-left">
              <span className="sec-label">{page.yAxisLabel} vs {page.xAxisLabel}</span>
            </div>
          </div>
          <div className="canvas-holder">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Special function calculator */}
        <div className="calc-wrap">
          <div className="sec-label">Calculator</div>
          <div className="calc-panels">
            {/* Inputs */}
            <div className="calc-panel">
              {page.inputs.map(inp => (
                <div key={inp.key} className="calc-input-row">
                  <label dangerouslySetInnerHTML={{ __html: inp.symbol }} />
                  <input
                    type="range"
                    min={inp.min} max={inp.max} step={inp.step}
                    value={values[inp.key]}
                    onChange={e => setVal(inp.key, parseFloat(e.target.value))}
                  />
                  <input
                    type="number"
                    min={inp.min} max={inp.max} step={inp.step}
                    value={values[inp.key]}
                    onChange={e => {
                      const v = parseFloat(e.target.value);
                      if (Number.isFinite(v)) setVal(inp.key, clamp(v, inp.min, inp.max));
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Output */}
            <div className="calc-panel">
              <div className="calc-result-row">
                <div className="calc-result-top">
                  <div
                    className="calc-result-meaning"
                    dangerouslySetInnerHTML={{ __html: page.outputFormula }}
                  />
                  <div className="calc-result-value">
                    <span className="result-val">{latexNum(result, 6)}</span>
                  </div>
                </div>
                {page.rCode && (
                  <div className="calc-code-row">
                    <span
                      className="calc-code-inline"
                      dangerouslySetInnerHTML={{ __html: page.rCode }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
