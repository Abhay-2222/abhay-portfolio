/**
 * MinesweeperOverlay.jsx
 * Canvas-based cell renderer. Sits above DotGrid (z-index 3).
 * Unrevealed/empty cells are transparent → dots show through.
 */
import { useEffect, useRef } from 'react';
import { CELL } from '../SignalMap.js';

const NUM_COLORS = [
  null,
  '#4A7FC1', // 1
  '#5A8F5A', // 2
  '#C14A4A', // 3
  '#4A4A8F', // 4
  '#8F4A4A', // 5
  '#4A8F8F', // 6
  '#1a1814', // 7
  '#8C8C8C', // 8
];

export default function MinesweeperOverlay({
  board, rows, cols, phase, hitCell, onCellClick, onCellRightClick,
}) {
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const canvasRef    = useRef(null);
  const boardRef     = useRef(board);
  const rowsRef      = useRef(rows);
  const colsRef      = useRef(cols);
  const hitCellRef   = useRef(hitCell);
  const revealTimes  = useRef({});  // key → reveal timestamp (ms)

  /* Keep refs in sync with props */
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { rowsRef.current = rows; colsRef.current = cols; }, [rows, cols]);
  useEffect(() => { hitCellRef.current = hitCell; }, [hitCell]);

  /* Reset reveal times on new game */
  useEffect(() => {
    if (phase === 'idle') revealTimes.current = {};
  }, [phase]);

  /* Track newly revealed cells for fade-in timing */
  useEffect(() => {
    const now = performance.now();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = board[r]?.[c];
        if (!cell) continue;
        const key = `${r}-${c}`;
        if ((cell.isRevealed || cell.isFlagged) && revealTimes.current[key] === undefined) {
          revealTimes.current[key] = now + (cell.depth || 0) * 15;
        }
      }
    }
  }, [board, rows, cols]);

  /* Canvas resize setup */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const ctx  = canvas.getContext('2d');

    function resize() {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  /* Continuous draw loop — reads from refs */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let rafId;

    function draw() {
      const board   = boardRef.current;
      const rows    = rowsRef.current;
      const cols    = colsRef.current;
      const hitCell = hitCellRef.current;

      if (!rows || !cols) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const W = canvas.width  / dpr;
      const H = canvas.height / dpr;
      ctx.clearRect(0, 0, W, H);

      /* ── Idle state: faint grid so player sees the board is live ── */
      if (phaseRef.current === 'idle') {
        ctx.strokeStyle = 'rgba(0,0,0,0.045)';
        ctx.lineWidth   = 0.5;
        for (let r = 0; r <= rows; r++) {
          ctx.beginPath();
          ctx.moveTo(0,          r * CELL);
          ctx.lineTo(cols * CELL, r * CELL);
          ctx.stroke();
        }
        for (let c = 0; c <= cols; c++) {
          ctx.beginPath();
          ctx.moveTo(c * CELL, 0);
          ctx.lineTo(c * CELL, rows * CELL);
          ctx.stroke();
        }
        rafId = requestAnimationFrame(draw);
        return;
      }

      if (!board || !board.length) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const now = performance.now();

      for (let r = 0; r < rows; r++) {
        const row = board[r];
        if (!row) continue;
        for (let c = 0; c < cols; c++) {
          const cell = row[c];
          if (!cell || (!cell.isRevealed && !cell.isFlagged)) continue;

          const x   = c * CELL;
          const y   = r * CELL;
          const key = `${r}-${c}`;

          /* Fade-in alpha */
          const revealAt = revealTimes.current[key];
          const alpha    = revealAt === undefined
            ? 1
            : Math.min(1, Math.max(0, (now - revealAt) / 120));

          if (cell.isFlagged && !cell.isRevealed) {
            /* Flag glyph */
            ctx.globalAlpha = alpha;
            ctx.fillStyle   = '#c8602a';
            ctx.font        = `${Math.round(CELL * 0.6)}px sans-serif`;
            ctx.textAlign   = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚑', x + CELL / 2, y + CELL / 2);
            ctx.globalAlpha = 1;
            continue;
          }

          if (!cell.isRevealed) continue;

          const isHit = hitCell && hitCell.r === r && hitCell.c === c;

          if (cell.isMine) {
            /* Mine cell */
            ctx.globalAlpha = alpha;
            ctx.fillStyle   = isHit ? 'rgba(200,50,50,0.35)' : 'rgba(200,50,50,0.12)';
            ctx.fillRect(x, y, CELL, CELL);
            ctx.fillStyle = isHit ? '#c83232' : '#a83232';
            ctx.font      = `${Math.round(CELL * 0.5)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('●', x + CELL / 2, y + CELL / 2);
            ctx.globalAlpha = 1;

          } else if (cell.isSignal) {
            /* Signal ring */
            ctx.globalAlpha  = alpha;
            ctx.strokeStyle  = 'rgba(200,140,80,0.72)';
            ctx.lineWidth    = 1.5;
            ctx.beginPath();
            ctx.arc(x + CELL / 2, y + CELL / 2, CELL * 0.36, 0, Math.PI * 2);
            ctx.stroke();
            /* Inner amber dot */
            ctx.fillStyle = 'rgba(200,140,80,0.55)';
            ctx.beginPath();
            ctx.arc(x + CELL / 2, y + CELL / 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

          } else if (cell.adjacentMines > 0) {
            /* Numbered cell */
            ctx.globalAlpha = alpha;
            ctx.fillStyle   = 'rgba(247,245,240,0.92)';
            ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
            ctx.fillStyle    = NUM_COLORS[cell.adjacentMines] || '#1a1814';
            ctx.font         = `600 ${Math.round(CELL * 0.55)}px "DM Mono", monospace`;
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(cell.adjacentMines), x + CELL / 2, y + CELL / 2);
            ctx.globalAlpha = 1;
          }
          // adjacentMines === 0, not signal: transparent — dots visible
        }
      }

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []); // runs once; reads from refs

  function handleClick(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left)  / CELL);
    const r = Math.floor((e.clientY - rect.top)   / CELL);
    if (r >= 0 && r < rowsRef.current && c >= 0 && c < colsRef.current) {
      onCellClick(r, c);
    }
  }

  function handleContextMenu(e) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left)  / CELL);
    const r = Math.floor((e.clientY - rect.top)   / CELL);
    if (r >= 0 && r < rowsRef.current && c >= 0 && c < colsRef.current) {
      onCellRightClick(r, c);
    }
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      aria-label="Minesweeper board"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        zIndex: 3, display: 'block',
        cursor: 'crosshair',
      }}
    />
  );
}
