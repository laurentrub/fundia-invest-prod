import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const CreditGuide = () => {
  const articles = [
    {
      title: "Comment choisir le bon prêt pour vos besoins",
      content: `Choisir le bon prêt nécessite une attention particulière à votre situation financière, vos objectifs et votre capacité de remboursement. Commencez par identifier votre besoin spécifique - s'agit-il d'un rachat de crédit, d'un achat important, de travaux ou d'un investissement professionnel ? Chaque objectif peut être mieux adapté à différents types de prêts.

Réfléchissez au montant dont vous avez réellement besoin. Emprunter trop peu signifie que vous pourriez avoir besoin d'un financement supplémentaire plus tard ; emprunter trop augmente les coûts inutilement. Créez un budget détaillé montrant exactement comment vous utiliserez les fonds.

Comparez les taux d'intérêt chez plusieurs prêteurs, mais rappelez-vous que le TAEG (Taux Annuel Effectif Global) est plus important que le taux d'intérêt de base car il inclut les frais. Les taux fixes offrent une stabilité de paiement, tandis que les taux variables peuvent commencer plus bas mais comportent un risque d'augmentation.

Évaluez attentivement les conditions de remboursement. Des durées plus courtes signifient des mensualités plus élevées mais des coûts d'intérêt totaux plus faibles. Des durées plus longues réduisent les mensualités mais augmentent considérablement le montant total payé. Choisissez une durée qui équilibre l'accessibilité avec la minimisation des intérêts.

Vérifiez les frais, notamment les frais de dossier, les pénalités de remboursement anticipé, les frais de retard et les frais annuels. Certains prêts affichent des taux bas mais ont des frais élevés qui augmentent le coût réel.

Considérez votre score de crédit de manière réaliste. Si votre score est inférieur à 650, vous pourriez faire face à des taux plus élevés ou avoir besoin d'un co-emprunteur. Améliorer votre crédit avant de faire une demande peut vous faire économiser des milliers d'euros en intérêts.

Enfin, lisez les petits caractères. Comprenez tous les termes, conditions et vos obligations avant de signer. Ne vous sentez jamais pressé d'accepter une offre - les prêteurs légitimes vous donnent le temps d'examiner et de décider.`
    },
    {
      title: "Comprendre et calculer votre taux d'endettement",
      content: `Votre taux d'endettement est l'un des facteurs les plus importants que les prêteurs considèrent lors de l'évaluation de votre demande de prêt. Il mesure quel pourcentage de votre revenu mensuel brut est consacré aux paiements de dettes, indiquant votre capacité à gérer les mensualités.

Pour calculer votre taux d'endettement, déterminez d'abord vos paiements mensuels de dettes totaux. Incluez les paiements minimums de cartes de crédit, les remboursements de prêts personnels, les crédits auto, les prêts étudiants, le loyer ou l'hypothèque, et toute autre obligation de dette récurrente. N'incluez pas les services publics, l'épicerie ou les assurances sauf s'ils font partie d'un plan de paiement.

Ensuite, calculez votre revenu mensuel brut (avant impôts). Incluez le salaire, les primes, les commissions, les revenus locatifs, la pension alimentaire, la pension pour enfants et toute autre source de revenu régulière.

Divisez les paiements mensuels de dettes totaux par le revenu mensuel brut, puis multipliez par 100 pour obtenir votre pourcentage. Par exemple : 1 200 € de paiements de dettes ÷ 4 000 € de revenu brut = 0,30 ou 30% de taux d'endettement.

La plupart des prêteurs préfèrent un taux d'endettement inférieur à 36%, avec pas plus de 28% consacré aux frais de logement. Vous pouvez toujours être qualifié avec un taux d'endettement allant jusqu'à 43-45%, mais vous ferez probablement face à des taux d'intérêt plus élevés. Au-dessus de 45%, l'approbation devient très difficile.

Pour améliorer votre taux d'endettement, vous pouvez augmenter vos revenus par des augmentations, des emplois secondaires ou des primes, ou réduire vos dettes en remboursant les soldes, en consolidant les dettes à taux d'intérêt élevé ou en évitant de nouvelles dettes. Parfois, reporter une demande de prêt tout en améliorant votre taux d'endettement aboutit à de bien meilleures conditions.

Lors d'une demande de nouveau prêt, les prêteurs calculent le taux d'endettement en incluant le nouveau paiement proposé. Assurez-vous de pouvoir confortablement vous permettre ce paiement combiné tout en maintenant une épargne d'urgence et une qualité de vie.`
    },
    {
      title: "Comment comparer efficacement les offres de prêt",
      content: `Comparer les offres de prêt nécessite de regarder au-delà du taux d'intérêt annoncé. Utilisez ces stratégies pour prendre une décision éclairée :

D'abord, concentrez-vous sur le TAEG (Taux Annuel Effectif Global) plutôt que sur le seul taux d'intérêt. Le TAEG inclut les frais de dossier, les frais de traitement et autres coûts, vous donnant le véritable coût annuel de l'emprunt. Un prêt avec un taux d'intérêt de 5% mais 5% de frais de dossier pourrait avoir un TAEG de 7%, le rendant plus cher qu'un prêt à 6% sans frais.

Comparez les coûts totaux du prêt en multipliant votre mensualité par le nombre de paiements. Un prêt de 10 000 € à 5% TAEG sur 36 mois coûte 299 €/mois (10 764 € au total), tandis que le même prêt à 7% TAEG coûte 308 €/mois (11 088 € au total) - une différence de 324 €.

Examinez attentivement tous les frais. Les frais courants incluent les frais de dossier (généralement 1-6% du montant du prêt), les frais de demande, les pénalités de remboursement anticipé, les frais de retard et les frais de traitement de chèque. Certains prêteurs ne facturent pas de frais mais ont des taux plus élevés, tandis que d'autres font l'inverse.

Vérifiez la flexibilité de remboursement. Pouvez-vous effectuer des paiements supplémentaires sans pénalité ? Pouvez-vous modifier votre date de paiement ? Y a-t-il un délai de grâce pour les paiements en retard ? Ces caractéristiques comptent lorsque les circonstances de la vie changent.

Lisez les avis et recherchez la réputation du prêteur. Vérifiez auprès du Better Business Bureau, des sites web de finances personnelles et des réseaux sociaux. Méfiez-vous des prêteurs avec des plaintes concernant des frais cachés, un mauvais service client ou des pratiques de recouvrement agressives.

Vérifiez les références du prêteur. Assurez-vous qu'ils sont correctement agréés en France et conformes aux lois de protection des consommateurs. Les prêteurs légitimes divulguent clairement tous les termes et ne vous pressent jamais de signer immédiatement.

Enfin, obtenez tout par écrit. Comparez les offres de prêt écrites côte à côte, y compris le TAEG, la mensualité, le coût total, les frais et les conditions. Prenez le temps d'examiner - ne signez jamais sous pression.`
    },
    {
      title: "La vérité sur le remboursement anticipé des prêts",
      content: `Rembourser un prêt par anticipation peut économiser beaucoup d'intérêts, mais ce n'est pas toujours la meilleure décision financière. Comprendre les implications vous aide à faire le bon choix.

La plupart des prêts personnels utilisent un intérêt simple calculé quotidiennement sur le solde restant. Payer tôt ou effectuer des paiements supplémentaires réduit le capital plus rapidement, ce qui réduit les intérêts accumulés. Par exemple, ajouter 100 €/mois à un prêt de 10 000 € à 6% TAEG peut économiser plus de 500 € en intérêts et réduire de plusieurs mois votre remboursement.

Cependant, vérifiez d'abord les pénalités de remboursement anticipé. Bien qu'elles soient de plus en plus rares sur les prêts personnels, certains prêteurs facturent des frais (généralement 2-5% du solde restant) si vous remboursez le prêt dans les premières 1-3 années. Ces frais pourraient éliminer vos économies d'intérêts, rendant le remboursement anticipé inutile.

Considérez le coût d'opportunité avant d'effectuer des paiements supplémentaires. Si votre taux de prêt est de 5% mais que vous pourriez gagner 8% en investissant cet argent, vous pourriez être mieux servi en effectuant des paiements minimums et en investissant la différence. Cela est particulièrement vrai si votre employeur abonde vos cotisations de retraite - c'est de l'argent gratuit que vous ne devriez pas manquer.

Ne priorisez pas le remboursement du prêt au détriment de l'épargne d'urgence. Les experts financiers recommandent 3-6 mois de dépenses en épargne facilement accessible avant de rembourser agressivement des dettes à faible taux d'intérêt. Sans fonds d'urgence, vous pourriez avoir besoin de contracter des dettes à taux d'intérêt élevé lors d'une crise.

Concentrez les paiements supplémentaires d'abord sur les dettes à taux d'intérêt élevé. Si vous avez un prêt personnel à 6% et des cartes de crédit à 20%, payez les minimums sur le prêt et attaquez les cartes de crédit. Cette "méthode avalanche" économise le plus d'argent.

Rembourser les prêts par anticipation améliore votre score de crédit en réduisant votre utilisation du crédit et votre taux d'endettement, ce qui aide si vous prévoyez demander une hypothèque ou un autre prêt important bientôt.

Calculez vos économies exactes en utilisant un calculateur de remboursement anticipé avant de décider. Parfois, les économies sont minimes, tandis que d'autres fois elles sont substantielles.`
    },
    {
      title: "Construire et maintenir un bon crédit",
      content: `Votre score de crédit impacte tous les aspects financiers de votre vie - approbations de prêts, taux d'intérêt, demandes de logement et même l'emploi. Comprendre comment construire et maintenir un bon crédit est essentiel pour la réussite financière.

Les scores de crédit vont de 300 à 850. Les scores supérieurs à 750 sont excellents, 700-749 est bon, 650-699 est correct, 600-649 est faible et en dessous de 600 est très faible. La formule exacte du score est propriétaire, mais nous connaissons les facteurs clés.

L'historique de paiement représente 35% de votre score. Ne manquez jamais de paiements - même un seul paiement en retard de 30 jours peut faire chuter votre score de plus de 100 points. Configurez des paiements automatiques ou des rappels de calendrier pour toutes les dettes. Si vous manquez un paiement, payez-le immédiatement et contactez le créancier - ils acceptent parfois de ne pas le signaler si vous avez un bon historique.

L'utilisation du crédit (montants dus) représente 30% de votre score. Maintenez les soldes de cartes de crédit en dessous de 30% des limites, idéalement en dessous de 10%. Remboursez les soldes plutôt que de déplacer la dette. Une utilisation élevée signale un stress financier même si vous payez à temps.

La durée de l'historique de crédit contribue à 15%. Gardez les anciens comptes ouverts même si vous ne les utilisez pas, car ils établissent la profondeur de votre historique de crédit. L'âge moyen de vos comptes compte considérablement.

Le mix de crédit représente 10%. Avoir différents types de crédit (cartes de crédit, prêts à tempérament, hypothèque) montre que vous pouvez gérer diverses obligations, bien que vous ne devriez pas contracter de dettes juste pour le mix.

Les nouvelles enquêtes de crédit représentent 10%. Chaque enquête approfondie (lorsque vous demandez un crédit) peut faire chuter votre score de 5 à 10 points temporairement. La recherche de taux pour les hypothèques ou les crédits auto dans les 14-45 jours compte comme une seule enquête, donc consolidez les périodes de recherche.

Pour construire un crédit à partir de zéro, commencez par une carte de crédit sécurisée, devenez utilisateur autorisé sur le compte d'une personne responsable, ou obtenez un prêt de construction de crédit. Effectuez de petits achats et payez intégralement chaque mois.

Surveillez régulièrement votre crédit via des rapports annuels gratuits. Contestez immédiatement toute erreur, car les erreurs sont courantes et peuvent nuire considérablement à votre score.

Évitez les arnaques de réparation de crédit. Personne ne peut légalement supprimer des informations négatives précises, et contester des éléments précis fait perdre du temps et de l'argent.`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Guide du Crédit</h1>
          <p className="text-xl max-w-2xl mx-auto text-primary-foreground/90">
            Ressources éducatives pour vous aider à prendre des décisions d'emprunt éclairées
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-12">
            {articles.map((article, index) => (
              <Card key={index} className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">{article.title}</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  {article.content.split('\n\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-foreground leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CreditGuide;
