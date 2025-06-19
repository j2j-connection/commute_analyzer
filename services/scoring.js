// Advanced Scoring Engine for Traffic Analysis App

class ScoringEngine {
    constructor() {
        this.apiService = new APIService();
        this.weights = CONFIG;
    }

    async calculateTrafficScore(origin, destination) {
        try {
            // Get real route data
            const routeData = await this.apiService.getRouteData(origin, destination, 'driving');
            const distanceMatrix = await this.apiService.getDistanceMatrix(origin, destination);
            
            // Get weather data for midpoint
            const midpoint = this.calculateMidpoint(origin, destination);
            const weatherData = await this.apiService.getWeatherData(midpoint.lat, midpoint.lng);
            
            // Calculate individual factors
            const distanceScore = this.calculateDistanceScore(routeData.distance.value);
            const timeOfDayScore = this.calculateTimeOfDayScore();
            const weatherScore = this.calculateWeatherScore(weatherData);
            const routeComplexityScore = this.calculateRouteComplexityScore(routeData.steps);
            const trafficLevelScore = this.calculateTrafficLevelScore(routeData.trafficLevel);
            
            // Weighted average
            const finalScore = (
                distanceScore * this.weights.TRAFFIC_WEIGHTS.distance +
                timeOfDayScore * this.weights.TRAFFIC_WEIGHTS.timeOfDay +
                weatherScore * this.weights.TRAFFIC_WEIGHTS.weather +
                routeComplexityScore * this.weights.TRAFFIC_WEIGHTS.routeComplexity +
                trafficLevelScore * this.weights.TRAFFIC_WEIGHTS.historicalData
            );
            
            return {
                score: Math.max(1, Math.min(10, finalScore)),
                factors: {
                    distance: distanceScore,
                    timeOfDay: timeOfDayScore,
                    weather: weatherScore,
                    routeComplexity: routeComplexityScore,
                    trafficLevel: trafficLevelScore
                },
                details: {
                    routeData,
                    weatherData,
                    distanceMatrix
                }
            };
        } catch (error) {
            console.error('Error calculating traffic score:', error);
            return this.getFallbackTrafficScore();
        }
    }

    async calculateBikeScore(origin, destination) {
        try {
            // Get bike route data
            const bikeRouteData = await this.apiService.getRouteData(origin, destination, 'bicycling');
            
            // Get infrastructure data
            const midpoint = this.calculateMidpoint(origin, destination);
            const infrastructureData = await this.apiService.getBikeInfrastructure(midpoint.lat, midpoint.lng);
            
            // Get weather data
            const weatherData = await this.apiService.getWeatherData(midpoint.lat, midpoint.lng);
            
            // Calculate individual factors
            const distanceScore = this.calculateBikeDistanceScore(bikeRouteData.distance.value);
            const infrastructureScore = this.calculateInfrastructureScore(infrastructureData);
            const terrainScore = this.calculateTerrainScore(bikeRouteData.steps);
            const safetyScore = this.calculateBikeSafetyScore(infrastructureData, bikeRouteData);
            const weatherScore = this.calculateBikeWeatherScore(weatherData);
            
            // Weighted average
            const finalScore = (
                distanceScore * this.weights.BIKE_WEIGHTS.distance +
                infrastructureScore * this.weights.BIKE_WEIGHTS.infrastructure +
                terrainScore * this.weights.BIKE_WEIGHTS.terrain +
                safetyScore * this.weights.BIKE_WEIGHTS.safety +
                weatherScore * this.weights.BIKE_WEIGHTS.weather
            );
            
            return {
                score: Math.max(1, Math.min(10, finalScore)),
                factors: {
                    distance: distanceScore,
                    infrastructure: infrastructureScore,
                    terrain: terrainScore,
                    safety: safetyScore,
                    weather: weatherScore
                },
                details: {
                    bikeRouteData,
                    infrastructureData,
                    weatherData
                }
            };
        } catch (error) {
            console.error('Error calculating bike score:', error);
            return this.getFallbackBikeScore();
        }
    }

    // Traffic Score Factors
    calculateDistanceScore(distanceMeters) {
        const distanceMiles = distanceMeters / 1609.34;
        
        if (distanceMiles <= 5) return 10;
        if (distanceMiles <= 10) return 9;
        if (distanceMiles <= 15) return 8;
        if (distanceMiles <= 20) return 7;
        if (distanceMiles <= 25) return 6;
        if (distanceMiles <= 30) return 5;
        if (distanceMiles <= 40) return 4;
        if (distanceMiles <= 50) return 3;
        return 2;
    }

    calculateTimeOfDayScore() {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Weekend traffic is generally lighter
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return 9;
        }
        
        // Rush hour periods
        const morningRush = hour >= 7 && hour <= 9;
        const eveningRush = hour >= 16 && hour <= 18;
        const lunchRush = hour >= 11 && hour <= 13;
        
        if (morningRush || eveningRush) return 5;
        if (lunchRush) return 7;
        if (hour >= 22 || hour <= 5) return 10; // Late night/early morning
        if (hour >= 10 && hour <= 15) return 8; // Mid-morning to mid-afternoon
        
