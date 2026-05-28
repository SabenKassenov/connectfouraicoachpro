import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Board4 } from "@/components/Board4";
import { useI18n } from "@/lib/i18n";
import { useProfile, profileActions } from "@/lib/store";
import {
  checkWin,
  cloneBoard,
  drop,
  emptyBoard,
  suggestMove,
  type Board,
} from "@/lib/game";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/puzzle")({
  component: PuzzlePage,
});

type Puzzle = {
  id: string;
  title: string;
  board: Board;
  bestCol: number; // expected best move (0-indexed)
  reward: number;
};

function mk(cells: [number, number, 1 | 2][]): Board {
  const b = emptyBoard();
  for (const [r, c, v] of cells) b[r][c] = v;
  return b;
}

const PUZZLES: Puzzle[] = [
  {
    id: "p1",
    title: "Win in 1",
    board: mk([
      [5, 1, 1],
      [5, 2, 1],
      [5, 3, 1],
      [5, 5, 2],
      [4, 5, 2],
      [3, 5, 2],
    ]),
    bestCol: 0,
    reward: 30,
  },
  {
    id: "p2",
    title: "Block the threat",
    board: mk([
      [5, 2, 2],
      [5, 3, 2],
      [5, 4, 2],
      [5, 0, 1],
      [4, 0, 1],
    ]),
    bestCol: 1,
    reward: 40,
  },
  {
    id: "p3",
    title: "Take the center",
    board: emptyBoard(),
    bestCol: 3,
    reward: 20,
  },
];

function PuzzlePage() {
  const { t } = useI18n();
  const profile = useProfile();
  const [idx, setIdx] = React.useState(0);
  const puzzle = PUZZLES[idx];
  const [board, setBoard] = React.useState<Board>(cloneBoard(puzzle.board));
  const [solved, setSolved] = React.useState(false);

  React.useEffect(() => {
    setBoard(cloneBoard(puzzle.board));
    setSolved(false);
  }, [idx]);

  const onCol = (c: number) => {
    if (solved) return;
    const next = cloneBoard(board);
    if (!drop(next, c, 1)) return;
    setBoard(next);
    const w = checkWin(next);
    const correct =
      c === puzzle.bestCol ||
      // accept any actually-winning move
      (w?.player === 1) ||
      // accept any move that matches suggestMove's recommendation
      suggestMove(puzzle.board, 1) === c;
    if (correct) {
      setSolved(true);
      profileActions.addCoins(puzzle.reward);
      toast.success(`${t("solved")} +${puzzle.reward} ●`);
    } else {
      toast.error("Not the best move — try again.");
      setTimeout(() => setBoard(cloneBoard(puzzle.board)), 600);
    }
  };

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">{t("puzzle")}</h1>
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-2">
          {PUZZLES.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setIdx(i)}
              className={`w-full rounded-2xl border border-white/10 p-3 text-left transition ${
                idx === i ? "bg-foreground/10" : "bg-white/5 hover:bg-foreground/5"
              }`}
            >
              <div className="font-semibold">{p.title}</div>
              <div className="text-xs text-amber-400">+{p.reward} ●</div>
            </button>
          ))}
        </div>
        <GlassCard>
          <div className="mb-3 flex items-center justify-between">
            <div className="font-semibold">{puzzle.title}</div>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setBoard(cloneBoard(puzzle.board));
                setSolved(false);
              }}
            >
              Reset
            </Button>
          </div>
          <Board4 board={board} onColumn={onCol} disabled={solved} skin={profile.selectedSkin} />
          {solved && (
            <div className="mt-3 text-center text-sm font-semibold text-emerald-400">
              {t("solved")}
            </div>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}
