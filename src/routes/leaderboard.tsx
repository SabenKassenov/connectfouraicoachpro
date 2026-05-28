import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { useProfile } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
});

type Row = { nickname: string; country: string; city: string; score: number };

const SEED: Row[] = [
  { nickname: "NeoQuant", country: "Kazakhstan", city: "Almaty", score: 2480 },
  { nickname: "AeroChip", country: "Kazakhstan", city: "Astana", score: 2310 },
  { nickname: "PixelKnight", country: "USA", city: "New York", score: 2275 },
  { nickname: "Voltara", country: "Germany", city: "Berlin", score: 2190 },
  { nickname: "Solanka", country: "Russia", city: "Moscow", score: 2154 },
  { nickname: "OrionByte", country: "Japan", city: "Tokyo", score: 2090 },
  { nickname: "DesertFox", country: "Kazakhstan", city: "Almaty", score: 1980 },
  { nickname: "Lumen", country: "France", city: "Paris", score: 1950 },
  { nickname: "Karaganda77", country: "Kazakhstan", city: "Karaganda", score: 1842 },
  { nickname: "Shym", country: "Kazakhstan", city: "Shymkent", score: 1801 },
  { nickname: "RedShift", country: "USA", city: "San Francisco", score: 1755 },
  { nickname: "Astra", country: "Russia", city: "Saint Petersburg", score: 1690 },
];

function LeaderboardPage() {
  const { t } = useI18n();
  const profile = useProfile();
  const totalGames = profile.wins + profile.losses + profile.draws;
  const myScore = profile.wins * 100 + profile.draws * 25 + profile.bestStreak * 30;
  const me: Row = {
    nickname: profile.nickname,
    country: profile.country,
    city: profile.city,
    score: myScore,
  };
  const all = React.useMemo(() => {
    const rows = totalGames > 0 ? [me, ...SEED] : SEED;
    return [...rows].sort((a, b) => b.score - a.score);
  }, [me.nickname, me.score, totalGames]);

  return (
    <AppShell>
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black">
          <Trophy className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t("leaderboard")}</h1>
      </div>
      <GlassCard>
        <Tabs defaultValue="global">
          <TabsList className="rounded-xl">
            <TabsTrigger value="global" className="rounded-lg">
              {t("globalBoard")}
            </TabsTrigger>
            <TabsTrigger value="country" className="rounded-lg">
              {t("country")}: {profile.country}
            </TabsTrigger>
            <TabsTrigger value="city" className="rounded-lg">
              {t("city")}: {profile.city}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="global">
            <Table
              rows={all}
              me={me.nickname}
              labels={{
                rank: t("rank"),
                player: t("player"),
                country: t("country"),
                score: t("score"),
              }}
            />
          </TabsContent>
          <TabsContent value="country">
            <Table
              rows={all.filter((r) => r.country === profile.country)}
              me={me.nickname}
              labels={{
                rank: t("rank"),
                player: t("player"),
                country: t("country"),
                score: t("score"),
              }}
            />
          </TabsContent>
          <TabsContent value="city">
            <Table
              rows={all.filter((r) => r.city === profile.city)}
              me={me.nickname}
              labels={{
                rank: t("rank"),
                player: t("player"),
                country: t("country"),
                score: t("score"),
              }}
            />
          </TabsContent>
        </Tabs>
      </GlassCard>
    </AppShell>
  );
}

function Table({
  rows,
  me,
  labels,
}: {
  rows: Row[];
  me: string;
  labels: { rank: string; player: string; country: string; score: string };
}) {
  if (rows.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">No players yet here.</div>
    );
  }
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-foreground/5 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left">{labels.rank}</th>
            <th className="px-3 py-2 text-left">{labels.player}</th>
            <th className="px-3 py-2 text-left">{labels.country}</th>
            <th className="px-3 py-2 text-right">{labels.score}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={`${r.nickname}-${i}`}
              className={`border-t border-white/5 ${r.nickname === me ? "bg-cyan-500/10" : ""}`}
            >
              <td className="px-3 py-2 font-semibold">{i + 1}</td>
              <td className="px-3 py-2">{r.nickname}</td>
              <td className="px-3 py-2 text-muted-foreground">
                {r.city}, {r.country}
              </td>
              <td className="px-3 py-2 text-right font-mono">{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
