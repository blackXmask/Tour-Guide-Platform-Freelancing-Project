import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/sections/Hero';
import { FeaturesBar } from '@/sections/FeaturesBar';
import { PopularGuides } from '@/sections/PopularGuides';
import { ToursByCountry } from '@/sections/ToursByCountry';
import { PopularDestinations } from '@/sections/PopularDestinations';
import { PopularTours } from '@/sections/PopularTours';
import { CTABanner } from '@/sections/CTABanner';
import { TourDetail } from '@/pages/TourDetail';
import { BookingFlow } from '@/pages/BookingFlow';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { SearchResults } from '@/pages/SearchResults';
import { initializeDatabase } from '@/lib/db';
import { Toaster } from '@/components/ui/sonner';

type Page = 'home' | 'tour' | 'booking' | 'admin' | 'search';
export type AppLanguage = 'en' | 'es' | 'fr' | 'de';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState<AppLanguage>('en');

  useEffect(() => {
    initializeDatabase();
    const storedLanguage = localStorage.getItem('tourbook_language') as AppLanguage | null;
    if (storedLanguage && ['en', 'es', 'fr', 'de'].includes(storedLanguage)) {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tourbook_language', language);
  }, [language]);

  const navigateTo = (page: Page, params?: Record<string, string>) => {
    setCurrentPage(page);
    if (params) {
      setPageParams(params);
    } else {
      setPageParams({});
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'tour':
        return <TourDetail 
          slug={pageParams.slug || ''} 
          onNavigate={navigateTo}
        />;
      case 'booking':
        return <BookingFlow 
          tourId={pageParams.tourId || ''}
          onNavigate={navigateTo}
        />;
      case 'admin':
        return <AdminDashboard onNavigate={navigateTo} mode={pageParams.mode} />;
      case 'search':
        return <SearchResults 
          query={pageParams.query || ''}
          onNavigate={navigateTo}
        />;
      case 'home':
      default:
        return (
          <>
            <Hero onNavigate={navigateTo} />
            <FeaturesBar />
            <section id="tours-section">
              <PopularTours onNavigate={navigateTo} />
            </section>
            <PopularGuides />
            <ToursByCountry onNavigate={navigateTo} />
            <section id="destinations-section">
              <PopularDestinations onNavigate={navigateTo} />
            </section>
            <section id="about-section">
              <CTABanner onNavigate={navigateTo} language={language} />
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onNavigate={navigateTo}
        currentPage={currentPage}
        language={language}
        onLanguageChange={setLanguage}
      />
      <main>
        {renderPage()}
      </main>
      <Footer onNavigate={navigateTo} />
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
