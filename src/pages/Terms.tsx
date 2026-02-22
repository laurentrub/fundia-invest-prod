import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Conditions Générales d'Utilisation (CGU)</h1>
          <p className="text-xl max-w-2xl mx-auto text-primary-foreground/90">
            Fundia Invest — Financement Civil, Professionnel & Rachat de Crédit
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* CGU Générales */}
          <Card className="p-8 mb-6">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-foreground mb-6 border-b pb-3">CGU Générales</h2>

              <h3 className="text-xl font-bold text-foreground mb-4">1. Objet</h3>
              <p className="text-foreground leading-relaxed mb-6">
                Les présentes Conditions Générales d'Utilisation (ci-après les « CGU ») définissent les modalités d'accès et d'utilisation de la plateforme <strong>Fundia Invest</strong>.
              </p>
              <p className="text-foreground leading-relaxed mb-6">
                Fundia Invest propose des services de mise en relation, de structuration juridique et d'accompagnement documentaire relatifs à des opérations de financement civil et professionnel, ainsi qu'un service d'orientation en matière de rachat de crédit.
              </p>

              <h3 className="text-xl font-bold text-foreground mb-4">2. Positionnement de Fundia Invest</h3>
              <p className="text-foreground leading-relaxed mb-3">
                Fundia Invest agit selon les cas comme :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li>plateforme de mise en relation,</li>
                <li>prestataire de structuration contractuelle,</li>
                <li>assistant documentaire,</li>
                <li>service d'orientation.</li>
              </ul>
              <p className="text-foreground leading-relaxed mb-3">
                Fundia Invest <strong>n'est pas</strong>, sauf mention expresse contraire :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li>un établissement de crédit,</li>
                <li>un prêteur,</li>
                <li>un emprunteur,</li>
                <li>un garant,</li>
                <li>un assureur.</li>
              </ul>

              <h3 className="text-xl font-bold text-foreground mb-4">3. Absence de détention des fonds</h3>
              <p className="text-foreground leading-relaxed mb-6">
                Les fonds relatifs aux opérations de financement ne transitent pas par Fundia Invest, sauf évolution réglementaire ultérieure et obtention des agréments requis.
              </p>

              <h3 className="text-xl font-bold text-foreground mb-4">4. Responsabilité</h3>
              <p className="text-foreground leading-relaxed mb-3">
                Fundia Invest n'assume aucune responsabilité quant :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li>à l'octroi effectif d'un financement,</li>
                <li>à la solvabilité des parties,</li>
                <li>à l'issue des opérations de rachat ou de financement.</li>
              </ul>

              <h3 className="text-xl font-bold text-foreground mb-4">5. Droit applicable</h3>
              <p className="text-foreground leading-relaxed mb-6">
                Les présentes CGU sont soumises au <strong>droit français</strong>.
              </p>
            </div>
          </Card>

          {/* Annexe B — Financement Professionnel */}
          <Card className="p-8 mb-6">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-foreground mb-6 border-b pb-3">Annexe B — Financement Professionnel</h2>

              <h3 className="text-xl font-bold text-foreground mb-4">B.1. Champ d'application</h3>
              <p className="text-foreground leading-relaxed mb-3">
                La présente annexe s'applique aux opérations de financement professionnel, incluant notamment :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li>prêts entre investisseurs privés et professionnels,</li>
                <li>financements d'entreprises, indépendants ou sociétés,</li>
                <li>opérations assorties de garanties professionnelles.</li>
              </ul>
              <p className="text-foreground leading-relaxed mb-6">
                Ces opérations sont conclues hors du champ du crédit à la consommation.
              </p>

              <h3 className="text-xl font-bold text-foreground mb-4">B.2. Rôle renforcé de Fundia Invest</h3>
              <p className="text-foreground leading-relaxed mb-3">
                Dans le cadre du financement professionnel, Fundia Invest peut :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li>structurer les modalités juridiques du financement,</li>
                <li>proposer des modèles contractuels adaptés aux besoins professionnels,</li>
                <li>accompagner la formalisation des garanties,</li>
                <li>faciliter les échanges entre les parties.</li>
              </ul>
              <p className="text-foreground leading-relaxed mb-6">
                Fundia Invest n'intervient pas dans la décision d'investissement et ne fournit aucun conseil financier personnalisé.
              </p>

              <h3 className="text-xl font-bold text-foreground mb-4">B.3. Contrats</h3>
              <p className="text-foreground leading-relaxed mb-6">
                Les contrats de financement professionnel sont générés par la Plateforme sur la base des informations fournies par les parties. Ils sont conclus directement entre investisseurs et bénéficiaires du financement.
              </p>

              <h3 className="text-xl font-bold text-foreground mb-4">B.4. Garanties</h3>
              <p className="text-foreground leading-relaxed mb-3">
                Les garanties applicables aux financements professionnels sont définies librement entre les parties et peuvent inclure notamment :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li>caution personnelle ou solidaire,</li>
                <li>nantissement,</li>
                <li>gage,</li>
                <li>sûretés professionnelles.</li>
              </ul>
              <p className="text-foreground leading-relaxed mb-6">
                Fundia Invest n'accorde aucune garantie et n'en assure pas l'exécution.
              </p>
            </div>
          </Card>

          {/* Annexe C — Rachat de Crédit */}
          <Card className="p-8 mb-6">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-foreground mb-6 border-b pb-3">Annexe C — Rachat de Crédit</h2>

              <h3 className="text-xl font-bold text-foreground mb-4">C.1. Nature du service</h3>
              <p className="text-foreground leading-relaxed mb-3">
                Fundia Invest propose un service d'accompagnement et d'orientation en matière de rachat de crédit. Ce service peut inclure :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li>la collecte d'informations financières,</li>
                <li>l'analyse de l'éligibilité,</li>
                <li>la mise en relation avec des partenaires spécialisés ou investisseurs qualifiés.</li>
              </ul>

              <h3 className="text-xl font-bold text-foreground mb-4">C.2. Absence de décision et d'engagement</h3>
              <p className="text-foreground leading-relaxed mb-3">
                Fundia Invest :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li>ne prend aucune décision d'octroi,</li>
                <li>ne garantit pas l'obtention d'un rachat de crédit,</li>
                <li>n'intervient pas comme établissement de crédit.</li>
              </ul>
              <p className="text-foreground leading-relaxed mb-6">
                Les opérations de rachat sont conclues directement entre les utilisateurs et les partenaires concernés.
              </p>

              <h3 className="text-xl font-bold text-foreground mb-4">C.3. Évolution réglementaire</h3>
              <p className="text-foreground leading-relaxed mb-3">
                En cas d'évolution de l'activité vers une intermédiation réglementée, Fundia Invest s'engage à :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li>obtenir les agréments requis,</li>
                <li>adapter ses CGU et documents contractuels,</li>
                <li>informer les utilisateurs.</li>
              </ul>

              <h3 className="text-xl font-bold text-foreground mb-4">C.4. Responsabilité</h3>
              <p className="text-foreground leading-relaxed">
                Fundia Invest ne saurait être tenue responsable des conditions, taux, délais ou refus relatifs aux opérations de rachat de crédit conclues en dehors de la Plateforme.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
