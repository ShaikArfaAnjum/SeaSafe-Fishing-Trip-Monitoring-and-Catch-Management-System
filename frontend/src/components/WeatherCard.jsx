// Live weather and sea wave conditions card for harbours in Andhra Pradesh
// Uses Open-Meteo free forecast API and marine API (no API key required)

import { useState, useEffect } from 'react';

// Harbour locations with coastal land coordinates and offshore Bay of Bengal coordinates
const HARBOURS = [
  {
    name: 'Visakhapatnam',
    lat: 17.6868,
    lon: 83.2185,
    seaLat: 17.68,
    seaLon: 83.40
  },
  {
    name: 'Kakinada',
    lat: 16.9891,
    lon: 82.2475,
    seaLat: 16.98,
    seaLon: 82.40
  },
  {
    name: 'Machilipatnam',
    lat: 16.1875,
    lon: 81.1389,
    seaLat: 16.18,
    seaLon: 81.30
  },
  {
    name: 'Nellore',
    lat: 14.4426,
    lon: 79.9865,
    seaLat: 14.44,
    seaLon: 80.20
  }
];

// Weather code mapping to description text and emoji
const WEATHER_CODES = {
  0: { label: 'Clear Sky', icon: '☀️' },
  1: { label: 'Mainly Clear', icon: '🌤️' },
  2: { label: 'Partly Cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Depositing Fog', icon: '🌫️' },
  51: { label: 'Light Drizzle', icon: '🌦️' },
  53: { label: 'Moderate Drizzle', icon: '🌦️' },
  55: { label: 'Dense Drizzle', icon: '🌧️' },
  61: { label: 'Slight Rain', icon: '🌧️' },
  63: { label: 'Moderate Rain', icon: '🌧️' },
  65: { label: 'Heavy Rain', icon: '🌧️' },
  80: { label: 'Rain Showers', icon: '🌦️' },
  81: { label: 'Heavy Showers', icon: '🌧️' },
  82: { label: 'Violent Showers', icon: '⛈️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with Hail', icon: '⛈️' },
  99: { label: 'Severe Thunderstorm', icon: '⛈️' }
};

export default function WeatherCard() {
  const [selectedHarbour, setSelectedHarbour] = useState('Visakhapatnam');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch weather and marine wave data when harbour changes
  useEffect(() => {
    const harbour = HARBOURS.find((h) => h.name === selectedHarbour) || HARBOURS[0];
    setLoading(true);
    setError(false);

    const landUrl = `https://api.open-meteo.com/v1/forecast?latitude=${harbour.lat}&longitude=${harbour.lon}&current=temperature_2m,wind_speed_10m,weather_code`;
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${harbour.seaLat}&longitude=${harbour.seaLon}&current=wave_height`;

    Promise.all([fetch(landUrl), fetch(marineUrl)])
      .then(async ([landRes, marineRes]) => {
        if (!landRes.ok) throw new Error('Land weather request failed');
        const landData = await landRes.json();

        // Marine API might occasionally return non-200 if offshore point is invalid
        let marineData = null;
        if (marineRes.ok) {
          marineData = await marineRes.json();
        }

        const current = landData.current || {};
        const code = current.weather_code ?? 0;
        const info = WEATHER_CODES[code] || { label: 'Fair Weather', icon: '🌤️' };

        // Parse wave height from marine API response
        let waveDisplay = 'Wave data not available';
        const wave = marineData?.current?.wave_height;
        if (typeof wave === 'number' && !isNaN(wave)) {
          waveDisplay = `Wave height: ${wave} m`;
        }

        setWeather({
          temp: typeof current.temperature_2m === 'number' ? Math.round(current.temperature_2m) : null,
          wind: current.wind_speed_10m ?? null,
          label: info.label,
          icon: info.icon,
          waveDisplay
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Weather fetch error:', err);
        setError(true);
        setLoading(false);
      });
  }, [selectedHarbour]);

  return (
    <div className="weather-card">
      {/* Card Header with title and harbour dropdown */}
      <div className="weather-header">
        <h3>
          <span>🌤️</span> Weather Info
        </h3>
        <select
          className="weather-select"
          value={selectedHarbour}
          onChange={(e) => setSelectedHarbour(e.target.value)}
          aria-label="Select Harbour"
        >
          {HARBOURS.map((h) => (
            <option key={h.name} value={h.name}>
              {h.name} Harbour
            </option>
          ))}
        </select>
      </div>

      {/* Weather Body */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0.5rem 0' }}>
          Loading weather...
        </p>
      ) : error || !weather ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0.5rem 0' }}>
          Weather not available right now
        </p>
      ) : (
        <>
          <div className="weather-body">
            <div className="weather-icon">{weather.icon}</div>
            <div>
              <div className="weather-temp">
                {weather.temp !== null ? `${weather.temp}°C` : '--'}
              </div>
              <div className="weather-condition">{weather.label}</div>
            </div>
          </div>

          {/* Wind speed and wave height metadata */}
          <div className="weather-meta">
            {weather.wind !== null && (
              <span className="weather-meta-item">
                💨 Wind: {weather.wind} km/h
              </span>
            )}
            <span className="weather-meta-item">
              🌊 {weather.waveDisplay}
            </span>
          </div>
        </>
      )}

      {/* Mandatory Disclaimer */}
      <div className="weather-disclaimer">
        ℹ️ For information only. Check with the harbour officer before sailing.
      </div>
    </div>
  );
}
