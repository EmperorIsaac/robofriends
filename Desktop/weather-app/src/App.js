import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_KEY = 'a7635517875931caebbab4e387e67f28';

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [city, setCity] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [lastCoords, setLastCoords] = useState(null);
  const [lastCity, setLastCity] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLastCoords({ lat: latitude, lon: longitude });
          fetchWeatherByCoords(latitude, longitude);
          fetchForecastByCoords(latitude, longitude);
        },
        (err) => {
          console.warn('Geolocation failed/denied:', err.message);
          setError('Location not available — please search for a city.');
        }
      );
    } else {
      setError('Geolocation not supported — please search for a city.');
    }
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
  }, [darkMode]);

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('City not found or API error.');
      const data = await res.json();
      if (!mountedRef.current) return;
      setWeather(data);
      setLastCity(cityName);
      fetchForecast(cityName);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error.');
      const data = await res.json();
      if (!mountedRef.current) return;
      setWeather(data);
      setLastCoords({ lat, lon });
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (cityName) => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`;
      const res = await fetch(url);
      const data = await res.json();
      const daily = data.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 5);
      setForecast(daily);
    } catch (err) {
      console.error('Forecast error:', err);
    }
  };

  const fetchForecastByCoords = async (lat, lon) => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      const res = await fetch(url);
      const data = await res.json();
      const daily = data.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 5);
      setForecast(daily);
    } catch (err) {
      console.error('Forecast error:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const t = city.trim();
    if (!t) {
      setError('Please enter a city name.');
      return;
    }
    fetchWeather(t);
    setCity('');
  };

  return (
    <div className="app">
      <div className="top-bar">
        <h1 className="title">Weather App</h1>
        <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀ Light' : '🌙 Dark'}
        </button>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter city (e.g. London)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p className="info">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-widget">
          <h2>
            {weather.name}
            {weather.sys?.country ? `, ${weather.sys.country}` : ''}
          </h2>
          <p className="desc">{weather.weather[0].description}</p>
          <p>Temp: {Math.round(weather.main.temp)}°C</p>
          <p>Feels like: {Math.round(weather.main.feels_like)}°C</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind: {weather.wind.speed} m/s</p>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="forecast-container">
          {forecast.map((day, index) => (
            <div key={index} className="forecast-card">
              <p>{new Date(day.dt_txt).toLocaleDateString(undefined, { weekday: 'short' })}</p>
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                alt={day.weather[0].description}
              />
              <p>{Math.round(day.main.temp)}°C</p>
              <p className="desc">{day.weather[0].description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
