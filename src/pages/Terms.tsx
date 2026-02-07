import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Conditions d'Utilisation</h1>
          <p className="text-xl max-w-2xl mx-auto text-primary-foreground/90">
            Termes et conditions régissant l'utilisation de nos services
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="p-8 mb-6">
            <p className="text-sm text-muted-foreground mb-6">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptation des conditions</h2>
              <p className="text-foreground leading-relaxed mb-6">
                En accédant et en utilisant le site web de Fundia Invest (le "Site") et nos services, vous acceptez 
                d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas 
                utiliser notre Site ou nos services.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">2. Description du service</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Fundia Invest est une plateforme de mise en relation qui connecte les emprunteurs potentiels avec 
                des partenaires financiers agréés. Nous ne sommes pas nous-mêmes un prêteur et ne prenons pas de 
                décisions de crédit. Notre rôle est de faciliter la mise en relation et de présenter des offres 
                adaptées à votre profil.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">3. Conditions d'éligibilité</h2>
              <p className="text-foreground leading-relaxed mb-3">
                Pour utiliser nos services, vous devez :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li>Être âgé d'au moins 18 ans</li>
                <li>Résider en France métropolitaine ou dans les DOM-TOM</li>
                <li>Avoir la capacité juridique de contracter</li>
                <li>Fournir des informations exactes et complètes</li>
                <li>Ne pas utiliser le service à des fins frauduleuses ou illégales</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">4. Processus de demande</h2>
              <p className="text-foreground leading-relaxed mb-3">
                Lorsque vous soumettez une demande via notre plateforme :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li>Nous analysons votre profil et le transmettons à nos partenaires financiers</li>
                <li>Les partenaires évaluent votre demande selon leurs propres critères</li>
                <li>Vous recevez des offres personnalisées si vous êtes éligible</li>
                <li>Vous êtes libre d'accepter ou de refuser toute offre proposée</li>
                <li>L'acceptation d'une offre crée un contrat direct entre vous et le prêteur</li>
              </ul>
              <p className="text-foreground leading-relaxed mb-6">
                Une demande via notre plateforme ne garantit pas l'obtention d'un crédit. Les décisions finales 
                appartiennent aux établissements prêteurs.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">5. Informations fournies</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Vous vous engagez à fournir des informations exactes, complètes et à jour. La fourniture d'informations 
                fausses ou trompeuses peut entraîner le rejet de votre demande, la résiliation de nos services et 
                d'éventuelles poursuites légales. Vous êtes responsable de maintenir la confidentialité de vos 
                identifiants de connexion.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">6. Frais et commissions</h2>
              <p className="text-foreground leading-relaxed mb-6">
                L'utilisation de notre plateforme de mise en relation est <strong>gratuite pour les emprunteurs</strong>. 
                Nous ne facturons aucun frais de dossier, d'inscription ou de traitement. Nous recevons une commission 
                de nos partenaires financiers en cas de mise en relation réussie. Les frais éventuels liés au crédit 
                lui-même (frais de dossier, intérêts, etc.) sont définis par le prêteur et clairement indiqués dans 
                l'offre de crédit.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">7. Propriété intellectuelle</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Tous les contenus du Site (textes, images, logos, design, code source) sont la propriété de Fundia 
                Invest ou de ses concédants de licence et sont protégés par les lois sur la propriété intellectuelle.
                Vous ne pouvez pas reproduire, distribuer, modifier ou utiliser ces contenus sans notre autorisation 
                écrite préalable.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">8. Limitations de responsabilité</h2>
              <p className="text-foreground leading-relaxed mb-3">
                Fundia Invest ne peut être tenu responsable de :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li>Les décisions de crédit prises par les établissements prêteurs</li>
                <li>Les termes et conditions des offres de crédit proposées</li>
                <li>Les retards ou interruptions de service indépendants de notre volonté</li>
                <li>Les dommages indirects ou consécutifs résultant de l'utilisation de nos services</li>
                <li>Les pertes financières liées aux décisions d'emprunt</li>
              </ul>
              <p className="text-foreground leading-relaxed mb-6">
                Nous nous efforçons de maintenir l'exactitude des informations sur le Site, mais ne garantissons pas 
                qu'elles soient toujours complètes, exactes ou à jour.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">9. Comportement interdit</h2>
              <p className="text-foreground leading-relaxed mb-3">
                Vous vous engagez à ne pas :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li>Utiliser le Site à des fins frauduleuses ou illégales</li>
                <li>Tenter d'accéder à des zones non autorisées du Site</li>
                <li>Interférer avec le fonctionnement normal du Site</li>
                <li>Transmettre des virus, malwares ou autres codes nuisibles</li>
                <li>Collecter des informations sur d'autres utilisateurs</li>
                <li>Usurper l'identité d'une autre personne</li>
                <li>Soumettre de multiples demandes frauduleuses</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">10. Résiliation</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Nous nous réservons le droit de suspendre ou de résilier votre accès à nos services à tout moment, 
                sans préavis, en cas de violation de ces conditions ou de comportement inapproprié. Vous pouvez 
                également demander la fermeture de votre compte à tout moment en nous contactant.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">11. Protection des données</h2>
              <p className="text-foreground leading-relaxed mb-6">
                L'utilisation de vos données personnelles est régie par notre Politique de Confidentialité. En 
                utilisant nos services, vous consentez à la collecte et au traitement de vos données conformément 
                à cette politique et au RGPD.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">12. Modifications des conditions</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. Les modifications 
                entrent en vigueur dès leur publication sur le Site. Votre utilisation continue des services après 
                la publication des modifications constitue votre acceptation des nouvelles conditions.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">13. Loi applicable et juridiction</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Ces conditions sont régies par le droit français. Tout litige relatif à l'interprétation ou 
                l'exécution de ces conditions sera de la compétence exclusive des tribunaux français. Avant toute 
                action en justice, nous vous encourageons à nous contacter pour tenter de résoudre le différend 
                à l'amiable.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">14. Divisibilité</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Si une disposition de ces conditions est jugée invalide ou inapplicable, les autres dispositions 
                resteront en vigueur. La disposition invalide sera remplacée par une disposition valide qui se 
                rapproche le plus de l'intention de la disposition originale.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">15. Contact</h2>
              <p className="text-foreground leading-relaxed mb-3">
                Pour toute question concernant ces conditions d'utilisation :
              </p>
              <ul className="list-none space-y-2 text-foreground">
                <li><strong>Email :</strong> legal@fundia-invest.com</li>
                <li><strong>Adresse :</strong> Fundia Invest, 5588 Rue Frontenac, Montréal, QC H2H 2L9, Canada</li>
                <li><strong>Téléphone :</strong> 01 23 45 67 89</li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
