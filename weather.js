/**
 * Weather API service
 * This file contains functions for interacting with the OpenWeatherMap API
 */

class WeatherService {
  /**
   * Get current weather data for a city
   * @param {string} city - The city name
   * @returns {Promise} - Promise object with weather data
   */

  static api_key = '580d33f1086adaa32c225fbf04ae8a74';

  static async getCurrentWeather(city) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.api_key}&units=metric`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch weather data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  }
  
  /**
   * Get 5-day forecast data for a city
   * @param {string} city - The city name
   * @returns {Promise} - Promise object with forecast data
   */
  static async getForecast(city) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${this.api_key}&units=metric`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch forecast data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  }
  
  /**
   * Get weather icon class based on weather condition code
   * @param {string} iconCode - The OpenWeatherMap icon code
   * @returns {string} - Font Awesome icon class
   */
  static getWeatherIconClass(iconCode) {
    // Map OpenWeatherMap icon codes to Font Awesome icons
    const iconMap = {
      '01d': 'fa-sun', // clear sky day
      '01n': 'fa-moon', // clear sky night
      '02d': 'fa-cloud-sun', // few clouds day
      '02n': 'fa-cloud-moon', // few clouds night
      '03d': 'fa-cloud', // scattered clouds
      '03n': 'fa-cloud',
      '04d': 'fa-cloud', // broken clouds
      '04n': 'fa-cloud',
      '09d': 'fa-cloud-showers-heavy', // shower rain
      '09n': 'fa-cloud-showers-heavy',
      '10d': 'fa-cloud-rain', // rain
      '10n': 'fa-cloud-rain',
      '11d': 'fa-bolt', // thunderstorm
      '11n': 'fa-bolt',
      '13d': 'fa-snowflake', // snow
      '13n': 'fa-snowflake',
      '50d': 'fa-smog', // mist
      '50n': 'fa-smog'
    };
    
    return iconMap[iconCode] || 'fa-cloud';
  }
  
  /**
   * Format date from timestamp
   * @param {number} timestamp - Unix timestamp
   * @param {boolean} showTime - Whether to include time
   * @returns {string} - Formatted date string
   */
  static formatDate(timestamp, showTime = false) {
    const date = new Date(timestamp * 1000);
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    
    if (showTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('en-US', options);
  }
  
  /**
   * Format time from timestamp
   * @param {number} timestamp - Unix timestamp
   * @returns {string} - Formatted time string
   */
  static formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
  
  /**
   * Get day name from timestamp
   * @param {number} timestamp - Unix timestamp
   * @returns {string} - Day name
   */
  static getDayName(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
}