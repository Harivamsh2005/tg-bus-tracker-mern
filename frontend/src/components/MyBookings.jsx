import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Download, CalendarClock, XCircle, Ticket } from 'lucide-react';

export default function MyBookings({ bookings, onUpdateBookings }) {
  const [filter, setFilter] = useState('UPCOMING');
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const displayed = bookings.filter(b => {
    if (filter === 'UPCOMING') return b.journeyDate >= today && b.status !== 'CANCELLED';
    return b.journeyDate < today || b.status === 'CANCELLED';
  });

  const handleCancel = (ticketId) => {
    const updated = bookings.map(b => {
      if (b.ticketId === ticketId) {
        const refundAmount = Math.round(b.amountPaid * 0.75);
        alert(`Ticket ${ticketId} Cancelled! 75% Refund (₹${refundAmount}) initiated to ${b.paymentMode}.`);
        return { ...b, status: 'CANCELLED', refundAmount };
      }
      return b;
    });
    onUpdateBookings(updated);
  };

  const handleReschedule = (ticketId) => {
    if (!newDate) return alert('Select a new journey date');
    const updated = bookings.map(b => (b.ticketId === ticketId ? { ...b, journeyDate: newDate } : b));
    onUpdateBookings(updated);
    setRescheduleId(null);
    alert(`Ticket rescheduled to ${newDate}!`);
  };

  const downloadPdfTicket = (b) => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('TGSRTC & PARTNER E-TICKET', 15, 22);
    doc.setFontSize(10);
    doc.text(`PNR / Ticket ID: ${b.ticketId}  |  Status: ${b.status}`, 15, 32);

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(12);
    doc.text(`Operator: ${b.operator} (${b.busNumber})`, 15, 55);
    doc.text(`Coach Type: ${b.coachType}`, 15, 64);
    doc.text(`Route: ${b.from}  --->  ${b.to}`, 15, 74);
    doc.text(`Journey Date: ${b.journeyDate}`, 15, 84);
    doc.text(`Passenger: ${b.passengerName} (${b.phone})`, 15, 94);
    doc.text(`ID Proof: ${b.aadhaarMasked}`, 15, 104);
    doc.text(`Seat Numbers: ${b.seats.join(', ')}`, 15, 114);
    doc.text(`Amount Paid: INR ${b.amountPaid} (${b.paymentMode})`, 15, 124);

    // Simulated QR Code Box on PDF
    doc.setDrawColor(16, 185, 129);
    doc.rect(145, 50, 48, 48);
    doc.setFontSize(9);
    doc.text('SCAN QR TO BOARD', 151, 60);
    doc.setFontSize(11);
    doc.text('|| ||| | |||| ||', 152, 75);
    doc.text(b.ticketId, 150, 88);

    doc.save(`${b.ticketId}-ETicket.pdf`);
  };

  return (
    <div className="card">
      <div className="card-title">
        <span><Ticket size={18} style={{ verticalAlign: 'middle' }} /> My Bookings & PDF E-Tickets</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${filter === 'UPCOMING' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('UPCOMING')}>
            Upcoming Trips
          </button>
          <button className={`btn ${filter === 'PAST' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('PAST')}>
            Past & Cancelled
          </button>
        </div>
      </div>

      {displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
          No trips found under {filter.toLowerCase()} bookings. Book a ticket from the Smart Ticket Booking tab!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {displayed.map(b => (
            <div key={b.ticketId} className="bus-item" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <strong style={{ fontSize: '1.05rem' }}>{b.from} ➔ {b.to}</strong>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {b.operator} ({b.busNumber}) • {b.coachType} • Date: <strong>{b.journeyDate}</strong>
                  </div>
                </div>
                <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-green' : 'badge-red'}`}>
                  {b.status} {b.refundAmount ? `(75% Refund: ₹${b.refundAmount})` : ''}
                </span>
              </div>

              <div style={{ marginTop: 10, fontSize: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: 16, color: '#cbd5e1' }}>
                <span>PNR: <strong>{b.ticketId}</strong></span>
                <span>Passenger: <strong>{b.passengerName}</strong></span>
                <span>Seats: <strong>{b.seats.join(', ')}</strong></span>
                <span>Paid: <strong>₹{b.amountPaid}</strong></span>
              </div>

              {b.status === 'CONFIRMED' && (
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  <button className="btn btn-emerald" onClick={() => downloadPdfTicket(b)}>
                    <Download size={15} /> Download PDF E-Ticket
                  </button>
                  <button className="btn btn-secondary" onClick={() => setRescheduleId(b.ticketId)}>
                    <CalendarClock size={15} /> Reschedule
                  </button>
                  <button className="btn btn-danger" onClick={() => handleCancel(b.ticketId)}>
                    <XCircle size={15} /> Cancel (75% Refund)
                  </button>
                </div>
              )}

              {rescheduleId === b.ticketId && (
                <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
                  <button className="btn btn-primary" onClick={() => handleReschedule(b.ticketId)}>Save New Date</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}