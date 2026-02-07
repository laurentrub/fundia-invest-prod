import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Fundia Invest</h3>
            <p className="text-sm text-primary-foreground/80 leading-relaxed mb-4">
              {t('footer.description')}
            </p>
            <div className="flex items-start gap-2 text-sm text-primary-foreground/80">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p>{t('footer.addressLine1')}</p>
                <p>{t('footer.addressLine2')}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">{t('footer.products')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/personal-loan" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('nav.personalLoan')}
                </Link>
              </li>
              <li>
                <Link to="/auto-loan" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('nav.autoLoan')}
                </Link>
              </li>
              <li>
                <Link to="/home-improvement" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('nav.homeImprovement')}
                </Link>
              </li>
              <li>
                <Link to="/consolidation" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('nav.consolidation')}
                </Link>
              </li>
              <li>
                <Link to="/business-loan" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('nav.businessLoan')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">{t('footer.resources')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/resources/glossary" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('footer.glossary')}
                </Link>
              </li>
              <li>
                <Link to="/resources/guide" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('footer.creditGuide')}
                </Link>
              </li>
              <li>
                <Link to="/resources/faq" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/60">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
