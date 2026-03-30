import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Calendar, Settings, 
  LogOut, Plus, Search, Edit, Trash2, Eye, BarChart3,
  TrendingUp, TrendingDown, DollarSign, CheckCircle, Clock,
  ChevronLeft, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TourDB, BookingDB, DashboardDB, AdminDB } from '@/lib/db';
import type { Tour, Booking, DashboardStats } from '@/types';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onNavigate: (page: 'home' | 'tour' | 'booking' | 'admin' | 'search', params?: Record<string, string>) => void;
  mode?: string;
}

type AdminView = 'dashboard' | 'tours' | 'bookings' | 'settings';

export function AdminDashboard({ onNavigate, mode }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const user = AdminDB.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
    }
    setStats(DashboardDB.getStats());
  }, []);

  useEffect(() => {
    if (mode === 'signup') {
      setAuthMode('signup');
    } else {
      setAuthMode('login');
    }
  }, [mode]);

  const handleLogin = () => {
    // Simple demo login (accept any password for demo)
    if (loginEmail.includes('@')) {
      const user = AdminDB.login(loginEmail, loginPassword);
      if (user || loginEmail === 'admin@tourbook.com') {
        setIsAuthenticated(true);
        toast.success('Welcome back, Admin!');
      } else {
        toast.error('Invalid credentials');
      }
    } else {
      toast.error('Please enter a valid email');
    }
  };

  const handleLogout = () => {
    AdminDB.logout();
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const handleSignup = () => {
    const name = signupName.trim();
    const email = signupEmail.trim();
    if (name.length < 2) {
      toast.error('Please enter your full name');
      return;
    }
    if (!email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    if (signupPassword.trim().length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    const created = AdminDB.register(name, email);
    if (!created) {
      toast.error('Email is already registered. Please sign in.');
      setAuthMode('login');
      setLoginEmail(email);
      return;
    }

    setIsAuthenticated(true);
    toast.success('Account created. Welcome!');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">
              {authMode === 'signup' ? 'Tour Guide Sign Up' : 'Admin Login'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex rounded-lg border p-1">
              <Button
                type="button"
                variant={authMode === 'login' ? 'default' : 'ghost'}
                className="flex-1"
                onClick={() => setAuthMode('login')}
              >
                Sign In
              </Button>
              <Button
                type="button"
                variant={authMode === 'signup' ? 'default' : 'ghost'}
                className="flex-1"
                onClick={() => setAuthMode('signup')}
              >
                Sign Up
              </Button>
            </div>

            {authMode === 'login' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@tourbook.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={handleLogin}
                >
                  Sign In
                </Button>
                <p className="text-center text-sm text-gray-500">
                  Demo: Use admin@tourbook.com (any password)
                </p>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="signupName">Full Name</Label>
                  <Input
                    id="signupName"
                    placeholder="Your name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={handleSignup}
                >
                  Create Account
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => onNavigate('home')}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Website
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden lg:flex flex-col">
        <div className="p-6">
          <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
            TourBook Admin
          </span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <SidebarButton
            active={currentView === 'dashboard'}
            onClick={() => setCurrentView('dashboard')}
            icon={LayoutDashboard}
            label="Dashboard"
          />
          <SidebarButton
            active={currentView === 'tours'}
            onClick={() => setCurrentView('tours')}
            icon={Package}
            label="Tours"
          />
          <SidebarButton
            active={currentView === 'bookings'}
            onClick={() => setCurrentView('bookings')}
            icon={Calendar}
            label="Bookings"
          />
          <SidebarButton
            active={currentView === 'settings'}
            onClick={() => setCurrentView('settings')}
            icon={Settings}
            label="Settings"
          />
        </nav>

        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="flex items-center justify-between p-4">
          <span className="font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
            TourBook Admin
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex overflow-x-auto px-4 pb-2 gap-2">
          <Button
            size="sm"
            variant={currentView === 'dashboard' ? 'default' : 'ghost'}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </Button>
          <Button
            size="sm"
            variant={currentView === 'tours' ? 'default' : 'ghost'}
            onClick={() => setCurrentView('tours')}
          >
            Tours
          </Button>
          <Button
            size="sm"
            variant={currentView === 'bookings' ? 'default' : 'ghost'}
            onClick={() => setCurrentView('bookings')}
          >
            Bookings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 mt-20 lg:mt-0">
        <div className="p-6 lg:p-8">
          {currentView === 'dashboard' && <DashboardView stats={stats} onNavigate={onNavigate} />}
          {currentView === 'tours' && <ToursView onNavigate={onNavigate} />}
          {currentView === 'bookings' && <BookingsView />}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

// Sidebar Button Component
function SidebarButton({ 
  active, 
  onClick, 
  icon: Icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ElementType; 
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active 
          ? 'bg-orange-50 text-orange-600' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

// Dashboard View
function DashboardView({ 
  stats, 
  onNavigate 
}: { 
  stats: DashboardStats | null;
  onNavigate: (page: 'home' | 'tour' | 'booking' | 'admin' | 'search', params?: Record<string, string>) => void;
}) {
  const recentBookings = BookingDB.getAll().slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button variant="outline" onClick={() => onNavigate('home')}>
          <Eye className="w-4 h-4 mr-2" />
          View Site
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Tours"
          value={stats?.totalTours || 0}
          icon={Package}
          trend="+2 this month"
          trendUp={true}
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          icon={Calendar}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Revenue This Month"
          value={`$${(stats?.revenueThisMonth || 0).toLocaleString()}`}
          icon={DollarSign}
          trend="+8%"
          trendUp={true}
        />
        <StatCard
          title="Active Tours"
          value={stats?.activeTours || 0}
          icon={CheckCircle}
          trend="All good"
          trendUp={true}
        />
        <StatCard
          title="Pending Bookings"
          value={stats?.pendingBookings || 0}
          icon={Clock}
          trend="Needs attention"
          trendUp={false}
        />
        <StatCard
          title="Bookings This Month"
          value={stats?.bookingsThisMonth || 0}
          icon={BarChart3}
          trend="+5 vs last month"
          trendUp={true}
        />
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Reference</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Tour</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{booking.bookingRef}</td>
                    <td className="py-3 px-4">
                      {TourDB.getById(booking.tourId)?.title || 'Unknown Tour'}
                    </td>
                    <td className="py-3 px-4">{booking.firstName} {booking.lastName}</td>
                    <td className="py-3 px-4">{new Date(booking.selectedDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">${booking.totalPrice.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge className={
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {booking.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  trend: string; 
  trendUp: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className="p-2 bg-orange-100 rounded-lg">
            <Icon className="w-5 h-5 text-orange-600" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-4">
          {trendUp ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-amber-500" />
          )}
          <span className={`text-sm ${trendUp ? 'text-green-500' : 'text-amber-500'}`}>
            {trend}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Tours View
function ToursView({ 
  onNavigate 
}: { 
  onNavigate: (page: 'home' | 'tour' | 'booking' | 'admin' | 'search', params?: Record<string, string>) => void;
}) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setTours(TourDB.getAll());
  }, []);

  const filteredTours = tours.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this tour?')) {
      TourDB.delete(id);
      setTours(TourDB.getAll());
      toast.success('Tour deleted successfully');
    }
  };

  const handleSave = (tour: Partial<Tour>) => {
    if (editingTour) {
      TourDB.update(editingTour.id, tour);
      toast.success('Tour updated successfully');
    } else {
      TourDB.create(tour as Omit<Tour, 'id' | 'createdAt' | 'updatedAt'>);
      toast.success('Tour created successfully');
    }
    setTours(TourDB.getAll());
    setIsDialogOpen(false);
    setEditingTour(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tours</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                setEditingTour(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tour
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTour ? 'Edit Tour' : 'Add New Tour'}</DialogTitle>
            </DialogHeader>
            <TourForm 
              tour={editingTour} 
              onSave={handleSave} 
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingTour(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search tours..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tours Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Tour</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Destination</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTours.map((tour) => (
                  <tr key={tour.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={tour.heroImage} 
                          alt={tour.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{tour.title}</p>
                          <p className="text-sm text-gray-500">{tour.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {tour.destination}, {tour.country}
                    </td>
                    <td className="py-3 px-4">
                      ${tour.basePrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={
                        tour.status === 'active' ? 'bg-green-100 text-green-700' :
                        tour.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {tour.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onNavigate('tour', { slug: tour.slug })}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingTour(tour);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(tour.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Tour Form Component
function TourForm({ 
  tour, 
  onSave, 
  onCancel 
}: { 
  tour: Tour | null; 
  onSave: (tour: Partial<Tour>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Tour>>({
    title: tour?.title || '',
    description: tour?.description || '',
    shortDesc: tour?.shortDesc || '',
    destination: tour?.destination || '',
    country: tour?.country || '',
    continent: tour?.continent || 'Europe',
    durationHours: tour?.durationHours || 3,
    maxGroupSize: tour?.maxGroupSize || 10,
    minGroupSize: tour?.minGroupSize || 1,
    basePrice: tour?.basePrice || 50,
    currency: tour?.currency || 'USD',
    heroImage: tour?.heroImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop',
    category: tour?.category || 'walking',
    tags: tour?.tags || [],
    status: tour?.status || 'active',
    slug: tour?.slug || '',
    gallery: tour?.gallery || [],
    inclusions: tour?.inclusions || [],
    itinerary: tour?.itinerary || [],
    guide: tour?.guide || {
      id: 'new',
      name: 'New Guide',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      country: 'USA',
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="tour-name-here"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Destination</Label>
          <Input
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Country</Label>
          <Input
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Continent</Label>
          <Select
            value={formData.continent}
            onValueChange={(v) => setFormData({ ...formData, continent: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Europe">Europe</SelectItem>
              <SelectItem value="Asia">Asia</SelectItem>
              <SelectItem value="North America">North America</SelectItem>
              <SelectItem value="South America">South America</SelectItem>
              <SelectItem value="Africa">Africa</SelectItem>
              <SelectItem value="Oceania">Oceania</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Duration (hours)</Label>
          <Input
            type="number"
            value={formData.durationHours}
            onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Min Group</Label>
          <Input
            type="number"
            value={formData.minGroupSize}
            onChange={(e) => setFormData({ ...formData, minGroupSize: parseInt(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Max Group</Label>
          <Input
            type="number"
            value={formData.maxGroupSize}
            onChange={(e) => setFormData({ ...formData, maxGroupSize: parseInt(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Price (USD)</Label>
          <Input
            type="number"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(v) => setFormData({ ...formData, category: v as Tour['category'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walking">Walking</SelectItem>
              <SelectItem value="nature">Nature</SelectItem>
              <SelectItem value="history">History</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="adventure">Adventure</SelectItem>
              <SelectItem value="photography">Photography</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
              <SelectItem value="extreme">Extreme</SelectItem>
              <SelectItem value="hiking">Hiking</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => setFormData({ ...formData, status: v as Tour['status'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Hero Image URL</Label>
        <Input
          value={formData.heroImage}
          onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
          required
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">
          <Save className="w-4 h-4 mr-2" />
          Save Tour
        </Button>
      </div>
    </form>
  );
}

// Bookings View
function BookingsView() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setBookings(BookingDB.getAll());
  }, []);

  const filteredBookings = bookings.filter(b => 
    b.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateStatus = (id: string, status: Booking['status']) => {
    BookingDB.update(id, { status });
    setBookings(BookingDB.getAll());
    toast.success('Booking status updated');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search bookings by reference, name, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Reference</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Tour</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Group</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{booking.bookingRef}</td>
                    <td className="py-3 px-4">
                      {TourDB.getById(booking.tourId)?.title || 'Unknown Tour'}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{booking.firstName} {booking.lastName}</p>
                        <p className="text-sm text-gray-500">{booking.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(booking.selectedDate).toLocaleDateString()}
                      <p className="text-sm text-gray-500">{booking.selectedTime}</p>
                    </td>
                    <td className="py-3 px-4">{booking.groupSize} people</td>
                    <td className="py-3 px-4">${booking.totalPrice.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Select
                        value={booking.status}
                        onValueChange={(v) => updateStatus(booking.id, v as Booking['status'])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Settings View
function SettingsView() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Site Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input defaultValue="TourBook" />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input defaultValue="hello@tourbook.com" />
            </div>
            <div className="space-y-2">
              <Label>Support Phone</Label>
              <Input defaultValue="+1 (555) 123-4567" />
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Meta Title</Label>
              <Input defaultValue="TourBook - Tour guides and tours around the world" />
            </div>
            <div className="space-y-2">
              <Label>Default Meta Description</Label>
              <Textarea 
                defaultValue="Discover the world with local experts. Book unique tours and experiences directly with professional guides."
                rows={3}
              />
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
