import * as React from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";

type Props = {
  result: "win" | "loss" | "draw";
  onPlayAgain: () => void;
};

export function EndOverlay({ result, onPlayAgain }: Props) {
  const { t } = useI18n();
  const title = result === "win" ? t("youWin") : result === "loss" ? t("youLose") : t("draw");
  const color =
    result === "win"
      ? "from-emerald-400 to-cyan-500"
      : result === "loss"
        ? "from-rose-500 to-fuchsia-600"
        : "from-amber-400 to-orange-500";

  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center">
      <div className="pointer-events-auto w-[92%] max-w-sm rounded-2xl border border-white/15 bg-background/80 p-4 text-center shadow-2xl backdrop-blur-xl">
        <div
          className={`bg-gradient-to-r ${color} bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl`}
        >
          {title}
        </div>
        <div className="mt-3 flex justify-center gap-2">
          <Button onClick={onPlayAgain} className="rounded-xl">
            {t("playAgain")}
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/">{t("mainMenu")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
