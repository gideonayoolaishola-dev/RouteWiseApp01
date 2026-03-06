// RouteWise App - Transportation Route Planner for Nigeria

// ========== MAP INITIALIZATION ==========
let map;
let routeControl = null;
let startMarker = null;
let endMarker = null;
let currentMode = 'car';

// Nigeria bounds for better initial view
const NIGERIA_CENTER = [9.0765, 7.3986];
const LAGOS_COORDS = [6.5244, 3.3792];
const ABUJA_COORDS = [9.0765, 7.3986];

// Initialize map on page load
document.addEventListener('DOMContentLoaded', initializeMap);

function initializeMap() {
    map = L.map('map').setView(NIGERIA_CENTER, 7);
    
    // Add OpenStreetMap tiles with dark styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19,
        crossOrigin: true
    }).addTo(map);
    
    setupEventListeners();
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    // Transport mode buttons
    document.querySelectorAll('.transport-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.transport-mode-btn').forEach(b => {
                b.classList.remove('active', 'from-blue-600', 'to-blue-500', 'hover:from-blue-500', 'hover:to-blue-400');
                b.classList.add('bg-slate-700', 'hover:bg-slate-600');
            });
            btn.classList.add('active', 'from-blue-600', 'to-blue-500', 'hover:from-blue-500', 'hover:to-blue-400');
            btn.classList.remove('bg-slate-700', 'hover:bg-slate-600');
            currentMode = btn.dataset.mode;
        });
    });
    
    // Route button
    document.getElementById('routeBtn').addEventListener('click', findRoute);
    
    // Input fields with autocomplete
    document.getElementById('startInput').addEventListener('input', debounce(handleStartInput, 300));
    document.getElementById('endInput').addEventListener('input', debounce(handleEndInput, 300));
}

// ========== LOCATION SEARCH & AUTOCOMPLETE ==========
const COMMON_LOCATIONS = {
    'Lagos': { lat: 6.5244, lng: 3.3792 },
    'Abuja': { lat: 9.0765, lng: 7.3986 },
    'Ibadan': { lat: 7.3869, lng: 3.8969 },
    'Kano': { lat: 12.0022, lng: 8.5922 },
    'Port Harcourt': { lat: 4.8156, lng: 7.0498 },
    'Enugu': { lat: 6.4373, lng: 7.5104 },
    'Benin City': { lat: 6.3350, lng: 5.6201 },
    'Owerri': { lat: 5.4833, lng: 7.0167 },
    'Calabar': { lat: 4.9526, lng: 8.3790 },
    'Jos': { lat: 9.9265, lng: 8.8953 },
    'Akure': { lat: 7.2607, lng: 5.1962 },
    'Sokoto': { lat: 13.0161, lng: 5.2379 },
    'Ilorin': { lat: 8.4955, lng: 4.5418 },
    'Maiduguri': { lat: 11.8469, lng: 13.1572 },
    'Gusau': { lat: 12.1692, lng: 6.6618 },
    'Lokoja': { lat: 7.8006, lng: 6.7539 },
    'Warri': { lat: 5.5045, lng: 5.7471 },
    'Asaba': { lat: 6.1954, lng: 6.7432 },
    'Makurdi': { lat: 7.7321, lng: 8.7412 },
    'Lafia': { lat: 8.4904, lng: 8.5201 }
};

function handleStartInput(e) {
    const query = e.target.value.trim().toLowerCase();
    const suggestionsDiv = document.getElementById('startSuggestions');
    
    if (query.length === 0) {
        suggestionsDiv.innerHTML = '';
        return;
    }
    
    const suggestions = Object.keys(COMMON_LOCATIONS).filter(city =>
        city.toLowerCase().includes(query)
    );
    
    suggestionsDiv.innerHTML = suggestions.map(city =>
        `<div class="bg-slate-700 hover:bg-slate-600 p-2 rounded cursor-pointer text-sm" onclick="selectStartLocation('${city}')">${city}</div>`
    ).join('');
}

