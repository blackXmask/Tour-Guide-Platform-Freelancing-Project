import type { Tour, Booking, Availability, AdminUser, DashboardStats, TourGuide, Country } from '@/types';

// Database keys
const DB_KEYS = {
  tours: 'tourbook_tours',
  bookings: 'tourbook_bookings',
  availability: 'tourbook_availability',
  adminUsers: 'tourbook_admin_users',
  currentUser: 'tourbook_current_user',
  countries: 'tourbook_countries',
  guides: 'tourbook_guides',
};

// Initialize database with sample data
export function initializeDatabase(): void {
  if (!localStorage.getItem(DB_KEYS.tours)) {
    localStorage.setItem(DB_KEYS.tours, JSON.stringify(sampleTours));
  }
  if (!localStorage.getItem(DB_KEYS.countries)) {
    localStorage.setItem(DB_KEYS.countries, JSON.stringify(sampleCountries));
  }
  if (!localStorage.getItem(DB_KEYS.guides)) {
    localStorage.setItem(DB_KEYS.guides, JSON.stringify(sampleGuides));
  }
  if (!localStorage.getItem(DB_KEYS.bookings)) {
    localStorage.setItem(DB_KEYS.bookings, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.availability)) {
    localStorage.setItem(DB_KEYS.availability, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.adminUsers)) {
    localStorage.setItem(DB_KEYS.adminUsers, JSON.stringify(sampleAdminUsers));
  }
}

// Generic CRUD operations
function getAll<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function getById<T extends { id: string }>(key: string, id: string): T | null {
  const items = getAll<T>(key);
  return items.find(item => item.id === id) || null;
}

function create<T extends { id: string }>(key: string, item: T): T {
  const items = getAll<T>(key);
  items.push(item);
  localStorage.setItem(key, JSON.stringify(items));
  return item;
}

function update<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
  const items = getAll<T>(key);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates };
  localStorage.setItem(key, JSON.stringify(items));
  return items[index];
}

function remove<T extends { id: string }>(key: string, id: string): boolean {
  const items = getAll<T>(key);
  const filtered = items.filter(item => item.id !== id);
  if (filtered.length === items.length) return false;
  localStorage.setItem(key, JSON.stringify(filtered));
  return true;
}

// Tour Operations
function normalizeImageUrl(input: unknown): string {
  if (typeof input !== 'string') return '';
  const s = input.trim();
  if (!s) return '';

  // Already a proper URL / data URI
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('data:image/')) return s;

  // Allow public-root and relative paths (if user entered them correctly)
  if (s.startsWith('/')) return s;
  if (s.startsWith('./') || s.startsWith('../')) return s;

  // Reject Windows local paths like `C:\Users\...` or `D:/...`
  if (/^[a-zA-Z]:[\\/]/.test(s)) return '';
  if (s.startsWith('file:')) return '';

  // If it contains a colon, it's likely not a web path (besides http(s)/data handled above)
  if (s.includes(':')) return '';

  // Treat bare filenames / relative paths (that look like image filenames) as public-root paths.
  // Example: `angkor.jpg` -> `/angkor.jpg`, `images/angkor.jpg` -> `/images/angkor.jpg`
  if (/^[\w\-./]+?\.(png|jpe?g|webp|gif|svg)$/i.test(s)) {
    return '/' + s.replace(/^\.\//, '');
  }

  return '';
}

const canonicalTourImages: Record<string, { heroImage: string; gallery: string[] }> = {
  'angkor-wat-sunrise-cambodia': {
    heroImage: 'https://picsum.photos/seed/angkor-wat-sunrise/1200/800',
    gallery: [
      'https://picsum.photos/seed/angkor-temple-1/800/600',
      'https://picsum.photos/seed/angkor-temple-2/800/600',
      'https://picsum.photos/seed/angkor-temple-3/800/600',
    ],
  },
};

