import { useRef, useEffect, useCallback } from 'react';
import { latexNum } from '../utils/math.js';

// Draw helpers ----------------------------------------------------------------

function drawAxes(ctx, W, H, L, R, T, B, yMax) {
  const gH = H - T - B;

  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(L, H - B);
  ctx.lineTo(W - R, H - B);
  ctx.moveTo(L, T);
  ctx.lineTo(L, H - B);
  ctx.stroke();

  ctx.font = '10px sans-serif';
  ctx.textAlign = 'right';

  for (let i = 0; i <= 5; i++) {
    const y   = H - B - (i / 5) * gH;
    const val = (i / 5) * yMax;
    ctx.fillStyle = '#999';
    ctx.fillText(latexNum(val, 2), L - 5, y + 3);

    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(L, y);
    ctx.lineTo(W - R, y);
    ctx.stroke();
  }
}

function drawPMFBars(ctx, cache, selectedXs, minX, maxX, yMax, W, H, L, R, T, B) {
  const gW = W - L - R;
  const gH = H - T - B;
  const range = Math.max(1, maxX - minX + 1);
  const step  = gW / range;
  const barW  = Math.max(1, step * 0.7);
  const [cacheA] = cache.displaySupport;

  for (let x = minX; x <= maxX; x++) {
    const idx = x - cacheA;
    const p   = (idx >= 0 && idx < cache.pmf.length) ? cache.pmf[idx] : 0;
    const barH = (p / yMax) * gH;
    const px   = L + (x - minX) * step + (step - barW) / 2;
    const selected = selectedXs.has(x);
    ctx.fillStyle = selected ? '#045275' : 'rgba(4,82,117,.30)';
    ctx.fillRect(px, H - B - barH, barW, barH);
  }
}

function drawCDFStep(ctx, cache, minX, maxX, yMax, W, H, L, R, T, B) {
  const gW = W - L - R;
  const gH = H - T - B;
  const range = Math.max(1, maxX - minX + 1);
  const step  = gW / range;
  const [cacheA] = cache.displaySupport;

  const xAtValue = x => L + (x - minX + 0.5) * step;
  const xBefore  = x => xAtValue(x) - step / 2;
  const xAfter   = x => xAtValue(x) + step / 2;
  const yToPx    = y => H - B - (y / yMax) * gH;

  const getCdf = (x) => {
    const idx = x - cacheA;
    return (idx >= 0 && idx < cache.cdf.length) ? cache.cdf[idx] : 0;
  };

  ctx.save();
  ctx.strokeStyle = '#e11d48';
  ctx.fillStyle   = '#e11d48';
  ctx.lineWidth   = 2;

  const y0 = yToPx(0);
  ctx.beginPath();
  ctx.moveTo(xBefore(minX), y0);
  ctx.lineTo(xAtValue(minX), y0);
  ctx.stroke();

  for (let x = minX; x <= maxX; x++) {
    const Fprev = x > cacheA ? getCdf(x - 1) : 0;
    const Fx    = getCdf(x);
    const x0    = xAtValue(x);
    const xl    = xBefore(x);
    const xr    = xAfter(x);
    const yPrev = yToPx(Fprev);
    const yNow  = yToPx(Fx);

    if (x > minX) {
      ctx.beginPath();
      ctx.moveTo(xl, yPrev);
      ctx.lineTo(x0, yPrev);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(x0, yNow);
    ctx.lineTo(xr, yNow);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x0, yPrev, 2.8, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#e11d48';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x0, yNow, 2.8, 0, Math.PI * 2);
    ctx.fillStyle = '#e11d48';
    ctx.fill();

    ctx.strokeStyle = '#e11d48';
  }

  const xR1 = xAfter(maxX);
  const xR2 = Math.min(W - R, xR1 + step / 2);
  ctx.beginPath();
  ctx.moveTo(xR1, yToPx(getCdf(maxX)));
  ctx.lineTo(xR2, yToPx(getCdf(maxX)));
  ctx.stroke();

  ctx.restore();
}

function drawXLabels(ctx, minX, maxX, W, H, L, R, T, B) {
  const gW   = W - L - R;
  const range = Math.max(1, maxX - minX + 1);
  const step  = gW / range;
  const jump  = range <= 20 ? 1 : Math.ceil(range / 10);

  ctx.fillStyle = '#666';
  ctx.font      = '10px sans-serif';
  ctx.textAlign = 'center';

  for (let x = minX; x <= maxX; x++) {
    if ((x - minX) % jump === 0) {
      const px = L + (x - minX + 0.5) * step;
      ctx.fillText(String(x), px, H - B + 13);
    }
  }
}

// Component -------------------------------------------------------------------

/**
 * DiscreteChart — canvas-based PMF bar chart + CDF step function.
 * Props:
 *   cache        — PMF cache from useDiscreteEngine
 *   selectedXs   — Set<number>
 *   displayXRange — { minX, maxX }
 *   displayYMax  — number
 *   showPMF      — bool
 *   showCDF      — bool
 */
export function DiscreteChart({ cache, selectedXs, displayXRange, displayYMax, showPMF, showCDF }) {
  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const holder = canvas.parentElement;
    const rect   = holder.getBoundingClientRect();
    const dpr    = window.devicePixelRatio || 1;

    const W = Math.max(220, Math.floor(rect.width));
    const H = Math.max(220, Math.floor(rect.height));

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const { minX, maxX } = displayXRange;
    const yMax = displayYMax;
    const L = 46, R = 16, T = 20, B = 28;

    drawAxes(ctx, W, H, L, R, T, B, yMax);
    if (showPMF) drawPMFBars(ctx, cache, selectedXs, minX, maxX, yMax, W, H, L, R, T, B);
    if (showCDF) drawCDFStep(ctx, cache, minX, maxX, yMax, W, H, L, R, T, B);
    drawXLabels(ctx, minX, maxX, W, H, L, R, T, B);
  }, [cache, selectedXs, displayXRange, displayYMax, showPMF, showCDF]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const obs = new ResizeObserver(draw);
    if (canvasRef.current?.parentElement) obs.observe(canvasRef.current.parentElement);
    return () => obs.disconnect();
  }, [draw]);

  return <canvas ref={canvasRef} />;
}
