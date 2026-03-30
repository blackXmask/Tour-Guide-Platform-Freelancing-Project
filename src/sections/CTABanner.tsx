import type { AppLanguage } from '@/App';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CTABannerProps {
  onNavigate: (page: 'home' | 'tour' | 'booking' | 'admin' | 'search', params?: Record<string, string>) => void;
  language: AppLanguage;
}

const ctaTranslations: Record<AppLanguage, { title: string; subtitle: string; button: string }> = {
  en: {
    title: 'Are you a tour guide?',
    subtitle: 'Then list your tours here!',
    button: 'Sign up as a tour guide',
  },
  es: {
    title: 'Eres guia turistico?',
    subtitle: 'Entonces publica tus tours aqui!',
    button: 'Registrate como guia turistico',
  },
  fr: {
    title: 'Etes-vous guide touristique?',
    subtitle: 'Ajoutez vos circuits ici !',
    button: 'Inscrivez-vous comme guide',
  },
  de: {
    title: 'Bist du Reisefuhrer?',
    subtitle: 'Dann liste hier deine Touren auf!',
    button: 'Als Reisefuhrer registrieren',
  },
};

export function CTABanner({ onNavigate, language }: CTABannerProps) {
  const t = ctaTranslations[language];
  return (
    <section className="py-16 bg-gradient-to-r from-orange-500 via-orange-400 to-blue-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">
          {t.title}
        </h2>
        <p className="text-xl text-white/90 mb-8">
          {t.subtitle}
        </p>
        <Button
          onClick={() => onNavigate('admin', { mode: 'signup' })}
          size="lg"
          className="bg-white text-orange-500 hover:bg-gray-100 hover:scale-105 transition-all duration-200 font-semibold px-8"
        >
          {t.button}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </section>
  );
}