function normalizeTourImages(tour: Tour): Tour {
  const sample = sampleTours.find((t) => t.slug === tour.slug);
  const canonical = canonicalTourImages[tour.slug];

  const heroNormalized = normalizeImageUrl(tour.heroImage);
  const heroImage =
    canonical?.heroImage ||
    heroNormalized ||
    sample?.heroImage ||
    tour.heroImage;

  const galleryCandidates = Array.isArray(tour.gallery) ? tour.gallery : [];
  const galleryNormalized = galleryCandidates.map(normalizeImageUrl).filter(Boolean);
  const gallery =
    canonical?.gallery ||
    (galleryNormalized.length ? galleryNormalized : sample?.gallery || tour.gallery);

  const avatarNormalized = normalizeImageUrl(tour.guide?.avatar);
  const avatar = avatarNormalized || sample?.guide?.avatar || tour.guide?.avatar;

  return {
    ...tour,
    heroImage,
    gallery,
    guide: {
      ...tour.guide,
      avatar,
    },
  };
}

export const TourDB = {
  getAll: (): Tour[] => getAll<Tour>(DB_KEYS.tours).map(normalizeTourImages),
  
  getById: (id: string): Tour | null => {
    const tour = getById<Tour>(DB_KEYS.tours, id);
    return tour ? normalizeTourImages(tour) : null;
  },
  
  getBySlug: (slug: string): Tour | null => {
    const tours = getAll<Tour>(DB_KEYS.tours);
    const tour = tours.find(t => t.slug === slug) || null;
    return tour ? normalizeTourImages(tour) : null;
  },
  
  getByCountry: (country: string): Tour[] => {
    const tours = getAll<Tour>(DB_KEYS.tours);
    return tours.filter(t => t.country.toLowerCase() === country.toLowerCase()).map(normalizeTourImages);
  },
  
  getByDestination: (destination: string): Tour[] => {
    const tours = getAll<Tour>(DB_KEYS.tours);
    return tours.filter(t => 
      t.destination.toLowerCase().includes(destination.toLowerCase()) ||
      t.country.toLowerCase().includes(destination.toLowerCase())
    ).map(normalizeTourImages);
  },
  
  search: (query: string): Tour[] => {
    const tours = getAll<Tour>(DB_KEYS.tours);
    const lowerQuery = query.toLowerCase();
    return tours.filter(t => 
      t.title.toLowerCase().includes(lowerQuery) ||
      t.destination.toLowerCase().includes(lowerQuery) ||
      t.country.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    ).map(normalizeTourImages);
  },
  
  getPopular: (limit: number = 6): Tour[] => {
    const tours = getAll<Tour>(DB_KEYS.tours);
    return tours
      .filter(t => t.status === 'active')
      .slice(0, limit)
      .map(normalizeTourImages);
  },
  
  create: (tour: Omit<Tour, 'id' | 'createdAt' | 'updatedAt'>): Tour => {
    const newTour: Tour = {
      ...tour,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return create<Tour>(DB_KEYS.tours, newTour);
  },
  
  update: (id: string, updates: Partial<Tour>): Tour | null => {
    return update<Tour>(DB_KEYS.tours, id, { ...updates, updatedAt: new Date().toISOString() });
  },
  
  delete: (id: string): boolean => remove<Tour>(DB_KEYS.tours, id),
};

// Booking Operations
export const BookingDB = {
  getAll: (): Booking[] => getAll<Booking>(DB_KEYS.bookings),
  
  getById: (id: string): Booking | null => getById<Booking>(DB_KEYS.bookings, id),
  
  getByTourId: (tourId: string): Booking[] => {
    const bookings = getAll<Booking>(DB_KEYS.bookings);
    return bookings.filter(b => b.tourId === tourId);
  },
  
  getByEmail: (email: string): Booking[] => {
    const bookings = getAll<Booking>(DB_KEYS.bookings);
    return bookings.filter(b => b.email.toLowerCase() === email.toLowerCase());
  },
  
  getByStatus: (status: Booking['status']): Booking[] => {
    const bookings = getAll<Booking>(DB_KEYS.bookings);
    return bookings.filter(b => b.status === status);
  },
  
  create: (booking: Omit<Booking, 'id' | 'bookingRef' | 'createdAt' | 'updatedAt'>): Booking => {
    const newBooking: Booking = {
      ...booking,
      id: generateId(),
      bookingRef: generateBookingRef(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return create<Booking>(DB_KEYS.bookings, newBooking);
  },
  
  update: (id: string, updates: Partial<Booking>): Booking | null => {
    return update<Booking>(DB_KEYS.bookings, id, { ...updates, updatedAt: new Date().toISOString() });
  },
  
  delete: (id: string): boolean => remove<Booking>(DB_KEYS.bookings, id),
  
  getStats: (): { total: number; thisMonth: number; pending: number; revenue: number } => {
    const bookings = getAll<Booking>(DB_KEYS.bookings);
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    return {
      total: bookings.length,
      thisMonth: bookings.filter(b => {
        const date = new Date(b.createdAt);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      }).length,
      pending: bookings.filter(b => b.status === 'pending').length,
      revenue: bookings
        .filter(b => b.status === 'confirmed' && b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalPrice, 0),
    };
  },
};

// Availability Operations
export const AvailabilityDB = {
  getAll: (): Availability[] => getAll<Availability>(DB_KEYS.availability),
  
  getByTourId: (tourId: string): Availability[] => {
    const availabilities = getAll<Availability>(DB_KEYS.availability);
    return availabilities.filter(a => a.tourId === tourId);
  },
  
  getByDate: (tourId: string, date: string): Availability | null => {
    const availabilities = getAll<Availability>(DB_KEYS.availability);
    return availabilities.find(a => a.tourId === tourId && a.date === date) || null;
  },
  
  getAvailableDates: (tourId: string, startDate: string, endDate: string): Availability[] => {
    const availabilities = getAll<Availability>(DB_KEYS.availability);
    return availabilities.filter(a => 
      a.tourId === tourId &&
      a.date >= startDate &&
      a.date <= endDate &&
      !a.isBlocked &&
      a.timeSlots.some(slot => slot.slotsAvailable > slot.slotsBooked)
    );
  },
  
  createOrUpdate: (tourId: string, date: string, data: Partial<Availability>): Availability => {
    const existing = AvailabilityDB.getByDate(tourId, date);
    if (existing) {
      const updated = update<Availability>(DB_KEYS.availability, existing.id, data);
      return updated!;
    }
    const newAvailability: Availability = {
      id: generateId(),
      tourId,
      date,
      timeSlots: [],
      isBlocked: false,
      ...data,
    };
    return create<Availability>(DB_KEYS.availability, newAvailability);
  },
  
  bookSlots: (tourId: string, date: string, time: string, slots: number): boolean => {
    const availability = AvailabilityDB.getByDate(tourId, date);
    if (!availability) return false;
    
    const timeSlot = availability.timeSlots.find(s => s.time === time);
    if (!timeSlot) return false;
    
    if (timeSlot.slotsAvailable - timeSlot.slotsBooked < slots) return false;
    
    timeSlot.slotsBooked += slots;
    update<Availability>(DB_KEYS.availability, availability.id, { timeSlots: availability.timeSlots });
    return true;
  },
};

// Admin Operations
export const AdminDB = {
  getAll: (): AdminUser[] => getAll<AdminUser>(DB_KEYS.adminUsers),
  
  getByEmail: (email: string): AdminUser | null => {
    const users = getAll<AdminUser>(DB_KEYS.adminUsers);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  
  login: (email: string, _password: string): AdminUser | null => {
    // Simple password check (in production, use proper hashing)
    const users = getAll<AdminUser>(DB_KEYS.adminUsers);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      // Store current user
      localStorage.setItem(DB_KEYS.currentUser, JSON.stringify(user));
      return user;
    }
    return null;
  },

  register: (name: string, email: string): AdminUser | null => {
    const users = getAll<AdminUser>(DB_KEYS.adminUsers);
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return null;

    const user: AdminUser = {
      id: generateId(),
      name,
      email,
      role: 'editor',
    };

    users.push(user);
    localStorage.setItem(DB_KEYS.adminUsers, JSON.stringify(users));
    localStorage.setItem(DB_KEYS.currentUser, JSON.stringify(user));
    return user;
  },
  
  logout: (): void => {
    localStorage.removeItem(DB_KEYS.currentUser);
  },
  
  getCurrentUser: (): AdminUser | null => {
    const data = localStorage.getItem(DB_KEYS.currentUser);
    return data ? JSON.parse(data) : null;
  },
  
  isAuthenticated: (): boolean => {
    return !!AdminDB.getCurrentUser();
  },
};

// Country Operations
export const CountryDB = {
  getAll: (): Country[] => getAll<Country>(DB_KEYS.countries),
  
  getByContinent: (continent: string): Country[] => {
    const countries = getAll<Country>(DB_KEYS.countries);
    return countries.filter(c => c.continent === continent);
  },
  
  getPopularDestinations: (limit: number = 20): { name: string; country: string; continent: string }[] => {
    const tours = getAll<Tour>(DB_KEYS.tours);
    const destinations = new Map<string, { name: string; country: string; continent: string; count: number }>();
    
    tours.forEach(tour => {
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
    
    return Array.from(destinations.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(({ name, country, continent }) => ({ name, country, continent }));
  },
};

// Guide Operations
export const GuideDB = {
  getAll: (): TourGuide[] => getAll<TourGuide>(DB_KEYS.guides),
  
  getById: (id: string): TourGuide | null => getById<TourGuide>(DB_KEYS.guides, id),
  
  getPopular: (limit: number = 6): TourGuide[] => {
    const guides = getAll<TourGuide>(DB_KEYS.guides);
    return guides.slice(0, limit);
  },
};

// Dashboard Stats
export const DashboardDB = {
  getStats: (): DashboardStats => {
    const tours = getAll<Tour>(DB_KEYS.tours);
    const bookings = getAll<Booking>(DB_KEYS.bookings);
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const bookingsThisMonth = bookings.filter(b => {
      const date = new Date(b.createdAt);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });
    
    return {
      totalTours: tours.length,
      totalBookings: bookings.length,
      bookingsThisMonth: bookingsThisMonth.length,
      revenueThisMonth: bookingsThisMonth
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + b.totalPrice, 0),
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      activeTours: tours.filter(t => t.status === 'active').length,
    };
  },
};

// Helper functions
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateBookingRef(): string {
  const prefix = 'TRP';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

// Sample Data
const sampleGuides: TourGuide[] = [
  {
    id: '1',
    name: 'Nirina Lovasoa',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop',
    country: 'Madagascar',
    bio: 'Experienced guide with 10+ years showing the beauty of Madagascar.',
    languages: ['English', 'French', 'Malagasy'],
    rating: 4.9,
    reviewCount: 127,
  },
  {
    id: '2',
    name: 'Lara Doty',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    country: 'Finland',
    bio: 'Northern Lights expert and nature enthusiast.',
    languages: ['English', 'Finnish', 'Swedish'],
    rating: 4.8,
    reviewCount: 89,
  },
  {
    id: '3',
    name: 'Elena Mohammed',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    country: 'Egypt',
    bio: 'Archaeologist and Egyptology expert.',
    languages: ['English', 'Arabic', 'French'],
    rating: 4.9,
    reviewCount: 203,
  },
  {
    id: '4',
    name: 'Prem Lamichhane',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    country: 'Nepal',
    bio: 'Mountain trekking specialist with 15 years experience.',
    languages: ['English', 'Nepali', 'Hindi'],
    rating: 5.0,
    reviewCount: 156,
  },
  {
    id: '5',
    name: 'Sahlie Beza',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    country: 'Ethiopia',
    bio: 'Cultural historian specializing in ancient Ethiopian civilization.',
    languages: ['English', 'Amharic'],
    rating: 4.7,
    reviewCount: 78,
  },
  {
    id: '6',
    name: 'Michael Zaydman',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    country: 'USA',
    bio: 'NYC native showing the hidden gems of the Big Apple.',
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 312,
  },
];

const sampleCountries: Country[] = [
  { code: 'IT', name: 'Italy', continent: 'Europe', flag: '🇮🇹', cityCount: 15, tourCount: 45 },
  { code: 'FR', name: 'France', continent: 'Europe', flag: '🇫🇷', cityCount: 12, tourCount: 38 },
  { code: 'ES', name: 'Spain', continent: 'Europe', flag: '🇪🇸', cityCount: 10, tourCount: 32 },
  { code: 'DE', name: 'Germany', continent: 'Europe', flag: '🇩🇪', cityCount: 8, tourCount: 24 },
  { code: 'GB', name: 'United Kingdom', continent: 'Europe', flag: '🇬🇧', cityCount: 9, tourCount: 28 },
  { code: 'JP', name: 'Japan', continent: 'Asia', flag: '🇯🇵', cityCount: 8, tourCount: 35 },
  { code: 'TH', name: 'Thailand', continent: 'Asia', flag: '🇹🇭', cityCount: 6, tourCount: 22 },
  { code: 'NP', name: 'Nepal', continent: 'Asia', flag: '🇳🇵', cityCount: 4, tourCount: 18 },
  { code: 'IN', name: 'India', continent: 'Asia', flag: '🇮🇳', cityCount: 10, tourCount: 30 },
  { code: 'EG', name: 'Egypt', continent: 'Africa', flag: '🇪🇬', cityCount: 5, tourCount: 20 },
  { code: 'US', name: 'USA', continent: 'North America', flag: '🇺🇸', cityCount: 20, tourCount: 65 },
  { code: 'CA', name: 'Canada', continent: 'North America', flag: '🇨🇦', cityCount: 8, tourCount: 25 },
  { code: 'BR', name: 'Brazil', continent: 'South America', flag: '🇧🇷', cityCount: 6, tourCount: 18 },
  { code: 'AU', name: 'Australia', continent: 'Oceania', flag: '🇦🇺', cityCount: 7, tourCount: 22 },
  { code: 'FI', name: 'Finland', continent: 'Europe', flag: '🇫🇮', cityCount: 4, tourCount: 15 },
];

const sampleTours: Tour[] = [
  {
    id: '1',
    slug: 'colosseum-underground-tour-rome',
    title: 'Colosseum Underground and Ancient Rome Tour',
    description: 'Explore the iconic Colosseum like never before with exclusive access to the underground chambers and arena floor. Walk in the footsteps of gladiators as your expert guide brings ancient Rome to life with fascinating stories and historical insights.',
    shortDesc: 'Exclusive access to Colosseum underground and arena floor with expert guide',
    destination: 'Rome',
    country: 'Italy',
    continent: 'Europe',
    durationHours: 3,
    maxGroupSize: 10,
    minGroupSize: 1,
    basePrice: 89,
    currency: 'USD',
    heroImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1529260830199-42c42dda5f3d?w=800&h=600&fit=crop',
    ],
    category: 'history',
    tags: ['colosseum', 'ancient rome', 'gladiators', 'archaeology', 'skip-the-line'],
    inclusions: [
      { item: 'Skip-the-line entry to Colosseum', included: true },
      { item: 'Underground chambers access', included: true },
      { item: 'Arena floor access', included: true },
      { item: 'Professional guide', included: true },
      { item: 'Headsets for groups over 6', included: true },
      { item: 'Hotel pickup', included: false },
    ],
    itinerary: [
      { time: '09:00', location: 'Colosseum', description: 'Meet your guide at the Colosseum entrance' },
      { time: '09:30', location: 'Underground Chambers', description: 'Explore the gladiator preparation areas' },
      { time: '10:30', location: 'Arena Floor', description: 'Stand where gladiators once fought' },
      { time: '11:00', location: 'Roman Forum', description: 'Walk through the heart of ancient Rome' },
      { time: '12:00', location: 'Palatine Hill', description: 'Enjoy panoramic views of the city' },
    ],
    guide: sampleGuides[2],
    status: 'active',
    seoTitle: 'Colosseum Underground Tour Rome | Skip the Line',
    seoDesc: 'Get exclusive access to the Colosseum underground and arena floor. Small group tour with expert guide.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    slug: 'mardi-himal-trek-nepal',
    title: 'Mardi Himal Trek - 5 Days',
    description: 'Explore the breathtaking Mardi Himal trail in just 5 days. Enjoy stunning mountain views, pristine forests, and authentic local culture on this shorter alternative to longer Annapurna treks.',
    shortDesc: '5-day trek with stunning mountain views and local culture immersion',
    destination: 'Pokhara',
    country: 'Nepal',
    continent: 'Asia',
    durationHours: 120,
    durationDays: 5,
    maxGroupSize: 12,
    minGroupSize: 2,
    basePrice: 450,
    currency: 'USD',
    heroImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800&h=600&fit=crop',
    ],
    category: 'hiking',
    tags: ['trekking', 'himalaya', 'mountains', 'nepal', 'annapurna', 'adventure'],
    inclusions: [
      { item: 'Professional trekking guide', included: true },
      { item: 'Porter service', included: true },
      { item: 'All meals during trek', included: true },
      { item: 'Tea house accommodation', included: true },
      { item: 'Trekking permits', included: true },
      { item: 'Ground transportation', included: true },
      { item: 'Sleeping bag rental', included: false },
    ],
    itinerary: [
      { day: 1, location: 'Pokhara to Phedi to Pothana', description: 'Drive to Phedi, trek to Pothana through beautiful forests' },
      { day: 2, location: 'Pothana to Forest Camp', description: 'Trek through rhododendron forests' },
      { day: 3, location: 'Forest Camp to High Camp', description: 'Ascend above the tree line with mountain views' },
      { day: 4, location: 'High Camp to Mardi Base Camp to Low Camp', description: 'Early morning summit for sunrise views' },
      { day: 5, location: 'Low Camp to Siding to Pokhara', description: 'Descend through villages and drive back' },
    ],
    guide: sampleGuides[3],
    status: 'active',
    seoTitle: 'Mardi Himal Trek 5 Days | Nepal Trekking',
    seoDesc: 'Short but spectacular 5-day trek to Mardi Himal with stunning Annapurna views.',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    slug: 'northern-lights-safari-finland',
    title: 'Northern Lights Safari - Rovaniemi',
    description: 'Hunt for the magical Aurora Borealis in the Finnish Lapland wilderness. Our expert guides will take you to the best viewing spots away from light pollution for the best chance to witness this natural wonder.',
    shortDesc: 'Chase the Northern Lights in Finnish Lapland with expert guides',
    destination: 'Rovaniemi',
    country: 'Finland',
    continent: 'Europe',
    durationHours: 4,
    maxGroupSize: 8,
    minGroupSize: 2,
    basePrice: 125,
    currency: 'USD',
    heroImage: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1483347752412-bf2e99f0f5d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop',
    ],
    category: 'nature',
    tags: ['northern lights', 'aurora', 'lapland', 'winter', 'photography'],
    inclusions: [
      { item: 'Expert aurora guide', included: true },
      { item: 'Hot drinks and snacks', included: true },
      { item: 'Transportation from hotel', included: true },
      { item: 'Aurora photography tips', included: true },
      { item: 'Warm clothing rental', included: false },
    ],
    itinerary: [
      { time: '19:00', location: 'Hotel pickup', description: 'Meet your guide and receive briefing' },
      { time: '20:00', location: 'First viewing location', description: 'Scout for Northern Lights away from city lights' },
      { time: '21:30', location: 'Campfire spot', description: 'Warm up by the fire with hot drinks' },
      { time: '22:30', location: 'Second viewing location', description: 'Try different spot for optimal viewing' },
      { time: '23:00', location: 'Return to hotel', description: 'Drop-off at your accommodation' },
    ],
    guide: sampleGuides[1],
    status: 'active',
    seoTitle: 'Northern Lights Safari Finland | Aurora Hunting',
    seoDesc: 'Chase the magical Northern Lights in Finnish Lapland with expert guides.',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    slug: 'angkor-wat-sunrise-cambodia',
    title: 'Angkor Wat Sunrise and Temple Tour',
    description: 'Witness the breathtaking sunrise over Angkor Wat, the largest religious monument in the world. Continue exploring the ancient temples of the Khmer Empire with your knowledgeable guide.',
    shortDesc: 'Sunrise at Angkor Wat with full temple complex exploration',
    destination: 'Siem Reap',
    country: 'Cambodia',
    continent: 'Asia',
    durationHours: 8,
    maxGroupSize: 6,
    minGroupSize: 1,
    basePrice: 75,
    currency: 'USD',
    heroImage: 'https://images.unsplash.com/photo-1600520611035-8a297f05bf7e?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1600520611035-8a297f05bf7e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1569668723429-9fb907c0ab52?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1598367772323-3b65499be3c7?w=800&h=600&fit=crop',
    ],
    category: 'cultural',
    tags: ['angkor wat', 'temples', 'sunrise', 'khmer', 'unesco', 'history'],
    inclusions: [
      { item: 'Temple pass (1-day)', included: true },
      { item: 'Professional guide', included: true },
      { item: 'Transportation by tuk-tuk', included: true },
      { item: 'Breakfast box', included: true },
      { item: 'Bottled water', included: true },
      { item: 'Hotel pickup/dropoff', included: true },
    ],
    itinerary: [
      { time: '04:30', location: 'Hotel pickup', description: 'Early morning departure for sunrise' },
      { time: '05:30', location: 'Angkor Wat', description: 'Witness magical sunrise over the temple' },
      { time: '07:30', location: 'Breakfast', description: 'Enjoy breakfast within the temple complex' },
      { time: '08:30', location: 'Bayon Temple', description: 'Explore the faces of Angkor Thom' },
      { time: '10:00', location: 'Ta Prohm', description: 'See the temple embraced by jungle roots' },
      { time: '12:00', location: 'Return to hotel', description: 'Drop-off at your accommodation' },
    ],
    guide: {
      id: '7',
      name: 'Sophea Chann',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
      country: 'Cambodia',
      bio: 'Born and raised in Siem Reap, expert in Khmer history.',
      languages: ['English', 'Khmer'],
      rating: 4.9,
      reviewCount: 145,
    },
    status: 'active',
    seoTitle: 'Angkor Wat Sunrise Tour | Cambodia Temples',
    seoDesc: 'Experience magical sunrise at Angkor Wat with expert local guide.',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
  },
  {
    id: '5',
    slug: 'pyramids-and-sphinx-cairo',
    title: 'Pyramids of Giza and Sphinx Half-Day Tour',
    description: 'Stand in awe before the last remaining Wonder of the Ancient World. Explore the Great Pyramid, see the Sphinx, and learn about ancient Egyptian civilization from your Egyptologist guide.',
    shortDesc: 'Explore the Great Pyramids and Sphinx with Egyptologist guide',
    destination: 'Cairo',
    country: 'Egypt',
    continent: 'Africa',
    durationHours: 4,
    maxGroupSize: 12,
    minGroupSize: 1,
    basePrice: 55,
    currency: 'USD',
    heroImage: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1539650116455-251d9a063595?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566194305773-3e1277d24b10?w=800&h=600&fit=crop',
    ],
    category: 'history',
    tags: ['pyramids', 'sphinx', 'giza', 'ancient egypt', 'pharaoh'],
    inclusions: [
      { item: 'Professional Egyptologist guide', included: true },
      { item: 'Entry to Giza plateau', included: true },
      { item: 'Camel ride (30 min)', included: true },
      { item: 'Bottled water', included: true },
      { item: 'Hotel pickup/dropoff', included: true },
      { item: 'Entry inside pyramids', included: false },
    ],
    itinerary: [
      { time: '08:00', location: 'Hotel pickup', description: 'Meet your Egyptologist guide' },
      { time: '08:30', location: 'Great Pyramid of Khufu', description: 'Learn about pyramid construction' },
      { time: '09:30', location: 'Sphinx and Valley Temple', description: 'See the guardian of the plateau' },
      { time: '10:30', location: 'Panorama viewpoint', description: 'Photo opportunity with all pyramids' },
      { time: '11:00', location: 'Camel ride', description: 'Experience desert transport like ancient times' },
      { time: '12:00', location: 'Return to hotel', description: 'Drop-off at your accommodation' },
    ],
    guide: sampleGuides[2],
    status: 'active',
    seoTitle: 'Pyramids of Giza Tour Cairo | Sphinx Egypt',
    seoDesc: 'Explore the Great Pyramids and Sphinx with expert Egyptologist guide.',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
  {
    id: '6',
    slug: 'tokyo-street-food-night-tour',
    title: 'Tokyo Street Food Night Tour - Shibuya and Shinjuku',
    description: 'Dive into Tokyo\'s vibrant food scene after dark. Sample authentic street food, visit local izakayas, and discover hidden gems in the neon-lit streets of Shibuya and Shinjuku.',
    shortDesc: 'Evening food tour through Tokyo\'s best street food spots',
    destination: 'Tokyo',
    country: 'Japan',
    continent: 'Asia',
    durationHours: 3,
    maxGroupSize: 8,
    minGroupSize: 2,
    basePrice: 95,
    currency: 'USD',
    heroImage: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1554797589-7241bb691973?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1580442151529-343f2f6e0e27?w=800&h=600&fit=crop',
    ],
    category: 'food',
    tags: ['street food', 'tokyo', 'night tour', 'izakaya', 'sushi', 'ramen'],
    inclusions: [
      { item: 'Local food expert guide', included: true },
      { item: '5+ food tastings', included: true },
      { item: '2 drinks included', included: true },
      { item: 'Small group experience', included: true },
      { item: 'Dietary accommodations', included: true },
    ],
    itinerary: [
      { time: '18:00', location: 'Shibuya Crossing', description: 'Meet at the famous scramble crossing' },
      { time: '18:30', location: 'Shibuya Yokocho', description: 'Taste yakitori and beer at food alley' },
      { time: '19:30', location: 'Memory Lane (Omoide Yokocho)', description: 'Explore narrow alleyways with tiny eateries' },
      { time: '20:15', location: 'Golden Gai', description: 'Visit tiny bars in historic district' },
      { time: '21:00', location: 'Shinjuku', description: 'End with ramen at local favorite spot' },
    ],
    guide: {
      id: '8',
      name: 'Yuki Tanaka',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      country: 'Japan',
      bio: 'Food blogger and Tokyo nightlife expert.',
      languages: ['English', 'Japanese'],
      rating: 4.9,
      reviewCount: 198,
    },
    status: 'active',
    seoTitle: 'Tokyo Street Food Tour | Night Food Tour Shibuya',
    seoDesc: 'Discover Tokyo\'s best street food on this evening tour of Shibuya and Shinjuku.',
    createdAt: '2024-01-06T00:00:00Z',
    updatedAt: '2024-01-06T00:00:00Z',
  },
];

const sampleAdminUsers: AdminUser[] = [
  {
    id: '1',
    email: 'admin@tourbook.com',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  },
  {
    id: '2',
    email: 'editor@tourbook.com',
    name: 'Editor User',
    role: 'editor',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  },
];

// Initialize on load
initializeDatabase();
