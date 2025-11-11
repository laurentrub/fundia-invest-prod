import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CreditSimulator from "@/components/credit/CreditSimulator";
import { Card } from "@/components/ui/card";
import { Home, CheckCircle } from "lucide-react";

const HomeImprovement = () => {
  const benefits = [
    "Financement de 3 000 € à 75 000 €",
    "Taux à partir de 3,5% TAEG",
    "Durées jusqu'à 15 ans disponibles",
    "Aucune garantie requise",
    "Utilisable pour tous vos projets de travaux",
    "Approbation et déblocage rapides",
  ];

  const projectExamples = [
    {
      project: "Rénovation de Cuisine",
      amount: "15 000 €",
      duration: "60 mois",
      monthly: "276 €",
      description: "Nouveaux meubles, plans de travail, électroménager et sol"
    },
    {
      project: "Rénovation de Salle de Bain",
      amount: "10 000 €",
      duration: "48 mois",
      monthly: "227 €",
      description: "Nouveaux équipements, carrelage, meuble-vasque et douche"
    },
    {
      project: "Extension de Maison",
      amount: "40 000 €",
      duration: "120 mois",
      monthly: "444 €",
      description: "Chambre supplémentaire ou espace de vie agrandi"
    },
    {
      project: "Efficacité Énergétique",
      amount: "8 000 €",
      duration: "60 mois",
      monthly: "147 €",
      description: "Panneaux solaires, isolation, nouvelles fenêtres"
    },
  ];

  const faqs = [
    {
      q: "Quels types de projets de travaux puis-je financer ?",
      a: "Presque tous les projets ! Rénovations de cuisine et salle de bain, extensions, aménagements paysagers, piscines, améliorations énergétiques, nouvelle toiture, menuiseries, fenêtres, systèmes de chauffage, aménagement de combles, et bien plus. La seule restriction est que les fonds doivent être utilisés pour des améliorations immobilières."
    },
    {
      q: "Dois-je être propriétaire pour bénéficier de ce crédit ?",
      a: "Oui, les crédits travaux sont destinés aux propriétaires. Si vous êtes locataire, considérez plutôt notre option de prêt personnel. Nous ne plaçons pas d'hypothèque sur votre propriété, mais vous devez être propriétaire ou en cours d'acquisition du bien que vous améliorez."
    },
    {
      q: "Quelle est la différence avec un prêt hypothécaire ?",
      a: "Nos crédits travaux sont des prêts personnels non garantis, ce qui signifie que vous n'utilisez pas votre maison comme garantie et qu'aucune hypothèque n'est placée sur votre propriété. Cela rend la demande plus rapide et plus simple. Les prêts hypothécaires offrent généralement des taux plus bas mais nécessitent une évaluation immobilière et des délais d'approbation plus longs."
    },
    {
      q: "Puis-je obtenir un financement avant d'avoir les devis d'entrepreneurs ?",
      a: "Oui ! Obtenez d'abord une pré-approbation pour connaître votre budget, puis obtenez des devis d'entrepreneurs. Cette approche vous donne un pouvoir de négociation avec les entrepreneurs puisque vous aurez un financement garanti. Vous pouvez toujours emprunter moins que votre montant approuvé."
    },
    {
      q: "Payez-vous directement l'entrepreneur ?",
      a: "Non, les fonds sont déposés sur votre compte bancaire et vous payez les entrepreneurs vous-même. Cela vous donne le contrôle des paiements et vous permet de négocier les conditions avec les entrepreneurs. Nous recommandons de payer les entrepreneurs par étapes au fur et à mesure de l'avancement des travaux."
    },
    {
      q: "Que se passe-t-il si mon projet coûte plus cher que prévu ?",
      a: "Les dépassements de coûts sont courants dans les rénovations. Si approuvé, vous pourriez envisager d'emprunter un peu plus que les estimations initiales pour créer un fonds de contingence (généralement 10 à 20% supplémentaires). Si vous avez déjà contracté un prêt, vous pouvez demander un financement supplémentaire, bien que nous recommandions de terminer d'abord votre premier projet."
    },
    {
      q: "Y a-t-il des avantages fiscaux pour les crédits travaux ?",
      a: "Les intérêts sur les crédits travaux ne sont généralement pas déductibles fiscalement sauf si vous le garantissez avec votre maison. Cependant, de nombreuses améliorations peuvent augmenter la valeur de votre maison et peuvent donner droit à des crédits d'impôt énergétiques si elles améliorent l'efficacité énergétique. Consultez un professionnel fiscal pour des conseils spécifiques."
    },
    {
      q: "Sous quel délai puis-je obtenir les fonds ?",
      a: "Une fois approuvés et tous les documents vérifiés, les fonds sont généralement transférés sous 24 à 48 heures. Cela signifie que vous pouvez souvent commencer votre projet dans la semaine suivant votre demande."
    },
    {
      q: "Puis-je financer un projet sur une propriété que j'achète ?",
      a: "En général, nous recommandons de finaliser d'abord l'achat de votre maison, puis de demander un crédit rénovation. Certaines exceptions peuvent s'appliquer pour des réparations immédiates nécessaires. Contactez-nous pour discuter de votre situation spécifique."
    },
    {
      q: "Quel est le score de crédit minimum requis ?",
      a: "Bien que nous préférions des scores supérieurs à 650 pour les meilleurs taux, nous examinons les demandes de divers profils de crédit. Les montants de prêt plus élevés et les durées plus longues nécessitent généralement un crédit plus solide. Votre projet spécifique et votre situation financière sont également des facteurs d'approbation."
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
                <Home className="h-10 w-10" />
                <h1 className="text-4xl md:text-5xl font-bold">Crédit Travaux</h1>
              </div>
              <p className="text-xl mb-6 text-primary-foreground/90">
                Transformez votre habitat avec notre financement travaux flexible. De la rénovation de cuisine aux améliorations énergétiques, nous finançons vos projets de maison idéale.
              </p>
            </div>
            <div>
              <CreditSimulator 
                minAmount={3000} 
                maxAmount={75000} 
                defaultAmount={15000} 
                minDuration={12}
                maxDuration={180}
                defaultDuration={60}
                interestRate={4.5} 
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">Pourquoi Choisir Notre Crédit Travaux ?</h2>
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
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Exemples de Projets Populaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectExamples.map((example, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{example.project}</h3>
                <p className="text-sm text-muted-foreground mb-4">{example.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Montant du Prêt</div>
                    <div className="text-lg font-bold text-accent">{example.amount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Mensualité</div>
                    <div className="text-lg font-bold text-success">{example.monthly}/mois</div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Durée {example.duration} à ~4,5% TAEG
                </div>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-6 text-center">
            *Les exemples sont illustratifs. Votre taux et vos paiements réels dépendent de votre profil de crédit et des conditions choisies.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Guide Complet du Crédit Travaux</h2>
            
            <h3 className="text-2xl font-bold text-foreground">Qu'est-ce qu'un Crédit Travaux ?</h3>
            <p className="text-foreground leading-relaxed">
              Un crédit travaux est un prêt personnel non garanti spécialement conçu pour financer des rénovations, réparations et améliorations de votre habitation. Contrairement aux prêts hypothécaires ou aux lignes de crédit garanties par l'immobilier, ces prêts ne nécessitent pas d'utiliser votre maison comme garantie, ce qui les rend plus rapides et plus simples à obtenir.
            </p>
            <p className="text-foreground leading-relaxed">
              Chez Privat Equity, nos crédits travaux varient de 3 000 € à 75 000 € avec des durées allant jusqu'à 15 ans pour les projets plus importants. Les taux d'intérêt commencent à partir de 3,5% TAEG pour les emprunteurs qualifiés. Étant des prêts non garantis, l'approbation repose principalement sur votre solvabilité et vos revenus plutôt que sur la valeur de votre maison.
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-8">Avantages des Crédits Travaux</h3>
            <ul className="space-y-3 text-foreground">
              <li><strong>Augmenter la Valeur Immobilière :</strong> Des améliorations stratégiques peuvent considérablement augmenter la valeur marchande de votre maison, dépassant souvent le coût du prêt</li>
              <li><strong>Aucune Garantie Requise :</strong> Votre maison n'est pas utilisée comme garantie, il n'y a donc aucun risque de saisie si vous rencontrez des difficultés financières</li>
              <li><strong>Processus d'Approbation Rapide :</strong> Sans évaluations immobilières ni recherches de titres, l'approbation est généralement beaucoup plus rapide que les produits hypothécaires</li>
              <li><strong>Taux et Paiements Fixes :</strong> Sachez exactement ce que vous paierez chaque mois pendant toute la durée du prêt</li>
              <li><strong>Améliorer la Qualité de Vie :</strong> Créez l'espace de vie dont vous avez toujours rêvé sans épuiser votre épargne</li>
              <li><strong>Économies d'Énergie :</strong> Les améliorations d'efficacité se rentabilisent souvent grâce à la réduction des factures de services publics</li>
              <li><strong>Utilisation Flexible :</strong> Financez pratiquement tous les projets d'amélioration, des mises à jour mineures aux rénovations majeures</li>
            </ul>

            <h3 className="text-2xl font-bold text-foreground mt-8">Projets de Travaux Populaires</h3>
            <p className="text-foreground leading-relaxed">
              Nos clients financent une grande variété de projets. Voici les plus populaires :
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Rénovations de Cuisine (10 000 € - 40 000 €)</h4>
            <p className="text-foreground leading-relaxed">
              Les rénovations de cuisine offrent systématiquement le meilleur retour sur investissement, récupérant souvent 60 à 80% des coûts en augmentation de la valeur du bien. Les projets incluent nouveaux meubles, plans de travail, électroménager, revêtements de sol, éclairage et modifications d'agencement. Une cuisine moderne et fonctionnelle est un argument de vente majeur et améliore la qualité de vie quotidienne.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Rénovations de Salle de Bain (5 000 € - 25 000 €)</h4>
            <p className="text-foreground leading-relaxed">
              Les mises à jour de salles de bain vont des simples rafraîchissements cosmétiques aux rénovations complètes. Les améliorations courantes incluent nouveaux équipements, carrelage, meubles-vasques, éclairage, ventilation et fonctionnalités d'accessibilité. Les maisons avec plusieurs salles de bain commandent des prix plus élevés, faisant d'une salle de bain supplémentaire un investissement précieux.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Extensions et Agrandissements (20 000 € - 75 000 €)</h4>
            <p className="text-foreground leading-relaxed">
              Ajouter des mètres carrés augmente à la fois l'espace de vie et la valeur de la propriété. Les extensions populaires incluent chambres supplémentaires, bureaux à domicile, vérandas et espaces de vie agrandis. Ces projets offrent généralement de bons retours mais nécessitent une planification appropriée, des permis et des entrepreneurs expérimentés.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Améliorations Énergétiques (5 000 € - 30 000 €)</h4>
            <p className="text-foreground leading-relaxed">
              Les investissements dans les panneaux solaires, l'amélioration de l'isolation, les fenêtres à haut rendement énergétique, les systèmes de chauffage mis à jour et la domotique réduisent les factures de services publics tout en augmentant le confort et la valeur de la propriété. De nombreuses améliorations donnent droit à des incitations gouvernementales et des crédits d'impôt, réduisant efficacement vos coûts.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-6">Aménagements Extérieurs (5 000 € - 35 000 €)</h4>
            <p className="text-foreground leading-relaxed">
              L'aménagement paysager, les terrasses, patios, clôtures et cuisines d'extérieur étendent votre espace de vie et améliorent l'attrait visuel. Ces projets sont particulièrement précieux dans les climats agréables et peuvent considérablement améliorer votre plaisir de la propriété tout en séduisant les futurs acheteurs.
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-8">Planifier Votre Projet de Travaux</h3>
            <p className="text-foreground leading-relaxed">
              Des rénovations réussies nécessitent une planification minutieuse :
            </p>
            <ol className="space-y-3 list-decimal list-inside text-foreground">
              <li><strong>Définir Vos Objectifs :</strong> Identifiez ce que vous voulez accomplir - meilleure fonctionnalité, valeur accrue, esthétique améliorée ou efficacité énergétique</li>
              <li><strong>Rechercher les Coûts :</strong> Obtenez au moins trois devis d'entrepreneurs agréés pour comprendre les prix réalistes</li>
              <li><strong>Ajouter une Réserve :</strong> Budgétisez 10 à 20% supplémentaires pour les problèmes imprévus qui surviennent couramment pendant les rénovations</li>
              <li><strong>Vérifier les Exigences :</strong> Vérifiez si votre projet nécessite des permis, l'approbation de la copropriété ou doit respecter des codes de construction spécifiques</li>
              <li><strong>Considérer le Timing :</strong> Planifiez les projets pendant les saisons appropriées et considérez combien de temps vous serez privé de l'utilisation de l'espace</li>
              <li><strong>Obtenir une Pré-Approbation :</strong> Sécurisez le financement avant de vous engager avec des entrepreneurs pour savoir exactement ce que vous pouvez vous permettre</li>
            </ol>

            <h3 className="text-2xl font-bold text-foreground mt-8">Choisir les Bons Entrepreneurs</h3>
            <p className="text-foreground leading-relaxed">
              Le choix de votre entrepreneur peut faire ou défaire votre projet :
            </p>
            <ul className="space-y-2 text-foreground">
              <li>Vérifiez les licences, assurances et garanties de tous les entrepreneurs</li>
              <li>Consultez les références et examinez les exemples de travaux précédents</li>
              <li>Obtenez des devis détaillés écrits qui détaillent la main-d'œuvre et les matériaux</li>
              <li>Ne payez jamais le montant total à l'avance - utilisez une structure de paiement par étapes</li>
              <li>Assurez-vous que tous les accords, garanties et délais sont écrits</li>
              <li>Vérifiez que les permis sont obtenus et les inspections programmées</li>
              <li>Maintenez une communication ouverte tout au long du projet</li>
            </ul>

            <h3 className="text-2xl font-bold text-foreground mt-8">Maximiser Votre Investissement</h3>
            <p className="text-foreground leading-relaxed">
              Pour vous assurer que votre rénovation ajoute un maximum de valeur :
            </p>
            <ul className="space-y-2 text-foreground">
              <li>Concentrez-vous sur les améliorations qui plaisent au plus large éventail d'acheteurs</li>
              <li>Évitez de trop améliorer par rapport à votre quartier</li>
              <li>Choisissez des designs intemporels plutôt que des styles tendance qui peuvent rapidement dater</li>
              <li>Investissez dans des matériaux de qualité qui dureront</li>
              <li>Considérez des caractéristiques de conception universelle qui conviennent à tous les âges et capacités</li>
              <li>Conservez des dossiers détaillés de toutes les améliorations pour les divulgations de vente futures</li>
              <li>Gardez les reçus pour d'éventuels avantages fiscaux ou à des fins d'assurance</li>
            </ul>

            <h3 className="text-2xl font-bold text-foreground mt-8">Crédit Travaux vs. Autres Options</h3>
            <div className="bg-muted/50 p-6 rounded-lg my-6">
              <h4 className="text-xl font-semibold mb-3">Prêt Hypothécaire</h4>
              <p className="mb-2"><strong>Avantages :</strong> Taux plus bas, montants plus importants, déductibilité fiscale potentielle</p>
              <p><strong>Inconvénients :</strong> Utilise la maison comme garantie, approbation plus lente, nécessite une valeur nette significative, frais de clôture</p>
            </div>
            <div className="bg-muted/50 p-6 rounded-lg my-6">
              <h4 className="text-xl font-semibold mb-3">Ligne de Crédit Hypothécaire</h4>
              <p className="mb-2"><strong>Avantages :</strong> Emprunt flexible, payez des intérêts uniquement sur ce que vous utilisez, avantages fiscaux potentiels</p>
              <p><strong>Inconvénients :</strong> Taux variables, utilise la maison comme garantie, nécessite de l'équité, peut tenter les dépenses excessives</p>
            </div>
            <div className="bg-muted/50 p-6 rounded-lg my-6">
              <h4 className="text-xl font-semibold mb-3">Prêt Personnel (Notre Option)</h4>
              <p className="mb-2"><strong>Avantages :</strong> Approbation rapide, aucune garantie, taux fixes, demande simple</p>
              <p><strong>Inconvénients :</strong> Taux potentiellement plus élevés que les options garanties, montants maximums inférieurs</p>
            </div>
            <div className="bg-muted/50 p-6 rounded-lg my-6">
              <h4 className="text-xl font-semibold mb-3">Cartes de Crédit</h4>
              <p className="mb-2"><strong>Avantages :</strong> Accès immédiat, récompenses potentielles</p>
              <p><strong>Inconvénients :</strong> Taux d'intérêt élevés, peut affecter l'utilisation du crédit, inadapté aux grands projets</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">FAQ Crédit Travaux</h2>
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

export default HomeImprovement;
