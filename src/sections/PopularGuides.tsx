import { useEffect, useState } from 'react';
import { GuideDB } from '@/lib/db';
import type { TourGuide } from '@/types';

const countryFlags: Record<string, string> = {
  Madagascar: '🇲🇬',
  Finland: '🇫🇮',
  Egypt: '🇪🇬',
  Nepal: '🇳🇵',
  Ethiopia: '🇪🇹',
  USA: '🇺🇸',
  Israel: '🇮🇱',
};

export function PopularGuides() {
  const [guides, setGuides] = useState<TourGuide[]>([]);

  useEffect(() => {
    setGuides(GuideDB.getPopular(6));
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-2xl font-bold text-gray-900 tracking-wide uppercase text-center mb-10">
          Popular Tour Guides
        </h2>

        {/* Guides Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {guides.map((guide, index) => (
            <article
              key={guide.id}
              className="group text-center animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Avatar */}
              <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 mb-3 overflow-hidden rounded-lg">
                <img
                  src={guide.avatar}
                  alt={guide.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Name */}
              <h3 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-orange-500 transition-colors">
                {guide.name}
              </h3>

              {/* Country */}
              <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                <span>{countryFlags[guide.country] || '🌍'}</span>
                <span>{guide.country}</span>
              </div>

              {/* Rating */}
              {guide.rating && (
                <div className="mt-2 text-xs text-gray-400">
                  ⭐ {guide.rating} ({guide.reviewCount} reviews)
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
