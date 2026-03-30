import { useEffect, useState } from 'react';
import { TourDB } from '@/lib/db';

interface PopularDestinationsProps {
  onNavigate: (page: 'home' | 'tour' | 'booking' | 'admin' | 'search', params?: Record<string, string>) => void;
}

interface Destination {
  name: string;
  country: string;
  continent: string;
  count: number;
}

export function PopularDestinations({ onNavigate }: PopularDestinationsProps) {
  const [europeDestinations, setEuropeDestinations] = useState<Destination[]>([]);
  const [asiaDestinations, setAsiaDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    const tours = TourDB.getAll();
    const destinations = new Map<string, Destination>();

    tours.forEach((tour) => {
      const key = `${tour.destination}-${tour.country}`;
      if (destinations.has(key)) {
        destinations.get(key)!.count++;
      } else {
        destinations.set(key, {
          name: tour.destination,
          country: tour.country,
          continent: tour.continent,
          count: 1,
        });
      }
    });

    const allDestinations = Array.from(destinations.values());
    
    setEuropeDestinations(
      allDestinations
        .filter((d) => d.continent === 'Europe')
        .sort((a, b) => b.count - a.count)
        .slice(0, 16)
    );
    
    setAsiaDestinations(
      allDestinations
        .filter((d) => d.continent === 'Asia')
        .sort((a, b) => b.count - a.count)
        .slice(0, 16)
    );
  }, []);

  const handleDestinationClick = (destination: string) => {
    onNavigate('search', { query: destination });
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-2xl font-bold text-gray-900 tracking-wide uppercase mb-10">
          Popular Destinations
        </h2>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Europe */}
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Europe</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {europeDestinations.map((dest) => (
                <button
                  key={dest.name}
                  onClick={() => handleDestinationClick(dest.name)}
                  className="text-left text-gray-600 hover:text-orange-500 transition-colors text-sm py-1"
                >
                  {dest.name}
                </button>
              ))}
            </div>
          </div>

          {/* Asia */}
          <div className="animate-in fade-in slide-in-bottom-4" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Asia</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {asiaDestinations.map((dest) => (
                <button
                  key={dest.name}
                  onClick={() => handleDestinationClick(dest.name)}
                  className="text-left text-gray-600 hover:text-orange-500 transition-colors text-sm py-1"
                >
                  {dest.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
