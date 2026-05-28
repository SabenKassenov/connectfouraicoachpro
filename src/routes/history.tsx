import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { useProfile } from "@/lib/store";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const { t } = useI18n();
  const p = useProfile();

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">{t("history")}</h1>
      <GlassCard>
        {p.history.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">{t("noGames")}</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-foreground/5 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">{t("date")}</th>
                  <th className="px-3 py-2 text-left">{t("result")}</th>
                  <th className="px-3 py-2 text-left">{t("difficulty")}</th>
                  <th className="px-3 py-2 text-right">{t("moves")}</th>
                  <th className="px-3 py-2 text-left">{t("aiCoach")}</th>
                </tr>
              </thead>
              <tbody>
                {p.history.map((m) => (
                  <tr key={m.id} className="border-t border-white/5 align-top">
                    <td className="px-3 py-2 text-muted-foreground">
                      {new Date(m.timestamp).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          m.result === "win"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : m.result === "loss"
                              ? "bg-rose-500/15 text-rose-400"
                              : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {m.result === "win" ? t("win") : m.result === "loss" ? t("loss") : t("draw")}
                      </span>
                    </td>
                    <td className="px-3 py-2 capitalize">{t(m.difficulty as any)}</td>
                    <td className="px-3 py-2 text-right font-mono">{m.movesCount}</td>
                    <td className="px-3 py-2 max-w-md text-muted-foreground">{m.summary ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </AppShell>
  );
}
