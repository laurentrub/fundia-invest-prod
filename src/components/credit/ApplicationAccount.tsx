import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { ApplicationAccount } from "@/hooks/useApplicationAccount";

interface ApplicationAccountProps {
  account: Pick<
    ApplicationAccount,
    | "mode"
    | "setMode"
    | "email"
    | "setEmail"
    | "password"
    | "setPassword"
    | "termsAccepted"
    | "setTermsAccepted"
    | "resendConfirmation"
    | "backToLogin"
  >;
}

export const AwaitingEmailConfirmation = ({ account }: ApplicationAccountProps) => {
  const { t } = useTranslation();

  return (
    <Card className="p-8 text-center space-y-4">
      <Mail className="h-12 w-12 text-accent mx-auto" />
      <h2 className="text-2xl font-bold text-foreground">{t('apply.account.awaitingTitle')}</h2>
      <p className="text-muted-foreground">
        {t('apply.account.awaitingDesc', { email: account.email })}
      </p>
      <p className="text-sm text-muted-foreground">{t('apply.account.awaitingHint')}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Button type="button" variant="outline" onClick={account.resendConfirmation}>
          {t('auth.resendEmail')}
        </Button>
        <Button type="button" onClick={account.backToLogin}>
          {t('apply.account.alreadyConfirmed')}
        </Button>
      </div>
    </Card>
  );
};

export const ApplicationAccountFields = ({ account }: ApplicationAccountProps) => {
  const { t } = useTranslation();
  const isSignup = account.mode === "signup";

  return (
    <div className="border rounded-lg p-6 mt-4 space-y-4">
      <div>
        <h3 className="font-semibold text-foreground">
          {t(isSignup ? 'apply.account.signupTitle' : 'apply.account.loginTitle')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t(isSignup ? 'apply.account.signupDesc' : 'apply.account.loginDesc')}
        </p>
      </div>

      <div>
        <Label htmlFor="account-email">{t('auth.email')} *</Label>
        <Input
          id="account-email"
          type="email"
          autoComplete="email"
          required
          value={account.email}
          onChange={(e) => account.setEmail(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="account-password">{t('auth.password')} *</Label>
        <Input
          id="account-password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          minLength={6}
          value={account.password}
          onChange={(e) => account.setPassword(e.target.value)}
        />
      </div>

      {isSignup && (
        <div className="flex items-start gap-2">
          <Checkbox
            id="account-terms"
            checked={account.termsAccepted}
            onCheckedChange={(checked) => account.setTermsAccepted(checked === true)}
            className="mt-1"
          />
          <Label htmlFor="account-terms" className="text-sm font-normal leading-snug text-muted-foreground">
            {t('auth.consentPrefix')}{" "}
            <Link to="/terms" className="text-primary hover:underline">
              {t('auth.consentTermsLink')}
            </Link>{" "}
            {t('auth.consentAnd')}{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              {t('auth.consentPrivacyLink')}
            </Link>
            . *
          </Label>
        </div>
      )}

      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={() => account.setMode(isSignup ? "login" : "signup")}
        >
          {t(isSignup ? 'apply.account.switchToLogin' : 'apply.account.switchToSignup')}
        </button>
        {!isSignup && (
          <Link to="/auth" className="text-primary hover:underline">
            {t('auth.forgotPassword')}
          </Link>
        )}
      </div>
    </div>
  );
};
