export type Cell = 0 | 1 | 2; // 0 empty, 1 player, 2 ai
export type Board = Cell[][]; // [row][col], row 0 = top
export const ROWS = 6;
export const COLS = 7;

export const emptyBoard = (): Board =>
  Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0));

export const cloneBoard = (b: Board): Board => b.map((r) => [...r]);

export function validMoves(b: Board): number[] {
  const out: number[] = [];
  for (let c = 0; c < COLS; c++) if (b[0][c] === 0) out.push(c);
  return out;
}

export function dropRow(b: Board, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) if (b[r][col] === 0) return r;
  return -1;
}

export function drop(b: Board, col: number, player: Cell): { row: number; col: number } | null {
  const r = dropRow(b, col);
  if (r < 0) return null;
  b[r][col] = player;
  return { row: r, col };
}

export type WinInfo = { player: Cell; cells: [number, number][] } | null;

const DIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

export function checkWin(b: Board): WinInfo {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = b[r][c];
      if (!p) continue;
      for (const [dr, dc] of DIRS) {
        const cells: [number, number][] = [[r, c]];
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
          if (b[nr][nc] !== p) break;
          cells.push([nr, nc]);
        }
        if (cells.length === 4) return { player: p, cells };
      }
    }
  }
  return null;
}

export function isDraw(b: Board): boolean {
  return validMoves(b).length === 0 && !checkWin(b);
}

// ---------- AI ----------
export type Difficulty = "easy" | "medium" | "hard";

function findWinningMove(b: Board, player: Cell): number | null {
  for (const c of validMoves(b)) {
    const r = dropRow(b, c);
    b[r][c] = player;
    const win = checkWin(b);
    b[r][c] = 0;
    if (win && win.player === player) return c;
  }
  return null;
}

function scoreWindow(window: Cell[], player: Cell): number {
  const opp: Cell = player === 1 ? 2 : 1;
  const pc = window.filter((v) => v === player).length;
  const oc = window.filter((v) => v === opp).length;
  const ec = window.filter((v) => v === 0).length;
  let score = 0;
  if (pc === 4) score += 100;
  else if (pc === 3 && ec === 1) score += 8;
  else if (pc === 2 && ec === 2) score += 3;
  if (oc === 3 && ec === 1) score -= 12;
  return score;
}

function evaluate(b: Board, player: Cell): number {
  let score = 0;
  // center pref
  for (let r = 0; r < ROWS; r++) if (b[r][3] === player) score += 4;
  // horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      score += scoreWindow([b[r][c], b[r][c + 1], b[r][c + 2], b[r][c + 3]], player);
    }
  }
  // vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      score += scoreWindow([b[r][c], b[r + 1][c], b[r + 2][c], b[r + 3][c]], player);
    }
  }
  // diag down-right
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      score += scoreWindow(
        [b[r][c], b[r + 1][c + 1], b[r + 2][c + 2], b[r + 3][c + 3]],
        player,
      );
    }
  }
  // diag up-right
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      score += scoreWindow(
        [b[r][c], b[r - 1][c + 1], b[r - 2][c + 2], b[r - 3][c + 3]],
        player,
      );
    }
  }
  return score;
}

export function aiMove(board: Board, difficulty: Difficulty, aiPlayer: Cell = 2): number {
  const moves = validMoves(board);
  if (moves.length === 0) return -1;
  const b = cloneBoard(board);

  if (difficulty === "easy") {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Always: take immediate win
  const winCol = findWinningMove(b, aiPlayer);
  if (winCol !== null) return winCol;
  // Block opponent immediate win
  const opp: Cell = aiPlayer === 1 ? 2 : 1;
  const blockCol = findWinningMove(b, opp);
  if (blockCol !== null) return blockCol;

  if (difficulty === "medium") {
    // prefer center, else random
    if (moves.includes(3)) return 3;
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // hard: 1-ply heuristic with look-ahead avoidance of giving opponent a win
  let best = moves[0];
  let bestScore = -Infinity;
  for (const c of moves) {
    const r = dropRow(b, c);
    b[r][c] = aiPlayer;
    let score = evaluate(b, aiPlayer);
    // penalize if opponent now has a winning reply
    if (findWinningMove(b, opp) !== null) score -= 80;
    b[r][c] = 0;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

// Hint: suggest a non-losing column favoring win/block/center
export function suggestMove(board: Board, player: Cell = 1): number | null {
  const moves = validMoves(board);
  if (moves.length === 0) return null;
  const b = cloneBoard(board);
  const win = findWinningMove(b, player);
  if (win !== null) return win;
  const opp: Cell = player === 1 ? 2 : 1;
  const block = findWinningMove(b, opp);
  if (block !== null) return block;
  if (moves.includes(3)) return 3;
  return moves[0];
}
