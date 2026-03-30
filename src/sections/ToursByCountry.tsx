import { useEffect, useState } from 'react';
import { TourDB } from '@/lib/db';

interface ToursByCountryProps {
  onNavigate: (page: 'home' | 'tour' | 'booking' | 'admin' | 'search', params?: Record<string, string>) => void;
}

const continentIcons: Record<string, string> = {
  Europe: '🏰',
  Asia: '🏯',
  'North America': '🗽',
  'South America': '🌴',
  Africa: '🦁',
  Oceania: '🦘',
};

export function ToursByCountry({ onNavigate }: ToursByCountryProps) {
  const [groupedTours, setGroupedTours] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const tours = TourDB.getAll();
    const grouped: Record<string, Set<string>> = {};

    tours.forEach((tour) => {
      if (!grouped[tour.continent]) {
        grouped[tour.continent] = new Set();
      }
      grouped[tour.continent].add(tour.country);
    });

    // Convert sets to sorted arrays
    const result: Record<string, string[]> = {};
    Object.entries(grouped).forEach(([continent, countries]) => {
      result[continent] = Array.from(countries).sort();
    });

    setGroupedTours(result);
  }, []);

  const handleCountryClick = (country: string) => {
    onNavigate('search', { query: country });
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-2xl font-bold text-gray-900 tracking-wide uppercase mb-10">
          Tours in Different Countries
        </h2>

        {/* Continents */}
        <div className="space-y-8">
          {Object.entries(groupedTours).map(([continent, countries]) => (
            <div key={continent} className="animate-in fade-in slide-in-from-bottom-4">
              {/* Continent Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{continentIcons[continent] || '🌍'}</span>
                <h3 className="text-lg font-semibold text-gray-900">{continent}</h3>
              </div>

              {/* Countries */}
              <div className="flex flex-wrap gap-x-1 gap-y-2">
                {countries.map((country, index) => (
                  <span key={country}>
                    <button
                      onClick={() => handleCountryClick(country)}
                      className="text-orange-500 hover:text-orange-600 hover:underline transition-colors"
                    >
                      {country}
                    </button>
                    {index < countries.length - 1 && (
                      <span className="text-gray-400">, </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
