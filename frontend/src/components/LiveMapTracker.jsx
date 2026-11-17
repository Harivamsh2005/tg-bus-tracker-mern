import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, ArrowLeftRight, CloudSun, LocateFixed, Play, Square, RefreshCw } from 'lucide-react';
import { TG_STATIONS, calculateDistanceKm } from '../data/tgData';

const busIcon = new L.DivIcon({
  html: `<div style="background:#2563eb;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:2px solid #93c5fd;box-shadow:0 0 12px rgba(37,99,235,0.9);">🚌</div>`,
  className: '',
  iconSize: [32, 32]
});

function MapFlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 10, { duration: 1.2 });
  }, [coords, map]);
  return null;
}

export default function LiveMapTracker({ buses, selectedBus, setSelectedBus, onSimulateGps }) {
  const [fromStation, setFromStation] = useState('Hanamkonda');
  const [toStation, setToStation] = useState('Jubilee Bus Station');
  const [userGps, setUserGps] = useState(null);
  const [flyCoords, setFlyCoords] = useState(null);
  const [weather, setWeather] = useState({ temp: 27, wind: 11, desc: 'Clear Sky' });
  const [autoAnimate, setAutoAnimate] = useState(true);

  const srcObj = TG_STATIONS.find(s => s.name === fromStation) || TG_STATIONS[5];
  const dstObj = TG_STATIONS.find(s => s.name === toStation) || TG_STATIONS[7];

  const shortestKm = calculateDistanceKm(srcObj.lat, srcObj.lng, dstObj.lat, dstObj.lng);
  const estMinutes = Math.round((shortestKm / 52) * 60);
  const estHoursText = `${Math.floor(estMinutes / 60)}h ${estMinutes % 60}m`;

  // Fetch Real Weather for Destination Station
  useEffect(() => {
    axios
      .get(`https://api.open-meteo.com/v1/forecast?latitude=${dstObj.lat}&longitude=${dstObj.lng}¤t_weather=true`)
      .then(res => {
        if (res.data?.current_weather) {
          setWeather({
            temp: res.data.current_weather.temperature,
            wind: res.data.current_weather.windspeed,
            desc: res.data.current_weather.temperature > 30 ? 'Sunny' : 'Pleasant'
          });
        }
      })
      .catch(() => {});
  }, [toStation]);

  // Smooth Live Bus Animation every 4 seconds
  useEffect(() => {
    if (!autoAnimate) return;
    const timer = setInterval(() => {
      onSimulateGps();
    }, 4000);
    return () => clearInterval(timer);
  }, [autoAnimate]);

  const handleLocateUser = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported by your browser');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserGps(coords);
        setFlyCoords(coords);
      },
      () => {
        // Fallback to Hanamkonda coordinates if browser blocks permission
        const fallback = [18.0072, 79.5584];
        setUserGps(fallback);
        setFlyCoords(fallback);
      }
    );
  };

  const swapRoute = () => {
    setFromStation(toStation);
    setToStation(fromStation);
  };

  // Intermediate midpoint for realistic highway curve
  const midLat = (srcObj.lat + dstObj.lat) / 2 + 0.04;
  const midLng = (srcObj.lng + dstObj.lng) / 2 - 0.04;
  const shortestPath = [
    [srcObj.lat, srcObj.lng],
    [midLat, midLng],
    [dstObj.lat, dstObj.lng]
  ];

  return (
    <div>
      {/* Route Planner & Telemetry Bar */}
      <div className="card">
        <div className="form-row" style={{ alignItems: 'flex-end', marginBottom: 14 }}>
          <div className="form-group">
            <label>Origin Station (26+ Telangana Hubs)</label>
            <select value={fromStation} onChange={e => setFromStation(e.target.value)}>
              {TG_STATIONS.map(st => <option key={st.name} value={st.name}>{st.name}</option>)}
            </select>
          </div>

          <button type="button" className="btn btn-secondary" onClick={swapRoute} title="Swap Bidirectional Route">
            <ArrowLeftRight size={18} />
          </button>

          <div className="form-group">
            <label>Destination Station</label>
            <select value={toStation} onChange={e => setToStation(e.target.value)}>
              {TG_STATIONS.map(st => <option key={st.name} value={st.name}>{st.name}</option>)}
            </select>
          </div>

          <button className="btn btn-primary" onClick={handleLocateUser}>
            <LocateFixed size={16} /> My GPS Location
          </button>

          <button className="btn btn-emerald" onClick={onSimulateGps}>
            <RefreshCw size={16} /> Step GPS
          </button>

          <button className={`btn ${autoAnimate ? 'btn-danger' : 'btn-secondary'}`} onClick={() => setAutoAnimate(!autoAnimate)}>
            {autoAnimate ? <><Square size={14} /> Pause Live</> : <><Play size={14} /> Auto Live</>}
          </button>
        </div>

        {/* Shortest Path Metrics Strip */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, background: '#0f172a', padding: '12px 16px', borderRadius: 10, border: '1px solid #1e293b', justifyContent: 'space-between' }}>
          <div>🛣️ <strong>Shortest Route:</strong> {fromStation} ➔ {toStation}</div>
          <div>📏 <strong>Est. Distance:</strong> <span className="badge badge-blue">{shortestKm} km</span></div>
          <div>⏱️ <strong>Est. Travel Time:</strong> <span className="badge badge-green">{estHoursText}</span></div>
          <div>
            <CloudSun size={15} style={{ verticalAlign: 'middle', color: '#fbbf24' }} />{' '}
            <strong>{toStation} Weather:</strong> <span className="badge badge-amber">{weather.temp}°C • Wind {weather.wind} km/h</span>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Live Fleet List */}
        <div className="card">
          <div className="card-title">
            <span><Navigation size={16} style={{ verticalAlign: 'middle' }} /> Live Animated Buses ({buses.length})</span>
            <span className="badge badge-green">26 Stations Active</span>
          </div>
          <div className="bus-list">
            {buses.map(bus => (
              <div
                key={bus._id}
                className={`bus-item ${selectedBus?._id === bus._id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedBus(bus);
                  setFlyCoords([bus.currentLocation.lat, bus.currentLocation.lng]);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong>{bus.busNumber}</strong>
                  <span className="badge badge-blue">{bus.serviceType}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: 8 }}>
                  {bus.source} ➔ {bus.destination}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span>Speed: <strong style={{ color: '#34d399' }}>{bus.currentLocation.speedKmph} km/h</strong></span>
                  <span>Seats Free: <strong>{bus.totalSeats - bus.bookedSeats.length}</strong></span>
                  <span>GPS: <strong>{bus.currentLocation.lat.toFixed(2)}, {bus.currentLocation.lng.toFixed(2)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Leaflet Map */}
        <div className="card">
          <div className="card-title">
            <span>Telangana Live Telemetry & Shortest Path Map</span>
            <span className="badge badge-blue">OSM Dark Layer</span>
          </div>

          <div className="map-wrapper">
            <MapContainer center={[17.85, 79.15]} zoom={7} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
              <MapFlyTo coords={flyCoords} />

              {/* All 26+ Telangana Bus Stations */}
              {TG_STATIONS.map(st => (
                <CircleMarker
                  key={st.name}
                  center={[st.lat, st.lng]}
                  radius={st.name === fromStation || st.name === toStation ? 8 : 4}
                  pathOptions={{
                    color: st.name === fromStation ? '#10b981' : st.name === toStation ? '#ef4444' : '#60a5fa',
                    fillOpacity: 0.9
                  }}
                >
                  <Popup>
                    <strong>{st.name} Bus Station</strong><br />
                    Telangana State Transit Hub
                  </Popup>
                </CircleMarker>
              ))}

              {/* Shortest Path Polyline */}
              <Polyline positions={shortestPath} color="#10b981" weight={5} dashArray="8, 8" />

              {/* User Live GPS Marker */}
              {userGps && (
                <CircleMarker center={userGps} radius={9} pathOptions={{ color: '#f59e0b', fillColor: '#fbbf24', fillOpacity: 1 }}>
                  <Popup>📍 <strong>Your Live GPS Location</strong></Popup>
                </CircleMarker>
              )}

              {/* Live Animated Buses */}
              {buses.map(bus => (
                <Marker key={bus._id} position={[bus.currentLocation.lat, bus.currentLocation.lng]} icon={busIcon}>
                  <Popup>
                    <strong>{bus.busNumber}</strong> ({bus.serviceType})<br />
                    {bus.source} ➔ {bus.destination}<br />
                    Live Speed: {bus.currentLocation.speedKmph} km/h
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}