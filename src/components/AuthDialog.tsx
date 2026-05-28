import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { profileActions } from "@/lib/store";
import { toast } from "sonner";
import { LogIn, Mail, User as UserIcon } from "lucide-react";

type Props = {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function randomGuest() {
  const adj = ["Neo", "Cyber", "Quantum", "Aero", "Pixel", "Nova", "Turbo", "Hyper"];
  const noun = ["Chip", "Falcon", "Tiger", "Bolt", "Knight", "Pilot", "Sage", "Drift"];
  const a = adj[Math.floor(Math.random() * adj.length)];
  const b = noun[Math.floor(Math.random() * noun.length)];
  const n = Math.floor(100 + Math.random() * 900);
  return `${a}${b}${n}`;
}

export function AuthDialog({ trigger, open, onOpenChange }: Props) {
  const { t } = useI18n();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [nickname, setNickname] = React.useState("");
  const [guestNick, setGuestNick] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      toast.error(t("authMissingFields"));
      return;
    }
    setLoading(true);
    const { error } = await signInWithEmail(email, password);
    setLoading(false);
    if (error) toast.error(t("authFailed"), { description: error });
    else {
      toast.success(t("authSignedIn"));
      setOpen(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password) {
      toast.error(t("authMissingFields"));
      return;
    }
    setLoading(true);
    const { error } = await signUpWithEmail(email, password, nickname || undefined);
    setLoading(false);
    if (error) toast.error(t("authFailed"), { description: error });
    else {
      toast.success(t("authAccountCreated"));
      setOpen(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) toast.error(t("authGoogleUnavailable"), { description: error });
  };

  const handleGuest = () => {
    const name = (guestNick || randomGuest()).trim();
    profileActions.setNickname(name);
    toast.success(t("authPlayingAsGuest"), { description: name });
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("authTitle")}</DialogTitle>
          <DialogDescription>{t("authSubtitle")}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="guest" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="guest">
              <UserIcon className="mr-1 h-3.5 w-3.5" />
              {t("playAsGuest")}
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="mr-1 h-3.5 w-3.5" />
              {t("email")}
            </TabsTrigger>
            <TabsTrigger value="signup">{t("signUp")}</TabsTrigger>
          </TabsList>

          <TabsContent value="guest" className="mt-4 space-y-3">
            <div>
              <Label className="text-xs">{t("guestNickname")}</Label>
              <Input
                value={guestNick}
                onChange={(e) => setGuestNick(e.target.value)}
                placeholder={t("guestNicknamePlaceholder")}
                className="rounded-xl"
                maxLength={24}
              />
              <p className="mt-1 text-xs text-muted-foreground">{t("guestNicknameHint")}</p>
            </div>
            <Button onClick={handleGuest} className="w-full rounded-xl">
              <UserIcon className="mr-2 h-4 w-4" />
              {t("playAsGuest")}
            </Button>
          </TabsContent>

          <TabsContent value="email" className="mt-4 space-y-3">
            <Button
              onClick={handleGoogle}
              disabled={loading}
              variant="outline"
              className="w-full rounded-xl"
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              {t("continueWithGoogle")}
            </Button>
            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">{t("or")}</span>
              <Separator className="flex-1" />
            </div>
            <div className="space-y-2">
              <div>
                <Label className="text-xs">{t("email")}</Label>
                <Input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs">{t("password")}</Label>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={handleEmailSignIn}
                disabled={loading}
                className="w-full rounded-xl"
              >
                <LogIn className="mr-2 h-4 w-4" />
                {t("signIn")}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="mt-4 space-y-3">
            <Button
              onClick={handleGoogle}
              disabled={loading}
              variant="outline"
              className="w-full rounded-xl"
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              {t("continueWithGoogle")}
            </Button>
            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">{t("or")}</span>
              <Separator className="flex-1" />
            </div>
            <div>
              <Label className="text-xs">{t("nickname")}</Label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t("guestNicknamePlaceholder")}
                className="rounded-xl"
                maxLength={24}
              />
            </div>
            <div>
              <Label className="text-xs">{t("email")}</Label>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs">{t("password")}</Label>
              <Input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <Button onClick={handleEmailSignUp} disabled={loading} className="w-full rounded-xl">
              {t("createAccount")}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.63-2.54C16.86 3.43 14.66 2.5 12 2.5 6.76 2.5 2.5 6.76 2.5 12s4.26 9.5 9.5 9.5c5.48 0 9.1-3.85 9.1-9.27 0-.62-.07-1.1-.16-1.55H12z"
      />
    </svg>
  );
}
