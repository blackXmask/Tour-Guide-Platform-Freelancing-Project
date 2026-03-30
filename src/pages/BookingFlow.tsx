import { useState, useEffect } from 'react';
import { 
  ChevronLeft, Calendar, Clock, Users, Check, 
  CreditCard, User, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { TourDB, BookingDB } from '@/lib/db';
import type { Tour, Booking } from '@/types';
import { toast } from 'sonner';

interface BookingFlowProps {
  tourId: string;
  onNavigate: (page: 'home' | 'tour' | 'booking' | 'admin' | 'search', params?: Record<string, string>) => void;
}

type BookingStep = 'date' | 'details' | 'confirmation';

export function BookingFlow({ tourId, onNavigate }: BookingFlowProps) {
  const [tour, setTour] = useState<Tour | null>(null);
  const [currentStep, setCurrentStep] = useState<BookingStep>('date');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [groupSize, setGroupSize] = useState(2);
  const [booking, setBooking] = useState<Booking | null>(null);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const foundTour = TourDB.getById(tourId);
    setTour(foundTour);
    if (foundTour) {
      setGroupSize(foundTour.minGroupSize);
    }
  }, [tourId]);

  // Generate available dates (next 30 days)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip some dates randomly to simulate availability
      if (Math.random() > 0.3) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const availableDates = generateAvailableDates();
  const availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  const calculateTotalPrice = () => {
    if (!tour) return 0;
    return tour.basePrice * groupSize;
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleContinueToDetails = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }
    setCurrentStep('details');
  };

  const handleSubmitBooking = () => {
    if (!tour) return;
    
    if (!firstName || !lastName || !email || !phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    // Create booking
    const newBooking = BookingDB.create({
      tourId: tour.id,
      availabilityId: '', // Would be set from actual availability
      email,
      firstName,
      lastName,
      phone,
      groupSize,
      selectedDate,
      selectedTime,
      totalPrice: calculateTotalPrice(),
      status: 'confirmed',
      specialRequests,
      paymentStatus: 'pending',
    });

    setBooking(newBooking);
    setCurrentStep('confirmation');
    toast.success('Booking confirmed successfully!');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => onNavigate('tour', { slug: tour.slug })}
            className="flex items-center text-gray-600 hover:text-orange-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to tour
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === 'date' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
              }`}>
                {currentStep === 'date' ? '1' : <Check className="w-5 h-5" />}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Date & Time</span>
            </div>
            <div className="w-16 h-1 mx-4 bg-gray-200">
              <div className={`h-full transition-all ${
                currentStep !== 'date' ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            </div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === 'details' ? 'bg-orange-500 text-white' : 
                currentStep === 'confirmation' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep === 'confirmation' ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Your Details</span>
            </div>
            <div className="w-16 h-1 mx-4 bg-gray-200">
              <div className={`h-full transition-all ${
                currentStep === 'confirmation' ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            </div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === 'confirmation' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep === 'confirmation' ? <Check className="w-5 h-5" /> : '3'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Confirmation</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'date' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            {/* Tour Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex gap-4">
                <img
                  src={tour.heroImage}
                  alt={tour.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div>
                  <h2 className="font-semibold text-gray-900">{tour.title}</h2>
                  <p className="text-sm text-gray-500">{tour.destination}, {tour.country}</p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    ${tour.basePrice.toLocaleString()} USD per person
                  </p>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Select a Date
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {availableDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => handleDateSelect(date)}
                    className={`p-3 rounded-lg text-center transition-all ${
                      selectedDate === date
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="text-xs uppercase">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold">
                      {new Date(date).getDate()}
                    </div>
                    <div className="text-xs">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="bg-white rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Select a Time
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Group Size */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                Group Size
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setGroupSize(Math.max(tour.minGroupSize, groupSize - 1))}
                  className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-16 text-center">{groupSize}</span>
                <button
                  onClick={() => setGroupSize(Math.min(tour.maxGroupSize, groupSize + 1))}
                  className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
                >
                  +
                </button>
                <span className="text-gray-500">
                  people (min {tour.minGroupSize}, max {tour.maxGroupSize})
                </span>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600">Total Price</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${calculateTotalPrice().toLocaleString()} USD
                  </p>
                </div>
                <Button
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleContinueToDetails}
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'details' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            {/* Booking Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tour</span>
                  <span className="font-medium">{tour.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Group Size</span>
                  <span className="font-medium">{groupSize} people</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-blue-600">
                    ${calculateTotalPrice().toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                Your Details
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requests">Special Requests</Label>
                  <Textarea
                    id="requests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requirements or questions..."
                    rows={3}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm font-normal leading-tight">
                    I agree to the Terms and Conditions and Privacy Policy. I understand that 
                    the tour guide will contact me to confirm the booking details.
                  </Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentStep('date')}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleSubmitBooking}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Confirm Booking
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'confirmation' && booking && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in">
            {/* Success Icon */}
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-12 h-12 text-green-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h2>
              <p className="text-gray-600">
                Thank you for your booking. We've sent a confirmation email to {booking.email}.
              </p>
            </div>

            {/* Booking Details Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm max-w-md mx-auto text-left">
              <div className="text-center pb-4 border-b">
                <p className="text-sm text-gray-500">Booking Reference</p>
                <p className="text-2xl font-bold text-orange-500">{booking.bookingRef}</p>
              </div>
              
              <div className="space-y-3 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tour</span>
                  <span className="font-medium">{tour.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{formatDate(booking.selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium">{booking.selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Group Size</span>
                  <span className="font-medium">{booking.groupSize} people</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-blue-600">
                    ${booking.totalPrice.toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto">
              <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Your tour guide {tour.guide.name} will contact you within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>You'll receive payment instructions via email</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Meet your guide at the designated location on the tour date</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => onNavigate('home')}
              >
                Back to Home
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => onNavigate('search', { query: '' })}
              >
                Explore More Tours
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
