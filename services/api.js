// API Service Layer for Traffic Analysis App

class APIService {
    constructor() {
        this.googleMapsAPIKey = CONFIG.GOOGLE_MAPS_API_KEY;
        this.openWeatherAPIKey = CONFIG.OPENWEATHER_API_KEY;
        this.mapboxAPIKey = CONFIG.MAPBOX_API_KEY;
    }

    // Google Maps API Methods
    async getRouteData(origin, destination, mode = 'driving') {
        try {
            const url = `${CONFIG.GOOGLE_MAPS_BASE_URL}/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&key=${this.googleMapsAPIKey}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status !== 'OK') {
                throw new Error(`Google Maps API Error: ${data.status}`);
            }
            
            return this.parseRouteData(data, mode);
        } catch (error) {
            console.error('Error fetching route data:', error);
            throw error;
        }
    }

    async getDistanceMatrix(origin, destination) {
        try {
            const url = `${CONFIG.GOOGLE_MAPS_BASE_URL}/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=driving&traffic_model=best_guess&departure_time=now&key=${this.googleMapsAPIKey}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status !== 'OK') {
                throw new Error(`Distance Matrix API Error: ${data.status}`);
            }
            
            return this.parseDistanceMatrixData(data);
        } catch (error) {
            console.error('Error fetching distance matrix:', error);
            throw error;
        }
    }

    async getGeocodingData(address) {
        try {
            const url = `${CONFIG.GOOGLE_MAPS_BASE_URL}/geocode/json?address=${encodeURIComponent(address)}&key=${this.googleMapsAPIKey}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status !== 'OK') {
                throw new Error(`Geocoding API Error: ${data.status}`);
            }
            
            return data.results[0];
        } catch (error) {
            console.error('Error fetching geocoding data:', error);
            throw error;
        }
    }

    // Weather API Methods
    async getWeatherData(lat, lon) {
        try {
            const url = `${CONFIG.OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.openWeatherAPIKey}&units=${CONFIG.DEFAULT_UNITS}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.cod !== 200) {
                throw new Error(`Weather API Error: ${data.message}`);
            }
            
            return this.parseWeatherData(data);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw error;
        }
    }

    // MapBox API Methods (for bike infrastructure)
    async getBikeInfrastructure(lat, lon) {
        try {
            const url = `${CONFIG.MAPBOX_BASE_URL}/directions-matrix/v1/mapbox/cycling/${lon},${lat};${lon},${lat}?access_token=${this.mapboxAPIKey}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.code !== 'Ok') {
                throw new Error(`MapBox API Error: ${data.message}`);
            }
            
            return this.parseBikeInfrastructureData(data);
        } catch (error) {
            console.error('Error fetching bike infrastructure:', error);
            // Return default data if API fails
            return this.getDefaultBikeInfrastructure();
        }
    }

    // Data Parsing Methods
    parseRouteData(data, mode) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        return {
            distance: {
                text: leg.distance.text,
                value: leg.distance.value // meters
            },
            duration: {
                text: leg.duration.text,
                value: leg.duration.value // seconds
            },
            durationInTraffic: leg.duration_in_traffic ? {
                text: leg.duration_in_traffic.text,
                value: leg.duration_in_traffic.value
            } : null,
            steps: leg.steps.map(step => ({
                instruction: step.html_instructions,
                distance: step.distance,
                duration: step.duration,
                polyline: step.polyline.points
            })),
            polyline: route.overview_polyline.points,
            mode: mode,
            trafficLevel: this.calculateTrafficLevel(leg)
        };
    }

    parseDistanceMatrixData(data) {
        const element = data.rows[0].elements[0];
        
        return {
            distance: element.distance,
            duration: element.duration,
            durationInTraffic: element.duration_in_traffic || element.duration,
            trafficLevel: this.calculateTrafficLevelFromDuration(element)
        };
    }

    parseWeatherData(data) {
        return {
            temperature: data.main.temp,
            feelsLike: data.main.feels_like,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            conditions: data.weather[0].main,
            visibility: data.visibility,
            isBikeFriendly: this.isWeatherBikeFriendly(data)
        };
    }

    parseBikeInfrastructureData(data) {
        // This would parse actual bike infrastructure data
        // For now, return simulated data based on location
        return this.getDefaultBikeInfrastructure();
    }

    // Helper Methods
    calculateTrafficLevel(leg) {
        if (!leg.duration_in_traffic) return 'normal';
        
        const normalDuration = leg.duration.value;
        const trafficDuration = leg.duration_in_traffic.value;
        const ratio = trafficDuration / normalDuration;
        
        if (ratio >= 1.5) return 'heavy';
        if (ratio >= 1.2) return 'moderate';
        return 'light';
    }

    calculateTrafficLevelFromDuration(element) {
        if (!element.duration_in_traffic) return 'normal';
        
        const normalDuration = element.duration.value;
        const trafficDuration = element.duration_in_traffic.value;
        const ratio = trafficDuration / normalDuration;
        
        if (ratio >= 1.5) return 'heavy';
        if (ratio >= 1.2) return 'moderate';
        return 'light';
    }

    isWeatherBikeFriendly(weatherData) {
        const temp = weatherData.main.temp;
        const conditions = weatherData.weather[0].main.toLowerCase();
        const windSpeed = weatherData.wind.speed;
        
        // Temperature check (Fahrenheit)
        if (temp < 32 || temp > 95) return false;
        
        // Weather conditions check
        const badConditions = ['rain', 'snow', 'thunderstorm', 'sleet'];
        if (badConditions.includes(conditions)) return false;
        
        // Wind speed check (mph)
        if (windSpeed > 20) return false;
        
        return true;
    }

    getDefaultBikeInfrastructure() {
        return {
            bikeLanes: Math.random() > 0.5,
            bikePaths: Math.random() > 0.7,
            bikeFriendlyRoads: Math.random() > 0.3,
            safetyScore: 5 + Math.random() * 5,
            infrastructureScore: 3 + Math.random() * 7
        };
    }

    // Error handling
    handleAPIError(error, fallbackData) {
        console.warn(`API Error: ${error.message}. Using fallback data.`);
        return fallbackData;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
} else {
    window.APIService = APIService;
} 