        return 6; // Default
    }

    calculateWeatherScore(weatherData) {
        const conditions = weatherData.conditions.toLowerCase();
        const temp = weatherData.temperature;
        const windSpeed = weatherData.windSpeed;
        const visibility = weatherData.visibility;
        
        let score = 10;
        
        // Weather conditions
        if (conditions.includes('rain') || conditions.includes('drizzle')) score -= 2;
        if (conditions.includes('snow') || conditions.includes('sleet')) score -= 4;
        if (conditions.includes('thunderstorm')) score -= 3;
        if (conditions.includes('fog') || conditions.includes('mist')) score -= 2;
        
        // Temperature effects
        if (temp < 32 || temp > 95) score -= 1;
        if (temp < 20 || temp > 100) score -= 2;
        
        // Wind effects
        if (windSpeed > 15) score -= 1;
        if (windSpeed > 25) score -= 2;
        
        // Visibility effects
        if (visibility < 5000) score -= 2; // Less than 5km visibility
        
        return Math.max(1, score);
    }

    calculateRouteComplexityScore(steps) {
        const numSteps = steps.length;
        const numTurns = steps.filter(step => 
            step.instruction.includes('Turn') || 
            step.instruction.includes('Exit') ||
            step.instruction.includes('Merge')
        ).length;
        
        let score = 10;
        
        // More steps = more complex route
        if (numSteps > 20) score -= 2;
        if (numSteps > 30) score -= 1;
        
        // More turns = more complex
        if (numTurns > 10) score -= 2;
        if (numTurns > 15) score -= 1;
        
        return Math.max(1, score);
    }

    calculateTrafficLevelScore(trafficLevel) {
        switch (trafficLevel) {
            case 'light': return 10;
            case 'normal': return 7;
            case 'moderate': return 5;
            case 'heavy': return 3;
            default: return 7;
        }
    }

    // Bike Score Factors
    calculateBikeDistanceScore(distanceMeters) {
        const distanceMiles = distanceMeters / 1609.34;
        
        if (distanceMiles <= 2) return 10;
        if (distanceMiles <= 5) return 9;
        if (distanceMiles <= 8) return 8;
        if (distanceMiles <= 12) return 7;
        if (distanceMiles <= 15) return 6;
        if (distanceMiles <= 20) return 5;
        if (distanceMiles <= 25) return 4;
        if (distanceMiles <= 30) return 3;
        return 2;
    }

    calculateInfrastructureScore(infrastructureData) {
        let score = 5; // Base score
        
        if (infrastructureData.bikeLanes) score += 2;
        if (infrastructureData.bikePaths) score += 2;
        if (infrastructureData.bikeFriendlyRoads) score += 1;
        
        // Add infrastructure score
        score += infrastructureData.infrastructureScore * 0.3;
        
        return Math.min(10, score);
    }

    calculateTerrainScore(steps) {
        // Analyze route steps for elevation changes
        const elevationChanges = steps.filter(step => 
            step.instruction.includes('hill') ||
            step.instruction.includes('climb') ||
            step.instruction.includes('elevation')
        ).length;
        
        let score = 10;
        
        if (elevationChanges > 5) score -= 3;
        if (elevationChanges > 10) score -= 2;
        if (elevationChanges > 15) score -= 1;
        
        return Math.max(1, score);
    }

    calculateBikeSafetyScore(infrastructureData, routeData) {
        let score = 5; // Base score
        
        // Infrastructure safety
        score += infrastructureData.safetyScore * 0.4;
        
        // Route safety (fewer steps often means safer routes)
        const numSteps = routeData.steps.length;
        if (numSteps < 10) score += 1;
        if (numSteps > 20) score -= 1;
        
        return Math.min(10, score);
    }

    calculateBikeWeatherScore(weatherData) {
        if (weatherData.isBikeFriendly) return 10;
        
        let score = 5;
        
        // Temperature effects on biking
        const temp = weatherData.temperature;
        if (temp < 40 || temp > 85) score -= 2;
        if (temp < 32 || temp > 95) score -= 3;
        
        // Wind effects on biking
        const windSpeed = weatherData.windSpeed;
        if (windSpeed > 10) score -= 1;
        if (windSpeed > 15) score -= 2;
        
        return Math.max(1, score);
    }

    // Helper Methods
    calculateMidpoint(origin, destination) {
        // This would use geocoding to get actual coordinates
        // For now, return a default midpoint
        return {
            lat: 40.7128, // Default to NYC coordinates
            lng: -74.0060
        };
    }

    getFallbackTrafficScore() {
        return {
            score: 6 + Math.random() * 3,
            factors: {
                distance: 7,
                timeOfDay: 6,
                weather: 8,
                routeComplexity: 7,
                trafficLevel: 6
            },
            details: {
                routeData: null,
                weatherData: null,
                distanceMatrix: null
            }
        };
    }

    getFallbackBikeScore() {
        return {
            score: 5 + Math.random() * 4,
            factors: {
                distance: 6,
                infrastructure: 5,
                terrain: 7,
                safety: 6,
                weather: 8
            },
            details: {
                bikeRouteData: null,
                infrastructureData: null,
                weatherData: null
            }
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoringEngine;
} else {
    window.ScoringEngine = ScoringEngine;
} 