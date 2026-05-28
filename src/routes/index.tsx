import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, GlassCard } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { AuthDialog } from "@/components/AuthDialog";
import { Button } from "@/components/ui/button";
import { Brain, Trophy, MessageSquare, Type, Calendar, Sparkles, Gamepad2, LogIn } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Connect Four AI Coach Pro" },
      {
        name: "description",
        content:
          "Play Connect Four against a smart AI and get post-game coaching, leaderboards, daily challenges and more.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useI18n();
  return (
    <AppShell>
      <section className="relative grid items-center gap-10 py-6 lg:grid-cols-2 lg:py-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> AI-powered Connect Four
          </div>
          <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">
              {t("appName")}
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">{t("tagline")}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-2xl px-6 text-base">
              <Link to="/play">
                <Gamepad2 className="mr-2 h-5 w-5" /> {t("startPlaying")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-2xl border-white/20 bg-white/5 px-6 text-base backdrop-blur"
            >
              <Link to="/leaderboard">
                <Trophy className="mr-2 h-5 w-5" /> {t("leaderboard")}
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-cyan-500/30 via-fuchsia-500/30 to-amber-400/20 blur-3xl" />
          <GlassCard className="aspect-square w-full max-w-md mx-auto p-6">
            <MiniBoardArt />
          </GlassCard>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">{t("features")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={Brain} title={t("featAi")} desc="Easy, Medium, and Hard rule-based opponents." />
          <Feature icon={MessageSquare} title={t("featCoach")} desc="Get a personal review after every match." />
          <Feature icon={Trophy} title={t("featLeaderboard")} desc="Global, country and city rankings." />
          <Feature icon={Type} title={t("featWord")} desc="Optional letter chips & word combos." />
          <Feature icon={Calendar} title={t("featDaily")} desc="Solve a fresh tactical puzzle each day." />
          <Feature icon={Sparkles} title={t("upgradePro")} desc={t("proDesc")} />
        </div>
      </section>
    </AppShell>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <GlassCard className="transition-transform hover:-translate-y-0.5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
    </GlassCard>
  );
}

function MiniBoardArt() {
  const cells = Array.from({ length: 42 });
  const sample: Record<number, 1 | 2> = {
    35: 1,
    36: 2,
    37: 1,
    28: 2,
    29: 1,
    22: 2,
    15: 1,
    8: 2,
  };
  return (
    <div className="grid h-full grid-cols-7 gap-1.5 rounded-2xl bg-blue-700 p-3 shadow-inner">
      {cells.map((_, i) => {
        const v = sample[i];
        return (
          <div key={i} className="grid aspect-square place-items-center rounded-full bg-blue-900/80">
            {v && (
              <div
                className={`h-[80%] w-[80%] rounded-full ${
                  v === 1
                    ? "bg-gradient-to-br from-red-400 to-red-600"
                    : "bg-gradient-to-br from-yellow-300 to-yellow-500"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