function handleEndInput(e) {
    const query = e.target.value.trim().toLowerCase();
    const suggestionsDiv = document.getElementById('endSuggestions');
    
    if (query.length === 0) {
        suggestionsDiv.innerHTML = '';
        return;
    }
    
    const suggestions = Object.keys(COMMON_LOCATIONS).filter(city =>
        city.toLowerCase().includes(query)
    );
    
    suggestionsDiv.innerHTML = suggestions.map(city =>
        `<div class="bg-slate-700 hover:bg-slate-600 p-2 rounded cursor-pointer text-sm" onclick="selectEndLocation('${city}')">${city}</div>`
    ).join('');
}

function selectStartLocation(city) {
    document.getElementById('startInput').value = city;
    document.getElementById('startSuggestions').innerHTML = '';
}

function selectEndLocation(city) {
    document.getElementById('endInput').value = city;
    document.getElementById('endSuggestions').innerHTML = '';
}

// ========== ROUTE FINDING ==========
async function findRoute() {
    const startText = document.getElementById('startInput').value.trim();
    const endText = document.getElementById('endInput').value.trim();
    
    if (!startText || !endText) {
        showInfo('Please enter both starting point and destination', 'error');
        return;
    }
    
    // Get coordinates from location names
    const startCoords = COMMON_LOCATIONS[startText] || await geocodeLocation(startText);
    const endCoords = COMMON_LOCATIONS[endText] || await geocodeLocation(endText);
    
    if (!startCoords || !endCoords) {
        showInfo('Could not find one or both locations. Please try another search.', 'error');
        return;
    }
    
    clearRoute();
    
    // Add markers
    startMarker = L.circleMarker([startCoords.lat, startCoords.lng], {
        radius: 8,
        fillColor: '#3b82f6',
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map).bindPopup(`<strong>Start:</strong> ${startText}`);
    
    endMarker = L.circleMarker([endCoords.lat, endCoords.lng], {
        radius: 8,
        fillColor: '#a855f7',
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map).bindPopup(`<strong>End:</strong> ${endText}`);
    
    // Fit map to markers
    const group = new L.featureGroup([startMarker, endMarker]);
    map.fitBounds(group.getBounds().pad(0.1));
    
    // Calculate route
    await calculateRoute(
        [startCoords.lng, startCoords.lat],
        [endCoords.lng, endCoords.lat]
    );
}

async function geocodeLocation(location) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${location},Nigeria&limit=1`
        );
        const data = await response.json();
        if (data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
    } catch (error) {
        console.error('Geocoding error:', error);
    }
    return null;
}

async function calculateRoute(start, end) {
    try {
        const profile = getRouteProfile();
        const url = `https://router.project-osrm.org/route/v1/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&steps=true&geometries=geojson`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.routes || data.routes.length === 0) {
            showInfo('No route found. Please try different locations.', 'error');
            return;
        }
        
        const route = data.routes[0];
        displayRoute(route, data);
        
    } catch (error) {
        console.error('Route calculation error:', error);
        showInfo('Error calculating route. Please try again.', 'error');
    }
}

function getRouteProfile() {
    const profiles = {
        'car': 'car',
        'bus': 'car',
        'bike': 'bike',
        'walk': 'foot'
    };
    return profiles[currentMode] || 'car';
}

function displayRoute(route, data) {
    const distance = route.distance / 1000; // Convert to km
    const duration = route.duration / 60; // Convert to minutes
    
    // Draw route line
    const coordinates = route.geometry.coordinates;
    const latlngs = coordinates.map(coord => [coord[1], coord[0]]);
    
    const routeColor = {
        'car': '#0ea5e9',
        'bus': '#8b5cf6',
        'bike': '#10b981',
        'walk': '#f59e0b'
    };
    
    L.polyline(latlngs, {
        color: routeColor[currentMode] || '#0ea5e9',
        weight: 4,
        opacity: 0.8,
        className: 'route-line'
    }).addTo(map);
    
    // Calculate cost
    const cost = calculateCost(distance, currentMode);
    
    // Simulate traffic
    const traffic = getTrafficStatus(duration);
    
    // Display results
    document.getElementById('distanceResult').textContent = distance.toFixed(1) + ' km';
    document.getElementById('durationResult').textContent = Math.ceil(duration) + ' min';
    document.getElementById('costResult').textContent = '₦' + cost.toLocaleString();
    document.getElementById('trafficResult').textContent = traffic.icon + ' ' + traffic.status;
    
    // Display instructions
    displayInstructions(route.legs);
    
    document.getElementById('resultsContainer').classList.remove('hidden');
    showInfo(`Route found! ${distance.toFixed(1)} km via ${currentMode}`, 'success');
}

