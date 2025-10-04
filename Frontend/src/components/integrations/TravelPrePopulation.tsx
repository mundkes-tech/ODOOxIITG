/**
 * Travel Pre-population Component
 * UI for pre-populating expense forms with travel booking data
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plane, 
  Calendar, 
  MapPin, 
  DollarSign,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Building,
  Car,
  Train,
  Hotel,
  UtensilsCrossed
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface TravelBooking {
  _id: string;
  externalId: string;
  bookingType: 'flight' | 'hotel' | 'car' | 'train' | 'package';
  bookingDate: string;
  travelDates: {
    start: string;
    end: string;
    duration: number;
  };
  destination: {
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  cost: {
    total: number;
    currency: string;
    breakdown: {
      base: number;
      taxes: number;
      fees: number;
      insurance: number;
    };
  };
  details: {
    flight?: {
      airline: string;
      flightNumber: string;
      departure: {
        airport: string;
        time: string;
      };
      arrival: {
        airport: string;
        time: string;
      };
      class: string;
    };
    hotel?: {
      name: string;
      address: string;
      checkIn: string;
      checkOut: string;
      roomType: string;
      guests: number;
    };
    car?: {
      provider: string;
      vehicleType: string;
      pickupLocation: string;
      dropoffLocation: string;
      pickupTime: string;
      dropoffTime: string;
    };
  };
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  prePopulatedExpenses: string[];
}

interface ExpenseSuggestion {
  category: string;
  subcategory: string;
  amount: number;
  description: string;
  date: string;
  merchant: string;
  isPrePopulated: boolean;
}

const TravelPrePopulation: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<TravelBooking | null>(null);
  const [isPrePopulateDialogOpen, setIsPrePopulateDialogOpen] = useState(false);
  const [expenseSuggestions, setExpenseSuggestions] = useState<ExpenseSuggestion[]>([]);
  
  const queryClient = useQueryClient();

  // Fetch travel bookings
  const { data: bookingsData, isLoading, refetch } = useQuery({
    queryKey: ['travel-bookings'],
    queryFn: () => api.get('/integrations/travel/bookings'),
  });

  const bookings: TravelBooking[] = bookingsData?.data?.bookings || [];

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.destination.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.destination.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (booking.details.flight?.airline || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (booking.details.hotel?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesType = typeFilter === 'all' || booking.bookingType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pre-populate expenses mutation
  const prePopulateMutation = useMutation({
    mutationFn: (bookingId: string) => api.post(`/integrations/travel/pre-populate/${bookingId}`),
    onSuccess: (response) => {
      setExpenseSuggestions(response.data.expenseSuggestions);
      toast.success('Expense suggestions generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate expense suggestions');
    },
  });

  // Sync bookings mutation
  const syncMutation = useMutation({
    mutationFn: () => api.post('/integrations/travel/fetch-bookings'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-bookings'] });
      toast.success('Travel bookings synced successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to sync travel bookings');
    },
  });

  const handlePrePopulate = (booking: TravelBooking) => {
    setSelectedBooking(booking);
    prePopulateMutation.mutate(booking._id);
    setIsPrePopulateDialogOpen(true);
  };

  const getBookingTypeIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return Plane;
      case 'hotel':
        return Building;
      case 'car':
        return Car;
      case 'train':
        return Train;
      default:
        return Plane;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingTypeColor = (type: string) => {
    switch (type) {
      case 'flight':
        return 'bg-blue-100 text-blue-800';
      case 'hotel':
        return 'bg-purple-100 text-purple-800';
      case 'car':
        return 'bg-orange-100 text-orange-800';
      case 'train':
        return 'bg-green-100 text-green-800';
      case 'package':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Plane className="w-6 h-6 text-blue-600" />
            <span>Travel Pre-population</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Pre-populate expense forms with travel booking data
          </p>
        </div>
        
        <Button 
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          <span>Sync Bookings</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Bookings</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by destination, airline, or hotel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="sm:w-48">
              <Label htmlFor="type-filter">Type Filter</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="flight">Flight</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="car">Car Rental</SelectItem>
                  <SelectItem value="train">Train</SelectItem>
                  <SelectItem value="package">Package</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Plane className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold">
                  ${bookings.reduce((sum, b) => sum + b.cost.total, 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No travel bookings found</p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => {
            const TypeIcon = getBookingTypeIcon(booking.bookingType);
            
            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <Badge className={getBookingTypeColor(booking.bookingType)}>
                            {booking.bookingType}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <TypeIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {booking.travelDates.duration} days
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-lg flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span>{booking.destination.city}, {booking.destination.country}</span>
                          </h3>
                          <p className="text-gray-600">
                            {new Date(booking.travelDates.start).toLocaleDateString()} - 
                            {new Date(booking.travelDates.end).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span>{booking.cost.currency} {booking.cost.total.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                          </div>
                          {booking.details.flight && (
                            <div className="flex items-center space-x-2">
                              <Plane className="w-4 h-4 text-gray-400" />
                              <span>{booking.details.flight.airline}</span>
                            </div>
                          )}
                          {booking.details.hotel && (
                            <div className="flex items-center space-x-2">
                              <Hotel className="w-4 h-4 text-gray-400" />
                              <span>{booking.details.hotel.name}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Booking Details */}
                        <div className="space-y-2">
                          {booking.details.flight && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-800">Flight Details</p>
                              <p className="text-sm text-blue-600">
                                {booking.details.flight.flightNumber} - {booking.details.flight.class}
                              </p>
                              <p className="text-xs text-blue-500">
                                {booking.details.flight.departure.airport} → {booking.details.flight.arrival.airport}
                              </p>
                            </div>
                          )}
                          
                          {booking.details.hotel && (
                            <div className="p-3 bg-purple-50 rounded-lg">
                              <p className="text-sm font-medium text-purple-800">Hotel Details</p>
                              <p className="text-sm text-purple-600">{booking.details.hotel.name}</p>
                              <p className="text-xs text-purple-500">
                                {booking.details.hotel.roomType} • {booking.details.hotel.guests} guests
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4 space-y-2">
                        <Button
                          onClick={() => handlePrePopulate(booking)}
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Pre-populate</span>
                        </Button>
                        
                        {booking.prePopulatedExpenses.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">Pre-populated:</p>
                            <p>{booking.prePopulatedExpenses.length} expenses</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pre-populate Dialog */}
      <Dialog open={isPrePopulateDialogOpen} onOpenChange={setIsPrePopulateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Pre-populate Expenses</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Booking Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Destination</p>
                    <p className="font-medium">
                      {selectedBooking.destination.city}, {selectedBooking.destination.country}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Travel Dates</p>
                    <p className="font-medium">
                      {new Date(selectedBooking.travelDates.start).toLocaleDateString()} - 
                      {new Date(selectedBooking.travelDates.end).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Cost</p>
                    <p className="font-medium">
                      {selectedBooking.cost.currency} {selectedBooking.cost.total.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-medium">{selectedBooking.travelDates.duration} days</p>
                  </div>
                </div>
              </div>
              
              {/* Expense Suggestions */}
              <div>
                <h4 className="font-semibold mb-4">Suggested Expenses</h4>
                {prePopulateMutation.isPending ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : expenseSuggestions.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No expense suggestions available</p>
                ) : (
                  <div className="space-y-3">
                    {expenseSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary">{suggestion.category}</Badge>
                              <Badge variant="outline">{suggestion.subcategory}</Badge>
                            </div>
                            <h5 className="font-medium mt-2">{suggestion.description}</h5>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4" />
                                <span>{suggestion.amount.toFixed(2)}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(suggestion.date).toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Building className="w-4 h-4" />
                                <span>{suggestion.merchant}</span>
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Button size="sm" variant="outline">
                              <Plus className="w-4 h-4 mr-1" />
                              Add Expense
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPrePopulateDialogOpen(false)}
                >
                  Close
                </Button>
                <Button>
                  Create All Expenses
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TravelPrePopulation;
