import { useRef, useEffect, useCallback, useState } from 'react';
import { clamp } from '../utils/math.js';
import { latexNum } from '../utils/math.js';

const colors = {
  pdf: '#045275',
  cdf: '#e11d48',
  shadeLeft: '#bae6fd',
  shadeRight: '#fecdd3',
  shadeTwo: '#e9d5ff',
  handleLine: '#333',
  handlePillBg: '#fff',
  handlePillText: '#2563eb',
  handlePillBorder: '#2563eb',
  grid: '#eee',
  axis: '#ccc',
  label: '#666',
};

const PAD = { L: 52, R: 20, T: 30, B: 28 };

function coordinateHelpers(W, H, xMin, xMax, yMax) {
  const gW = W - PAD.L - PAD.R;
  const gH = H - PAD.T - PAD.B;

  const X  = v => PAD.L + ((v - xMin) / (xMax - xMin)) * gW;
  const Y  = v => H - PAD.B - (v / yMax) * gH;
  const xFromPx = px => xMin + ((px - PAD.L) / gW) * (xMax - xMin);
  const yFromPx = py => (H - PAD.B - py) / gH * yMax;

  return { X, Y, xFromPx, yFromPx, gW, gH };
}

function drawGrid(ctx, W, H, xMin, xMax, yMax) {
  const { X, Y } = coordinateHelpers(W, H, xMin, xMax, yMax);

  ctx.strokeStyle = colors.axis;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD.L, H - PAD.B);
  ctx.lineTo(W - PAD.R, H - PAD.B);
  ctx.moveTo(PAD.L, PAD.T);
  ctx.lineTo(PAD.L, H - PAD.B);
  ctx.stroke();

  ctx.font = '10px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let i = 0; i <= 5; i++) {
    const val = (i / 5) * yMax;
    const y = Y(val);
    ctx.fillStyle = colors.label;
    ctx.fillText(latexNum(val, 2), PAD.L - 5, y);
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.L, y);
    ctx.lineTo(W - PAD.R, y);
    ctx.stroke();
  }

  // x ticks
  const ticks = 8;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let i = 0; i <= ticks; i++) {
    const val = xMin + (i / ticks) * (xMax - xMin);
    const x = X(val);
    ctx.fillStyle = colors.label;
    ctx.fillText(latexNum(val, 2), x, H - PAD.B + 4);
  }
}

function drawCurve(ctx, page, params, W, H, xMin, xMax, yMax, type, fill) {
  const { X, Y } = coordinateHelpers(W, H, xMin, xMax, yMax);
  const steps = Math.floor((W - PAD.L - PAD.R) * 2);

  const fn = type === 'pdf'
    ? (x) => (page.pdf ? page.pdf(x, params) : 0)
    : (x) => (page.cdf ? page.cdf(x, params) : 0);

  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    const y = clamp(fn(x) ?? 0, 0, yMax * 2);
    pts.push([X(x), Y(y)]);
  }

  if (pts.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0], pts[i][1]);
  }

  if (fill) {
    ctx.fillStyle = fill;
    const bottom = Y(0);
    ctx.lineTo(pts[pts.length - 1][0], bottom);
    ctx.lineTo(pts[0][0], bottom);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = type === 'pdf' ? colors.pdf : colors.cdf;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawShadingArea(ctx, page, params, W, H, xMin, xMax, yMax, dxMin, dxMax, fillColor) {
  if (dxMin >= dxMax) return;
  const { X, Y } = coordinateHelpers(W, H, xMin, xMax, yMax);
  const steps = Math.max(10, Math.floor((X(dxMax) - X(dxMin)) * 1.5));

  ctx.beginPath();
  ctx.moveTo(X(dxMin), Y(0));
  for (let i = 0; i <= steps; i++) {
    const x = dxMin + (i / steps) * (dxMax - dxMin);
    const y = clamp((page.pdf ? page.pdf(x, params) : 0) ?? 0, 0, yMax * 2);
    ctx.lineTo(X(x), Y(y));
  }
  ctx.lineTo(X(dxMax), Y(0));
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
}

function drawHandle(ctx, cx, topY, bottomY, hovered) {
  // Dashed vertical line
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx, bottomY);
  ctx.strokeStyle = colors.handleLine;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);

  // "drag" pill
  const ph = 14;
  const pw = 32;
  const py = topY - ph / 2; // Center the pill exactly over topY
  const px = cx - pw / 2;

  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 6);
  ctx.fillStyle = colors.handlePillBg;
  ctx.fill();
  ctx.strokeStyle = hovered ? '#1d4ed8' : colors.handlePillBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = 'bold 9px sans-serif';
  ctx.fillStyle = hovered ? '#1d4ed8' : colors.handlePillText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('drag', cx, py + ph / 2 + 1);
}