function calculateCost(distance, mode) {
    const rates = {
        'car': 150,      // ₦150 per km
        'bus': 50,       // ₦50 per km
        'bike': 30,      // ₦30 per km
        'walk': 0        // Free
    };
    
    const baseRate = rates[mode] || 150;
    const cost = Math.ceil(distance * baseRate);
    
    // Add minimum fare
    const minimums = { 'car': 500, 'bus': 200, 'bike': 100, 'walk': 0 };
    return Math.max(cost, minimums[mode] || 500);
}

function getTrafficStatus(duration) {
    // Simulate traffic conditions based on time of day
    const hour = new Date().getHours();
    
    // Rush hours: 6-9am, 4-7pm
    const isRushHour = (hour >= 6 && hour <= 9) || (hour >= 16 && hour <= 19);
    
    if (isRushHour) {
        return { status: 'Heavy Traffic', icon: '🔴', color: 'red' };
    } else if (hour >= 10 && hour <= 15) {
        return { status: 'Light Traffic', icon: '🟢', color: 'green' };
    } else {
        return { status: 'Moderate Traffic', icon: '🟡', color: 'yellow' };
    }
}

function displayInstructions(legs) {
    const list = document.getElementById('instructionsList');
    list.innerHTML = '';
    
    let stepCount = 1;
    legs.forEach((leg, legIndex) => {
        leg.steps.forEach((step, stepIndex) => {
            if (step.maneuver && step.maneuver.instruction) {
                const instruction = document.createElement('div');
                instruction.className = 'bg-slate-800/50 border-l-4 border-blue-400 p-3 rounded text-sm text-slate-300 hover:bg-slate-700/50 transition-all';
                instruction.innerHTML = `
                    <span class="font-semibold text-blue-400">${stepCount}.</span> 
                    ${step.maneuver.instruction}
                    <span class="text-xs text-slate-500 ml-2">(${(step.distance / 1000).toFixed(1)} km)</span>
                `;
                list.appendChild(instruction);
                stepCount++;
            }
        });
    });
    
    if (stepCount === 1) {
        const noSteps = document.createElement('div');
        noSteps.className = 'text-slate-400 text-sm';
        noSteps.textContent = 'Route directions loading...';
        list.appendChild(noSteps);
    }
}

function clearRoute() {
    if (routeControl) {
        map.removeControl(routeControl);
        routeControl = null;
    }
    if (startMarker) {
        map.removeLayer(startMarker);
        startMarker = null;
    }
    if (endMarker) {
        map.removeLayer(endMarker);
        endMarker = null;
    }
    
    // Clear route lines
    map.eachLayer(layer => {
        if (layer instanceof L.Polyline && layer !== routeControl) {
            map.removeLayer(layer);
        }
    });
}

function showInfo(message, type = 'info') {
    const infoCard = document.getElementById('infoCard');
    const infoMessage = document.getElementById('infoMessage');
    
    infoMessage.textContent = message;
    infoCard.classList.remove('hidden');
    
    setTimeout(() => {
        infoCard.classList.add('hidden');
    }, 4000);
}

// ========== UTILITY FUNCTIONS ==========
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initial info
window.addEventListener('load', () => {
    showInfo('🎉 Welcome to RouteWise! Enter your start and end locations to find the best route.', 'success');
});