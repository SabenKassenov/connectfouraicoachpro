import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Board4 } from "@/components/Board4";
import { useI18n } from "@/lib/i18n";
import { useProfile, profileActions } from "@/lib/store";
import {
  aiMove,
  checkWin,
  cloneBoard,
  drop,
  emptyBoard,
  type Board,
  type Cell,
} from "@/lib/game";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/challenges")({
  component: ChallengesPage,
});

type Challenge = {
  id: string;
  title: string;
  desc: string;
  board: Board;
  toMove: Cell;
  goalMoves: number; // win within N moves
  reward: number;
};

function makeBoard(cells: [number, number, Cell][]): Board {
  const b = emptyBoard();
  for (const [r, c, v] of cells) b[r][c] = v;
  return b;
}

const CHALLENGES: Challenge[] = [
  {
    id: "c1",
    title: "Win in 2",
    desc: "Play as Red. Find the winning move sequence.",
    board: makeBoard([
      [5, 2, 1],
      [5, 3, 1],
      [5, 4, 1],
      [5, 0, 2],
      [4, 2, 2],
      [4, 3, 2],
    ]),
    toMove: 1,
    goalMoves: 2,
    reward: 50,
  },
  {
    id: "c2",
    title: "Block then win",
    desc: "Stop AI's threat and win.",
    board: makeBoard([
      [5, 3, 1],
      [5, 4, 1],
      [4, 3, 2],
      [4, 4, 2],
      [5, 5, 2],
      [5, 2, 1],
    ]),
    toMove: 1,
    goalMoves: 3,
    reward: 60,
  },
  {
    id: "c3",
    title: "Center power",
    desc: "Build a double threat starting from an empty board (hard AI).",
    board: emptyBoard(),
    toMove: 1,
    goalMoves: 8,
    reward: 80,
  },
];

function ChallengesPage() {
  const { t } = useI18n();
  const profile = useProfile();
  const [activeId, setActiveId] = React.useState<string>(CHALLENGES[0].id);
  const active = CHALLENGES.find((c) => c.id === activeId)!;
  const [board, setBoard] = React.useState<Board>(cloneBoard(active.board));
  const [turn, setTurn] = React.useState<Cell>(active.toMove);
  const [moves, setMoves] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const claimedRef = React.useRef(false);

  React.useEffect(() => {
    setBoard(cloneBoard(active.board));
    setTurn(active.toMove);
    setMoves(0);
    setDone(false);
    claimedRef.current = false;
  }, [activeId]);

  const reset = () => {
    setBoard(cloneBoard(active.board));
    setTurn(active.toMove);
    setMoves(0);
    setDone(false);
    claimedRef.current = false;
  };

  const handle = (col: number) => {
    if (done || turn !== 1) return;
    const next = cloneBoard(board);
    if (!drop(next, col, 1)) return;
    setBoard(next);
    setMoves((m) => m + 1);
    const w = checkWin(next);
    if (w?.player === 1) {
      finishWin();
      return;
    }
    setTurn(2);
  };

  React.useEffect(() => {
    if (done || turn !== 2) return;
    const id = setTimeout(() => {
      const next = cloneBoard(board);
      const c = aiMove(next, "hard", 2);
      if (c < 0) return;
      drop(next, c, 2);
      setBoard(next);
      const w = checkWin(next);
      if (w?.player === 2) {
        setDone(true);
        toast.error("Challenge failed — try again");
        return;
      }
      setTurn(1);
    }, 500);
    return () => clearTimeout(id);
  }, [turn, done, board]);

  function finishWin() {
    setDone(true);
    if (claimedRef.current) return;
    claimedRef.current = true;
    if (moves + 1 <= active.goalMoves) {
      profileActions.addCoins(active.reward);
      toast.success(`${t("reward")} +${active.reward} ${t("coins")}`);
    } else {
      toast.success("Solved — but not within optimal moves.");
    }
  }

  return (
    <AppShell>
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-white">
          <Calendar className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t("challengeOfTheDay")}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-2">
          {CHALLENGES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full rounded-2xl border border-white/10 p-3 text-left transition ${
                activeId === c.id ? "bg-foreground/10" : "bg-white/5 hover:bg-foreground/5"
              }`}
            >
              <div className="font-semibold">{c.title}</div>
              <div className="text-xs text-muted-foreground">{c.desc}</div>
              <div className="mt-1 text-xs text-amber-400">
                {t("reward")}: ● {c.reward}
              </div>
            </button>
          ))}
          <div className="px-1 pt-2 text-xs text-muted-foreground">
            Your coins: ● {profile.coins}
          </div>
        </div>
        <GlassCard>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="font-semibold">{active.title}</div>
              <div className="text-xs text-muted-foreground">{active.desc}</div>
            </div>
            <Button variant="outline" onClick={reset} className="rounded-xl">
              Reset
            </Button>
          </div>
          <Board4
            board={board}
            onColumn={handle}
            disabled={done || turn !== 1}
            skin={profile.selectedSkin}
          />
          <div className="mt-3 text-center text-xs text-muted-foreground">
            {t("moves")}: {moves} / Goal: ≤{active.goalMoves}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
