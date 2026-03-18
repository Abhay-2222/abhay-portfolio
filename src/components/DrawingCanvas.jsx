/**
 * DrawingCanvas.jsx — freehand pen, eraser, rect, circle on transparent canvas
 * Exposed via ref: clear(), setTool(tool)
 */
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

function midPoint(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }

function redrawAll(ctx, strokes, preview) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const dpr = window.devicePixelRatio || 1;
  ctx.save();
  ctx.scale(dpr, dpr);

  for (const s of strokes) {
    if (s.type === 'pen') {
      drawPenStroke(ctx, s);
    } else if (s.type === 'rect') {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width || 2;
      ctx.beginPath();
      ctx.rect(s.x0, s.y0, s.x1 - s.x0, s.y1 - s.y0);
      ctx.stroke();
    } else if (s.type === 'circle') {
      const rx = Math.abs(s.x1 - s.x0) / 2;
      const ry = Math.abs(s.y1 - s.y0) / 2;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width || 2;
      ctx.beginPath();
      ctx.ellipse(s.x0 + (s.x1 - s.x0) / 2, s.y0 + (s.y1 - s.y0) / 2, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (preview) {
    ctx.strokeStyle = preview.color;
    ctx.lineWidth = preview.width || 2;
    if (preview.type === 'rect') {
      ctx.beginPath();
      ctx.rect(preview.x0, preview.y0, preview.x1 - preview.x0, preview.y1 - preview.y0);
      ctx.stroke();
    } else if (preview.type === 'circle') {
      const rx = Math.abs(preview.x1 - preview.x0) / 2;
      const ry = Math.abs(preview.y1 - preview.y0) / 2;
      ctx.beginPath();
      ctx.ellipse(
        preview.x0 + (preview.x1 - preview.x0) / 2,
        preview.y0 + (preview.y1 - preview.y0) / 2,
        rx, ry, 0, 0, Math.PI * 2
      );
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawPenStroke(ctx, s) {
  if (!s.points || s.points.length < 2) return;
  ctx.strokeStyle = s.color;
  ctx.lineWidth = s.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(s.points[0].x, s.points[0].y);
  for (let i = 1; i < s.points.length - 1; i++) {
    const m = midPoint(s.points[i], s.points[i + 1]);
    ctx.quadraticCurveTo(s.points[i].x, s.points[i].y, m.x, m.y);
  }
  ctx.lineTo(s.points[s.points.length - 1].x, s.points[s.points.length - 1].y);
  ctx.stroke();
}

const DrawingCanvas = forwardRef(function DrawingCanvas({ activeTool, color }, ref) {
  const canvasRef = useRef(null);
  const strokes   = useRef([]);
  const drawing   = useRef(false);
  const origin    = useRef(null);
  const preview   = useRef(null);

  useImperativeHandle(ref, () => ({
    clear() {
      strokes.current = [];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      // Save strokes before resize
      const saved = [...strokes.current];
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      strokes.current = saved;
      redrawAll(canvas.getContext('2d'), strokes.current, preview.current);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    return () => ro.disconnect();
  }, []);

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX ?? e.touches?.[0]?.clientX) - rect.left,
      y: (e.clientY ?? e.touches?.[0]?.clientY) - rect.top,
    };
  }

  function onDown(e) {
    if (!['pen','eraser','rect','circle'].includes(activeTool)) return;
    e.preventDefault();
    drawing.current = true;
    const pos = getPos(e);
    origin.current = pos;

    if (activeTool === 'pen') {
      strokes.current.push({ type: 'pen', color, width: 2, points: [pos] });
    } else if (activeTool === 'eraser') {
      const ctx = canvasRef.current.getContext('2d');
      ctx.save();
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function onMove(e) {
    if (!drawing.current) return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');

    if (activeTool === 'pen') {
      const cur = strokes.current[strokes.current.length - 1];
      cur.points.push(pos);
      redrawAll(ctx, strokes.current, null);
    } else if (activeTool === 'eraser') {
      ctx.save();
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (activeTool === 'rect' || activeTool === 'circle') {
      preview.current = {
        type: activeTool,
        x0: origin.current.x,
        y0: origin.current.y,
        x1: pos.x,
        y1: pos.y,
        color,
        width: 2,
      };
      redrawAll(ctx, strokes.current, preview.current);
    }
  }

  function onUp(e) {
    if (!drawing.current) return;
    drawing.current = false;
    if (activeTool === 'rect' || activeTool === 'circle') {
      if (preview.current) {
        strokes.current.push({ ...preview.current });
        preview.current = null;
        redrawAll(canvasRef.current.getContext('2d'), strokes.current, null);
      }
    }
    origin.current = null;
  }

  const isActive = ['pen','eraser','rect','circle'].includes(activeTool);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        display: 'block',
        pointerEvents: isActive ? 'auto' : 'none',
        touchAction: 'none',
      }}
    />
  );
});

export default DrawingCanvas;
