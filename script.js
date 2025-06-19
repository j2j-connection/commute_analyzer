// Traffic Analysis App - Real Implementation with APIs

class TrafficAnalyzer {
    constructor() {
        this.form = document.getElementById('commuteForm');
        this.results = document.getElementById('results');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.newAnalysisBtn = document.getElementById('newAnalysis');
        
        this.scoringEngine = new ScoringEngine();
        this.apiService = new APIService();
        
        this.initializeEventListeners();
        this.checkAPIKeys();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.newAnalysisBtn.addEventListener('click', () => this.resetForm());
    }

    checkAPIKeys() {
        const hasGoogleMapsKey = CONFIG.GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
        const hasWeatherKey = CONFIG.OPENWEATHER_API_KEY !== 'YOUR_OPENWEATHER_API_KEY_HERE';
        
        if (!hasGoogleMapsKey || !hasWeatherKey) {
            this.showAPIKeyWarning();
        }
    }

    showAPIKeyWarning() {
        const warning = document.createElement('div');
        warning.className = 'api-warning';
        warning.innerHTML = `
            <div class="warning-content">
                <h3>⚠️ API Keys Required</h3>
                <p>To get real traffic and weather data, you need to add your API keys to <code>config.js</code>:</p>
                <ul>
                    <li><strong>Google Maps API Key:</strong> For route data and traffic information</li>
                    <li><strong>OpenWeather API Key:</strong> For real-time weather data</li>
                </ul>
                <p><strong>Current mode:</strong> Using simulated data with realistic algorithms</p>
            </div>
        `;
        
        this.form.insertBefore(warning, this.form.firstChild);
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const startAddress = document.getElementById('startAddress').value.trim();
        const endAddress = document.getElementById('endAddress').value.trim();
        
        if (!startAddress || !endAddress) {
            this.showError('Please enter both starting and destination addresses.');
            return;
        }

        this.showLoading(true);
        
        try {
            // Use real scoring engine
            const [trafficAnalysis, bikeAnalysis] = await Promise.all([
                this.scoringEngine.calculateTrafficScore(startAddress, endAddress),
                this.scoringEngine.calculateBikeScore(startAddress, endAddress)
            ]);
            
            const analysis = {
                startAddress,
                endAddress,
                trafficScore: trafficAnalysis.score,
                bikeScore: bikeAnalysis.score,
                trafficFactors: trafficAnalysis.factors,
                bikeFactors: bikeAnalysis.factors,
                trafficDetails: trafficAnalysis.details,
                bikeDetails: bikeAnalysis.details,
                recommendation: this.generateRecommendation(trafficAnalysis.score, bikeAnalysis.score, trafficAnalysis.details, bikeAnalysis.details)
            };
            
            this.displayResults(analysis);
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError('An error occurred while analyzing your commute. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    generateRecommendation(trafficScore, bikeScore, trafficDetails, bikeDetails) {
        const trafficLabel = this.getScoreLabel(trafficScore);
        const bikeLabel = this.getScoreLabel(bikeScore);
        
        // Enhanced recommendations based on real data
        if (bikeScore >= 7 && trafficScore <= 5) {
            const bikeTime = bikeDetails?.bikeRouteData?.duration?.text || 'similar time';
            return `Consider biking! Your route has ${bikeLabel.toLowerCase()} bikability and ${trafficLabel.toLowerCase()} traffic. Biking would take ${bikeTime} and could save you time while improving your health.`;
        } else if (trafficScore <= 4) {
            const trafficTime = trafficDetails?.routeData?.durationInTraffic?.text || 'longer than usual';
            return `Traffic looks challenging with ${trafficTime} travel time. Consider leaving earlier, using public transit, or exploring alternative routes.`;
        } else if (bikeScore >= 8) {
            return `Excellent biking conditions! Even with ${trafficLabel.toLowerCase()} traffic, biking might be faster and more enjoyable.`;
        } else if (trafficScore >= 7) {
            const driveTime = trafficDetails?.routeData?.duration?.text || 'reasonable time';
            return `Traffic conditions look good! Your commute should take ${driveTime} with smooth sailing.`;
        } else {
            return `Mixed conditions. Consider checking real-time traffic updates before leaving.`;
        }
    }

    getScoreLabel(score) {
        if (score >= 8) return 'Excellent';
        if (score >= 6) return 'Good';
        if (score >= 4) return 'Fair';
        return 'Poor';
    }

    getScoreDescription(score, type, details = null) {
        if (type === 'traffic') {
            if (score >= 8) return 'Light traffic, smooth commute';
            if (score >= 6) return 'Moderate traffic, some delays expected';
            if (score >= 4) return 'Heavy traffic, significant delays';
            return 'Severe congestion, consider alternatives';
        } else { // bike
            if (score >= 8) return 'Excellent biking conditions';
            if (score >= 6) return 'Good biking route available';
            if (score >= 4) return 'Challenging but doable';
            return 'Not recommended for biking';
        }
    }

    displayResults(analysis) {
        // Update traffic score
        const trafficScoreEl = document.getElementById('trafficScore');
        const trafficLabelEl = document.getElementById('trafficLabel');
        const trafficDescEl = document.getElementById('trafficDescription');
        
        trafficScoreEl.textContent = analysis.trafficScore.toFixed(1);
        trafficScoreEl.className = `score ${this.getScoreLabel(analysis.trafficScore).toLowerCase()}`;
        trafficLabelEl.textContent = this.getScoreLabel(analysis.trafficScore);
        trafficDescEl.textContent = this.getScoreDescription(analysis.trafficScore, 'traffic', analysis.trafficDetails);
        
        // Update bike score
        const bikeScoreEl = document.getElementById('bikeScore');
        const bikeLabelEl = document.getElementById('bikeLabel');
        const bikeDescEl = document.getElementById('bikeDescription');
        
        bikeScoreEl.textContent = analysis.bikeScore.toFixed(1);
        bikeScoreEl.className = `score ${this.getScoreLabel(analysis.bikeScore).toLowerCase()}`;
        bikeLabelEl.textContent = this.getScoreLabel(analysis.bikeScore);
        bikeDescEl.textContent = this.getScoreDescription(analysis.bikeScore, 'bike', analysis.bikeDetails);
        
        // Update recommendation
        document.getElementById('recommendationText').textContent = analysis.recommendation;
        
        // Display score breakdown
        this.displayScoreBreakdown(analysis);
        
        // Add detailed information if available
        this.addDetailedInfo(analysis);
        
        // Show results
        this.form.style.display = 'none';
        this.results.style.display = 'block';
    }

    displayScoreBreakdown(analysis) {
        // Display traffic factors
        const trafficFactorsEl = document.getElementById('trafficFactors');
        trafficFactorsEl.innerHTML = this.createFactorList(analysis.trafficFactors, 'traffic', analysis.trafficDetails);
        
        // Display bike factors
        const bikeFactorsEl = document.getElementById('bikeFactors');
        bikeFactorsEl.innerHTML = this.createFactorList(analysis.bikeFactors, 'bike', analysis.bikeDetails);
    }

    createFactorList(factors, type, details) {
        const factorConfig = this.getFactorConfig(type);
        let html = '';
        
        for (const [factorName, factorScore] of Object.entries(factors)) {
            const config = factorConfig[factorName] || {};
            const scoreLabel = this.getScoreLabel(factorScore);
            const isRealData = this.isRealData(factorName, type, details);
            
            html += `
                <div class="factor-item">
                    <div>
                        <div class="factor-name">
                            ${config.label || factorName}
                            <span class="data-source ${isRealData ? 'real' : 'simulated'}">
                                ${isRealData ? 'REAL' : 'SIM'}
                            </span>
                        </div>
                        <div class="factor-details">${config.description || ''}</div>
                    </div>
                    <div class="factor-score ${scoreLabel.toLowerCase()}">${factorScore.toFixed(1)}</div>
                </div>
            `;
        }
        
        return html;
    }

    getFactorConfig(type) {
        if (type === 'traffic') {
            return {
                distance: {
                    label: 'Distance',
                    description: 'Route length impact on traffic'
                },
                timeOfDay: {
                    label: 'Time of Day',
                    description: 'Rush hour vs. off-peak analysis'
                },
                weather: {
                    label: 'Weather',
                    description: 'Current weather conditions'
                },
                routeComplexity: {
                    label: 'Route Complexity',
                    description: 'Number of turns and complexity'
                },
                trafficLevel: {
                    label: 'Traffic Level',
                    description: 'Real-time traffic conditions'
                }
            };
        } else {
            return {
                distance: {
                    label: 'Distance',
                    description: 'Bike route length'
                },
                infrastructure: {
                    label: 'Infrastructure',
                    description: 'Bike lanes and paths'
                },
                terrain: {
                    label: 'Terrain',
                    description: 'Hills and elevation changes'
                },
                safety: {
                    label: 'Safety',
                    description: 'Road safety factors'
                },
                weather: {
                    label: 'Weather',
                    description: 'Weather suitability for biking'
                }
            };
        }
    }

    isRealData(factorName, type, details) {
        // Determine if data is real or simulated based on available APIs
        const hasGoogleMaps = CONFIG.GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
        const hasWeather = CONFIG.OPENWEATHER_API_KEY !== 'YOUR_OPENWEATHER_API_KEY_HERE';
        const hasMapBox = CONFIG.MAPBOX_API_KEY !== 'YOUR_MAPBOX_API_KEY_HERE';
        
        if (type === 'traffic') {
            switch (factorName) {
                case 'distance':
                case 'routeComplexity':
                case 'trafficLevel':
                    return hasGoogleMaps;
                case 'timeOfDay':
                    return true; // Always real (current time)
                case 'weather':
                    return hasWeather;
                default:
                    return false;
            }
        } else { // bike
            switch (factorName) {
                case 'distance':
                    return hasGoogleMaps;
                case 'infrastructure':
                    return hasMapBox;
                case 'terrain':
                    return hasMapBox;
                case 'safety':
                    return hasMapBox;
                case 'weather':
                    return hasWeather;
                default:
                    return false;
            }
        }
    }

    addDetailedInfo(analysis) {
        // Add route information if available
        if (analysis.trafficDetails?.routeData) {
            const routeInfo = analysis.trafficDetails.routeData;
            const distanceText = routeInfo.distance.text;
            const durationText = routeInfo.duration.text;
            const trafficLevel = routeInfo.trafficLevel;
            
            // You could add this to the results display
            console.log(`Route: ${distanceText}, Duration: ${durationText}, Traffic: ${trafficLevel}`);
        }
        
        // Add weather information if available
        if (analysis.trafficDetails?.weatherData) {
            const weather = analysis.trafficDetails.weatherData;
            console.log(`Weather: ${weather.temperature}°F, ${weather.description}`);
        }
    }

    resetForm() {
        this.form.reset();
        this.form.style.display = 'block';
        this.results.style.display = 'none';
        
        // Reset score classes
        document.getElementById('trafficScore').className = 'score';
        document.getElementById('bikeScore').className = 'score';
        
        // Remove any detailed info
        const detailedInfo = document.querySelector('.detailed-info');
        if (detailedInfo) {
            detailedInfo.remove();
        }
    }

    showLoading(show) {
        const submitBtn = this.form.querySelector('.submit-btn span');
        const spinner = this.loadingSpinner;
        
        if (show) {
            submitBtn.textContent = 'Analyzing...';
            spinner.style.display = 'block';
        } else {
            submitBtn.textContent = 'Analyze Commute';
            spinner.style.display = 'none';
        }
    }

    showError(message) {
        // Enhanced error display
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-text">${message}</span>
            </div>
        `;
        
        // Insert at the top of the form
        this.form.insertBefore(errorDiv, this.form.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TrafficAnalyzer();
});

// Add some sample data for demonstration
const sampleRoutes = [
    { start: '123 Main St, Downtown', end: '456 Oak Ave, Suburbs' },
    { start: '789 Pine Rd, City Center', end: '321 Elm St, Business District' },
    { start: '555 River Dr, Riverside', end: '888 Mountain View, Heights' }
];

// Optional: Add sample route buttons for testing
function addSampleRoutes() {
    const form = document.getElementById('commuteForm');
    const sampleDiv = document.createElement('div');
    sampleDiv.className = 'sample-routes';
    sampleDiv.innerHTML = `
        <h4>Try Sample Routes:</h4>
        <div class="sample-buttons">
            ${sampleRoutes.map((route, index) => `
                <button type="button" class="sample-btn" onclick="fillSampleRoute(${index})">
                    Route ${index + 1}
                </button>
            `).join('')}
        </div>
    `;
    form.appendChild(sampleDiv);
}

function fillSampleRoute(index) {
    const route = sampleRoutes[index];
    document.getElementById('startAddress').value = route.start;
    document.getElementById('endAddress').value = route.end;
}

// Uncomment the line below to add sample route buttons
// addSampleRoutes();
