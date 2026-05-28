import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Moon, Sun, Gamepad2, Trophy, User, Sparkles, Calendar, Puzzle, ShoppingBag, History } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useI18n, type Lang } from "@/lib/i18n";
import { useProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const navItems = [
  { to: "/", labelKey: "home" as const, icon: Sparkles },
  { to: "/play", labelKey: "play" as const, icon: Gamepad2 },
  { to: "/profile", labelKey: "profile" as const, icon: User },
  { to: "/leaderboard", labelKey: "leaderboard" as const, icon: Trophy },
  { to: "/challenges", labelKey: "challenges" as const, icon: Calendar },
  { to: "/puzzle", labelKey: "puzzle" as const, icon: Puzzle },
  { to: "/shop", labelKey: "shop" as const, icon: ShoppingBag },
  { to: "/history", labelKey: "history" as const, icon: History },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useI18n();
  const profile = useProfile();
  const router = useRouterState();
  const path = router.location.pathname;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/20 blur-3xl dark:bg-fuchsia-500/15" />
        <div className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/15" />
        <div className="absolute top-1/3 left-1/2 h-[20rem] w-[20rem] -translate-x-1/2 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-white shadow-lg">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <span className="hidden text-base font-semibold tracking-tight sm:inline">
              C4 Coach <span className="text-cyan-500">Pro</span>
            </span>
          </Link>

          <nav className="ml-2 hidden flex-1 items-center gap-1 lg:flex">
            {navItems.map((n) => {
              const Icon = n.icon;
              const active = path === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-foreground/10 text-foreground"
                      : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t(n.labelKey)}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs sm:flex">
              <span className="text-amber-400">●</span>
              <span className="font-medium">{profile.coins}</span>
              <span className="text-muted-foreground">{t("coins")}</span>
            </div>
            <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
              <SelectTrigger className="h-9 w-[80px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="ru">RU</SelectItem>
                <SelectItem value="kz">KZ</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Toggle theme"
              className="rounded-xl"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-2 lg:hidden">
          {navItems.map((n) => {
            const Icon = n.icon;
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs ${
                  active
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(n.labelKey)}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-10">{children}</main>

      <footer className="mx-auto max-w-7xl px-4 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Connect Four AI Coach Pro
      </footer>
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/60 p-5 shadow-xl backdrop-blur-xl dark:bg-white/5 ${className}`}
    >
      {children}
    </div>
  );
}
