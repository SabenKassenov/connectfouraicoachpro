import * as React from "react";
import type { Board, Cell, WinInfo } from "@/lib/game";
import { ROWS, COLS } from "@/lib/game";
import { getSkin } from "@/lib/skins";
import type { Skin } from "@/lib/store";

type Props = {
  board: Board;
  onColumn?: (col: number) => void;
  disabled?: boolean;
  win?: WinInfo;
  hintCol?: number | null;
  lastMove?: { row: number; col: number } | null;
  skin?: Skin;
  letters?: (string | null)[][] | null;
  bonusCells?: [number, number][];
};

export function Board4({
  board,
  onColumn,
  disabled,
  win,
  hintCol,
  lastMove,
  skin = "classic",
  letters = null,
  bonusCells = [],
}: Props) {
  const [hover, setHover] = React.useState<number | null>(null);
  const skinDef = getSkin(skin);

  const winSet = React.useMemo(() => {
    const s = new Set<string>();
    if (win) for (const [r, c] of win.cells) s.add(`${r}:${c}`);
    return s;
  }, [win]);

  const bonusSet = React.useMemo(() => {
    const s = new Set<string>();
    for (const [r, c] of bonusCells) s.add(`${r}:${c}`);
    return s;
  }, [bonusCells]);

  return (
    <div
      className={`relative mx-auto w-full max-w-[560px] select-none rounded-3xl p-3 shadow-2xl ${skinDef.frameClass}`}
    >
      <div
        className={`grid grid-cols-7 gap-1.5 rounded-2xl p-2 sm:gap-2 sm:p-3 ${skinDef.boardClass}`}
        style={{ aspectRatio: `${COLS}/${ROWS}` }}
      >
        {Array.from({ length: ROWS * COLS }).map((_, idx) => {
          const r = Math.floor(idx / COLS);
          const c = idx % COLS;
          const cell = board[r][c] as Cell;
          const isWin = winSet.has(`${r}:${c}`);
          const isBonus = !isWin && bonusSet.has(`${r}:${c}`);
          const isLast = lastMove && lastMove.row === r && lastMove.col === c;
          const isHintCol = hintCol === c && r === 0;
          const letter = letters?.[r]?.[c] ?? null;
          return (
            <button
              key={idx}
              disabled={disabled}
              onMouseEnter={() => setHover(c)}
              onMouseLeave={() => setHover((h) => (h === c ? null : h))}
              onClick={() => !disabled && onColumn?.(c)}
              className={`group relative grid aspect-square place-items-center rounded-full bg-black/30 transition-transform ${
                hover === c && !disabled ? "scale-[1.02]" : ""
              } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
              aria-label={`column-${c + 1}`}
            >
              {cell !== 0 && (
                <span
                  className={`relative grid h-[86%] w-[86%] place-items-center rounded-full ${
                    cell === 1 ? skinDef.player : skinDef.ai
                  } ${isLast ? "animate-[chipDrop_400ms_ease-out]" : ""}`}
                  style={
                    isWin
                      ? {
                          boxShadow: `0 0 0 3px ${skinDef.glow}, 0 0 24px ${skinDef.glow}`,
                          animation: "winPulse 1.4s ease-in-out infinite",
                        }
                      : isBonus
                        ? {
                            boxShadow:
                              "0 0 0 2px rgba(250, 204, 21, 0.85), 0 0 18px rgba(250, 204, 21, 0.6)",
                          }
                        : undefined
                  }
                >
                  {letter && (
                    <span
                      className="select-none text-[clamp(10px,3.4vw,22px)] font-black uppercase tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                      aria-hidden="true"
                    >
                      {letter}
                    </span>
                  )}
                </span>
              )}
              {isHintCol && cell === 0 && (
                <span className="pointer-events-none absolute inset-2 rounded-full border-2 border-dashed border-cyan-300/80 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
      <style>{`
        @keyframes chipDrop {
          0% { transform: translateY(-340%); opacity: 0.6; }
          70% { transform: translateY(8%); }
          100% { transform: translateY(0); }
        }
        @keyframes winPulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.4); }
        }
      `}</style>
    </div>
  );
}
