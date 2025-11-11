import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    category: "Questions Générales",
    questions: [
      {
        q: "Qu'est-ce que Privat Equity ?",
        a: "Privat Equity est une plateforme de prêt en ligne qui connecte les emprunteurs avec des offres de crédit compétitives. Nous proposons des prêts personnels, des crédits auto, des crédits travaux, du rachat de crédit et des prêts entreprise."
      },
      {
        q: "Comment Privat Equity gagne-t-il de l'argent ?",
        a: "Nous recevons une commission de nos partenaires financiers lorsque nous mettons en relation des emprunteurs avec des prêts. Ce service est gratuit pour les emprunteurs - nous ne facturons jamais de frais de dossier ou de coûts initiaux."
      },
      {
        q: "Privat Equity est-il sûr et légitime ?",
        a: "Oui, Privat Equity est une plateforme de prêt agréée et réglementée. Nous utilisons un cryptage de niveau bancaire, sommes entièrement conformes au RGPD et ne travaillons qu'avec des institutions financières agréées."
      },
    ]
  },
  {
    category: "Processus de Demande",
    questions: [
      {
        q: "Combien de temps prend la demande ?",
        a: "Notre demande en ligne prend environ 5 à 10 minutes à compléter. Vous recevrez une décision préliminaire instantanément, et l'approbation finale prend généralement 24 à 48 heures."
      },
      {
        q: "Quels documents ai-je besoin ?",
        a: "Vous aurez besoin d'une pièce d'identité valide, d'une preuve de revenu (bulletins de salaire ou déclarations fiscales), de relevés bancaires des 3 derniers mois et d'un justificatif de domicile. Des documents supplémentaires peuvent être demandés selon votre demande."
      },
      {
        q: "La vérification de mon taux affectera-t-elle mon score de crédit ?",
        a: "Non ! Vérifier votre taux sur Privat Equity utilise une enquête de crédit douce qui n'affecte pas votre score. Une enquête approfondie ne sera effectuée que lorsque vous accepterez formellement une offre de prêt."
      },
      {
        q: "Puis-je faire une demande si je suis travailleur indépendant ?",
        a: "Oui ! Les travailleurs indépendants sont les bienvenus. Vous devrez fournir des documents supplémentaires tels que des déclarations fiscales, des relevés bancaires professionnels et une preuve d'enregistrement de l'entreprise."
      },
      {
        q: "Que se passe-t-il si ma demande est refusée ?",
        a: "Si votre demande est refusée, nous vous expliquerons pourquoi et pourrons suggérer des alternatives. Les raisons courantes incluent un revenu insuffisant, un ratio d'endettement élevé ou des problèmes de crédit. Vous pouvez faire une nouvelle demande après avoir résolu ces problèmes."
      },
    ]
  },
  {
    category: "Taux et Conditions",
    questions: [
      {
        q: "Quels taux d'intérêt proposez-vous ?",
        a: "Nos taux commencent à partir de 2,9% TAEG pour les emprunteurs qualifiés. Votre taux spécifique dépend de votre profil de crédit, du montant du prêt, de la durée et du type de prêt."
      },
      {
        q: "Comment mon taux d'intérêt est-il déterminé ?",
        a: "Les taux d'intérêt sont basés sur votre score de crédit, vos revenus, votre ratio d'endettement, le montant du prêt et la durée. De meilleurs profils de crédit et financiers reçoivent généralement des taux plus bas."
      },
      {
        q: "Les taux sont-ils fixes ou variables ?",
        a: "Tous nos prêts personnels, crédits auto et crédits travaux ont des taux fixes, ce qui signifie que votre taux et votre mensualité ne changent jamais. Cela offre une prévisibilité tout au long de votre prêt."
      },
      {
        q: "Quels montants de prêt sont disponibles ?",
        a: "Nous proposons des prêts de 1 000 € à 75 000 € selon le type de prêt. Les prêts personnels vont jusqu'à 75 000 €, tandis que les limites spécifiques peuvent varier selon le produit."
      },
      {
        q: "Quelles durées de remboursement sont disponibles ?",
        a: "Les durées de remboursement vont de 12 à 84 mois selon le type et le montant du prêt. Des durées plus longues ont des mensualités plus faibles mais plus d'intérêts au total."
      },
      {
        q: "Y a-t-il des frais ?",
        a: "Nous ne facturons pas de frais de dossier. Certains prêts peuvent avoir des frais d'origination (généralement 1 à 5% du montant du prêt), qui sont clairement divulgués avant d'accepter une offre."
      },
    ]
  },
  {
    category: "Remboursement et Gestion",
    questions: [
      {
        q: "Comment effectuer mes paiements ?",
        a: "Les paiements sont automatiquement prélevés sur votre compte bancaire à la date de paiement prévue chaque mois. Vous pouvez également effectuer des paiements manuels via votre compte en ligne."
      },
      {
        q: "Puis-je changer ma date de paiement ?",
        a: "Oui, contactez notre service client pour demander un changement de date de paiement. Nous travaillerons avec vous pour aligner les paiements sur votre calendrier de revenus."
      },
      {
        q: "Puis-je rembourser mon prêt par anticipation ?",
        a: "Oui ! Tous nos prêts permettent le remboursement anticipé sans pénalités. Vous économiserez sur les intérêts en remboursant votre prêt avant l'échéance."
      },
      {
        q: "Que se passe-t-il si je manque un paiement ?",
        a: "Contactez-nous immédiatement si vous ne pouvez pas effectuer un paiement. Nous pourrons peut-être organiser un plan de paiement ou un report temporaire. Manquer des paiements peut entraîner des frais de retard et endommager votre score de crédit."
      },
      {
        q: "Puis-je augmenter le montant de mon prêt plus tard ?",
        a: "Une fois votre prêt actif, vous ne pouvez pas augmenter le montant. Cependant, après plusieurs paiements à temps, vous pourriez être éligible pour refinancer un montant plus élevé."
      },
    ]
  },
  {
    category: "Crédit et Éligibilité",
    questions: [
      {
        q: "Quel score de crédit ai-je besoin ?",
        a: "Bien que nous préférions des scores supérieurs à 650, nous considérons les demandes de divers profils de crédit. Un score inférieur ne vous disqualifie pas automatiquement - nous évaluons votre situation financière complète."
      },
      {
        q: "Puis-je faire une demande avec un mauvais crédit ?",
        a: "Oui, nous travaillons avec des emprunteurs de tous profils de crédit. Un mauvais crédit peut entraîner des taux plus élevés ou nécessiter un co-emprunteur, mais de nombreuses options restent disponibles."
      },
      {
        q: "Acceptez-vous les demandes avec co-emprunteur ?",
        a: "Oui, ajouter un co-emprunteur avec un bon crédit peut améliorer vos chances d'approbation et potentiellement réduire votre taux d'intérêt."
      },
      {
        q: "Quelle est l'exigence de revenu minimum ?",
        a: "Il n'y a pas de minimum strict, mais vous devez démontrer un revenu suffisant pour couvrir les paiements du prêt. Nous recherchons généralement un ratio d'endettement inférieur à 40%."
      },
    ]
  },
  {
    category: "Sécurité et Confidentialité",
    questions: [
      {
        q: "Comment mes informations personnelles sont-elles protégées ?",
        a: "Nous utilisons un cryptage SSL 256 bits, la même sécurité utilisée par les banques. Vos données ne sont jamais vendues ou partagées sans votre consentement explicite, et nous sommes entièrement conformes au RGPD."
      },
      {
        q: "Qui a accès à mes informations ?",
        a: "Seul le personnel autorisé de Privat Equity et nos partenaires financiers (lorsque vous acceptez une offre) ont accès à vos informations. Nous ne vendons jamais vos données à des tiers."
      },
      {
        q: "Combien de temps conservez-vous mes informations ?",
        a: "Nous conservons vos informations conformément aux exigences légales et à notre politique de confidentialité. Vous pouvez demander la suppression de vos données à tout moment, sous réserve des obligations réglementaires."
      },
    ]
  },
  {
    category: "Situations Particulières",
    questions: [
      {
        q: "Puis-je faire une demande si je suis retraité ?",
        a: "Oui ! Les personnes retraitées avec une pension ou un revenu de retraite peuvent faire une demande. Vous devrez fournir une preuve de votre revenu de retraite."
      },
      {
        q: "Proposez-vous des prêts aux étudiants ?",
        a: "Les étudiants ayant des emplois à temps partiel ou d'autres sources de revenus peuvent faire une demande. Cependant, les exigences de revenu s'appliquent toujours, et un co-emprunteur peut être bénéfique."
      },
      {
        q: "Puis-je utiliser un prêt pour créer une entreprise ?",
        a: "Pour les besoins professionnels, nous recommandons notre produit Prêt Entreprise dédié, spécialement conçu pour les entrepreneurs et les propriétaires d'entreprise."
      },
      {
        q: "Que faire si je traverse un divorce ?",
        a: "Les personnes en cours de divorce peuvent faire une demande, mais vous devrez montrer vos revenus et dettes individuels. Les dettes conjointes sont considérées dans votre calcul de ratio d'endettement."
      },
    ]
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Questions Fréquentes</h1>
          <p className="text-xl max-w-2xl mx-auto text-primary-foreground/90">
            Tout ce que vous devez savoir sur les prêts, les demandes et Privat Equity
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {faqs.map((category, catIndex) => (
            <div key={catIndex} className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">{category.category}</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((faq, qIndex) => (
                  <AccordionItem key={qIndex} value={`${catIndex}-${qIndex}`} className="border border-border rounded-lg px-6">
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:text-accent">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
