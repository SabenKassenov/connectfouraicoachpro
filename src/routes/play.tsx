import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard } from "@/components/AppShell";
import { Board4 } from "@/components/Board4";
import { EndOverlay } from "@/components/EndOverlay";
import { AICoachPanel, type CoachReview } from "@/components/AICoachPanel";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useProfile, profileActions } from "@/lib/store";
import {
  aiMove,
  cloneBoard,
  checkWin,
  drop,
  dropRow,
  emptyBoard,
  isDraw,
  suggestMove,
  validMoves,
  type Board,
  type Cell,
  type Difficulty,
  type WinInfo,
} from "@/lib/game";
import { buildCoachReview } from "@/lib/coach";
import { detectWords, emptyLetters, randomLetter, type Letters } from "@/lib/words";
import { Lightbulb, Mic, MicOff, RotateCcw, Type, Volume2, VolumeX } from "lucide-react";
import { useVoiceColumns } from "@/lib/useVoice";
import { playSound, isMuted, setMuted } from "@/lib/sound";
import { toast } from "sonner";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play — Connect Four AI Coach Pro" },
      { name: "description", content: "Play Connect Four versus a smart AI opponent." },
    ],
  }),
  component: PlayPage,
});

type SavedGame = {
  board: Board;
  turn: Cell;
  difficulty: Difficulty;
  moves: { col: number; player: 1 | 2 }[];
};

const SAVE_KEY = "c4_save_v1";

function loadSaved(): SavedGame | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveGame(g: SavedGame | null) {
  if (typeof window === "undefined") return;
  if (!g) {
    localStorage.removeItem(SAVE_KEY);
    return;
  }
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(g));
  } catch {
    /* ignore */
  }
}

