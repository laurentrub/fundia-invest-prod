import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CreditSimulator from "@/components/credit/CreditSimulator";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, TrendingDown } from "lucide-react";

const Consolidation = () => {
  const benefits = [
    "Regroupez plusieurs dettes en un seul paiement",
    "Taux d'intérêt global potentiellement inférieur",
    "Simplifiez la gestion financière",
    "Mensualité fixe",
    "Peut améliorer le score de crédit avec le temps",
    "Réduisez le stress et l'anxiété financière",
  ];

  const whenToConsolidate = [
    {
      icon: CheckCircle,
      scenario: "Plusieurs Dettes à Taux Élevé",
      description: "Vous avez plusieurs cartes de crédit ou prêts avec des taux supérieurs à 10-15 % TAEG"
    },
    {
      icon: CheckCircle,
      scenario: "Difficulté à Suivre les Paiements",
      description: "Gérer plusieurs dates d'échéance est accablant et vous avez manqué des paiements"
    },
    {
      icon: CheckCircle,
      scenario: "Bon Score de Crédit",
      description: "Votre score de crédit vous qualifie pour un taux inférieur à votre moyenne actuelle"
    },
    {
      icon: CheckCircle,
      scenario: "Revenus Stables",
      description: "Vous avez des revenus réguliers pour maintenir le paiement regroupé"
    },
  ];

  const risks = [
    "Peut prolonger la période de remboursement, augmentant le total des intérêts payés",
    "La fermeture de cartes de crédit peut temporairement réduire le score de crédit",
    "Ne résout pas les habitudes de dépenses sous-jacentes",
    "Nécessite de la discipline pour éviter d'accumuler de nouvelles dettes",
    "Certains prêts ont des frais de dossier qui s'ajoutent aux coûts",
  ];

  const faqs = [
    {
      q: "Comment fonctionne le regroupement de crédits ?",
      a: "Le regroupement de crédits consiste à contracter un nouveau prêt pour rembourser plusieurs dettes existantes. Au lieu de jongler avec plusieurs paiements avec différents taux et dates d'échéance, vous effectuez un seul paiement mensuel sur le nouveau prêt, idéalement à un taux d'intérêt inférieur à votre taux moyen actuel."
    },
    {
      q: "Le regroupement de crédits nuira-t-il à mon score de crédit ?",
      a: "Initialement, vous pouvez constater une légère baisse due à l'enquête approfondie et à la fermeture de comptes remboursés (ce qui réduit votre crédit disponible). Cependant, si vous effectuez des paiements à temps et n'accumulez pas de nouvelles dettes, le regroupement améliore généralement votre score de crédit avec le temps en réduisant votre taux d'utilisation du crédit et en démontrant un comportement de paiement responsable."
    },
    {
      q: "Quels types de dettes puis-je regrouper ?",
      a: "Vous pouvez regrouper la plupart des dettes non garanties, y compris les soldes de cartes de crédit, les prêts personnels, les factures médicales, les cartes de magasin, les prêts sur salaire et certains prêts étudiants. Vous ne pouvez pas regrouper les dettes garanties comme les hypothèques ou les prêts auto via un prêt de regroupement personnel."
    },
    {
      q: "Le regroupement de crédits est-il identique au règlement de dettes ?",
      a: "Non, ce sont très différents. Le regroupement de crédits rembourse vos dettes en totalité avec un nouveau prêt. Le règlement de dettes implique de négocier avec les créanciers pour payer moins que ce que vous devez, ce qui endommage gravement votre crédit et peut avoir des implications fiscales. Le regroupement est beaucoup moins dommageable pour votre santé financière."
    },
    {
      q: "Combien puis-je économiser avec le regroupement de crédits ?",
      a: "Les économies dépendent de vos taux actuels par rapport au nouveau taux. Si vous regroupez des cartes de crédit à 18-25 % TAEG en un prêt personnel à 6-8 % TAEG, vous pourriez économiser des milliers en intérêts. Utilisez notre calculateur pour voir vos économies potentielles en fonction de votre situation spécifique."
    },
    {
      q: "Quelle est la meilleure option : regroupement ou transfert de solde ?",
      a: "Les transferts de solde (transfert de dette vers une carte à 0 % TAEG) peuvent économiser plus si vous pouvez rembourser le solde pendant la période promotionnelle (généralement 12-18 mois). Cependant, les prêts de regroupement sont meilleurs pour les dettes plus importantes qui nécessitent des périodes de remboursement plus longues, et ils ne nécessitent pas un excellent crédit comme la plupart des cartes de transfert de solde."
    },
    {
      q: "Puis-je regrouper mes dettes si j'ai un mauvais crédit ?",
      a: "Oui, bien que votre taux d'intérêt sera plus élevé. Si votre score de crédit est inférieur à 650, vous ne pourriez pas économiser autant sur les intérêts, mais le regroupement peut quand même simplifier vos finances et vous aider à éviter les paiements manqués. Envisagez un cosignataire pour être admissible à de meilleurs taux."
    },
    {
      q: "Dois-je fermer mes cartes de crédit après les avoir remboursées ?",
      a: "Généralement non, surtout pour vos comptes les plus anciens. Les garder ouverts maintient la longueur de votre historique de crédit et votre taux d'utilisation du crédit. Cependant, si vous avez du mal avec la tentation de dépenser, vous pourriez les garder ouverts mais rangés en sécurité, ou fermer les comptes plus récents tout en gardant les plus anciens."
    },
    {
      q: "Que faire si je ne peux pas me permettre le paiement du prêt regroupé ?",
      a: "Si le nouveau paiement est trop élevé, vous pourriez avoir besoin d'une durée de prêt plus longue pour réduire les coûts mensuels, bien que cela augmente le total des intérêts payés. Alternativement, envisagez des plans de gestion de dettes via des agences de conseil en crédit, ou dans les cas graves, consultez un avocat spécialisé en faillite. N'ignorez jamais le problème - contactez votre prêteur immédiatement si vous rencontrez des difficultés."
    },
    {
      q: "Dans combien de temps verrai-je les résultats du regroupement ?",
      a: "Vous bénéficierez immédiatement de paiements simplifiés. Les améliorations du score de crédit apparaissent généralement dans les 3-6 mois alors que vous établissez un historique de paiement positif. Le soulagement du stress financier est souvent immédiat car vous ne jonglez plus avec plusieurs factures."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Regroupement de Crédits
                <br />
                <span className="text-accent-light">Simplifiez Vos Finances</span>
              </h1>
              <p className="text-xl mb-6 text-primary-foreground/90">
                Regroupez plusieurs dettes en un seul paiement mensuel gérable avec un taux d'intérêt potentiellement inférieur. Reprenez le contrôle de vos finances dès aujourd'hui.
              </p>
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="h-5 w-5" />
                <span className="text-sm">Réduisez vos mensualités et le total des intérêts</span>
              </div>
            </div>
            <div>
              <CreditSimulator 
                minAmount={5000} 
                maxAmount={75000} 
                defaultAmount={15000} 
                minDuration={24}
                maxDuration={84}
                defaultDuration={60}
                interestRate={5.2} 
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">Avantages du Regroupement de Crédits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Quand Envisager le Regroupement ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {whenToConsolidate.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <Icon className="h-8 w-8 text-success flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{item.scenario}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Guide Complet du Regroupement de Crédits</h2>
            
            <h3 className="text-2xl font-bold text-foreground">Qu'est-ce que le Regroupement de Crédits ?</h3>
            <p className="text-foreground leading-relaxed">
              Le regroupement de crédits est une stratégie financière qui combine plusieurs dettes en un seul nouveau prêt avec un paiement mensuel unique. Au lieu de gérer plusieurs cartes de crédit, prêts personnels et autres dettes avec différents taux d'intérêt, dates de paiement et prêteurs, vous contractez un prêt pour tous les rembourser, ne vous laissant qu'un seul créancier et un seul paiement à suivre.
            </p>
            <p className="text-foreground leading-relaxed">
              Chez Privat Equity, nos prêts de regroupement de crédits vont de 5 000 € à 75 000 € avec des durées de remboursement de 24 à 84 mois. Les taux d'intérêt commencent à partir de 4,2 % TAEG pour les emprunteurs qualifiés, souvent nettement inférieurs aux taux des cartes de crédit qui varient généralement de 15 à 25 % TAEG. L'objectif est d'économiser de l'argent sur les intérêts tout en simplifiant votre vie financière.
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-8">Comment Fonctionne le Regroupement de Crédits</h3>
            <p className="text-foreground leading-relaxed">
              Le processus est simple :
            </p>
            <ol className="space-y-3 list-decimal list-inside text-foreground">
              <li><strong>Évaluez Vos Dettes :</strong> Calculez votre dette totale, les taux d'intérêt actuels et les paiements mensuels</li>
              <li><strong>Demandez un Prêt de Regroupement :</strong> Obtenez l'approbation d'un montant de prêt qui couvre toutes ou la plupart de vos dettes</li>
              <li><strong>Remboursez les Dettes Existantes :</strong> Utilisez les fonds du prêt pour rembourser les cartes de crédit, prêts personnels et autres dettes</li>
              <li><strong>Effectuez Un Seul Paiement Mensuel :</strong> Remboursez votre nouveau prêt de regroupement avec un seul paiement mensuel fixe</li>
              <li><strong>Économisez et Reconstruisez Votre Crédit :</strong> Bénéficiez de taux d'intérêt plus bas et de finances simplifiées tout en établissant un historique de paiement positif</li>
            </ol>

            <h3 className="text-2xl font-bold text-foreground mt-8">Types de Dettes que Vous Pouvez Regrouper</h3>
            <p className="text-foreground leading-relaxed">
              Les prêts de regroupement fonctionnent mieux pour les dettes non garanties :
            </p>
            <ul className="space-y-2 text-foreground">
              <li><strong>Soldes de Cartes de Crédit :</strong> Dette renouvelable à taux d'intérêt élevé, souvent 15-25 % TAEG</li>
              <li><strong>Prêts Personnels :</strong> Les prêts existants avec des taux plus élevés peuvent être refinancés</li>
              <li><strong>Factures Médicales :</strong> Dépenses de santé impayées nécessitant un remboursement structuré</li>
              <li><strong>Cartes de Magasin :</strong> Les cartes de détail ont souvent des taux d'intérêt très élevés</li>
              <li><strong>Prêts sur Salaire :</strong> Prêts à court terme à intérêt extrêmement élevé qui piègent les emprunteurs</li>
              <li><strong>Comptes en Recouvrement :</strong> Dettes en recouvrement (bien que cela puisse nécessiter une négociation)</li>
              <li><strong>Prêts Étudiants Privés :</strong> Certaines dettes d'éducation privées peuvent être regroupées</li>
            </ul>
            <p className="text-foreground leading-relaxed mt-4">
              <strong>Note :</strong> Vous ne pouvez généralement pas regrouper les dettes garanties comme les hypothèques ou les prêts auto via un prêt de regroupement personnel, car celles-ci sont liées à des garanties spécifiques.
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-8">Avantages du Regroupement de Crédits</h3>

            <h4 className="text-xl font-semibold text-foreground mt-6">1. Réduction des Coûts d'Intérêt</h4>
            <p className="text-foreground leading-relaxed">
              Si vous payez 18-25 % TAEG sur des cartes de crédit et que vous pouvez regrouper à 5-8 % TAEG, vos économies peuvent être substantielles. Par exemple, regrouper 20 000 € de dettes de carte de crédit à 20 % TAEG en un prêt personnel de 5 ans à 6 % TAEG permet d'économiser environ 12 000 € en intérêts.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">2. Gestion Financière Simplifiée</h4>
            <p className="text-foreground leading-relaxed">
              Gérer un paiement au lieu de cinq ou dix élimine la confusion, réduit les risques de paiements manqués et facilite grandement la budgétisation. Vous aurez une seule date d'échéance à retenir et un seul montant à planifier chaque mois.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">3. Calendrier de Remboursement Fixe</h4>
            <p className="text-foreground leading-relaxed">
              Contrairement aux cartes de crédit sans date de remboursement fixe, les prêts de regroupement ont une durée spécifique. Vous saurez exactement quand vous serez libéré de vos dettes, ce qui procure des avantages psychologiques et aide à la planification financière à long terme.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">4. Amélioration Potentielle du Score de Crédit</h4>
            <p className="text-foreground leading-relaxed">
              Le remboursement des cartes de crédit réduit votre taux d'utilisation du crédit (le pourcentage de crédit disponible que vous utilisez), qui est un facteur majeur dans les scores de crédit. De plus, des paiements réguliers à temps sur votre prêt de regroupement construisent un historique de paiement positif.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">5. Réduction du Stress Financier</h4>
            <p className="text-foreground leading-relaxed">
              Le fardeau mental de plusieurs dettes, d'appels de recouvrement et de jonglage financier a un impact réel. Le regroupement offre un chemin clair vers l'avant et souvent un soulagement immédiat de l'anxiété.
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-8">Risques Potentiels et Considérations</h3>
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-6 my-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-warning flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-bold text-foreground mb-3">Avertissements Importants</h4>
                  <ul className="space-y-2 text-foreground">
                    {risks.map((risk, index) => (
                      <li key={index} className="text-sm leading-relaxed">• {risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-foreground mt-8">Le Regroupement de Crédits Est-il Fait Pour Vous ?</h3>
            <p className="text-foreground leading-relaxed">
              Le regroupement fonctionne mieux si vous :
            </p>
            <ul className="space-y-2 text-foreground">
              <li>Avez plusieurs dettes avec des taux d'intérêt élevés (supérieurs à 10-12 %)</li>
              <li>Avez des revenus stables pour maintenir le nouveau paiement</li>
              <li>Avez un crédit suffisamment bon pour être admissible à un taux inférieur à votre moyenne actuelle</li>
              <li>Êtes engagé à ne pas accumuler de nouvelles dettes après le regroupement</li>
              <li>Avez un plan pour résoudre les dépenses ou les circonstances qui ont conduit à la dette</li>
            </ul>

            <p className="text-foreground leading-relaxed mt-6">
              Le regroupement pourrait NE PAS convenir si :
            </p>
            <ul className="space-y-2 text-foreground">
              <li>Votre dette est relativement faible (moins de 3 000 €) et vous pouvez la rembourser rapidement</li>
              <li>Vous n'avez pas résolu les problèmes de dépenses sous-jacents et accumulerez probablement plus de dettes</li>
              <li>Votre score de crédit est si bas que vous ne pouvez pas être admissible à un taux inférieur à vos dettes actuelles</li>
              <li>Vous avez des revenus très limités et avez besoin d'un allègement de dettes plutôt que d'un regroupement</li>
            </ul>

            <h3 className="text-2xl font-bold text-foreground mt-8">Alternatives au Regroupement de Crédits</h3>
            
            <h4 className="text-xl font-semibold text-foreground mt-6">Carte de Crédit avec Transfert de Solde</h4>
            <p className="text-foreground leading-relaxed">
              Transférez les soldes vers une carte avec 0 % TAEG pendant 12-18 mois. Bon si vous pouvez rembourser le solde pendant la période promotionnelle. Nécessite un bon crédit et comprend généralement des frais de transfert de 3-5 %.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Plan de Gestion de Dettes (PGD)</h4>
            <p className="text-foreground leading-relaxed">
              Travaillez avec une agence de conseil en crédit pour négocier des taux d'intérêt plus bas avec les créanciers. Vous effectuez un paiement à l'agence, qui le distribue aux créanciers. Nécessite généralement la fermeture des comptes de crédit.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Règlement de Dettes</h4>
            <p className="text-foreground leading-relaxed">
              Négociez avec les créanciers pour payer moins que ce que vous devez. Endommage gravement le crédit et peut avoir des conséquences fiscales. Ne considérez que si vous faites face à la faillite.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Faillite</h4>
            <p className="text-foreground leading-relaxed">
              Processus juridique qui élimine ou restructure les dettes. Impact grave sur le crédit durant 7-10 ans. Devrait être un dernier recours absolu après consultation d'un avocat.
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-8">Faire Fonctionner le Regroupement à Long Terme</h3>
            <p className="text-foreground leading-relaxed">
              Pour vous assurer que le regroupement aide vraiment votre situation financière :
            </p>
            <ul className="space-y-2 text-foreground">
              <li><strong>Créez un Budget :</strong> Suivez les revenus et les dépenses pour éviter l'accumulation de nouvelles dettes</li>
              <li><strong>Constituez une Épargne d'Urgence :</strong> Visez 3-6 mois de dépenses pour éviter les futures dettes</li>
              <li><strong>Traitez les Causes Profondes :</strong> Identifiez pourquoi vous avez accumulé des dettes et apportez les changements nécessaires</li>
              <li><strong>Effectuez des Paiements Supplémentaires :</strong> Lorsque possible, payez plus que le minimum pour réduire les intérêts et le délai de remboursement</li>
              <li><strong>Évitez les Nouvelles Dettes :</strong> Résistez à l'utilisation du crédit nouvellement disponible - envisagez de ne garder qu'une carte pour les urgences</li>
              <li><strong>Fixez des Objectifs Financiers :</strong> Concentrez-vous sur des objectifs positifs comme épargner pour une maison ou la retraite</li>
              <li><strong>Surveillez Votre Crédit :</strong> Vérifiez régulièrement vos rapports de crédit pour suivre l'amélioration</li>
              <li><strong>Cherchez de l'Aide si Nécessaire :</strong> Envisagez un conseil financier si vous avez du mal avec vos habitudes de dépenses</li>
            </ul>

            <h3 className="text-2xl font-bold text-foreground mt-8">Le Processus de Demande</h3>
            <ol className="space-y-3 list-decimal list-inside text-foreground">
              <li><strong>Calculez la Dette Totale :</strong> Listez toutes les dettes que vous souhaitez regrouper avec les soldes et les taux</li>
              <li><strong>Vérifiez Votre Crédit :</strong> Connaissez votre score pour comprendre quels taux vous pourriez obtenir</li>
              <li><strong>Comparez les Options :</strong> Examinez les offres de prêts de regroupement de plusieurs prêteurs</li>
              <li><strong>Faites Votre Demande :</strong> Soumettez votre demande avec la documentation des revenus et des dettes</li>
              <li><strong>Examinez les Conditions du Prêt :</strong> Examinez attentivement le TAEG, les frais et le coût total avant d'accepter</li>
              <li><strong>Remboursez les Dettes :</strong> Utilisez les fonds pour payer directement les créanciers (nous pouvons souvent le faire pour vous)</li>
              <li><strong>Confirmez les Remboursements :</strong> Vérifiez que tous les anciens comptes affichent des soldes nuls</li>
              <li><strong>Configurez le Paiement Automatique :</strong> Assurez-vous de ne jamais manquer le paiement de votre nouveau prêt</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">Questions Fréquentes sur le Regroupement de Crédits</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Consolidation;