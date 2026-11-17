import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Tag, CreditCard, Smartphone, Landmark, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { TG_STATIONS, PROMO_CODES, calculateDistanceKm } from '../data/tgData';

const API = 'http://localhost:5000/api';

const BUS_CATALOG = [
  { id: 'tg-101', operator: 'TGSRTC Garuda Plus', busNumber: 'TS-03-Z-4512', category: 'AC', seatType: 'Seater', farePerKm: 1.8, booked: [3, 4, 11, 18] },
  { id: 'tg-102', operator: 'Orange Tours', busNumber: 'TS-09-UB-7721', category: 'AC', seatType: 'Sleeper', farePerKm: 2.4, booked: [1, 2, 9, 10, 22] },
  { id: 'tg-103', operator: 'TGSRTC Super Luxury', busNumber: 'TS-10-Z-8821', category: 'Non-AC', seatType: 'Seater', farePerKm: 1.4, booked: [5, 14, 27] },
  { id: 'tg-104', operator: 'Morning Star Travels', busNumber: 'TS-04-UA-3304', category: 'Non-AC', seatType: 'Sleeper', farePerKm: 1.9, booked: [7, 8, 19] }
];

export default function TicketBooking({ onBookingComplete }) {
  const [from, setFrom] = useState('Hanamkonda');
  const [to, setTo] = useState('Jubilee Bus Station');
  const [journeyDate, setJourneyDate] = useState('2026-11-20');
  const [acFilter, setAcFilter] = useState('ALL');
  const [seatFilter, setSeatFilter] = useState('ALL');
  const [selectedCoach, setSelectedCoach] = useState(BUS_CATALOG[0]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Passenger Form & Validation
  const [passengerName, setPassengerName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [formError, setFormError] = useState('');

  // Promo Code
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Payment Gateway Modal
  const [showGateway, setShowGateway] = useState(false);
  const [payTab, setPayTab] = useState('UPI');
  const [secondsLeft, setSecondsLeft] = useState(300); // 5-min UPI timer
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [selectedBank, setSelectedBank] = useState('State Bank of India (SBI)');

  const srcObj = TG_STATIONS.find(s => s.name === from) || TG_STATIONS[5];
  const dstObj = TG_STATIONS.find(s => s.name === to) || TG_STATIONS[7];
  const distanceKm = Math.max(35, calculateDistanceKm(srcObj.lat, srcObj.lng, dstObj.lat, dstObj.lng));

  const filteredBuses = BUS_CATALOG.filter(b => {
    if (acFilter !== 'ALL' && b.category !== acFilter) return false;
    if (seatFilter !== 'ALL' && b.seatType !== seatFilter) return false;
    return true;
  });

  // 5-Minute Countdown Timer for UPI Payment Gateway
  useEffect(() => {
    if (!showGateway) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showGateway]);

  const baseFare = Math.round(distanceKm * selectedCoach.farePerKm * selectedSeats.length);
  let discount = 0;
  if (appliedPromo && baseFare >= appliedPromo.minFare) {
    discount =
      appliedPromo.type === 'FLAT'
        ? appliedPromo.value
        : Math.min(appliedPromo.maxDiscount, Math.round((baseFare * appliedPromo.value) / 100));
  }
  const finalFare = Math.max(0, baseFare - discount);

  const handleApplyPromo = () => {
    const found = PROMO_CODES.find(p => p.code === promoInput.trim().toUpperCase());
    if (!found) return alert('Invalid Promo Code! Try GET100, FIRSTBUS, or FESTIVE20');
    if (baseFare < found.minFare) return alert(`Minimum fare ₹${found.minFare} required for ${found.code}`);
    setAppliedPromo(found);
  };

  const toggleSeat = (num) => {
    if (selectedCoach.booked.includes(num)) return;
    setSelectedSeats(prev => (prev.includes(num) ? prev.filter(s => s !== num) : [...prev, num]));
  };

  const openCheckout = (e) => {
    e.preventDefault();
    setFormError('');
    if (selectedSeats.length === 0) return setFormError('Please select at least 1 seat.');
    if (!/^[6-9]\d{9}$/.test(phone)) return setFormError('Enter a valid 10-digit Indian mobile number.');
    if (!/^\d{12}$/.test(aadhaar)) return setFormError('Enter a valid 12-digit ID number.');
    setSecondsLeft(300);
    setShowGateway(true);
  };

  const confirmPayment = async () => {
    const newBooking = {
      ticketId: `TGRTC-${Math.floor(100000 + Math.random() * 900000)}`,
      operator: selectedCoach.operator,
      busNumber: selectedCoach.busNumber,
      coachType: `${selectedCoach.category} ${selectedCoach.seatType}`,
      from,
      to,
      journeyDate,
      passengerName,
      phone,
      aadhaarMasked: `XXXX-XXXX-${aadhaar.slice(-4)}`,
      seats: selectedSeats,
      amountPaid: finalFare,
      discountApplied: discount,
      paymentMode: payTab,
      status: 'CONFIRMED',
      bookedAt: new Date().toISOString()
    };

    try {
      await axios.post(`${API}/health`); // Verify backend firewall check
    } catch (_) {}

    onBookingComplete(newBooking);
    setShowGateway(false);
    setSelectedSeats([]);
    alert(`Payment Successful! E-Ticket ${newBooking.ticketId} saved to My Bookings.`);
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div>
      {/* Search & Filters */}
      <div className="card">
        <div className="form-row">
          <div className="form-group">
            <label>From</label>
            <select value={from} onChange={e => setFrom(e.target.value)}>
              {TG_STATIONS.map(s => <option key={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>To</label>
            <select value={to} onChange={e => setTo(e.target.value)}>
              {TG_STATIONS.map(s => <option key={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Journey Date</label>
            <input type="date" value={journeyDate} onChange={e => setJourneyDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Climate Filter</label>
            <select value={acFilter} onChange={e => setAcFilter(e.target.value)}>
              <option value="ALL">All (AC & Non-AC)</option>
              <option value="AC">AC Only</option>
              <option value="Non-AC">Non-AC Only</option>
            </select>
          </div>
          <div className="form-group">
            <label>Coach Layout</label>
            <select value={seatFilter} onChange={e => setSeatFilter(e.target.value)}>
              <option value="ALL">Seater & Sleeper</option>
              <option value="Seater">Seater</option>
              <option value="Sleeper">Sleeper</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Bus Selection & Seat Map */}
        <div className="card">
          <div className="card-title">
            <span>Available Coaches ({distanceKm} km)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            {filteredBuses.map(bus => (
              <div
                key={bus.id}
                className={`bus-item ${selectedCoach.id === bus.id ? 'selected' : ''}`}
                onClick={() => { setSelectedCoach(bus); setSelectedSeats([]); }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{bus.operator} ({bus.busNumber})</strong>
                  <span className="badge badge-blue">{bus.category} • {bus.seatType}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
                  Seat Fare: <strong style={{ color: '#34d399' }}>₹{Math.round(distanceKm * bus.farePerKm)}</strong> / seat
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
            SELECT SEATS ({selectedCoach.seatType.toUpperCase()} DECK)
          </div>
          <div className="seat-grid">
            {Array.from({ length: 28 }, (_, i) => i + 1).map(num => {
              const isBooked = selectedCoach.booked.includes(num);
              const isSelected = selectedSeats.includes(num);
              return (
                <div
                  key={num}
                  className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleSeat(num)}
                >
                  {selectedCoach.seatType === 'Sleeper' ? `L${num}` : `S${num}`}
                </div>
              );
            })}
          </div>
        </div>

        {/* Passenger Validation & Dynamic Fare */}
        <div className="card">
          <div className="card-title">Passenger Details & Promo Checkout</div>

          {formError && <div className="alert-banner">⚠️ {formError}</div>}

          <form onSubmit={openCheckout}>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Primary Passenger Name *</label>
              <input required placeholder="Full Name as per ID" value={passengerName} onChange={e => setPassengerName(e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Mobile Number (10 digits) *</label>
                <input required maxLength={10} placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label>12-Digit ID Number *</label>
                <input required maxLength={12} placeholder="12-digit numeric ID" value={aadhaar} onChange={e => setAadhaar(e.target.value)} />
              </div>
            </div>

            {/* Promo Code Box */}
            <div className="form-row" style={{ alignItems: 'flex-end' }}>
              <div className="form-group">
                <label><Tag size={13} /> Promo Code (GET100, FIRSTBUS, FESTIVE20)</label>
                <input placeholder="Enter promo code" value={promoInput} onChange={e => setPromoInput(e.target.value)} />
              </div>
              <button type="button" className="btn btn-secondary" onClick={handleApplyPromo}>Apply Code</button>
            </div>

            {/* Dynamic Fare Summary */}
            <div style={{ background: '#0f172a', padding: 14, borderRadius: 10, marginBottom: 16, lineHeight: 1.8 }}>
              <div>Selected Seats: <strong>{selectedSeats.join(', ') || 'None'}</strong></div>
              <div>Base Fare ({selectedSeats.length} seats): <strong>₹{baseFare}</strong></div>
              {discount > 0 && <div style={{ color: '#34d399' }}>Promo Discount ({appliedPromo.code}): <strong>-₹{discount}</strong></div>}
              <div style={{ fontSize: '1.15rem', borderTop: '1px solid #1e293b', paddingTop: 6, marginTop: 6 }}>
                Payable Amount: <strong style={{ color: '#60a5fa' }}>₹{finalFare}</strong>
              </div>
            </div>

            <button type="submit" className="btn btn-emerald" style={{ width: '100%' }}>
              <Ticket size={16} /> Proceed to Payment Gateway (₹{finalFare})
            </button>
          </form>
        </div>
      </div>

      {/* SIMULATED MULTI-MODE PAYMENT GATEWAY MODAL */}
      {showGateway && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', border: '1px solid #3b82f6' }}>
            <div className="card-title">
              <span><ShieldCheck size={18} color="#10b981" style={{ verticalAlign: 'middle' }} /> TG-Pay Secure Gateway</span>
              <span className="badge badge-amber"><Clock size={13} /> {mins}:{secs}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button className={`btn ${payTab === 'UPI' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setPayTab('UPI')}>
                <Smartphone size={15} /> UPI QR
              </button>
              <button className={`btn ${payTab === 'CARD' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setPayTab('CARD')}>
                <CreditCard size={15} /> Card
              </button>
              <button className={`btn ${payTab === 'NETBANKING' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setPayTab('NETBANKING')}>
                <Landmark size={15} /> NetBanking
              </button>
            </div>

            {payTab === 'UPI' && (
              <div style={{ textAlign: 'center', background: '#0f172a', padding: 18, borderRadius: 12, marginBottom: 16 }}>
                <div style={{ background: 'white', color: '#0f172a', width: 140, height: 140, margin: '0 auto 10px', borderRadius: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 900 }}>
                  <div>█▀▀▀▀▀█ ▀▄ █▀▀▀▀▀█</div>
                  <div>█ ███ █ ▄▀ █ ███ █</div>
                  <div>█ ▀▀▀ █ ▀▄ █ ▀▀▀ █</div>
                  <div style={{ fontSize: '0.65rem', marginTop: 4 }}>tgsrtc@upi</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Scan with GPay / PhonePe / Paytm to pay <strong style={{ color: '#34d399' }}>₹{finalFare}</strong></div>
              </div>
            )}

            {payTab === 'CARD' && (
              <div style={{ marginBottom: 16 }}>
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <label>Card Number</label>
                  <input placeholder="4532 XXXX XXXX 8890" maxLength={16} value={cardDetails.number} onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry (MM/YY)</label>
                    <input placeholder="09/29" value={cardDetails.expiry} onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="password" maxLength={3} placeholder="***" value={cardDetails.cvv} onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {payTab === 'NETBANKING' && (
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Select Indian Bank</label>
                <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)}>
                  <option>State Bank of India (SBI)</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Union Bank of India</option>
                  <option>Axis Bank</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowGateway(false)}>Cancel</button>
              <button className="btn btn-emerald" style={{ flex: 2 }} onClick={confirmPayment}>
                <CheckCircle2 size={16} /> Complete Payment ₹{finalFare}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}