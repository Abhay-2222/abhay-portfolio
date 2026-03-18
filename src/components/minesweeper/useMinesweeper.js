/**
 * useMinesweeper.js — game state hook
 * Pure logic, no JSX.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { SIGNALS, SIGNAL_0, CELL } from '../SignalMap.js';

/* ── Board creation ── */
function createBoard(rows, cols) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      isSignal: false,
      signalId: null,
      adjacentMines: 0,
      depth: 0,
    }))
  );
}

function placeMines(board, rows, cols, firstR, firstC, safeSet, count) {
  // 3×3 zone around first click is always safe
  const safe = new Set(safeSet);
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r2 = firstR + dr, c2 = firstC + dc;
      if (r2 >= 0 && r2 < rows && c2 >= 0 && c2 < cols) safe.add(r2 * cols + c2);
    }
  }
  let placed = 0;
  let guard  = count * 200;
  while (placed < count && guard-- > 0) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].isMine && !safe.has(r * cols + c)) {
      board[r][c].isMine = true;
      placed++;
    }
  }
}

function computeAdjacency(board, rows, cols) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) continue;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const r2 = r + dr, c2 = c + dc;
          if (r2 >= 0 && r2 < rows && c2 >= 0 && c2 < cols && board[r2][c2].isMine) n++;
        }
      }
      board[r][c].adjacentMines = n;
    }
  }
}

/* BFS flood-fill reveal. Mutates board in place. Returns revealed list. */
function bfsReveal(board, startR, startC, rows, cols) {
  const visited = new Set();
  const queue   = [{ r: startR, c: startC, depth: 0 }];
  const revealed = [];

  while (queue.length > 0) {
    const { r, c, depth } = queue.shift();
    const key = r * cols + c;
    if (visited.has(key)) continue;
    visited.add(key);

    const cell = board[r][c];
    if (cell.isMine || cell.isRevealed || cell.isFlagged) continue;

    cell.isRevealed = true;
    cell.depth = depth;
    revealed.push({ r, c, isSignal: cell.isSignal, signalId: cell.signalId });

    if (cell.adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const r2 = r + dr, c2 = c + dc;
          if (r2 >= 0 && r2 < rows && c2 >= 0 && c2 < cols) {
            queue.push({ r: r2, c: c2, depth: depth + 1 });
          }
        }
      }
    }
  }

  return revealed;
}

