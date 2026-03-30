import { useState, useEffect } from 'react';
import { 
  Clock, Users, MapPin, Check, X, Calendar, 
  User, MessageSquare, Info, ChevronRight, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TourDB } from '@/lib/db';
import type { Tour } from '@/types';

interface TourDetailProps {
  slug: string;
  onNavigate: (page: 'home' | 'tour' | 'booking' | 'admin' | 'search', params?: Record<string, string>) => void;
}

const FALLBACK_TOUR_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23f59e0b'/%3E%3Cstop offset='100%25' stop-color='%23f97316'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' fill='white' font-size='48' font-family='Arial, sans-serif' text-anchor='middle' dominant-baseline='middle'%3ETour image unavailable%3C/text%3E%3C/svg%3E";

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

export function TourDetail({ slug, onNavigate }: TourDetailProps) {
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    // Reset gallery selection when switching tours.
    setSelectedImage(0);
    const foundTour = TourDB.getBySlug(slug);
    setTour(foundTour);
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tour not found</h1>
        <p className="text-gray-600 mb-6">The tour you're looking for doesn't exist.</p>
        <Button onClick={() => onNavigate('home')}>
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  const formatDuration = (hours: number, days?: number) => {
    if (days) return `${days} days`;
    if (hours >= 24) return `${Math.floor(hours / 24)} days`;
    return `${hours} hours`;
  };

  const allImages = [tour.heroImage, ...(tour.gallery || [])].filter(
    (img): img is string => typeof img === 'string' && img.trim().length > 0
  );
  const displayImages = allImages.length > 0 ? allImages : [FALLBACK_TOUR_IMAGE];
  const safeSelectedImage = allImages.length
    ? Math.min(selectedImage, allImages.length - 1)
    : 0;

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <button onClick={() => onNavigate('home')} className="hover:text-orange-500 transition-colors">
              Home
            </button>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => onNavigate('search', { query: tour.country })} className="hover:text-orange-500 transition-colors">
              Tours in {tour.country}
            </button>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => onNavigate('search', { query: tour.destination })} className="hover:text-orange-500 transition-colors">
              Tours in {tour.destination}
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 truncate max-w-xs">{tour.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{tour.title}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge className={`${categoryColors[tour.category]} capitalize`}>
                  {tour.category}
                </Badge>
                {tour.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={displayImages[safeSelectedImage] || FALLBACK_TOUR_IMAGE}
                  alt={tour.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== FALLBACK_TOUR_IMAGE) {
                      target.src = FALLBACK_TOUR_IMAGE;
                    }
                  }}
                />
              </div>
              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-orange-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${tour.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== FALLBACK_TOUR_IMAGE) {
                          target.src = FALLBACK_TOUR_IMAGE;
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description of the tour</h2>
              <p className="text-gray-600 leading-relaxed">{tour.description}</p>
            </div>

            {/* Itinerary */}
            {tour.itinerary.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tour Itinerary</h2>
                <div className="space-y-4">
                  {tour.itinerary.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-16 text-sm font-medium text-orange-500">
                        {item.time || `Day ${item.day}`}
                      </div>
                      <div className="flex-1 pb-4 border-l-2 border-gray-200 pl-4 relative">
                        <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-orange-500" />
                        <h4 className="font-medium text-gray-900">{item.location}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's Included */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">What's Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tour.inclusions.map((inclusion, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {inclusion.included ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={inclusion.included ? 'text-gray-700' : 'text-gray-400'}>
                      {inclusion.item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-blue-600">
                      ${tour.basePrice.toLocaleString()}
                    </span>
                    <span className="text-gray-500">USD</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    for a group of {tour.minGroupSize}-{tour.maxGroupSize} people
                  </p>
                </div>

                {/* Guide Info */}
                <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={tour.guide.avatar}
                    alt={tour.guide.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{tour.guide.name}</p>
                    <p className="text-sm text-gray-500">Your tour guide</p>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="capitalize">{tour.category} tour</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{tour.destination}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span>{formatDuration(tour.durationHours, tour.durationDays)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span>Up to {tour.maxGroupSize} people</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6"
                    onClick={() => onNavigate('booking', { tourId: tour.id })}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book a tour
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold py-6"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Ask a question
                  </Button>
                </div>

                {/* Info Note */}
                <div className="mt-4 p-3 bg-amber-50 rounded-lg flex gap-2">
                  <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-700">
                    No booking fees at the time of ordering a tour. The tour guide will receive a request for this tour and will contact you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