/**
 * ContinuousChart — canvas PDF/CDF renderer with draggable handles.
 * Props:
 *   page            — continuous PAGE object
 *   params          — current parameter values
 *   xRange          — { xMin, xMax }
 *   yMax            — number
 *   mode            — 'one' | 'two' | 'right'
 *   cutoffs         — { cutoff1, cutoff2 }
 *   showPdf         — bool
 *   showCdf         — bool
 *   onCutoff1Change — (v) => void
 *   onCutoff2Change — (v) => void
 */
export function ContinuousChart({ page, params, xRange, yMax, mode, cutoffs, showPdf, showCdf, onCutoff1Change, onCutoff2Change }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({ dragging: null, hover: null, W: 0, H: 0 });
  const [popout, setPopout] = useState(null);

  const { xMin, xMax } = xRange;
  const { cutoff1, cutoff2 } = cutoffs;

  // ── Draw ────────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const holder = canvas.parentElement;
    const rect   = holder.getBoundingClientRect();
    const dpr    = window.devicePixelRatio || 1;

    const W = Math.max(200, Math.floor(rect.width));
    const H = Math.max(180, Math.floor(rect.height));
    stateRef.current.W = W;
    stateRef.current.H = H;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const safeYMax = Math.max(yMax, 1e-6);
    const { X, Y } = coordinateHelpers(W, H, xMin, xMax, safeYMax);

    drawGrid(ctx, W, H, xMin, xMax, safeYMax);

    if (showPdf && mode !== 'center') {
      // Shading based on mode
      if (mode === 'one') {
        drawShadingArea(ctx, page, params, W, H, xMin, xMax, safeYMax, Math.max(xMin, xMin), Math.min(xMax, cutoff1), colors.shadeLeft);
        drawShadingArea(ctx, page, params, W, H, xMin, xMax, safeYMax, Math.max(xMin, cutoff1), Math.min(xMax, xMax), colors.shadeRight);
      } else if (mode === 'right') {
        drawShadingArea(ctx, page, params, W, H, xMin, xMax, safeYMax, Math.max(xMin, cutoff1), Math.min(xMax, xMax), colors.shadeRight);
      } else if (mode === 'two') {
        drawShadingArea(ctx, page, params, W, H, xMin, xMax, safeYMax, Math.max(xMin, cutoff1), Math.min(xMax, cutoff2), colors.shadeTwo);
      } else if (mode === 'area') {
        drawShadingArea(ctx, page, params, W, H, xMin, xMax, safeYMax, Math.max(xMin, xMin), Math.min(xMax, cutoff1), colors.shadeLeft);
      }

      drawCurve(ctx, page, params, W, H, xMin, xMax, safeYMax, 'pdf', null);

      // handles
      const bottomY = Y(0);
      const topY = PAD.T + 12; // Static handle attachment height
      const c1x = X(clamp(cutoff1, xMin, xMax));
      const { hover, dragging } = stateRef.current;
      drawHandle(ctx, c1x, topY, bottomY, hover === 1 || dragging === 1);

      if (mode === 'two') {
        const c2x = X(clamp(cutoff2, xMin, xMax));
        drawHandle(ctx, c2x, topY, bottomY, hover === 2 || dragging === 2);
      }
    }

    if (showCdf) {
      drawCurve(ctx, page, params, W, H, xMin, xMax, safeYMax, 'cdf', null);
    }
  }, [page, params, xMin, xMax, yMax, mode, cutoff1, cutoff2, showPdf, showCdf]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const obs = new ResizeObserver(draw);
    if (canvasRef.current?.parentElement) obs.observe(canvasRef.current.parentElement);
    return () => obs.disconnect();
  }, [draw]);

  // ── Pointer events ──────────────────────────────────────────────────────────
  const getXFromEvent = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const px = clientX - rect.left;
    const { W, H } = stateRef.current;
    const { xFromPx } = coordinateHelpers(W, H, xMin, xMax, yMax);
    return clamp(xFromPx(px), xMin, xMax);
  }, [xMin, xMax, yMax]);

  const handlePointerDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const px = clientX - rect.left;
    const { W, H } = stateRef.current;
    const { X } = coordinateHelpers(W, H, xMin, xMax, yMax);

    const c1x = X(clamp(cutoff1, xMin, xMax));
    const c2x = X(clamp(cutoff2, xMin, xMax));

    if (Math.abs(px - c1x) <= 12) {
      stateRef.current.dragging = 1;
      e.preventDefault();
    } else if (mode === 'two' && Math.abs(px - c2x) <= 12) {
      stateRef.current.dragging = 2;
      e.preventDefault();
    }
  }, [cutoff1, cutoff2, xMin, xMax, yMax, mode]);

  const handlePointerMove = useCallback((e) => {
    const { dragging } = stateRef.current;
    const x = getXFromEvent(e);
    if (x === null) return;

    if (dragging === 1) {
      const next = mode === 'two' ? Math.min(x, cutoff2 - 1e-6) : x;
      onCutoff1Change(clamp(next, xMin, xMax));
    } else if (dragging === 2) {
      onCutoff2Change(clamp(Math.max(x, cutoff1 + 1e-6), xMin, xMax));
    } else {
      // hover detection
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const px = clientX - rect.left;
      const { W, H } = stateRef.current;
      const { X } = coordinateHelpers(W, H, xMin, xMax, yMax);
      // check handle hover
      const c1x = X(clamp(cutoff1, xMin, xMax));
      const c2x = X(clamp(cutoff2, xMin, xMax));
      const prevHover = stateRef.current.hover;
      if (Math.abs(px - c1x) <= 12) stateRef.current.hover = 1;
      else if (mode === 'two' && Math.abs(px - c2x) <= 12) stateRef.current.hover = 2;
      else stateRef.current.hover = null;
      if (stateRef.current.hover !== prevHover) draw();

      // Tooltip popout
      if (!e.touches) {
        const clientY = e.clientY;
        const py = clientY - rect.top;
        // Compute function values at x
        
        // Compute function values at x
        const pdfY = page.pdf ? page.pdf(x, params) : 0;
        const cdfY = page.cdf ? page.cdf(x, params) : 0;
        
        let content = `<b>x = ${latexNum(x, 4)}</b>`;
        if (showPdf && pdfY != null && !isNaN(pdfY)) content += `<br/>PDF = ${latexNum(pdfY, 4)}`;
        if (showCdf && cdfY != null && !isNaN(cdfY)) content += `<br/>CDF = ${latexNum(cdfY, 4)}`;

        setPopout({ px, py, content });
      }
    }
  }, [getXFromEvent, cutoff1, cutoff2, xMin, xMax, yMax, mode, onCutoff1Change, onCutoff2Change, draw, page, params, showPdf, showCdf]);

  const handlePointerUp = useCallback(() => {
    if (stateRef.current.dragging) {
      stateRef.current.dragging = null;
      draw();
    }
  }, [draw]);

  const handlePointerLeave = useCallback(() => {
    handlePointerUp();
    setPopout(null);
  }, [handlePointerUp]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ cursor: 'crosshair', display: 'block', width: '100%', height: '100%' }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerLeave}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
      {popout && (
        <div
          className="curve-hover-popout"
          style={{ left: popout.px + 10, top: popout.py + 10 }}
          dangerouslySetInnerHTML={{ __html: popout.content }}
        />
      )}
    </div>
  );
}
