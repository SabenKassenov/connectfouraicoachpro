import { createFileRoute } from "@tanstack/react-router";
import { AppShell, GlassCard } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { useProfile, profileActions, type Skin } from "@/lib/store";
import { SKINS } from "@/lib/skins";
import { Button } from "@/components/ui/button";
import { Check, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/shop")({
  component: ShopPage,
});

function ShopPage() {
  const { t } = useI18n();
  const p = useProfile();

  const onBuy = (id: Skin, price: number) => {
    if (!p.ownedSkins.includes(id) && p.coins < price) {
      toast.error(t("notEnoughCoins"));
      return;
    }
    profileActions.buySkin(id, price);
    toast.success("Skin updated");
  };

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("shop")}</h1>
        <div className="rounded-full bg-foreground/10 px-3 py-1 text-sm">
          ● {p.coins} {t("coins")}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKINS.map((s) => {
          const owned = p.ownedSkins.includes(s.id);
          const selected = p.selectedSkin === s.id;
          return (
            <GlassCard key={s.id} className="flex flex-col">
              <div
                className={`mb-3 grid h-32 grid-cols-3 gap-2 rounded-xl p-3 ${s.frameClass}`}
              >
                <div className={`grid place-items-center rounded-full ${s.boardClass}`}>
                  <div className={`h-7 w-7 rounded-full ${s.player}`} />
                </div>
                <div className={`grid place-items-center rounded-full ${s.boardClass}`}>
                  <div className={`h-7 w-7 rounded-full ${s.ai}`} />
                </div>
                <div className={`grid place-items-center rounded-full ${s.boardClass}`}>
                  <div className={`h-7 w-7 rounded-full ${s.player}`} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-muted-foreground">
                  {s.price === 0 ? "Free" : `● ${s.price}`}
                </div>
              </div>
              <Button
                onClick={() => onBuy(s.id, s.price)}
                className="mt-3 rounded-xl"
                variant={selected ? "secondary" : "default"}
              >
                {selected ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> {t("selectSkin")}
                  </>
                ) : owned ? (
                  t("selectSkin")
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" /> {t("buyFor")} {s.price}
                  </>
                )}
              </Button>
            </GlassCard>
          );
        })}
      </div>
    </AppShell>
  );
}
