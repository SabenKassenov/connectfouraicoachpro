import type { Difficulty, Board } from "./game";
import type { CoachReview } from "@/components/AICoachPanel";
import { aiMove, cloneBoard, dropRow, validMoves } from "./game";

// Local heuristic "AI Coach" used as a graceful fallback.
// Produces a structured review based on actual gameplay.
export function buildCoachReview(args: {
  result: "win" | "loss" | "draw";
  difficulty: Difficulty;
  moves: { col: number; player: 1 | 2 }[];
  finalBoard: Board;
}): CoachReview {
  const { result, difficulty, moves } = args;
  const playerMoves = moves.filter((m) => m.player === 1);

  // Replay to find missed wins/blocks
  let missedBlocks = 0;
  let missedWins = 0;
  let centerControl = 0;
  let bestMomentMove = -1;

  const b = Array.from({ length: 6 }, () => Array(7).fill(0)) as Board;
  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    if (m.player === 1) {
      // Did we have a winning move available?
      const winCol = findImmediateWin(b, 1);
      if (winCol !== null && m.col !== winCol && result !== "win") missedWins++;
      // Was opponent threatening a win we didn't block?
      const blockCol = findImmediateWin(b, 2);
      if (blockCol !== null && m.col !== blockCol) missedBlocks++;
      if (m.col === 3) centerControl++;
      // Best move = matched AI hard recommendation
      const rec = aiMove(b, "hard", 1);
      if (rec === m.col) bestMomentMove = i + 1;
    }
    const row = dropRow(b, m.col);
    if (row >= 0) b[row][m.col] = m.player;
  }

  let score = result === "win" ? 75 : result === "draw" ? 55 : 35;
  score += Math.min(20, centerControl * 4);
  score -= missedBlocks * 10;
  score -= missedWins * 8;
  if (difficulty === "hard") score += 5;
  if (difficulty === "easy") score -= 5;
  score = Math.max(0, Math.min(100, score));

  const summary =
    result === "win"
      ? `Solid ${difficulty} win in ${playerMoves.length} moves. You converted your pressure into a winning line.`
      : result === "draw"
        ? `A balanced ${difficulty} match — neither side broke through. ${playerMoves.length} moves played.`
        : `Tough ${difficulty} loss after ${playerMoves.length} moves. The opponent capitalized on a key opening.`;

  const mistake =
    missedBlocks > 0
      ? `You missed ${missedBlocks} immediate block${missedBlocks > 1 ? "s" : ""} — always scan for the opponent's three-in-a-row first.`
      : missedWins > 0
        ? `You had ${missedWins} winning move${missedWins > 1 ? "s" : ""} available but played elsewhere.`
        : centerControl < 2
          ? "You drifted away from the center too early — column 4 is the most powerful square."
          : "Minor positional drift — keep stacking threats instead of isolated chips.";

  const best =
    bestMomentMove > 0
      ? `Move #${bestMomentMove} matched the engine's top choice — that was your strongest moment.`
      : "Your opening was reasonable; look for double-threat setups (two ways to win at once).";

  const tip =
    difficulty === "easy"
      ? "Step up to Medium and practice anticipating one move ahead."
      : difficulty === "medium"
        ? "Build odd-row threats on columns 3, 4, 5 — they convert most reliably."
        : "Against Hard AI, force zugzwang by controlling odd rows with your bottom chips.";

  return { summary, mistake, best, tip, score };
}

function findImmediateWin(board: Board, player: 1 | 2): number | null {
  const b = cloneBoard(board);
  for (const c of validMoves(b)) {
    const r = dropRow(b, c);
    b[r][c] = player;
    if (hasFour(b, player)) {
      b[r][c] = 0;
      return c;
    }
    b[r][c] = 0;
  }
  return null;
}

function hasFour(b: Board, p: 1 | 2): boolean {
  const ROWS = 6,
    COLS = 7;
  const dirs: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (b[r][c] === p)
        for (const [dr, dc] of dirs) {
          let k = 1;
          while (
            k < 4 &&
            r + dr * k >= 0 &&
            r + dr * k < ROWS &&
            c + dc * k >= 0 &&
            c + dc * k < COLS &&
            b[r + dr * k][c + dc * k] === p
          )
            k++;
          if (k === 4) return true;
        }
  return false;
}
