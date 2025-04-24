/**
 * Main application script
 * Handles UI interactions, form validation, and data display
 */

document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const weatherForm = document.getElementById('weather-form');
  const cityInput = document.getElementById('city-input');
  const cityError = document.getElementById('city-error');
  const weatherContainer = document.getElementById('weather-container');
  const loadingState = document.getElementById('loading-state');
  const emptyState = document.getElementById('empty-state');
  const errorState = document.getElementById('error-state');
  const errorMessage = document.getElementById('error-message');
  const tryAgainBtn = document.getElementById('try-again-btn');
  const recentSearchesList = document.getElementById('recent-searches-list');
  
  // Weather data elements
  const weatherCity = document.getElementById('weather-city');
  const weatherDate = document.getElementById('weather-date');
  const weatherTemp = document.getElementById('weather-temp');
  const weatherIcon = document.getElementById('weather-icon');
  const weatherDescription = document.getElementById('weather-description');
  const weatherFeelsLike = document.getElementById('weather-feels-like');
  const weatherWind = document.getElementById('weather-wind');
  const weatherHumidity = document.getElementById('weather-humidity');
  const weatherPressure = document.getElementById('weather-pressure');
  const forecastItems = document.getElementById('forecast-items');
  
  // Storage key for recent searches
  const RECENT_SEARCHES_KEY = 'recentSearches';
  // Maximum number of recent searches to store
  const MAX_RECENT_SEARCHES = 5;
  
  // Initialize the application
  function init() {
    // Load recent searches
    loadRecentSearches();
    
    // Set up event listeners
    weatherForm.addEventListener('submit', handleFormSubmit);
    tryAgainBtn.addEventListener('click', handleTryAgain);
    
    // Check for a city in URL parameter and load it
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get('city');
    if (cityParam) {
      cityInput.value = cityParam;
      fetchWeatherData(cityParam);
    }
  }
  
  /**
   * Handle form submission
   * @param {Event} event - The form submit event
   */
  function handleFormSubmit(event) {
    event.preventDefault();
    
    const city = cityInput.value.trim();
    
    // Validate city input
    if (!validateCityInput(city)) {
      return;
    }
    
    // Fetch weather data
    fetchWeatherData(city);
  }
  
  /**
   * Validate city input
   * @param {string} city - The city name to validate
   * @returns {boolean} - Whether the input is valid
   */
  function validateCityInput(city) {
    // Reset error state
    cityInput.classList.remove('is-invalid');
    cityError.textContent = '';
    
    if (!city) {
      cityInput.classList.add('is-invalid');
      cityError.textContent = 'Please enter a city name';
      return false;
    }
    
    // Basic validation - city should only contain letters, spaces, and hyphens
    const cityRegex = /^[a-zA-Z\s\-]+$/;
    if (!cityRegex.test(city)) {
      cityInput.classList.add('is-invalid');
      cityError.textContent = 'City name should only contain letters, spaces, and hyphens';
      return false;
    }
    
    return true;
  }
  
  /**
   * Fetch weather data for a city
   * @param {string} city - The city name
   */
  async function fetchWeatherData(city) {
    // Show loading state
    showLoadingState();
    
    try {
      // Fetch current weather and forecast in parallel
      const [weatherData, forecastData] = await Promise.all([
        WeatherService.getCurrentWeather(city),
        WeatherService.getForecast(city)
      ]);
      
      // Add city to recent searches
      addToRecentSearches(city);
      
      // Update URL with city parameter without reloading the page
      const url = new URL(window.location);
      url.searchParams.set('city', city);
      window.history.pushState({}, '', url);
      
      // Display weather data
      displayWeatherData(weatherData);
      displayForecastData(forecastData);
      
      // Show weather container
      showWeatherState();
    } catch (error) {
      console.error('Error:', error);
      showErrorState(error.message);
    }
  }
  
  /**
   * Display current weather data
   * @param {Object} data - Weather data from API
   */
  function displayWeatherData(data) {
    // Update weather information
    weatherCity.textContent = `${data.name}, ${data.sys.country}`;
    weatherDate.textContent = WeatherService.formatDate(data.dt);
    weatherTemp.textContent = `${Math.round(data.main.temp)}°C`;
    
    // First letter uppercase for description
    const description = data.weather[0].description;
    weatherDescription.textContent = description.charAt(0).toUpperCase() + description.slice(1);
    
    // Update weather icon
    const iconClass = WeatherService.getWeatherIconClass(data.weather[0].icon);
    weatherIcon.className = '';
    weatherIcon.classList.add('fas', iconClass);
    
    // Update weather details
    weatherFeelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    weatherWind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
    weatherHumidity.textContent = `${data.main.humidity}%`;
    weatherPressure.textContent = `${data.main.pressure} hPa`;
  }
  
  /**
   * Display forecast data
   * @param {Object} data - Forecast data from API
   */
  function displayForecastData(data) {
    if (!data || !data.list) {
      console.error('Invalid forecast data:', data);
      throw new Error('Invalid forecast data received');
    }
    console.log('Data Forecast: ', data)
    // Clear existing forecast items
    forecastItems.innerHTML = '';
    
    // Get one forecast per day (at noon)
    const dailyForecasts = [];
    const processedDays = new Set();
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // If we haven't processed this day yet and it's around noon (between 11 AM and 2 PM)
      const hour = date.getHours();
      if (!processedDays.has(day) && hour >= 11 && hour <= 14) {
        dailyForecasts.push(item);
        processedDays.add(day);
      }
    });
    
    // If we didn't get 5 days, take the first entry of each day
    if (dailyForecasts.length < 5) {
      processedDays.clear();
      dailyForecasts.length = 0;
      
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toISOString().split('T')[0];
        
        if (!processedDays.has(day)) {
          dailyForecasts.push(item);
          processedDays.add(day);
          
          // Limit to 5 days
          if (dailyForecasts.length >= 5) {
            return;
          }
        }
      });
    }
    
    // Create forecast cards
    dailyForecasts.forEach(forecast => {
      const forecastCard = createForecastCard(forecast);
      forecastItems.appendChild(forecastCard);
    });
  }
  
  /**
   * Create a forecast card element
   * @param {Object} forecast - Forecast data for a single day
   * @returns {HTMLElement} - Forecast card element
   */
  function createForecastCard(forecast) {
    const col = document.createElement('div');
    col.className = 'col';
    
    const card = document.createElement('div');
    card.className = 'card h-100 text-center forecast-card';
    
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body py-3';
    
    // Day name
    const dayName = document.createElement('h5');
    dayName.className = 'card-title';
    dayName.textContent = WeatherService.getDayName(forecast.dt);
    
    // Weather icon
    const iconDiv = document.createElement('div');
    iconDiv.className = 'my-2';
    const icon = document.createElement('i');
    const iconClass = WeatherService.getWeatherIconClass(forecast.weather[0].icon);
    icon.className = `fas ${iconClass} fa-2x`;
    iconDiv.appendChild(icon);
    
    // Temperature
    const tempDiv = document.createElement('div');
    tempDiv.className = 'mt-2';
    const temp = document.createElement('h4');
    temp.className = 'mb-0';
    temp.textContent = `${Math.round(forecast.main.temp)}°C`;
    tempDiv.appendChild(temp);
    
    // Weather description
    const descDiv = document.createElement('div');
    descDiv.className = 'small text-muted';
    const description = forecast.weather[0].description;
    descDiv.textContent = description.charAt(0).toUpperCase() + description.slice(1);
    
    // Assemble the card
    cardBody.appendChild(dayName);
    cardBody.appendChild(iconDiv);
    cardBody.appendChild(tempDiv);
    cardBody.appendChild(descDiv);
    card.appendChild(cardBody);
    col.appendChild(card);
    
    return col;
  }
  
  /**
   * Add a city to recent searches
   * @param {string} city - The city name
   */
  function addToRecentSearches(city) {
    // Capitalize city name
    const formattedCity = formatCityName(city);
    
    // Get existing searches
    let recentSearches = getRecentSearches();
    
    // Remove if already exists (to move it to the top)
    recentSearches = recentSearches.filter(search => 
      search.toLowerCase() !== formattedCity.toLowerCase()
    );
    
    // Add to the beginning of the array
    recentSearches.unshift(formattedCity);
    
    // Limit to max number of searches
    if (recentSearches.length > MAX_RECENT_SEARCHES) {
      recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES);
    }
    
    // Save to local storage
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
    
    // Update UI
    displayRecentSearches();
  }
  
  /**
   * Format city name (capitalize first letter of each word)
   * @param {string} city - The city name
   * @returns {string} - Formatted city name
   */
  function formatCityName(city) {
    return city
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  /**
   * Get recent searches from local storage
   * @returns {Array} - Array of city names
   */
  function getRecentSearches() {
    const searches = localStorage.getItem(RECENT_SEARCHES_KEY);
    return searches ? JSON.parse(searches) : [];
  }
  
  /**
   * Load and display recent searches
   */
  function loadRecentSearches() {
    displayRecentSearches();
  }
  
  /**
   * Display recent searches in the UI
   */
  function displayRecentSearches() {
    const searches = getRecentSearches();
    recentSearchesList.innerHTML = '';
    
    searches.forEach(city => {
      const button = document.createElement('button');
      button.className = 'btn btn-sm btn-outline-secondary search-item';
      button.textContent = city;
      button.addEventListener('click', () => {
        cityInput.value = city;
        fetchWeatherData(city);
      });
      
      recentSearchesList.appendChild(button);
    });
  }
  
  /**
   * Handle try again button click
   */
  function handleTryAgain() {
    // If there's a city in the input, try again with that city
    const city = cityInput.value.trim();
    if (city && validateCityInput(city)) {
      fetchWeatherData(city);
    } else {
      // Otherwise, show empty state
      showEmptyState();
    }
  }
  
  /**
   * Show loading state
   */
  function showLoadingState() {
    weatherContainer.classList.add('d-none');
    errorState.classList.add('d-none');
    emptyState.classList.add('d-none');
    loadingState.classList.remove('d-none');
  }
  
  /**
   * Show weather data state
   */
  function showWeatherState() {
    loadingState.classList.add('d-none');
    errorState.classList.add('d-none');
    emptyState.classList.add('d-none');
    weatherContainer.classList.remove('d-none');
    weatherContainer.classList.add('fade-in');
  }
  
  /**
   * Show empty state
   */
  function showEmptyState() {
    weatherContainer.classList.add('d-none');
    loadingState.classList.add('d-none');
    errorState.classList.add('d-none');
    emptyState.classList.remove('d-none');
  }
  
  /**
   * Show error state
   * @param {string} message - Error message to display
   */
  function showErrorState(message) {
    weatherContainer.classList.add('d-none');
    loadingState.classList.add('d-none');
    emptyState.classList.add('d-none');
    
    errorMessage.textContent = message || 'Unable to fetch weather data';
    errorState.classList.remove('d-none');
  }
  
  // Initialize the application
  init();
});