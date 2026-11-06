// Fisherman dashboard home page matching the SeaSafe reference design.
// Contains: Welcome hero banner with boat photo, StatCards,Recent Trips table (last 5), and Fish Price Board preview.
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import WeatherCard from '../../components/WeatherCard';
import { formatTime } from '../../utils/formatDate';

export default function FishermanHome() {
  const { user } = useContext(AuthContext);

  const [boats, setBoats] = useState([]);
  const [trips, setTrips] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch boats, trips, and prices concurrently
    Promise.all([
      api.get('/boats'),
      api.get('/trips/my'),
      api.get('/prices')
    ])
      .then(([boatsRes, tripsRes, pricesRes]) => {
        setBoats(boatsRes.data);
        setTrips(tripsRes.data);
        setPrices(pricesRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      });
  }, []);

  // Compute summary stats
  const activeTripsCount = trips.filter((t) => t.status === 'At Sea').length;
  const overdueTripsCount = trips.filter((t) => t.status === 'Overdue').length;

  // Calculate total catch in kg from all trips
  let totalCatchKg = 0;
  trips.forEach((t) => {
    (t.catches || []).forEach((c) => {
      totalCatchKg += c.quantityKg;
    });
  });

  const recentTrips = trips.slice(0, 5);
  const previewPrices = prices.slice(0, 3);

  // Fish emoji picker helper
  const getFishEmoji = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('prawn') || t.includes('shrimp')) return '🦐';
    if (t.includes('crab')) return '🦀';
    return '🐟';
  };

  return (
    <div>
      {/* Welcome Hero Banner with boat visual */}
      <div className="welcome-hero">
        <div className="welcome-hero-text">
          <h1>Welcome, {user?.name || 'Fisherman'}!</h1>
          <p>Track your fishing trips and keep your seas safer with automated overdue monitoring.</p>
          <Link to="/fisherman/start-trip" className="btn btn-primary" style={{ background: '#fff', color: 'var(--ocean-blue)' }}>
            Start New Trip →
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="stat-cards-grid">
        <StatCard title="My Boats" value={boats.length} icon="🚢" iconBg="#e0f2fe" />
        <StatCard title="Active Trips" value={activeTripsCount} icon="⛵" iconBg="#e0f2fe" />
        <StatCard
          title="Overdue Trips"
          value={overdueTripsCount}
          icon="⚠️"
          iconBg={overdueTripsCount > 0 ? 'var(--danger-light)' : '#f1f5f9'}
        />
        <StatCard title="Total Catch" value={`${totalCatchKg} kg`} icon="🐟" iconBg="#e0f2fe" />
      </div>

      {/* Weather Forecast & Marine Conditions */}
      <div style={{ marginBottom: '1.5rem' }}>
        <WeatherCard />
      </div>

      {/* Two columns: Recent Trips & Fish Price Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Trips Table Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🚢</span> My Recent Trips
            </h3>
            <Link to="/fisherman/history" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading trips...</p>
          ) : recentTrips.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⛵</div>
              <p>No trips recorded yet.</p>
              <Link to="/fisherman/start-trip" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                Start your first trip
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Boat Name</th>
                    <th>Departure</th>
                    <th>Expected Return</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.map((trip) => (
                    <tr key={trip._id}>
                      <td style={{ fontWeight: 600 }}>{trip.boat?.boatName || 'Deleted boat'}</td>
                      <td>{formatTime(trip.departureTime)}</td>
                      <td>{formatTime(trip.expectedReturnTime)}</td>
                      <td>
                        <StatusBadge status={trip.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Fish Price Board Preview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🏷️</span> Fish Price Board
            </h3>
            <Link to="/fisherman/prices" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading prices...</p>
          ) : previewPrices.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No prices listed yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {previewPrices.map((p) => (
                <div
                  key={p._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: '#f8fafc',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getFishEmoji(p.fishType)}</span>
                    <span style={{ fontWeight: 600 }}>{p.fishType}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--ocean-blue)', fontSize: '1.05rem' }}>
                    ₹{p.pricePerKg}/kg
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

