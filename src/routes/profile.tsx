import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { useProfile, profileActions } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { AuthDialog } from "@/components/AuthDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Crown, Sparkles, LogOut, LogIn } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useI18n();
  const p = useProfile();
  const totalGames = p.wins + p.losses + p.draws;
  const winRate = totalGames ? Math.round((p.wins / totalGames) * 100) : 0;
  const level = Math.floor(p.xp / 100) + 1;
  const xpInLevel = p.xp % 100;
  const initials = p.nickname.slice(0, 2).toUpperCase();

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-xl font-bold text-white">
              {initials}
            </div>
            <div>
              <div className="text-lg font-bold">{p.nickname}</div>
              <div className="text-xs text-muted-foreground">
                {p.city}, {p.country}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Badge className="rounded-full">
                  {t("level")} {level}
                </Badge>
                <Badge variant="secondary" className="rounded-full">
                  ● {p.coins} {t("coins")}
                </Badge>
                {p.isPro && (
                  <Badge className="rounded-full bg-amber-500 text-black">
                    <Crown className="mr-1 h-3 w-3" /> PRO
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>XP</span>
              <span>{xpInLevel}/100</span>
            </div>
            <Progress value={xpInLevel} className="h-2" />
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <Label className="text-xs">{t("guestNickname")}</Label>
              <Input
                defaultValue={p.nickname}
                onBlur={(e) => profileActions.setNickname(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">{t("country")}</Label>
                <Input
                  defaultValue={p.country}
                  onBlur={(e) => profileActions.setCountry(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs">{t("city")}</Label>
                <Input
                  defaultValue={p.city}
                  onBlur={(e) => profileActions.setCity(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          <ProDialog isPro={p.isPro} />
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <div className="text-sm font-semibold">Statistics</div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label={t("wins")} value={p.wins} />
            <Stat label={t("losses")} value={p.losses} />
            <Stat label={t("draws")} value={p.draws} />
            <Stat label={t("winRate")} value={`${winRate}%`} />
            <Stat label="Streak" value={p.currentStreak} />
            <Stat label="Best" value={p.bestStreak} />
            <Stat label="Games" value={totalGames} />
            <Stat label="XP" value={p.xp} />
          </div>

          <div className="mt-6 text-sm font-semibold">Badges</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {p.badges.length === 0 && (
              <div className="text-sm text-muted-foreground">Play games to unlock badges.</div>
            )}
            {p.badges.map((b) => (
              <Badge key={b} variant="outline" className="rounded-full">
                <Sparkles className="mr-1 h-3 w-3 text-amber-400" />
                {labelForBadge(b)}
              </Badge>
            ))}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}

function labelForBadge(b: string) {
  switch (b) {
    case "first_win":
      return "First Win";
    case "streak_3":
      return "Streak x3";
    case "hard_win":
      return "Hard Conqueror";
    default:
      return b;
  }
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-foreground/5 p-3">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function ProDialog({ isPro }: { isPro: boolean }) {
  const { t } = useI18n();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:from-amber-500 hover:to-amber-700">
          <Crown className="mr-2 h-4 w-4" /> {t("upgradePro")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t("proTitle")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{t("proDesc")}</p>
        <ul className="mt-2 space-y-2 text-sm">
          <li>• Advanced AI Coach</li>
          <li>• Hard AI & Ranked Mode</li>
          <li>• Exclusive Skins</li>
          <li>• Unlimited History</li>
        </ul>
        <div className="mt-4 rounded-xl border border-white/10 bg-foreground/5 p-4">
          <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            Payment (mockup)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Card number" className="col-span-2 rounded-xl" />
            <Input placeholder="MM/YY" className="rounded-xl" />
            <Input placeholder="CVC" className="rounded-xl" />
          </div>
          <Button
            className="mt-3 w-full rounded-xl"
            onClick={() => {
              profileActions.setPro(true);
            }}
            disabled={isPro}
          >
            {isPro ? "Already Pro" : "Pay $4.99/mo (mockup)"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
