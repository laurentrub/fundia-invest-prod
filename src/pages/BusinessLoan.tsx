import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CreditSimulator from "@/components/credit/CreditSimulator";
import { Card } from "@/components/ui/card";
import { Briefcase, CheckCircle } from "lucide-react";

const BusinessLoan = () => {
  const benefits = [
    "Prêts de 5 000 € à 75 000 €",
    "Durées flexibles : 12 à 84 mois",
    "Approbation rapide pour entrepreneurs",
    "Utilisable pour tout projet professionnel",
    "Taux compétitifs pour PME",
    "Préservez votre trésorerie",
  ];

  const useCases = [
    {
      title: "Fonds de Roulement",
      description: "Couvrir les dépenses opérationnelles, la paie, les stocks ou les écarts de trésorerie saisonniers",
      typical: "10 000 € - 50 000 €"
    },
    {
      title: "Achat d'Équipement",
      description: "Acheter des machines, véhicules, ordinateurs ou outils spécialisés",
      typical: "15 000 € - 75 000 €"
    },
    {
      title: "Expansion de l'Entreprise",
      description: "Ouvrir de nouveaux locaux, recruter du personnel ou conquérir de nouveaux marchés",
      typical: "20 000 € - 75 000 €"
    },
    {
      title: "Marketing & Croissance",
      description: "Financer des campagnes publicitaires, le développement web ou des initiatives commerciales",
      typical: "5 000 € - 30 000 €"
    },
    {
      title: "Achat de Stock",
      description: "Constituer des stocks de produits, matériaux ou fournitures",
      typical: "10 000 € - 50 000 €"
    },
    {
      title: "Refinancement",
      description: "Regrouper des dettes professionnelles ou refinancer à de meilleures conditions",
      typical: "15 000 € - 75 000 €"
    },
  ];

  const faqs = [
    {
      q: "Qui peut bénéficier d'un crédit professionnel ?",
      a: "Les entrepreneurs individuels, sociétés de personnes, SARL, SA et professionnels indépendants peuvent faire une demande. Vous devez être en activité depuis au moins 6 mois (de préférence 12+ mois), afficher un chiffre d'affaires régulier et fournir des documents financiers professionnels. Le score de crédit personnel est également pris en compte car ces prêts sont souvent garantis personnellement."
    },
    {
      q: "Quels documents sont nécessaires pour la demande ?",
      a: "Vous aurez besoin des documents de création de l'entreprise (immatriculation, statuts), des déclarations fiscales (professionnelles et personnelles des 2 dernières années), bilans et comptes de résultat, relevés bancaires (3-6 mois), un business plan ou explication de l'utilisation des fonds, et une pièce d'identité. Les travailleurs indépendants doivent fournir une documentation complète de leurs revenus."
    },
    {
      q: "S'agit-il d'un prêt garanti ou non garanti ?",
      a: "Nos crédits professionnels sont généralement non garantis, ce qui signifie que vous n'avez pas besoin de mettre en gage des actifs professionnels spécifiques en garantie. Cependant, vous devrez peut-être fournir une garantie personnelle, ce qui signifie que vous êtes personnellement responsable du remboursement si l'entreprise ne peut pas payer."
    },
    {
      q: "Dans quel délai puis-je obtenir le financement ?",
      a: "L'approbation d'un crédit professionnel prend généralement 2 à 5 jours ouvrables selon la complexité de votre demande et la rapidité avec laquelle vous fournissez les documents. Une fois approuvés, les fonds sont généralement versés dans les 24 à 48 heures."
    },
    {
      q: "Que faire si mon entreprise est toute nouvelle ?",
      a: "Les entreprises très récentes (moins de 6 mois) ont des options limitées avec les prêteurs traditionnels. Envisagez de demander un prêt personnel pour financer votre startup, utilisez le financement participatif, recherchez des investisseurs providentiels, ou attendez d'avoir 6-12 mois d'historique de revenus. Un bon crédit personnel et un business plan détaillé peuvent aider."
    },
    {
      q: "Puis-je utiliser ce prêt pour créer une entreprise ?",
      a: "Bien que nos crédits professionnels soient principalement destinés aux entreprises existantes, si vous avez un business plan très solide, une expérience significative du secteur, un investissement personnel substantiel et un excellent crédit personnel, nous pouvons envisager le financement de startup au cas par cas."
    },
    {
      q: "À quels taux d'intérêt puis-je m'attendre ?",
      a: "Les taux varient généralement de 5 % à 12 % TAEG selon le chiffre d'affaires de votre entreprise, l'ancienneté, votre score de crédit personnel et le montant/durée du prêt. Les entreprises établies avec des finances solides et un bon crédit personnel obtiennent les meilleurs taux."
    },
    {
      q: "Comment fonctionne le remboursement d'un crédit professionnel ?",
      a: "Le remboursement se fait généralement par mensualités fixes comprenant le capital et les intérêts. Les paiements sont souvent prélevés automatiquement sur votre compte bancaire professionnel. Il n'y a pas de pénalités de remboursement anticipé si vous souhaitez rembourser le prêt plus tôt."
    },
    {
      q: "Cela affectera-t-il mon crédit personnel ?",
      a: "Oui, la demande entraînera une enquête approfondie sur votre rapport de crédit personnel car vous garantissez personnellement le prêt. Les paiements à temps peuvent impacter positivement votre crédit personnel, tandis que les paiements manqués le détérioreront. De plus, le prêt peut apparaître sur votre rapport de crédit personnel."
    },
    {
      q: "Puis-je obtenir un prêt si mon entreprise a des dettes ?",
      a: "Oui, l'endettement professionnel existant ne vous disqualifie pas automatiquement. Nous évaluerons votre ratio d'endettement et nous assurerons que votre entreprise génère suffisamment de revenus pour gérer le paiement supplémentaire. Beaucoup d'entreprises utilisent nos prêts spécifiquement pour consolider et refinancer des dettes existantes à taux d'intérêt plus élevés."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="h-10 w-10" />
                <h1 className="text-4xl md:text-5xl font-bold">Crédit Professionnel</h1>
              </div>
              <p className="text-xl mb-6 text-primary-foreground/90">
                Financement flexible pour entrepreneurs, PME et entreprises en croissance. Financez l'expansion, l'équipement, le fonds de roulement et plus encore.
              </p>
            </div>
            <div>
              <CreditSimulator 
                minAmount={5000} 
                maxAmount={75000} 
                defaultAmount={25000} 
                minDuration={12}
                maxDuration={84}
                defaultDuration={48}
                interestRate={6.5} 
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">Pourquoi Choisir Notre Crédit Professionnel ?</h2>
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
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Utilisations Courantes du Crédit Professionnel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{useCase.description}</p>
                <div className="text-xs text-accent font-semibold">Montant typique : {useCase.typical}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Guide Complet du Crédit Professionnel</h2>
            
            <h3 className="text-2xl font-bold text-foreground">Qu'est-ce qu'un Crédit Professionnel ?</h3>
            <p className="text-foreground leading-relaxed">
              Un crédit professionnel fournit des capitaux pour aider votre entreprise à se développer, gérer la trésorerie, acheter des actifs ou faire face à des dépenses imprévues. Chez Privat Equity, nous proposons des prêts à terme de 5 000 € à 75 000 € avec des périodes de remboursement de 12 à 84 mois, conçus spécifiquement pour les petites et moyennes entreprises (PME), les entrepreneurs et les professionnels indépendants.
            </p>
            <p className="text-foreground leading-relaxed">
              Contrairement aux prêts bancaires professionnels traditionnels qui peuvent prendre des semaines ou des mois à traiter, notre processus de demande simplifié se concentre sur les performances réelles et le potentiel de votre entreprise plutôt que sur la paperasserie. Les taux d'intérêt varient généralement de 5 à 12 % TAEG selon la solidité de votre entreprise, son ancienneté et votre solvabilité.
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-8">Avantages des Crédits Professionnels</h3>
            <ul className="space-y-3 text-foreground">
              <li><strong>Maintenir la Trésorerie :</strong> Gardez le fonds de roulement disponible pour les opérations quotidiennes tout en finançant les dépenses importantes</li>
              <li><strong>Préserver les Capitaux Propres :</strong> Évitez de céder des parts de propriété de votre entreprise aux investisseurs</li>
              <li><strong>Construire le Crédit d'Entreprise :</strong> Établir un historique de paiement positif aide à construire le profil de crédit de votre entreprise</li>
              <li><strong>Avantages Fiscaux :</strong> Les paiements d'intérêts sur les prêts professionnels sont généralement déductibles fiscalement</li>
              <li><strong>Paiements Prévisibles :</strong> Les mensualités fixes facilitent la budgétisation et la planification de trésorerie</li>
              <li><strong>Accès Rapide aux Capitaux :</strong> Obtenez un financement beaucoup plus rapidement que les prêts bancaires traditionnels ou la levée de fonds</li>
              <li><strong>Utilisation Flexible :</strong> Utilisez les fonds pour presque tout usage professionnel légitime sans restrictions</li>
            </ul>

            <h3 className="text-2xl font-bold text-foreground mt-8">Types d'Entreprises que Nous Finançons</h3>
            <p className="text-foreground leading-relaxed">
              Nous travaillons avec une large gamme de types d'entreprises et de structures :
            </p>
            <ul className="space-y-2 text-foreground">
              <li><strong>Entreprises Individuelles :</strong> Propriétaires d'entreprise individuels y compris freelances et consultants</li>
              <li><strong>Sociétés de Personnes :</strong> Entreprises détenues par deux personnes ou plus</li>
              <li><strong>Sociétés à Responsabilité Limitée (SARL):</strong> La structure de petite entreprise la plus courante</li>
              <li><strong>Sociétés par Actions (SAS/SA):</strong> Entreprises structurées plus importantes</li>
              <li><strong>Professionnels Indépendants :</strong> Médecins, avocats, comptables, entrepreneurs et autres professionnels</li>
              <li><strong>Entreprises de Commerce Électronique :</strong> Détaillants et prestataires de services en ligne</li>
              <li><strong>Commerce de Détail Physique :</strong> Magasins physiques et showrooms</li>
              <li><strong>Entreprises de Services :</strong> Conseil, maintenance, santé, beauté et services personnels</li>
              <li><strong>Fabrication :</strong> Entreprises de production et de fabrication à petite échelle</li>
              <li><strong>Restauration :</strong> Restaurants, cafés, traiteurs, food trucks</li>
            </ul>

            <h3 className="text-2xl font-bold text-foreground mt-8">Utilisations Courantes des Crédits Professionnels</h3>

            <h4 className="text-xl font-semibold text-foreground mt-6">Fonds de Roulement</h4>
            <p className="text-foreground leading-relaxed">
              Couvrir les dépenses opérationnelles quotidiennes, gérer les fluctuations saisonnières, payer les fournisseurs, respecter la paie pendant les périodes creuses, ou combler l'écart entre les créances et les dettes. Les prêts de fonds de roulement maintiennent votre entreprise en marche pendant les phases de croissance ou les crises temporaires de trésorerie.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Achats d'Équipement et d'Actifs</h4>
            <p className="text-foreground leading-relaxed">
              Acheter des machines, véhicules, ordinateurs, mobilier, outils spécialisés ou tout équipement dont votre entreprise a besoin pour fonctionner ou se développer. Le financement d'équipement préserve vos réserves de trésorerie tout en vous permettant d'acquérir des actifs qui génèrent des revenus ou améliorent l'efficacité.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Expansion de l'Entreprise</h4>
            <p className="text-foreground leading-relaxed">
              Ouvrir de nouveaux locaux, embaucher de nouveaux employés, entrer sur de nouveaux marchés, lancer de nouvelles gammes de produits ou augmenter la capacité de production. L'expansion nécessite des capitaux, et l'emprunt stratégique peut accélérer la croissance tout en minimisant la dilution de la propriété.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Stock et Inventaire</h4>
            <p className="text-foreground leading-relaxed">
              Acheter des stocks en gros pour profiter de remises, faire des réserves pour les saisons chargées ou maintenir des niveaux de stock adéquats pour répondre à la demande des clients. Les entreprises de vente au détail et de commerce électronique bénéficient particulièrement du financement de stock.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Marketing et Développement Commercial</h4>
            <p className="text-foreground leading-relaxed">
              Financer des campagnes publicitaires, développer des sites web professionnels, assister à des salons professionnels, embaucher du personnel commercial ou mettre en place des systèmes CRM. Les investissements marketing ont souvent un excellent ROI mais nécessitent des capitaux initiaux que les prêts peuvent fournir.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Consolidation et Refinancement de Dettes</h4>
            <p className="text-foreground leading-relaxed">
              Regrouper plusieurs dettes professionnelles ou avances de trésorerie commerçant à taux d'intérêt élevé en un seul prêt à taux inférieur. Cela simplifie les finances, réduit les coûts d'intérêt totaux et peut considérablement améliorer la trésorerie mensuelle.
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-8">Conditions d'Éligibilité</h3>
            <p className="text-foreground leading-relaxed">
              Pour être admissible à un crédit professionnel avec Privat Equity, vous devez généralement remplir ces critères :
            </p>
            <ul className="space-y-2 text-foreground">
              <li>Entreprise en activité depuis au moins 6-12 mois (exceptions pour les startups solides)</li>
              <li>Chiffre d'affaires mensuel minimum de 5 000 € - 10 000 € selon le montant du prêt</li>
              <li>Score de crédit personnel de 600+ (les scores plus élevés obtiennent de meilleurs taux)</li>
              <li>Aucune faillite récente ou défaut majeur</li>
              <li>Entreprise enregistrée avec licence et documentation appropriées</li>
              <li>Ratio de couverture du service de la dette montrant la capacité de remboursement</li>
              <li>Résidence française ou immatriculation commerciale appropriée en France</li>
            </ul>

            <h3 className="text-2xl font-bold text-foreground mt-8">Documentation Requise</h3>
            <p className="text-foreground leading-relaxed">
              Préparez ces documents pour accélérer votre demande :
            </p>
            <ul className="space-y-2 text-foreground">
              <li><strong>Documentation d'Entreprise :</strong> Immatriculation, statuts, accord d'exploitation, licences commerciales</li>
              <li><strong>États Financiers :</strong> 2 dernières années de déclarations fiscales professionnelles, bilans et comptes de résultat</li>
              <li><strong>Relevés Bancaires :</strong> 3-6 mois de relevés bancaires professionnels montrant revenus et dépenses</li>
              <li><strong>Informations Personnelles :</strong> Déclarations fiscales personnelles du propriétaire, pièce d'identité, justificatif de domicile</li>
              <li><strong>Business Plan :</strong> Description de votre entreprise, utilisation prévue des fonds du prêt, projections de croissance</li>
              <li><strong>Comptes Clients/Fournisseurs :</strong> Si applicable, rapports d'ancienneté montrant l'argent dû à et par votre entreprise</li>
            </ul>

            <h3 className="text-2xl font-bold text-foreground mt-8">Comprendre les Conditions du Crédit Professionnel</h3>

            <h4 className="text-xl font-semibold text-foreground mt-6">Taux d'Intérêt (TAEG)</h4>
            <p className="text-foreground leading-relaxed">
              Votre taux dépend de plusieurs facteurs : ancienneté de l'entreprise (plus longue est mieux), chiffre d'affaires annuel (plus élevé est mieux), marges bénéficiaires, score de crédit personnel, montant et durée du prêt, et votre secteur d'activité. Les entreprises établies et rentables avec un bon crédit peuvent obtenir des taux aussi bas que 5 % TAEG, tandis que les entreprises plus récentes ou à risque plus élevé pourraient voir des taux de 10-12 % TAEG.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Durées de Prêt et Amortissement</h4>
            <p className="text-foreground leading-relaxed">
              Les durées plus courtes (12-36 mois) ont des mensualités plus élevées mais des coûts d'intérêt totaux plus faibles. Les durées plus longues (60-84 mois) réduisent les mensualités mais augmentent le total des intérêts payés. Choisissez une durée qui équilibre mensualités abordables et minimisation des coûts d'intérêt.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Garanties Personnelles</h4>
            <p className="text-foreground leading-relaxed">
              La plupart des crédits professionnels de moins de 75 000 € nécessitent une garantie personnelle du ou des propriétaires de l'entreprise, ce qui signifie que vous êtes personnellement responsable du remboursement si l'entreprise ne peut pas payer. C'est standard pour les prêts aux petites entreprises et reflète le besoin de sécurité du prêteur.
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-8">Comment Améliorer Vos Chances d'Approbation</h3>
            <ul className="space-y-2 text-foreground">
              <li>Maintenir un crédit personnel et professionnel propre - corriger les erreurs avant de faire une demande</li>
              <li>Démontrer une croissance constante des revenus ou des modèles de revenus stables</li>
              <li>Réduire la dette professionnelle existante pour améliorer les ratios d'endettement</li>
              <li>Avoir un business plan clair et réaliste expliquant l'utilisation du prêt et le ROI</li>
              <li>Tenir des registres financiers détaillés montrant la rentabilité ou le chemin vers la rentabilité</li>
              <li>Construire une relation avec le prêteur avant d'avoir besoin d'un financement urgent</li>
              <li>Envisager un cosignataire si votre crédit ou historique d'entreprise est limité</li>
              <li>Commencer par un montant de prêt plus petit pour établir un historique</li>
            </ul>

            <h3 className="text-2xl font-bold text-foreground mt-8">Alternatives aux Crédits Professionnels</h3>

            <h4 className="text-xl font-semibold text-foreground mt-6">Ligne de Crédit d'Entreprise</h4>
            <p className="text-foreground leading-relaxed">
              Similaire à une carte de crédit, vous êtes approuvé pour un montant maximum et ne payez des intérêts que sur ce que vous utilisez réellement. Bon pour les besoins de fonds de roulement continus plutôt que pour les achats ponctuels.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Financement d'Équipement</h4>
            <p className="text-foreground leading-relaxed">
              Prêts garantis où l'équipement lui-même sert de garantie, entraînant souvent des taux plus bas. L'équipement doit être l'utilisation principale des fonds.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Affacturage de Factures</h4>
            <p className="text-foreground leading-relaxed">
              Vendez vos factures impayées à une société d'affacturage avec une décote pour obtenir de l'argent immédiatement. Coûteux mais utile pour les entreprises ayant des problèmes de trésorerie dus à des clients qui paient lentement.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Avance de Trésorerie Commerçant</h4>
            <p className="text-foreground leading-relaxed">
              Recevez une somme forfaitaire en échange d'un pourcentage des ventes quotidiennes par carte de crédit. Très coûteux (souvent 30-100 % de TAEG équivalent) et ne devrait être utilisé qu'en dernier recours.
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-8">Gérer Votre Crédit Professionnel</h3>
            <p className="text-foreground leading-relaxed">
              Une fois approuvé, une gestion appropriée du prêt est cruciale :
            </p>
            <ul className="space-y-2 text-foreground">
              <li>Mettez en place des paiements automatiques depuis votre compte bancaire professionnel pour ne jamais manquer un paiement</li>
              <li>Suivez comment les fonds du prêt sont utilisés par rapport à votre business plan</li>
              <li>Surveillez le ROI de votre prêt - génère-t-il les rendements attendus ?</li>
              <li>Effectuez des paiements supplémentaires lorsque la trésorerie le permet pour réduire les coûts d'intérêt</li>
              <li>Maintenez une communication ouverte avec votre prêteur si des défis surviennent</li>
              <li>Conservez des registres détaillés à des fins fiscales (les intérêts sont généralement déductibles)</li>
              <li>Envisagez un refinancement si votre entreprise se développe et que vous êtes admissible à de meilleures conditions</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">Questions Fréquentes sur le Crédit Professionnel</h2>
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

export default BusinessLoan;