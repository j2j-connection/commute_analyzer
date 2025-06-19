// Configuration file for API keys and settings
const CONFIG = {
    // Google Maps API Key - You'll need to get this from Google Cloud Console
    // IMPORTANT: Replace with your actual API key for local development
    // For production, use environment variables
    GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
    
    // OpenWeatherMap API Key - For real weather data
    // IMPORTANT: Replace with your actual API key for local development
    // For production, use environment variables
    OPENWEATHER_API_KEY: 'YOUR_OPENWEATHER_API_KEY_HERE',
    
    // MapBox API Key - For bike infrastructure data
    // IMPORTANT: Replace with your actual API key for local development
    // For production, use environment variables
    MAPBOX_API_KEY: 'YOUR_MAPBOX_API_KEY_HERE',
    
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