import { useState, useEffect } from 'react';
import { Menu, X, Globe, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AppLanguage } from '@/App';

interface HeaderProps {
  onNavigate: (page: 'home' | 'tour' | 'booking' | 'admin' | 'search', params?: Record<string, string>) => void;
  currentPage?: string;
  language: AppLanguage;
  onLanguageChange: (language: AppLanguage) => void;
}

const languageLabels: Record<AppLanguage, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
};

const navTranslations: Record<AppLanguage, { destinations: string; tours: string; about: string; contact: string; forGuides: string; signIn: string }> = {
  en: { destinations: 'Destinations', tours: 'Tours', about: 'About', contact: 'Contact', forGuides: 'For Tour Guides', signIn: 'Sign in' },
  es: { destinations: 'Destinos', tours: 'Tours', about: 'Acerca de', contact: 'Contacto', forGuides: 'Para guias', signIn: 'Iniciar sesion' },
  fr: { destinations: 'Destinations', tours: 'Circuits', about: 'A propos', contact: 'Contact', forGuides: 'Pour les guides', signIn: 'Se connecter' },
  de: { destinations: 'Reiseziele', tours: 'Touren', about: 'Uber uns', contact: 'Kontakt', forGuides: 'Fur Reisefuhrer', signIn: 'Anmelden' },
};

export function Header({ onNavigate, language, onLanguageChange }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateToSection = (sectionId: string) => {
    onNavigate('home');
    // Wait a tick so home content is mounted before scrolling.
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 120);
  };

  const t = navTranslations[language];
  const navLinks = [
    { label: t.destinations, action: () => navigateToSection('destinations-section') },
    { label: t.tours, action: () => navigateToSection('tours-section') },
    { label: t.about, action: () => navigateToSection('about-section') },
    { label: t.contact, action: () => navigateToSection('contact-section') },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white shadow-md'
          : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-1"
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
              TourBook
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-150"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span>{languageLabels[language]}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onLanguageChange('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLanguageChange('es')}>Spanish</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLanguageChange('fr')}>French</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLanguageChange('de')}>German</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate('admin')}
            >
              {t.forGuides}
            </Button>

            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center gap-1"
              onClick={() => onNavigate('admin')}
            >
              <User className="w-4 h-4" />
              <span>{t.signIn}</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg transition-all duration-300 ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <nav className="px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => {
                link.action();
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              {link.label}
            </button>
          ))}
          <hr className="my-2" />
          <button
            onClick={() => {
              onNavigate('admin');
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            {t.forGuides}
          </button>
          <button
            onClick={() => {
              onNavigate('admin');
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            {t.signIn}
          </button>
        </nav>
      </div>
    </header>
  );
}
