export const TG_STATIONS = [
  { name: 'Adilabad', lat: 19.6641, lng: 78.5320 },
  { name: 'Asifabad', lat: 19.3587, lng: 79.2869 },
  { name: 'Bhadrachalam', lat: 17.6688, lng: 80.8936 },
  { name: 'Dilsukhnagar', lat: 17.3688, lng: 78.5247 },
  { name: 'Gadwal', lat: 16.2336, lng: 77.8048 },
  { name: 'Hanamkonda', lat: 18.0072, lng: 79.5584 },
  { name: 'Jagtial', lat: 18.7895, lng: 78.9120 },
  { name: 'Jubilee Bus Station', lat: 17.4486, lng: 78.4983 },
  { name: 'Karimnagar', lat: 18.4386, lng: 79.1288 },
  { name: 'Kazipet', lat: 17.9784, lng: 79.5126 },
  { name: 'Khammam', lat: 17.2473, lng: 80.1514 },
  { name: 'Mahabubnagar', lat: 16.7488, lng: 78.0035 },
  { name: 'Mahatma Gandhi Bus Station', lat: 17.3782, lng: 78.4806 },
  { name: 'Mancherial', lat: 18.8714, lng: 79.4443 },
  { name: 'Medak', lat: 18.0466, lng: 78.2608 },
  { name: 'Nalgonda', lat: 17.0575, lng: 79.2684 },
  { name: 'Nirmal', lat: 19.0964, lng: 78.3430 },
  { name: 'Nizamabad', lat: 18.6725, lng: 78.0941 },
  { name: 'Sangareddy', lat: 17.6140, lng: 78.0816 },
  { name: 'Siddipet', lat: 18.1019, lng: 78.8520 },
  { name: 'Suryapet', lat: 17.1314, lng: 79.6336 },
  { name: 'Vemulawada', lat: 18.4667, lng: 78.8667 },
  { name: 'Vikarabad', lat: 17.3364, lng: 77.9048 },
  { name: 'Wanaparthy', lat: 16.3622, lng: 78.0622 },
  { name: 'Warangal', lat: 17.9689, lng: 79.5941 },
  { name: 'Yadagirigutta', lat: 17.5880, lng: 78.9437 }
];

export const PROMO_CODES = [
  { code: 'GET100', type: 'FLAT', value: 100, minFare: 250, desc: 'Flat ₹100 OFF on bookings above ₹250' },
  { code: 'FIRSTBUS', type: 'PERCENT', value: 15, maxDiscount: 120, minFare: 100, desc: '15% OFF (up to ₹120) for first-time riders' },
  { code: 'FESTIVE20', type: 'PERCENT', value: 20, maxDiscount: 150, minFare: 300, desc: '20% Telangana Festive Bonanza (up to ₹150)' }
];

export const OPERATORS_DATA = [
  {
    id: 'op-1',
    name: 'TGSRTC (Telangana State Road Transport)',
    rating: '4.8 ★',
    fleetCount: '9,400+ Buses',
    categories: ['Palle Velugu', 'Express', 'Deluxe', 'Super Luxury', 'Garuda Plus'],
    routes: [
      { from: 'Hanamkonda', to: 'Jubilee Bus Station', frequency: 'Every 15 mins', fareFrom: 260 },
      { from: 'Warangal', to: 'Karimnagar', frequency: 'Every 30 mins', fareFrom: 110 },
      { from: 'Khammam', to: 'Mahatma Gandhi Bus Station', frequency: 'Every 20 mins', fareFrom: 310 }
    ]
  },
  {
    id: 'op-2',
    name: 'Orange Tours & Travels',
    rating: '4.6 ★',
    fleetCount: '420+ AC Sleepers',
    categories: ['AC Sleeper', 'Volvo Multi-Axle Seater'],
    routes: [
      { from: 'Jubilee Bus Station', to: 'Adilabad', frequency: '4 Daily Services', fareFrom: 650 },
      { from: 'Mahatma Gandhi Bus Station', to: 'Bhadrachalam', frequency: '3 Daily Services', fareFrom: 580 }
    ]
  },
  {
    id: 'op-3',
    name: 'Morning Star Travels',
    rating: '4.5 ★',
    fleetCount: '310+ Luxury Coaches',
    categories: ['AC Seater', 'Non-AC Sleeper'],
    routes: [
      { from: 'Nizamabad', to: 'Jubilee Bus Station', frequency: 'Every 1 hour', fareFrom: 340 },
      { from: 'Hanamkonda', to: 'Khammam', frequency: 'Every 2 hours', fareFrom: 220 }
    ]
  },
  {
    id: 'op-4',
    name: 'Kaveri & VRL Express',
    rating: '4.7 ★',
    fleetCount: '280+ Coaches',
    categories: ['AC Sleeper', 'AC Seater'],
    routes: [
      { from: 'Karimnagar', to: 'Mahatma Gandhi Bus Station', frequency: 'Every 45 mins', fareFrom: 290 },
      { from: 'Suryapet', to: 'Dilsukhnagar', frequency: 'Every 30 mins', fareFrom: 210 }
    ]
  }
];

export const FAQ_DATA = [
  {
    q: 'How is the 75% cancellation refund calculated?',
    a: 'If you cancel an upcoming trip from the My Bookings tab at least 2 hours before departure, 75% of the paid ticket amount is instantly refunded to your original payment mode.'
  },
  {
    q: 'Which documents are required for a Student or General Digital Bus Pass?',
    a: 'You need a valid 12-digit Aadhaar number and a clear PDF, JPG, or PNG scan of your Aadhaar card or College Bonafide ID (strictly verified by our CyberShield upload firewall).'
  },
  {
    q: 'How do I apply promo codes like GET100, FIRSTBUS, or FESTIVE20?',
    a: 'During seat selection on the Smart Ticket Booking tab, enter GET100, FIRSTBUS, or FESTIVE20 in the Promo Code box before proceeding to the payment gateway.'
  },
  {
    q: 'How does Real-Time Shortest Path & GPS Tracking work?',
    a: 'Select any Source and Destination from our 26+ Telangana stations on the Live Map tab to view the shortest route polyline, Haversine road distance, ETA, live weather, and animated bus positions.'
  },
  {
    q: 'Can I reschedule my booked bus ticket?',
    a: 'Yes! Open My Bookings, click Reschedule on any upcoming trip, pick a new journey date, and your PDF E-Ticket updates immediately with zero extra fee.'
  }
];

// Haversine Distance Calculator (in KM)
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.18); // 1.18 road curvature factor
}