import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useProfile, profileActions } from "@/lib/store";
import { Brain, Crown, Gem, History, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";

export function ProDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
}) {
  const { t } = useI18n();
  const profile = useProfile();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const benefits = [
    { icon: Brain, label: t("proFeatCoach") },
    { icon: ShieldCheck, label: t("proFeatHard") },
    { icon: Gem, label: t("proFeatSkins") },
    { icon: History, label: t("proFeatHistory") },
    { icon: Trophy, label: t("proFeatRanked") },
    { icon: Sparkles, label: t("proFeatChallenges") },
  ];

  const activate = () => {
    profileActions.setPro(true);
    toast.success(t("proActivated"));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="overflow-hidden rounded-2xl border-white/10 bg-background/95 p-0 backdrop-blur-xl sm:max-w-md">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="relative p-6">
          <DialogHeader>
            <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <Crown className="h-3.5 w-3.5" /> {t("proTitle")}
            </div>
            <DialogTitle className="text-2xl">{t("proCtaTitle")}</DialogTitle>
            <DialogDescription>{t("proCtaSubtitle")}</DialogDescription>
          </DialogHeader>

          <ul className="mt-5 grid gap-2">
            {benefits.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-white">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-baseline justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm text-muted-foreground">{t("proTitle")}</span>
            <span className="text-xl font-bold">{t("proPrice")}</span>
          </div>

          <DialogFooter className="mt-5 flex-col gap-2 sm:flex-col">
            {profile.isPro ? (
              <Button disabled className="h-11 w-full rounded-xl">
                <Crown className="mr-2 h-4 w-4" /> {t("proActive")}
              </Button>
            ) : (
              <Button
                onClick={activate}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400 text-white shadow-lg hover:opacity-95"
              >
                <Crown className="mr-2 h-4 w-4" /> {t("proActivate")}
              </Button>
            )}
            <p className="text-center text-[11px] text-muted-foreground">{t("proPaymentNote")}</p>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
