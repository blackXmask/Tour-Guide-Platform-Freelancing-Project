import { useEffect, useState } from 'react';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TourDB } from '@/lib/db';
import type { Tour } from '@/types';

interface PopularToursProps {
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

export function PopularTours({ onNavigate }: PopularToursProps) {
  const [tours, setTours] = useState<Tour[]>([]);

  useEffect(() => {
    setTours(TourDB.getPopular(6));
  }, []);

  const formatDuration = (hours: number, days?: number) => {
    if (days) return `${days} days`;
    if (hours >= 24) return `${Math.floor(hours / 24)} days`;
    return `${hours} hours`;
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-wide uppercase">
            Popular Tours
          </h2>
          <Button 
            variant="ghost" 
            className="text-orange-500 hover:text-orange-600 group"
            onClick={() => onNavigate('search', { query: '' })}
          >
            View all
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour, index) => (
            <article
              key={tour.id}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
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
      </div>
    </section>
  );
}
