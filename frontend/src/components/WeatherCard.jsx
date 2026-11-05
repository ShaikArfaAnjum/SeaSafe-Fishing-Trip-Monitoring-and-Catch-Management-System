// ============================================================
// src/components/WeatherCard.jsx
// Shows current weather at Visakhapatnam harbour using the free Open-Meteo API.
// ============================================================

import { useState, useEffect } from 'react';

// Weather code to description and emoji lookup
const WEATHER_CODES = {
  0: { label: 'Clear Sky', icon: '☀️' },
  1: { label: 'Mainly Clear', icon: '🌤️' },
  2: { label: 'Partly Cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Depositing Rime Fog', icon: '🌫️' },
  51: { label: 'Light Drizzle', icon: '🌦️' },
  53: { label: 'Moderate Drizzle', icon: '🌦️' },
  55: { label: 'Dense Drizzle', icon: '🌧️' },
  61: { label: 'Slight Rain', icon: '🌧️' },
  63: { label: 'Moderate Rain', icon: '🌧️' },
  65: { label: 'Heavy Rain', icon: '🌧️' },
  80: { label: 'Rain Showers', icon: '🌦️' },
  81: { label: 'Heavy Showers', icon: '🌧️' },
  82: { label: 'Violent Showers', icon: '⛈️' },
  95: { label: 'Thunderstorm', icon: '⛈️' }
};

export default function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Visakhapatnam coordinates
    fetch('https://api.open-meteo.com/v1/forecast?latitude=17.6868&longitude=83.2185&current_weather=true')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (data.current_weather) {
          const code = data.current_weather.weathercode;
          const info = WEATHER_CODES[code] || { label: 'Fair Weather', icon: '🌤️' };
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            wind: data.current_weather.windspeed,
            label: info.label,
            icon: info.icon
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="weather-card">
      <div className="weather-header">
        <h3>Weather Info • Visakhapatnam Harbour</h3>
        <span className="weather-disclaimer">For information only</span>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading weather data...</p>
      ) : error || !weather ? (
        <p style={{ color: 'var(--text-muted)' }}>Weather not available right now</p>
      ) : (
        <div className="weather-body">
          <div className="weather-icon">{weather.icon}</div>
          <div>
            <div className="weather-temp">{weather.temp}°C</div>
            <div className="weather-condition">
              {weather.label} • Wind: {weather.wind} km/h
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

