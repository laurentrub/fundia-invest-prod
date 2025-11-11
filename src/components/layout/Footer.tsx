import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Privat Equity</h3>
            <p className="text-sm text-primary-foreground/80">
              Votre partenaire de confiance pour des solutions de crédit rapides, transparentes et sécurisées.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Produits de crédit</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/personal-loan" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Prêt personnel
                </Link>
              </li>
              <li>
                <Link to="/auto-loan" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Crédit auto
                </Link>
              </li>
              <li>
                <Link to="/home-improvement" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Crédit travaux
                </Link>
              </li>
              <li>
                <Link to="/consolidation" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Rachat de crédit
                </Link>
              </li>
              <li>
                <Link to="/business-loan" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Prêt entreprise
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Ressources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/resources/glossary" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Glossaire du crédit
                </Link>
              </li>
              <li>
                <Link to="/resources/guide" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Guide du crédit
                </Link>
              </li>
              <li>
                <Link to="/resources/faq" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Entreprise</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/60">
          <p>&copy; {currentYear} Privat Equity. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
