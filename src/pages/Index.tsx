import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CreditSimulator from "@/components/credit/CreditSimulator";
import Newsletter from "@/components/Newsletter";
import Testimonials from "@/components/Testimonials";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Shield, Clock, TrendingUp, Users, Award, ArrowRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-finance.jpg";
import teamMeeting from "@/assets/team-meeting.jpg";
import happyClients from "@/assets/happy-clients.jpg";
import advisorWoman from "@/assets/advisor-woman.jpg";
import advisorMan from "@/assets/advisor-man.jpg";
import teamGroup from "@/assets/team-group.jpg";
import carLoanSuccess from "@/assets/car-loan-success.jpg";

const Index = () => {
  const { t } = useTranslation();
  const [hasPendingApplication, setHasPendingApplication] = useState(false);
  const [showResumeBar, setShowResumeBar] = useState(true);
  
  useEffect(() => {
    const savedData = localStorage.getItem('pendingLoanApplication');
    if (savedData) {
      try {
        JSON.parse(savedData);
        setHasPendingApplication(true);
      } catch {
        setHasPendingApplication(false);
      }
    }
  }, []);
  
  const handleDismissResumeBar = () => {
    setShowResumeBar(false);
  };
  
  const handleClearApplication = () => {
    localStorage.removeItem('pendingLoanApplication');
    setHasPendingApplication(false);
    setShowResumeBar(false);
  };
  const features = [
    {
      icon: Clock,
      title: t('home.indexFeatures.fastApproval'),
      description: t('home.indexFeatures.fastApprovalDesc'),
    },
    {
      icon: Shield,
      title: t('home.indexFeatures.secure'),
      description: t('home.indexFeatures.secureDesc'),
    },
    {
      icon: TrendingUp,
      title: t('home.indexFeatures.bestRates'),
      description: t('home.indexFeatures.bestRatesDesc'),
    },
    {
      icon: Users,
      title: t('home.indexFeatures.expertSupport'),
      description: t('home.indexFeatures.expertSupportDesc'),
    },
  ];

  const loanProducts = [
    {
      title: t('home.loanProducts.personal'),
      description: t('home.loanProducts.personalDesc'),
      rate: t('home.loanProducts.personalRate'),
      href: "/personal-loan",
    },
    {
      title: t('home.loanProducts.auto'),
      description: t('home.loanProducts.autoDesc'),
      rate: t('home.loanProducts.autoRate'),
      href: "/auto-loan",
    },
    {
      title: t('home.loanProducts.home'),
      description: t('home.loanProducts.homeDesc'),
      rate: t('home.loanProducts.homeRate'),
      href: "/home-improvement",
    },
    {
      title: t('home.loanProducts.consolidation'),
      description: t('home.loanProducts.consolidationDesc'),
      rate: t('home.loanProducts.consolidationRate'),
      href: "/consolidation",
    },
  ];

  const faqs = [
    { question: t('home.faqs.q1'), answer: t('home.faqs.a1') },
    { question: t('home.faqs.q2'), answer: t('home.faqs.a2') },
    { question: t('home.faqs.q3'), answer: t('home.faqs.a3') },
    { question: t('home.faqs.q4'), answer: t('home.faqs.a4') },
    { question: t('home.faqs.q5'), answer: t('home.faqs.a5') },
    { question: t('home.faqs.q6'), answer: t('home.faqs.a6') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Resume Application Banner */}
      {hasPendingApplication && showResumeBar && (
        <div className="bg-accent text-accent-foreground py-3 px-4">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-accent-foreground rounded-full animate-pulse" />
              <span className="text-sm md:text-base font-medium">
                {t('home.resumeApplication.message')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/apply">
                <Button variant="secondary" size="sm" className="gap-2">
                  {t('home.resumeApplication.button')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDismissResumeBar}
                className="text-accent-foreground hover:bg-accent-foreground/10 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Hero Section with Simulator */}
      <section className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {t('home.hero.title')}
              </h1>
              <h2 className="text-xl md:text-2xl font-semibold text-primary-foreground/95">
                {t('home.hero.subtitle')}
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/90">
                {t('home.hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link to="/apply">
                  <Button variant="accent" size="xl" className="w-full sm:w-auto">
                    {t('home.hero.applyButton')}
                  </Button>
                </Link>
                <Link to="/project-financing">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    {t('home.hero.projectButton')}
                  </Button>
                </Link>
              </div>
            </div>

            <div>
              <CreditSimulator />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">{t('home.trustIndicators.clients')}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">€500M+</div>
              <div className="text-sm text-muted-foreground">{t('home.trustIndicators.loansGranted')}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">95%</div>
              <div className="text-sm text-muted-foreground">{t('home.trustIndicators.satisfactionRate')}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">5 min</div>
              <div className="text-sm text-muted-foreground">{t('home.trustIndicators.approvalTime')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('home.featuresSection.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.featuresSection.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Products */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('home.productsSection.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.productsSection.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {loanProducts.map((product, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all hover:-translate-y-1">
                <h3 className="text-2xl font-bold text-foreground mb-3">{product.title}</h3>
                <p className="text-muted-foreground mb-4">{product.description}</p>
                <div className="text-accent font-semibold mb-6">{product.rate}</div>
                <Link to={product.href}>
                  <Button variant="outline" className="w-full">
                    {t('home.productsSection.learnMore')}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={teamMeeting} 
                alt={t('home.howItWorks.title')}
                className="rounded-2xl shadow-2xl w-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {t('home.howItWorks.title')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t('home.howItWorks.subtitle')}
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{t('home.howItWorks.step1.title')}</h3>
                    <p className="text-muted-foreground">{t('home.howItWorks.step1.description')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{t('home.howItWorks.step2.title')}</h3>
                    <p className="text-muted-foreground">{t('home.howItWorks.step2.description')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{t('home.howItWorks.step3.title')}</h3>
                    <p className="text-muted-foreground">{t('home.howItWorks.step3.description')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-xl">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{t('home.howItWorks.step4.title')}</h3>
                    <p className="text-muted-foreground">{t('home.howItWorks.step4.description')}</p>
                  </div>
                </div>
              </div>
              <Link to="/apply" className="inline-block mt-8">
                <Button size="lg" variant="accent">
                  {t('home.howItWorks.startNow')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {t('home.mission.title')}
            </h2>
            <p className="text-2xl md:text-3xl font-semibold text-foreground max-w-4xl mx-auto leading-relaxed">
              {t('home.mission.statement')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 text-center hover:shadow-xl transition-shadow border-2">
              <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{t('home.mission.accessibility.title')}</h3>
              <p className="text-muted-foreground text-lg">
                {t('home.mission.accessibility.description')}
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-shadow border-2">
              <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{t('home.mission.trust.title')}</h3>
              <p className="text-muted-foreground text-lg">
                {t('home.mission.trust.description')}
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-shadow border-2">
              <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{t('home.mission.innovation.title')}</h3>
              <p className="text-muted-foreground text-lg">
                {t('home.mission.innovation.description')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('home.successStories.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.successStories.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src={carLoanSuccess} 
                alt={t('home.successStories.story1.imageAlt')}
                className="w-full h-72 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-3">{t('home.successStories.story1.title')}</h3>
                <p className="text-muted-foreground mb-4">
                  "{t('home.successStories.story1.quote')}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold">
                    ML
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t('home.successStories.story1.name')}</p>
                    <p className="text-sm text-muted-foreground">{t('home.successStories.story1.location')}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src={happyClients} 
                alt={t('home.successStories.story2.imageAlt')}
                className="w-full h-72 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-3">{t('home.successStories.story2.title')}</h3>
                <p className="text-muted-foreground mb-4">
                  "{t('home.successStories.story2.quote')}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold">
                    AK
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t('home.successStories.story2.name')}</p>
                    <p className="text-sm text-muted-foreground">{t('home.successStories.story2.location')}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* About Section - Rich Content for SEO */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            {t('home.seoSection.title')}
          </h2>
          
          <div className="prose prose-lg max-w-none space-y-6 text-foreground">
            <p className="text-lg leading-relaxed">
              <strong>Fundia Invest</strong> {t('home.seoSection.intro')}
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4">{t('home.seoSection.missionTitle')}</h3>
            <p className="leading-relaxed">
              {t('home.seoSection.missionText')}
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4">{t('home.seoSection.differenceTitle')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                <span><strong>{t('home.seoSection.speed.title')}</strong> {t('home.seoSection.speed.text')}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                <span><strong>{t('home.seoSection.transparency.title')}</strong> {t('home.seoSection.transparency.text')}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                <span><strong>{t('home.seoSection.security.title')}</strong> {t('home.seoSection.security.text')}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                <span><strong>{t('home.seoSection.flexibility.title')}</strong> {t('home.seoSection.flexibility.text')}</span>
              </li>
            </ul>

            <h3 className="text-2xl font-bold mt-8 mb-4">{t('home.seoSection.loanTypesTitle')}</h3>
            <p className="leading-relaxed">
              {t('home.seoSection.loanTypesIntro')}
            </p>

            <div className="bg-muted/50 p-6 rounded-lg my-6">
              <h4 className="text-xl font-semibold mb-3">{t('home.seoSection.personalLoan.title')}</h4>
              <p className="mb-2">{t('home.seoSection.personalLoan.text')}</p>
              <p className="text-sm text-muted-foreground">{t('home.seoSection.personalLoan.example')}</p>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg my-6">
              <h4 className="text-xl font-semibold mb-3">{t('home.seoSection.autoLoan.title')}</h4>
              <p className="mb-2">{t('home.seoSection.autoLoan.text')}</p>
              <p className="text-sm text-muted-foreground">{t('home.seoSection.autoLoan.example')}</p>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg my-6">
              <h4 className="text-xl font-semibold mb-3">{t('home.seoSection.homeLoan.title')}</h4>
              <p className="mb-2">{t('home.seoSection.homeLoan.text')}</p>
              <p className="text-sm text-muted-foreground">{t('home.seoSection.homeLoan.example')}</p>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg my-6">
              <h4 className="text-xl font-semibold mb-3">{t('home.seoSection.consolidation.title')}</h4>
              <p className="mb-2">{t('home.seoSection.consolidation.text')}</p>
              <p className="text-sm text-muted-foreground">{t('home.seoSection.consolidation.example')}</p>
            </div>

            <h3 className="text-2xl font-bold mt-8 mb-4">{t('home.seoSection.processTitle')}</h3>
            <ol className="space-y-4 list-decimal list-inside">
              <li className="leading-relaxed"><strong>{t('home.seoSection.process.step1.title')}</strong> {t('home.seoSection.process.step1.text')}</li>
              <li className="leading-relaxed"><strong>{t('home.seoSection.process.step2.title')}</strong> {t('home.seoSection.process.step2.text')}</li>
              <li className="leading-relaxed"><strong>{t('home.seoSection.process.step3.title')}</strong> {t('home.seoSection.process.step3.text')}</li>
              <li className="leading-relaxed"><strong>{t('home.seoSection.process.step4.title')}</strong> {t('home.seoSection.process.step4.text')}</li>
              <li className="leading-relaxed"><strong>{t('home.seoSection.process.step5.title')}</strong> {t('home.seoSection.process.step5.text')}</li>
            </ol>

            <h3 className="text-2xl font-bold mt-8 mb-4">{t('home.seoSection.responsibleTitle')}</h3>
            <p className="leading-relaxed">
              {t('home.seoSection.responsibleText')}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            {t('home.faqSection.title')}
          </h2>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">{faq.question}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/resources/faq">
              <Button variant="outline" size="lg">
                {t('home.faqSection.viewAll')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-12 border-y border-border">
        <div className="container mx-auto px-4">
          <h3 className="text-center text-sm font-semibold text-muted-foreground mb-8 uppercase tracking-wider">
            {t('home.partners.title')}
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            <Award className="h-12 w-12" />
            <Shield className="h-12 w-12" />
            <TrendingUp className="h-12 w-12" />
            <Users className="h-12 w-12" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            {t('home.cta.description')}
          </p>
          <Link to="/apply">
            <Button variant="accent" size="xl">
              {t('home.cta.button')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Index;
