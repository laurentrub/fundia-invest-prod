import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Politique de Confidentialité</h1>
          <p className="text-xl max-w-2xl mx-auto text-primary-foreground/90">
            Comment nous collectons, utilisons et protégeons vos données personnelles
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
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Fundia Invest ("nous", "notre" ou "nos") s'engage à protéger et à respecter votre vie privée. 
                Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et 
                protégeons vos informations personnelles lorsque vous utilisez notre site web et nos services.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">2. Informations que nous collectons</h2>
              <p className="text-foreground leading-relaxed mb-3">
                Nous collectons plusieurs types d'informations pour vous fournir et améliorer nos services :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li><strong>Informations d'identification :</strong> Nom, prénom, date de naissance, adresse email, numéro de téléphone, adresse postale</li>
                <li><strong>Informations financières :</strong> Revenus, situation professionnelle, informations bancaires, historique de crédit</li>
                <li><strong>Données de navigation :</strong> Adresse IP, type de navigateur, pages visitées, durée des visites</li>
                <li><strong>Documents justificatifs :</strong> Pièce d'identité, justificatifs de revenus, relevés bancaires</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">3. Comment nous utilisons vos informations</h2>
              <p className="text-foreground leading-relaxed mb-3">
                Nous utilisons les informations collectées pour :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li>Traiter vos demandes de crédit et évaluer votre éligibilité</li>
                <li>Vous mettre en relation avec nos partenaires financiers</li>
                <li>Communiquer avec vous concernant votre demande</li>
                <li>Améliorer nos services et votre expérience utilisateur</li>
                <li>Respecter nos obligations légales et réglementaires</li>
                <li>Prévenir la fraude et assurer la sécurité de notre plateforme</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">4. Partage de vos informations</h2>
              <p className="text-foreground leading-relaxed mb-3">
                Nous pouvons partager vos informations avec :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li><strong>Partenaires financiers :</strong> Lorsque vous acceptez une offre de crédit, nous partageons vos informations avec l'établissement prêteur</li>
                <li><strong>Prestataires de services :</strong> Pour l'hébergement, l'analyse de données, la vérification d'identité et la prévention de la fraude</li>
                <li><strong>Autorités légales :</strong> Si requis par la loi ou pour protéger nos droits</li>
              </ul>
              <p className="text-foreground leading-relaxed mb-6">
                Nous ne vendons jamais vos données personnelles à des tiers.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">5. Sécurité de vos données</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour 
                protéger vos informations personnelles contre tout accès non autorisé, modification, divulgation 
                ou destruction. Cela inclut le cryptage SSL 256 bits, des pare-feu, des contrôles d'accès stricts 
                et une surveillance continue de nos systèmes.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">6. Vos droits (RGPD)</h2>
              <p className="text-foreground leading-relaxed mb-3">
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
                <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> Corriger des données inexactes ou incomplètes</li>
                <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
                <li><strong>Droit à la limitation :</strong> Restreindre le traitement de vos données</li>
                <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
                <li><strong>Droit de retrait du consentement :</strong> Retirer votre consentement à tout moment</li>
              </ul>
              <p className="text-foreground leading-relaxed mb-6">
                Pour exercer ces droits, contactez-nous à : privacy@fundia-invest.com
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">7. Cookies et technologies similaires</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Nous utilisons des cookies et des technologies similaires pour améliorer votre expérience, analyser 
                le trafic et personnaliser le contenu. Vous pouvez configurer votre navigateur pour refuser les 
                cookies, mais cela peut affecter certaines fonctionnalités de notre site.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">8. Conservation des données</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services 
                et respecter nos obligations légales. Les données des demandes de crédit sont généralement conservées 
                pendant 5 ans conformément aux exigences réglementaires.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">9. Transferts internationaux</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Vos données sont principalement stockées et traitées au sein de l'Union Européenne. Si nous devons 
                transférer vos données en dehors de l'UE, nous nous assurons que des garanties appropriées sont en 
                place conformément au RGPD.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">10. Modifications de cette politique</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Nous pouvons mettre à jour cette politique de confidentialité périodiquement. Nous vous informerons 
                de tout changement significatif par email ou via une notification sur notre site. Nous vous encourageons 
                à consulter régulièrement cette page pour rester informé.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">11. Contact</h2>
              <p className="text-foreground leading-relaxed mb-3">
                Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles :
              </p>
              <ul className="list-none space-y-2 text-foreground mb-6">
                <li><strong>Email :</strong> privacy@fundia-invest.com</li>
                <li><strong>Adresse :</strong> Fundia Invest, 5588 Rue Frontenac, Montréal, QC H2H 2L9, Canada</li>
                <li><strong>Téléphone :</strong> 01 23 45 67 89</li>
              </ul>
              <p className="text-foreground leading-relaxed">
                Vous avez également le droit de déposer une plainte auprès de la Commission Nationale de l'Informatique 
                et des Libertés (CNIL) si vous estimez que vos droits n'ont pas été respectés.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;
