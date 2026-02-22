import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";

const MentionsLegales = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Mentions Légales</h1>
          <p className="text-xl max-w-2xl mx-auto text-primary-foreground/90">
            Informations légales relatives à la plateforme Fundia Invest
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="p-8 mb-6">
            <div className="prose prose-lg max-w-none">

              <h2 className="text-2xl font-bold text-foreground mb-4">1. Éditeur du site</h2>
              <p className="text-foreground leading-relaxed mb-3">
                Le site <strong>fundia-invest.com</strong> (ci-après le « Site ») est édité par :
              </p>
              <ul className="list-none space-y-2 text-foreground mb-6">
                <li><strong>Nom / Raison sociale :</strong> Fundia Invest</li>
                <li><strong>Propriétaire :</strong> Martin Pablo</li>
                <li><strong>SIREN :</strong> 990 555 997</li>
                <li><strong>Adresse :</strong> 5588 Rue Frontenac, Montréal, QC H2H 2L9, Canada</li>
                <li><strong>Email :</strong> contact@fundia-invest.com</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">2. Hébergement</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Le Site est hébergé par des services d'infrastructure cloud. Les données sont stockées dans des centres de données sécurisés conformes aux normes en vigueur.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">3. Propriété intellectuelle</h2>
              <p className="text-foreground leading-relaxed mb-6">
                L'ensemble des éléments composant le Site (textes, images, graphismes, logo, icônes, logiciels, base de données, etc.) est la propriété exclusive de Fundia Invest ou de ses partenaires. Toute reproduction, représentation, modification, publication, adaptation ou exploitation de tout ou partie des éléments du Site, quel que soit le moyen ou le procédé utilisé, est interdite sans l'autorisation écrite préalable de Fundia Invest.
              </p>
              <p className="text-foreground leading-relaxed mb-6">
                Toute exploitation non autorisée du Site ou de l'un quelconque des éléments qu'il contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de la Propriété Intellectuelle.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">4. Données personnelles</h2>
              <p className="text-foreground leading-relaxed mb-3">
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition sur vos données personnelles.
              </p>
              <p className="text-foreground leading-relaxed mb-3">
                Les données collectées via le Site sont traitées dans le cadre des finalités suivantes :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li>traitement et suivi des demandes de financement,</li>
                <li>mise en relation entre les parties,</li>
                <li>gestion de la relation client,</li>
                <li>respect des obligations légales et réglementaires.</li>
              </ul>
              <p className="text-foreground leading-relaxed mb-6">
                Pour exercer vos droits ou pour toute question relative à vos données personnelles, contactez-nous à : <strong>contact@fundia-invest.com</strong>.
              </p>
              <p className="text-foreground leading-relaxed mb-6">
                Pour plus de détails, consultez notre <a href="/privacy" className="text-primary hover:underline font-medium">Politique de Confidentialité</a>.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">5. Cookies</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Le Site peut utiliser des cookies nécessaires à son fonctionnement technique, ainsi que des cookies d'analyse pour améliorer l'expérience utilisateur. L'utilisateur peut configurer son navigateur pour refuser les cookies. Pour plus de détails, consultez notre Politique de Confidentialité.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">6. Limitation de responsabilité</h2>
              <p className="text-foreground leading-relaxed mb-3">
                Fundia Invest s'efforce de fournir des informations aussi précises que possible sur le Site. Toutefois, Fundia Invest ne saurait être tenue responsable :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li>des omissions, inexactitudes ou erreurs contenues dans les informations diffusées,</li>
                <li>des dommages résultant d'une intrusion frauduleuse d'un tiers,</li>
                <li>de l'interruption temporaire ou permanente du Site pour des raisons de maintenance ou tout autre motif.</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">7. Liens hypertextes</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Le Site peut contenir des liens vers d'autres sites internet. Fundia Invest n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou à leur politique de confidentialité.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">8. Droit applicable et juridiction compétente</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Les présentes mentions légales sont soumises au <strong>droit français</strong>. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">9. Contact</h2>
              <p className="text-foreground leading-relaxed">
                Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter à l'adresse suivante : <strong>contact@fundia-invest.com</strong>.
              </p>

            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MentionsLegales;
