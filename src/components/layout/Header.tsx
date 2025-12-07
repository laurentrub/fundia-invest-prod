import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const languages = {
    fr: { name: "Français", flag: "🇫🇷" },
    en: { name: "English", flag: "🇬🇧" },
    de: { name: "Deutsch", flag: "🇩🇪" },
    es: { name: "Español", flag: "🇪🇸" },
    pt: { name: "Português", flag: "🇵🇹" },
    nl: { name: "Nederlands", flag: "🇳🇱" },
    hr: { name: "Hrvatski", flag: "🇭🇷" },
  };

  const currentLang = i18n.language?.split('-')[0] || 'fr';

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const navigation = {
    particuliers: [
      { name: t('nav.personalLoan'), href: "/personal-loan" },
      { name: t('nav.autoLoan'), href: "/auto-loan" },
      { name: t('nav.homeImprovement'), href: "/home-improvement" },
      { name: t('nav.consolidation'), href: "/consolidation" },
    ],
    professionnels: [
      { name: t('nav.businessLoan'), href: "/business-loan" },
      { name: t('nav.cashFlow'), href: "/business-loan" },
      { name: t('nav.equipment'), href: "/business-loan" },
    ],
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-hero rounded-lg">
            <span className="text-lg font-bold text-primary-foreground">PE</span>
          </div>
          <span className="text-xl font-bold text-foreground">Privat Equity</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>{t('nav.particuliers')}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {navigation.particuliers.map((item) => (
                      <li key={item.name}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{item.name}</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>{t('nav.professionnels')}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {navigation.professionnels.map((item) => (
                      <li key={item.name}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{item.name}</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="hidden md:flex md:items-center md:space-x-3">
          <Link to="/project-financing">
            <Button variant="accent" size="default">
              {t('nav.financeProject')}
            </Button>
          </Link>
          
          <Link to="/apply">
            <Button variant="outline">{t('nav.creditRequest')}</Button>
          </Link>
          
          {user && (
            <Link to="/profile">
              <Button variant="outline">{t('nav.myProfile')}</Button>
            </Link>
          )}
          
          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              {t('nav.logout')}
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="ghost">{t('nav.login')}</Button>
            </Link>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <span className="text-xl">{languages[currentLang as keyof typeof languages]?.flag || "🇫🇷"}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {Object.entries(languages).map(([code, { name, flag }]) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => changeLanguage(code)}
                  className="cursor-pointer"
                >
                  <span className="mr-2 text-xl">{flag}</span>
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Open menu</span>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <div className="space-y-4">
              <div>
                <div className="px-3 py-2 text-sm font-semibold text-foreground">{t('nav.particuliers')}</div>
                {navigation.particuliers.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-6 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div>
                <div className="px-3 py-2 text-sm font-semibold text-foreground">{t('nav.professionnels')}</div>
                {navigation.professionnels.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-6 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

            </div>

            <div className="pt-4 space-y-2">
              <Link to="/project-financing" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="accent" size="default" className="w-full">
                  {t('nav.financeProject')}
                </Button>
              </Link>
              
              <Link to="/apply" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="default" className="w-full">
                  {t('nav.creditRequest')}
                </Button>
              </Link>
              
              {user && (
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="default" className="w-full">
                    {t('nav.myProfile')}
                  </Button>
                </Link>
              )}
              
              {user ? (
                <Button variant="ghost" size="default" onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }} className="w-full gap-2">
                  <LogOut className="h-4 w-4" />
                  {t('nav.logout')}
                </Button>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="default" className="w-full">
                    {t('nav.login')}
                  </Button>
                </Link>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="default" className="w-full gap-2">
                    <span className="text-xl">{languages[currentLang as keyof typeof languages]?.flag || "🇫🇷"}</span>
                    {languages[currentLang as keyof typeof languages]?.name || "Français"}
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-[calc(100vw-2rem)]">
                  {Object.entries(languages).map(([code, { name, flag }]) => (
                    <DropdownMenuItem
                      key={code}
                      onClick={() => changeLanguage(code)}
                      className="cursor-pointer"
                    >
                      <span className="mr-2 text-xl">{flag}</span>
                      {name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
