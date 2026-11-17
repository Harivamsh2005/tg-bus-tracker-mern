import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Bus, Navigation, Ticket, FolderCheck, CreditCard, Building2, HelpCircle, ShieldAlert, Lock, Unlock
} from 'lucide-react';
import LiveMapTracker from './components/LiveMapTracker';
import TicketBooking from './components/TicketBooking';
import MyBookings from './components/MyBookings';
import BusPassPortal from './components/BusPassPortal';
import OperatorsAndOffers from './components/OperatorsAndOffers';
import SupportAndChatbot from './components/SupportAndChatbot';

const API = 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [firewallAlert, setFirewallAlert] = useState('');

  // Admin / Developer Security Mode (Hidden from regular passengers)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  // LocalStorage Persisted Bookings
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('tg_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  // Firewall Data
  const [firewallData, setFirewallData] = useState({ blockedIPs: [], logs: [] });
  const [ipToBlock, setIpToBlock] = useState('');

  useEffect(() => {
    localStorage.setItem('tg_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const fetchBuses = async () => {
    try {
      const res = await axios.get(`${API}/buses`);
      setBuses(res.data);
      if (res.data.length > 0 && !selectedBus) setSelectedBus(res.data[0]);
    } catch (_) {}
  };

  const fetchFirewall = async () => {
    try {
      const res = await axios.get(`${API}/firewall/status`);
      setFirewallData(res.data);
    } catch (_) {}
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  // Keyboard shortcut Ctrl + Shift + F for Developer Security Panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        openDeveloperFirewall();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminUnlocked]);

  const openDeveloperFirewall = () => {
    if (isAdminUnlocked) {
      setActiveTab('firewall');
      fetchFirewall();
      return;
    }
    const pwd = window.prompt('Developer / Admin Access Only — Enter Security Key:');
    if (pwd === 'AdminPassword@2026' || pwd === 'admin123') {
      setIsAdminUnlocked(true);
      setActiveTab('firewall');
      fetchFirewall();
    } else if (pwd !== null) {
      alert('Unauthorized! Access restricted to Backend Administrators.');
    }
  };

  const handleSimulateGps = async () => {
    try {
      const res = await axios.post(`${API}/buses/simulate-gps`);
      setBuses(res.data.buses);
      if (selectedBus) {
        const updated = res.data.buses.find(b => b._id === selectedBus._id);
        if (updated) setSelectedBus(updated);
      }
    } catch (_) {}
  };

  const handleBlockIp = async (e) => {
    e.preventDefault();
    if (!ipToBlock) return;
    await axios.post(`${API}/firewall/block-ip`, { ipAddress: ipToBlock, reason: 'Admin Manual Block' });
    setIpToBlock('');
    fetchFirewall();
  };

  const simulateInjectionAttack = async () => {
    try {
      await axios.post(`${API}/auth/login`, { email: { $where: '1==1' }, password: 'hack' });
    } catch (err) {
      if (err.response?.data?.firewallAlert) {
        setFirewallAlert(err.response.data.message);
        fetchFirewall();
      }
    }
  };

  return (
    <div className="app-container">
      {/* Clean Passenger-First Top Navbar */}
      <header className="navbar">
        <div className="brand">
          <Bus size={26} color="#3b82f6" />
          <div>
            <h1>TGSRTC Smart Transit</h1>
            <span>26+ Telangana Stations • Live GPS & E-Ticketing</span>
          </div>
        </div>

        <nav className="nav-tabs">
          <button className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
            <Navigation size={15} /> Live Map
          </button>
          <button className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`} onClick={() => setActiveTab('book')}>
            <Ticket size={15} /> Smart Booking
          </button>
          <button className={`tab-btn ${activeTab === 'mybookings' ? 'active' : ''}`} onClick={() => setActiveTab('mybookings')}>
            <FolderCheck size={15} /> My Bookings ({bookings.length})
          </button>
          <button className={`tab-btn ${activeTab === 'pass' ? 'active' : ''}`} onClick={() => setActiveTab('pass')}>
            <CreditCard size={15} /> Bus Pass
          </button>
          <button className={`tab-btn ${activeTab === 'operators' ? 'active' : ''}`} onClick={() => setActiveTab('operators')}>
            <Building2 size={15} /> Operators & Offers
          </button>
          <button className={`tab-btn ${activeTab === 'support' ? 'active' : ''}`} onClick={() => setActiveTab('support')}>
            <HelpCircle size={15} /> Support & AI
          </button>

          {isAdminUnlocked && (
            <button className={`tab-btn firewall-tab ${activeTab === 'firewall' ? 'active' : ''}`} onClick={() => { setActiveTab('firewall'); fetchFirewall(); }}>
              <ShieldAlert size={15} /> Dev Firewall ({firewallData.logs.length})
            </button>
          )}
        </nav>
      </header>

      {firewallAlert && (
        <div className="alert-banner">
          🚨 {firewallAlert}
          <button style={{ float: 'right', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setFirewallAlert('')}>✖</button>
        </div>
      )}

      {activeTab === 'map' && (
        <LiveMapTracker
          buses={buses}
          selectedBus={selectedBus}
          setSelectedBus={setSelectedBus}
          onSimulateGps={handleSimulateGps}
        />
      )}

      {activeTab === 'book' && (
        <TicketBooking
          onBookingComplete={(newTicket) => {
            setBookings([newTicket, ...bookings]);
            setActiveTab('mybookings');
          }}
        />
      )}

      {activeTab === 'mybookings' && (
        <MyBookings bookings={bookings} onUpdateBookings={setBookings} />
      )}

      {activeTab === 'pass' && (
        <BusPassPortal onFirewallAlert={(msg) => setFirewallAlert(msg)} />
      )}

      {activeTab === 'operators' && <OperatorsAndOffers />}

      {activeTab === 'support' && <SupportAndChatbot />}

      {/* Hidden Developer / Admin Firewall Panel */}
      {activeTab === 'firewall' && isAdminUnlocked && (
        <div className="card">
          <div className="card-title">
            <span><Lock size={16} /> Developer Backend WAF & Intrusion Monitor</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-danger" onClick={simulateInjectionAttack}>⚡ Simulate Attack</button>
              <button className="btn btn-secondary" onClick={() => { setIsAdminUnlocked(false); setActiveTab('map'); }}>
                <Unlock size={14} /> Lock Dev Panel
              </button>
            </div>
          </div>
          <form onSubmit={handleBlockIp} className="form-row">
            <div className="form-group">
              <input placeholder="Block suspicious IP (e.g. 192.168.1.99)" value={ipToBlock} onChange={e => setIpToBlock(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-danger">Blacklist IP</button>
          </form>
          <div style={{ overflowX: 'auto', marginTop: 14 }}>
            <table className="log-table">
              <thead>
                <tr><th>Time</th><th>IP</th><th>Threat</th><th>Endpoint</th><th>Details</th></tr>
              </thead>
              <tbody>
                {firewallData.logs.map(log => (
                  <tr key={log._id}>
                    <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td><code>{log.ipAddress}</code></td>
                    <td><span className="badge badge-red">{log.threatType}</span></td>
                    <td>{log.endpoint}</td>
                    <td>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtle Footer with Developer Console Trigger */}
      <footer style={{ textAlign: 'center', marginTop: 30, paddingTop: 14, borderTop: '1px solid #1e293b', fontSize: '0.8rem', color: '#64748b' }}>
        <span>TGSRTC Smart Transit Portal • Protected by Background Application Firewall</span>
        {' • '}
        <button
          onClick={openDeveloperFirewall}
          style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.78rem' }}
        >
          Developer Security Console
        </button>
      </footer>
    </div>
  );
}