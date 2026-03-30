import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TourDB } from '@/lib/db';
import type { Tour } from '@/types';

interface HeroProps {
  onNavigate: (page: 'home' | 'tour' | 'booking' | 'admin' | 'search', params?: Record<string, string>) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Tour[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search suggestions
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = TourDB.search(searchQuery).slice(0, 5);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      setTimeout(() => {
        onNavigate('search', { query: searchQuery });
        setIsSearching(false);
      }, 300);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (tour: Tour) => {
    onNavigate('tour', { slug: tour.slug });
  };

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920&h=1080&fit=crop')`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
            Tour guides and tours around the world!
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg text-white/90 drop-shadow-md">
            Enter the destination
          </p>

          {/* Search Container */}
          <div 
            ref={searchRef}
            className="relative max-w-2xl mx-auto mt-8"
          >
            <div className="bg-white rounded-xl shadow-2xl p-2 flex items-center gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder='For instance, "Florence"'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 h-12 border-0 bg-transparent text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
                className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </Button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {suggestions.map((tour) => (
                  <button
                    key={tour.id}
                    onClick={() => handleSuggestionClick(tour)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <img 
                      src={tour.heroImage} 
                      alt={tour.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{tour.title}</p>
                      <p className="text-sm text-gray-500">{tour.destination}, {tour.country}</p>
                    </div>
                  </button>
                ))}
                <button
                  onClick={handleSearch}
                  className="w-full px-4 py-3 text-center text-orange-500 font-medium hover:bg-orange-50 transition-colors border-t"
                >
                  See all results for "{searchQuery}"
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