/* ── Hook ── */
export default function useMinesweeper() {
  const [phase,     setPhase]     = useState('idle');
  const [board,     setBoard]     = useState([]);
  const [rows,      setRows]      = useState(0);
  const [cols,      setCols]      = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const [mineCount, setMineCount] = useState(0);
  const [elapsed,   setElapsed]   = useState(0);
  const [score,     setScore]     = useState(0);
  const [hitCell,   setHitCell]   = useState(null);

  const boardRef     = useRef([]);
  const rowsRef      = useRef(0);
  const colsRef      = useRef(0);
  const minesRef     = useRef(0);
  const phaseRef     = useRef('idle');
  const timerRef     = useRef(null);
  const startTimeRef = useRef(0);
  const signalCells  = useRef([]); // [{id, r, c}]
  const signalSafe   = useRef(new Set());

  /* Keep refs in sync */
  useEffect(() => { rowsRef.current = rows; colsRef.current = cols; }, [rows, cols]);
  useEffect(() => { minesRef.current = mineCount; }, [mineCount]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  /* Timer */
  useEffect(() => {
    if (phase === 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  /* startGame — call with hero pixel dimensions */
  const startGame = useCallback((heroW, heroH) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    const c     = Math.ceil(heroW / CELL) + 1;
    const r     = Math.ceil(heroH / CELL) + 1;
    const mines = Math.floor(c * r * 0.08);

    const scs = [SIGNAL_0, ...SIGNALS].map(s => ({
      id: s.id,
      r:  Math.round((heroH * s.pctY / 100) / CELL),
      c:  Math.round((heroW * s.pctX / 100) / CELL),
    }));
    signalCells.current = scs;
    signalSafe.current  = new Set(scs.map(s => s.r * c + s.c));

    rowsRef.current  = r;
    colsRef.current  = c;
    minesRef.current = mines;
    phaseRef.current = 'idle';

    setRows(r);
    setCols(c);
    setMineCount(mines);
    setFlagCount(0);
    setElapsed(0);
    setScore(0);
    setHitCell(null);
    boardRef.current = [];
    setBoard([]);
    setPhase('idle');
  }, []);

  /* handleClick — pass onSignalRevealed(id) callback */
  const handleClick = useCallback((r, c, onSignalRevealed) => {
    const phase = phaseRef.current;
    if (phase === 'won' || phase === 'lost') return;

    const rows = rowsRef.current;
    const cols = colsRef.current;
    let cur    = boardRef.current;

    if (phase === 'idle') {
      const nb = createBoard(rows, cols);
      for (const sc of signalCells.current) {
        if (sc.r >= 0 && sc.r < rows && sc.c >= 0 && sc.c < cols) {
          nb[sc.r][sc.c].isSignal  = true;
          nb[sc.r][sc.c].signalId  = sc.id;
        }
      }
      placeMines(nb, rows, cols, r, c, signalSafe.current, minesRef.current);
      computeAdjacency(nb, rows, cols);
      boardRef.current = nb;
      cur = nb;
      startTimeRef.current = Date.now();
      phaseRef.current = 'playing';
      setPhase('playing');
    }

    const cell = cur[r]?.[c];
    if (!cell || cell.isRevealed || cell.isFlagged) return;

    if (cell.isMine) {
      const nb = cur.map(row => row.map(c => ({ ...c })));
      for (let ri = 0; ri < rows; ri++) {
        for (let ci = 0; ci < cols; ci++) {
          if (nb[ri][ci].isMine) { nb[ri][ci].isRevealed = true; nb[ri][ci].depth = 0; }
        }
      }
      boardRef.current = nb;
      setBoard(nb.map(row => [...row]));
      setHitCell({ r, c });
      phaseRef.current = 'lost';
      setPhase('lost');
      const disc = nb.flat().filter(x => x.isSignal && x.isRevealed && x.signalId !== 0).length;
      setScore(disc * 100);
      return;
    }

    const nb       = cur.map(row => row.map(c => ({ ...c })));
    const revealed = bfsReveal(nb, r, c, rows, cols);
    boardRef.current = nb;
    setBoard(nb.map(row => [...row]));

    for (const cell of revealed) {
      if (cell.isSignal && cell.signalId !== null) {
        onSignalRevealed?.(cell.signalId);
      }
    }

    let allDone = true;
    outer: for (let ri = 0; ri < rows; ri++) {
      for (let ci = 0; ci < cols; ci++) {
        if (!nb[ri][ci].isMine && !nb[ri][ci].isRevealed) { allDone = false; break outer; }
      }
    }

    if (allDone) {
      phaseRef.current = 'won';
      setPhase('won');
      const elapsedNow    = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const timeBonus     = Math.max(0, Math.round((300 - elapsedNow) / 300 * 500));
      const correctFlags  = nb.flat().filter(x => x.isFlagged && x.isMine).length;
      const flagBonus     = correctFlags * 20;
      const disc          = nb.flat().filter(x => x.isSignal && x.isRevealed && x.signalId !== 0).length;
      const signalBonus   = disc * 100;
      const baseScore     = minesRef.current * 150;
      setScore(baseScore + timeBonus + flagBonus + signalBonus);
    }
  }, []);

  /* handleRightClick */
  const handleRightClick = useCallback((r, c) => {
    if (phaseRef.current !== 'playing') return;
    const cur  = boardRef.current;
    const cell = cur[r]?.[c];
    if (!cell || cell.isRevealed) return;

    const nb       = cur.map(row => row.map(c => ({ ...c })));
    const wasFlagged = cur[r][c].isFlagged;
    nb[r][c].isFlagged = !wasFlagged;
    boardRef.current = nb;
    setBoard(nb.map(row => [...row]));
    setFlagCount(prev => wasFlagged ? prev - 1 : prev + 1);
  }, []);

  return {
    phase, board, rows, cols,
    flagCount, mineCount, elapsed, score, hitCell,
    startGame, handleClick, handleRightClick,
  };
}
