// Tour Types
export interface Tour {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDesc: string;
  destination: string;
  country: string;
  continent: string;
  durationHours: number;
  durationDays?: number;
  maxGroupSize: number;
  minGroupSize: number;
  basePrice: number;
  currency: string;
  heroImage: string;
  gallery: string[];
  category: TourCategory;
  tags: string[];
  inclusions: Inclusion[];
  itinerary: ItineraryItem[];
  guide: TourGuide;
  status: 'active' | 'inactive' | 'draft';
  seoTitle?: string;
  seoDesc?: string;
  createdAt: string;
  updatedAt: string;
}

export type TourCategory = 'walking' | 'nature' | 'history' | 'food' | 'adventure' | 'photography' | 'cultural' | 'extreme' | 'hiking';

export interface Inclusion {
  item: string;
  included: boolean;
  icon?: string;
}

export interface ItineraryItem {
  day?: number;
  time?: string;
  location: string;
  description: string;
}

export interface TourGuide {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  country: string;
  languages?: string[];
  rating?: number;
  reviewCount?: number;
}

// Availability Types
export interface Availability {
  id: string;
  tourId: string;
  date: string;
  timeSlots: TimeSlot[];
  isBlocked: boolean;
  specialPrice?: number;
  notes?: string;
}

export interface TimeSlot {
  time: string;
  slotsAvailable: number;
  slotsBooked: number;
}

// Booking Types
export interface Booking {
  id: string;
  tourId: string;
  availabilityId: string;
  bookingRef: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  groupSize: number;
  selectedDate: string;
  selectedTime?: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

// Admin Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  avatar?: string;
}

// Search & Filter Types
export interface SearchFilters {
  destination?: string;
  country?: string;
  continent?: string;
  category?: TourCategory;
  minPrice?: number;
  maxPrice?: number;
  duration?: 'short' | 'medium' | 'long';
  groupSize?: number;
  date?: string;
}

// Stats Types
export interface DashboardStats {
  totalTours: number;
  totalBookings: number;
  bookingsThisMonth: number;
  revenueThisMonth: number;
  pendingBookings: number;
  activeTours: number;
}

// Country/Destination Types
export interface Country {
  code: string;
  name: string;
  continent: string;
  flag: string;
  cityCount: number;
  tourCount: number;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  continent: string;
  image?: string;
  tourCount: number;
  description?: string;
}
