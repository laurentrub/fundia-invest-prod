import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

const Newsletter = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast({
        title: t('newsletter.invalidEmail'),
        description: t('newsletter.invalidEmailDesc'),
        variant: "destructive",
      });
      return;
    }

    if (!consent) {
      toast({
        title: t('newsletter.consentRequired'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, consent_given: consent });

    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        toast({
          title: t('newsletter.alreadySubscribed'),
        });
        setEmail("");
        setConsent(false);
        return;
      }
      toast({
        title: t('newsletter.errorTitle'),
        description: t('newsletter.errorDesc'),
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t('newsletter.successTitle'),
      description: t('newsletter.successDesc'),
    });
    setEmail("");
    setConsent(false);
  };

  return (
    <section className="py-16 bg-gradient-accent">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-background/10 rounded-full">
              <Mail className="h-8 w-8 text-accent-foreground" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-accent-foreground mb-4">
            {t('newsletter.title')}
          </h2>
          <p className="text-lg text-accent-foreground/90 mb-8">
            {t('newsletter.description')}
          </p>

          <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder={t('newsletter.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-background/90 border-0 h-12 text-base"
                disabled={loading}
              />
              <Button
                type="submit"
                size="lg"
                className="bg-background text-accent hover:bg-background/90 h-12 px-8"
                disabled={loading}
              >
                {loading ? t('newsletter.subscribing') : t('newsletter.subscribe')}
              </Button>
            </div>

            <div className="flex items-start justify-center gap-2 text-left">
              <Checkbox
                id="newsletter-consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked === true)}
                className="mt-1 border-accent-foreground/40"
              />
              <Label htmlFor="newsletter-consent" className="text-sm font-normal leading-snug text-accent-foreground/90">
                {t('newsletter.consentLabel')}{" "}
                <Link to="/privacy" className="underline hover:text-accent-foreground">
                  {t('newsletter.consentLink')}
                </Link>
              </Label>
            </div>
          </form>

          <p className="text-sm text-accent-foreground/80 mt-4">
            {t('newsletter.noSpam')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
