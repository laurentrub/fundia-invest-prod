import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Network,
  BadgeCheck,
  Shield,
  Lock,
  Users,
  TrendingUp,
  Zap,
  Star,
  CheckCircle,
  ArrowRight,
  MapPin,
  Euro,
  Clock,
} from "lucide-react";

const PREVIEW_FUNDERS = [
  {
    id: 1,
    initials: "ML",
    type: "Prêteur Privé",
    specialties: ["Immobilier", "Personnel"],
    region: "Île-de-France",
    ticketMin: 5000,
    ticketMax: 150000,
    badge: "verified",
    responseRate: 92,
    blurred: false,
  },
  {
    id: 2,
    initials: "AB",
    type: "Business Angel",
    specialties: ["Startup", "Professionnel"],
    region: "Auvergne-Rhône-Alpes",
    ticketMin: 20000,
    ticketMax: 500000,
    badge: "topResponder",
    responseRate: 88,
    blurred: false,
  },
  {
    id: 3,
    initials: "CR",
    type: "Fonds Spécialisé",
    specialties: ["Projet écologique", "Professionnel"],
    region: "France entière",
    ticketMin: 10000,
    ticketMax: 300000,
    badge: "active",
    responseRate: 95,
    blurred: false,
  },
  {
    id: 4,
    initials: "??",
    type: "Investisseur",
    specialties: ["Immobilier", "Auto"],
    region: "Sud",
    ticketMin: 8000,
    ticketMax: 200000,
    badge: "verified",
    responseRate: 85,
    blurred: true,
  },
  {
    id: 5,
    initials: "??",
    type: "Prêteur Privé",
    specialties: ["Personnel", "Auto"],
    region: "Bretagne",
    ticketMin: 3000,
    ticketMax: 50000,
    badge: "new",
    responseRate: 90,
    blurred: true,
  },
  {
    id: 6,
    initials: "??",
    type: "Business Angel",
    specialties: ["Startup"],
    region: "France entière",
    ticketMin: 50000,
    ticketMax: 1000000,
    badge: "topResponder",
    responseRate: 97,
    blurred: true,
  },
];

const BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  verified: {
    label: "Vérifié Fundia",
    className: "bg-success/10 text-success border-success/20",
  },
  topResponder: {
    label: "Top Répondeur",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  active: {
    label: "Très actif",
    className: "bg-accent/15 text-accent-foreground border-accent/30",
  },
  new: {
    label: "Nouveau",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export default function NetworkPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, hsl(38 93% 50% / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(221 83% 50% / 0.4) 0%, transparent 50%)",
            }}
          />
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-bold text-accent uppercase tracking-wider">
                <Network className="h-3 w-3" />
                {t("network.landing.badge")}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {t("network.landing.title")}
            </h1>

            <p className="text-xl md:text-2xl text-primary-foreground/85 leading-relaxed max-w-2xl mx-auto">
              {t("network.landing.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link to="/network/checkout">
                <Button variant="accent" size="xl" className="gap-2">
                  <Network className="h-5 w-5" />
                  {t("network.pricing.cta")} — {t("network.pricing.price")}€
                  {t("network.pricing.period")}
                </Button>
              </Link>
              <Button
                variant="hero"
                size="xl"
                className="gap-2"
                onClick={() => {
                  document
                    .getElementById("preview")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t("network.landing.ctaSecondary")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-primary-foreground/60 max-w-xl mx-auto leading-relaxed">
              {t("network.landing.disclaimer")}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-10 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-accent mb-1">240+</div>
              <div className="text-sm text-muted-foreground">
                {t("network.landing.stats.funders")}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">
                {t("network.landing.stats.responseValue")}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("network.landing.stats.responseTime")}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">87%</div>
              <div className="text-sm text-muted-foreground">
                {t("network.landing.stats.successRate")}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">1 200+</div>
              <div className="text-sm text-muted-foreground">
                {t("network.landing.stats.members")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("network.howItWorks.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: t("network.howItWorks.step1.title"),
                desc: t("network.howItWorks.step1.description"),
                icon: Users,
              },
              {
                step: "2",
                title: t("network.howItWorks.step2.title"),
                desc: t("network.howItWorks.step2.description"),
                icon: Network,
              },
              {
                step: "3",
                title: t("network.howItWorks.step3.title"),
                desc: t("network.howItWorks.step3.description"),
                icon: Zap,
              },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className="h-16 w-16 rounded-full bg-gradient-accent flex items-center justify-center mx-auto">
                    <Icon className="h-7 w-7 text-accent-foreground" />
                  </div>
                  <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Network Preview */}
      <section id="preview" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("network.preview.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t("network.preview.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PREVIEW_FUNDERS.map((funder) => (
              <div key={funder.id} className="relative">
                {funder.blurred && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm border border-border">
                    <Lock className="h-6 w-6 text-muted-foreground mb-2" />
                    <p className="text-xs text-center text-muted-foreground px-4 font-medium">
                      {t("network.preview.locked")}
                    </p>
                  </div>
                )}
                <Card className="p-5 hover:shadow-lg transition-shadow h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                        {funder.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-sm">
                          {funder.type}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {funder.region}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${BADGE_CONFIG[funder.badge].className}`}
                    >
                      {BADGE_CONFIG[funder.badge].label}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {funder.specialties.map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                    <div className="flex items-center gap-1">
                      <Euro className="h-3 w-3" />
                      <span>
                        {funder.ticketMin.toLocaleString("fr-FR")} —{" "}
                        {funder.ticketMax.toLocaleString("fr-FR")} €
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{funder.responseRate}% réponse</span>
                    </div>
                  </div>

                  {!funder.blurred && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 text-xs"
                      disabled
                    >
                      <Lock className="h-3 w-3 mr-1.5" />
                      {t("network.preview.contact")} — Accès Premium requis
                    </Button>
                  )}
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground mb-4">
              Et 237 autres financeurs dans le réseau...
            </p>
            <Button
              variant="accent"
              size="lg"
              className="gap-2"
              onClick={() => {
                document
                  .getElementById("pricing")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Network className="h-4 w-4" />
              Déverrouiller l'accès complet
            </Button>
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="p-6 text-center border-2 hover:shadow-lg transition-shadow">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Shield className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-2">
                {t("network.trust.noGuarantee")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("network.trust.noGuaranteeDesc")}
              </p>
            </Card>
            <Card className="p-6 text-center border-2 hover:shadow-lg transition-shadow">
              <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <BadgeCheck className="h-7 w-7 text-success" />
              </div>
              <h3 className="font-bold text-foreground mb-2">
                {t("network.trust.verified")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("network.trust.verifiedDesc")}
              </p>
            </Card>
            <Card className="p-6 text-center border-2 hover:shadow-lg transition-shadow">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">
                {t("network.trust.privacy")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("network.trust.privacyDesc")}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("network.pricing.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t("network.pricing.subtitle")}
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="p-8 border-2 border-accent/30 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-accent" />

              <div className="text-center mb-6">
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="text-5xl font-bold text-foreground">
                    {t("network.pricing.price")}€
                  </span>
                  <span className="text-lg text-muted-foreground mb-1">
                    {t("network.pricing.period")}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("network.pricing.monthly")}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {(t("network.pricing.features", { returnObjects: true }) as string[]).map(
                  (feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  )
                )}
              </ul>

              <Link to="/network/checkout">
                <Button variant="accent" size="lg" className="w-full gap-2 text-base">
                  <Network className="h-4 w-4" />
                  {t("network.pricing.cta")}
                </Button>
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Star className="h-3 w-3 text-accent" />
                {t("network.pricing.guarantee")}
              </div>

              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                {t("network.pricing.secure")}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">
            {t("network.faq.title")}
          </h2>
          <div className="space-y-5">
            {(["q1", "q2", "q3", "q4", "q5"] as const).map((key) => (
              <Card key={key} className="p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  {t(`network.faq.${key}`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`network.faq.a${key.slice(1)}`)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="become-partner" className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Network className="h-12 w-12 text-accent mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("network.landing.title")}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/85">
            {t("network.landing.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button variant="accent" size="xl" className="gap-2">
                <Network className="h-5 w-5" />
                {t("network.pricing.cta")} — {t("network.pricing.price")}€
                {t("network.pricing.period")}
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-primary-foreground/60 max-w-lg mx-auto">
            {t("network.landing.disclaimer")}
          </p>
        </div>
      </section>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
