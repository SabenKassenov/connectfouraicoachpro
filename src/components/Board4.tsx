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
};

export function Board4({
  board,
  onColumn,
  disabled,
  win,
  hintCol,
  lastMove,
  skin = "classic",
}: Props) {
  const [hover, setHover] = React.useState<number | null>(null);
  const skinDef = getSkin(skin);

  const winSet = React.useMemo(() => {
    const s = new Set<string>();
    if (win) for (const [r, c] of win.cells) s.add(`${r}:${c}`);
    return s;
  }, [win]);

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
          const isLast = lastMove && lastMove.row === r && lastMove.col === c;
          const isHintCol = hintCol === c && r === 0;
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
                  className={`block h-[86%] w-[86%] rounded-full ${
                    cell === 1 ? skinDef.player : skinDef.ai
                  } ${isLast ? "animate-[chipDrop_400ms_ease-out]" : ""}`}
                  style={
                    isWin
                      ? {
                          boxShadow: `0 0 0 3px ${skinDef.glow}, 0 0 24px ${skinDef.glow}`,
                          animation: "winPulse 1.4s ease-in-out infinite",
                        }
                      : undefined
                  }
                />
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