function PlayPage() {
  const { t, lang } = useI18n();
  const profile = useProfile();

  const [board, setBoard] = React.useState<Board>(emptyBoard);
  const [turn, setTurn] = React.useState<Cell>(1);
  const [difficulty, setDifficulty] = React.useState<Difficulty>("medium");
  const [mode, setMode] = React.useState<"classic" | "word">("classic");
  const [letters, setLetters] = React.useState<Letters>(emptyLetters);
  const [bonusCells, setBonusCells] = React.useState<[number, number][]>([]);
  const [bonusWords, setBonusWords] = React.useState<string[]>([]);
  const foundWordKeysRef = React.useRef<Set<string>>(new Set());
  const [aiThinking, setAiThinking] = React.useState(false);
  const [win, setWin] = React.useState<WinInfo>(null);
  const [draw, setDraw] = React.useState(false);
  const [lastMove, setLastMove] = React.useState<{ row: number; col: number } | null>(null);
  const [hintCol, setHintCol] = React.useState<number | null>(null);
  const [movesLog, setMovesLog] = React.useState<{ col: number; player: 1 | 2 }[]>([]);
  const [review, setReview] = React.useState<CoachReview | null>(null);
  const [reviewLoading, setReviewLoading] = React.useState(false);
  const [reviewError, setReviewError] = React.useState<string | null>(null);
  const [muted, setMutedState] = React.useState(false);

  const finishedRef = React.useRef(false);

  // Hydrate saved game
  React.useEffect(() => {
    setMutedState(isMuted());
    const saved = loadSaved();
    if (saved) {
      setBoard(saved.board);
      setTurn(saved.turn);
      setDifficulty(saved.difficulty);
      setMovesLog(saved.moves ?? []);
      const w = checkWin(saved.board);
      if (w) setWin(w);
      else if (isDraw(saved.board)) setDraw(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist
  React.useEffect(() => {
    if (win || draw) {
      saveGame(null);
    } else {
      saveGame({ board, turn, difficulty, moves: movesLog });
    }
  }, [board, turn, difficulty, movesLog, win, draw]);

  const ended = Boolean(win) || draw;
  const result: "win" | "loss" | "draw" | null = win
    ? win.player === 1
      ? "win"
      : "loss"
    : draw
      ? "draw"
      : null;

  // Game-over side effects (record + coach review)
  React.useEffect(() => {
    if (!ended || !result || finishedRef.current) return;
    finishedRef.current = true;
    playSound(result === "win" ? "win" : "click");
    const review = buildCoachReview({
      result,
      difficulty,
      moves: movesLog,
      finalBoard: board,
    });
    setReviewLoading(true);
    setReviewError(null);
    // Simulate small async delay to mimic AI gateway latency
    const timer = setTimeout(() => {
      setReview(review);
      setReviewLoading(false);
    }, 600);
    profileActions.addMatch({
      result,
      difficulty,
      movesCount: movesLog.length,
      summary: review.summary,
    });
    if (result === "win") toast.success(t("youWin"), { description: review.summary });
    else if (result === "loss") toast.error(t("youLose"), { description: review.summary });
    else toast(t("draw"), { description: review.summary });
    return () => clearTimeout(timer);
  }, [ended, result, board, difficulty, movesLog, t]);

  const playerMove = React.useCallback(
    (col: number) => {
      if (ended || aiThinking || turn !== 1) return;
      if (!validMoves(board).includes(col)) return;
      const next = cloneBoard(board);
      const placed = drop(next, col, 1);
      if (!placed) return;
      playSound("drop");
      setBoard(next);
      setLastMove(placed);
      setHintCol(null);
      setMovesLog((m) => [...m, { col, player: 1 }]);
      const w = checkWin(next);
      if (w) {
        setWin(w);
        return;
      }
      if (isDraw(next)) {
        setDraw(true);
        return;
      }
      setTurn(2);
    },
    [board, ended, aiThinking, turn],
  );

  // AI turn
  React.useEffect(() => {
    if (ended || turn !== 2) return;
    setAiThinking(true);
    const delay = 500 + Math.random() * 300;
    const id = setTimeout(() => {
      const col = aiMove(board, difficulty, 2);
      if (col < 0) {
        setAiThinking(false);
        return;
      }
      const next = cloneBoard(board);
      const placed = drop(next, col, 2);
      if (!placed) {
        setAiThinking(false);
        return;
      }
      playSound("drop");
      setBoard(next);
      setLastMove(placed);
      setMovesLog((m) => [...m, { col, player: 2 }]);
      const w = checkWin(next);
      if (w) setWin(w);
      else if (isDraw(next)) setDraw(true);
      else setTurn(1);
      setAiThinking(false);
    }, delay);
    return () => clearTimeout(id);
  }, [turn, ended, board, difficulty]);

  const reset = React.useCallback(() => {
    setBoard(emptyBoard());
    setTurn(1);
    setWin(null);
    setDraw(false);
    setLastMove(null);
    setMovesLog([]);
    setHintCol(null);
    setReview(null);
    setReviewError(null);
    setReviewLoading(false);
    finishedRef.current = false;
    saveGame(null);
  }, []);

  const voice = useVoiceColumns(lang, (c) => playerMove(c));

  const onHint = () => {
    if (ended || turn !== 1) return;
    const c = suggestMove(board, 1);
    if (c !== null) {
      setHintCol(c);
      toast(`${t("hint")}: column ${c + 1}`);
      setTimeout(() => setHintCol(null), 2500);
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <GlassCard className="relative overflow-hidden">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("difficulty")}
                </span>
                <Select
                  value={difficulty}
                  onValueChange={(v) => {
                    setDifficulty(v as Difficulty);
                    reset();
                  }}
                >
                  <SelectTrigger className="h-9 w-[130px] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">{t("easy")}</SelectItem>
                    <SelectItem value="medium">{t("medium")}</SelectItem>
                    <SelectItem value="hard">{t("hard")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <TurnIndicator turn={turn} aiThinking={aiThinking} ended={ended} />
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="rounded-xl" onClick={onHint}>
                  <Lightbulb className="mr-1.5 h-4 w-4" /> {t("hint")}
                </Button>
                {voice.supported ? (
                  <Button
                    variant={voice.listening ? "default" : "outline"}
                    size="sm"
                    className="rounded-xl"
                    onClick={() => (voice.listening ? voice.stop() : voice.start())}
                  >
                    {voice.listening ? (
                      <>
                        <Mic className="mr-1.5 h-4 w-4" /> {t("micActive")}
                      </>
                    ) : (
                      <>
                        <MicOff className="mr-1.5 h-4 w-4" /> {t("voice")}
                      </>
                    )}
                  </Button>
                ) : null}
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={toggleMute}>
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={reset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <Board4
                board={board}
                onColumn={playerMove}
                disabled={ended || aiThinking || turn !== 1}
                win={win}
                hintCol={hintCol}
                lastMove={lastMove}
                skin={profile.selectedSkin}
              />
              {ended && result && <EndOverlay result={result} onPlayAgain={reset} />}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {t("moves")}: {movesLog.length}
              </span>
              <span className="hidden sm:inline">
                Tip: click a column to drop your chip
              </span>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <AICoachPanel loading={reviewLoading} review={review} error={reviewError} />
          <GlassCard>
            <div className="text-sm font-semibold">Quick stats</div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
              <Stat label={t("wins")} value={profile.wins} />
              <Stat label={t("losses")} value={profile.losses} />
              <Stat label={t("draws")} value={profile.draws} />
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}

function TurnIndicator({
  turn,
  aiThinking,
  ended,
}: {
  turn: Cell;
  aiThinking: boolean;
  ended: boolean;
}) {
  const { t } = useI18n();
  if (ended) return <div className="rounded-full bg-foreground/10 px-3 py-1 text-xs">—</div>;
  if (aiThinking) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs font-medium text-fuchsia-300">
        <span className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-400" />
        {t("aiTurn")}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-medium text-cyan-300">
      <span className="h-2 w-2 rounded-full bg-cyan-400" />
      {turn === 1 ? t("yourTurn") : "AI"}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-foreground/5 p-2">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

// Avoid unused import warning
void dropRow;
