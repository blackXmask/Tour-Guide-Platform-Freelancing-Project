import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Users, ArrowLeft, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TourDB } from '@/lib/db';
import type { Tour } from '@/types';

interface SearchResultsProps {
  query: string;
  onNavigate: (page: 'home' | 'tour' | 'booking' | 'admin' | 'search', params?: Record<string, string>) => void;
}

const categoryColors: Record<string, string> = {
  walking: 'bg-blue-100 text-blue-700',
  nature: 'bg-green-100 text-green-700',
  history: 'bg-amber-100 text-amber-700',
  food: 'bg-orange-100 text-orange-700',
  adventure: 'bg-purple-100 text-purple-700',
  photography: 'bg-pink-100 text-pink-700',
  cultural: 'bg-indigo-100 text-indigo-700',
  extreme: 'bg-red-100 text-red-700',
  hiking: 'bg-teal-100 text-teal-700',
};

export function SearchResults({ query, onNavigate }: SearchResultsProps) {
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    setSearchQuery(query);
    performSearch(query);
  }, [query]);

  const performSearch = (searchTerm: string) => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      let tours;
      if (!searchTerm || searchTerm.trim() === '') {
        tours = TourDB.getAll();
      } else {
        tours = TourDB.search(searchTerm);
      }
      
      if (selectedCategory) {
        tours = tours.filter(t => t.category === selectedCategory);
      }
      
      setResults(tours);
      setLoading(false);
    }, 300);
  };

  const handleSearch = () => {
    performSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
    setTimeout(() => performSearch(searchQuery), 0);
  };

  const formatDuration = (hours: number, days?: number) => {
    if (days) return `${days} days`;
    if (hours >= 24) return `${Math.floor(hours / 24)} days`;
    return `${hours} hours`;
  };

  const categories = [...new Set(results.map(t => t.category))];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center text-gray-600 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back
            </button>
            
            {/* Search Bar */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search tours, destinations, or countries..."
                  className="pl-10 h-12"
                />
              </div>
              <Button onClick={handleSearch} className="h-12 px-6 bg-orange-500 hover:bg-orange-600">
                Search
              </Button>
            </div>
          </div>

          {/* Category Filters */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <button
                onClick={() => handleCategoryFilter(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === null
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors capitalize ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Count */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {loading ? 'Searching...' : `${results.length} tour${results.length !== 1 ? 's' : ''} found`}
          </h1>
          {query && (
            <p className="text-gray-500 mt-1">
              for "{query}"
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No tours found</h2>
            <p className="text-gray-500 mb-6">Try adjusting your search terms or browse all tours</p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                performSearch('');
              }}
              variant="outline"
            >
              <X className="w-4 h-4 mr-2" />
              Clear filters
            </Button>
          </div>
        )}

        {/* Results Grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((tour, index) => (
              <article
                key={tour.id}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => onNavigate('tour', { slug: tour.slug })}
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={tour.heroImage}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={`${categoryColors[tour.category] || 'bg-gray-100 text-gray-700'} capitalize`}>
                      {tour.category}
                    </Badge>
                  </div>
                  {/* Location Badge */}
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {tour.destination}, {tour.country}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-500 transition-colors">
                    {tour.title}
                  </h3>

                  {/* Guide */}
                  <div className="flex items-center gap-2">
                    <img
                      src={tour.guide.avatar}
                      alt={tour.guide.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-600">{tour.guide.name}</span>
                  </div>

                  {/* Info Row */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(tour.durationHours, tour.durationDays)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>Up to {tour.maxGroupSize}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">
                        ${tour.basePrice.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        USD for group of {tour.minGroupSize}-{tour.maxGroupSize}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
