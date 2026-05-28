import * as React from "react";
import { useI18n } from "@/lib/i18n";
import { GlassCard } from "@/components/AppShell";
import { Sparkles, Loader2 } from "lucide-react";

export type CoachReview = {
  summary: string;
  mistake: string;
  best: string;
  tip: string;
  score: number;
};

type Props = {
  loading: boolean;
  review: CoachReview | null;
  error: string | null;
};

export function AICoachPanel({ loading, review, error }: Props) {
  const { t } = useI18n();
  return (
    <GlassCard className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">{t("aiCoach")}</div>
          <div className="text-xs text-muted-foreground">Powered by Lovable AI</div>
        </div>
        {review && (
          <div className="ml-auto rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold">
            {review.score}/100
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-xl bg-foreground/5 p-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("analyzing")}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm">
          {t("coachFallback")}
        </div>
      )}

      {!loading && review && (
        <div className="space-y-2 text-sm">
          <CoachLine label="Summary" value={review.summary} />
          <CoachLine label="Key mistake" value={review.mistake} />
          <CoachLine label="Best move" value={review.best} />
          <CoachLine label="Tip" value={review.tip} />
        </div>
      )}

      {!loading && !review && !error && (
        <div className="rounded-xl bg-foreground/5 p-3 text-sm text-muted-foreground">
          Finish a game to get a personal AI review.
        </div>
      )}
    </GlassCard>
  );
}

function CoachLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-foreground/5 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
