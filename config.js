// Configuration file for API keys and settings
const CONFIG = {
    // Google Maps API Key - You'll need to get this from Google Cloud Console
    GOOGLE_MAPS_API_KEY: 'AIzaSyA5MER9NSNdWiVW59O0S83KthgN241ch1E',
    
    // OpenWeatherMap API Key - For real weather data
    OPENWEATHER_API_KEY: '7b68e6a853bcf0f891c8acce16cf1c24',
    
    // MapBox API Key - For bike infrastructure data
    MAPBOX_API_KEY: 'pk.eyJ1IjoiaGoyajIiLCJhIjoiY21jMnc2enJ2MGN3YjJyb2d2MGs2aHB1NyJ9.amKbtBa98D5CoIxGQDnM7AAPBOX_API_KEY_HERE',
    
    // API Endpoints
    GOOGLE_MAPS_BASE_URL: 'https://maps.googleapis.com/maps/api',
    OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
    MAPBOX_BASE_URL: 'https://api.mapbox.com',
    
    // Default settings
    DEFAULT_UNITS: 'imperial', // or 'metric'
    DEFAULT_LANGUAGE: 'en',
    
    // Scoring weights (can be adjusted)
    TRAFFIC_WEIGHTS: {
        distance: 0.3,
        timeOfDay: 0.25,
        weather: 0.2,
        routeComplexity: 0.15,
        historicalData: 0.1
    },
    
    BIKE_WEIGHTS: {
        distance: 0.35,
        infrastructure: 0.25,
        terrain: 0.2,
        safety: 0.15,
        weather: 0.05
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
} 