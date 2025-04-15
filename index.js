const config = {
    apiKey: 'bb2e796edfd957135de352561d3605eb', 
    units: 'metric',
    themeKey: 'weatherwise_theme',
};

const elements = {
    form: document.getElementById('weatherForm'),
    cityInput: document.getElementById('cityInput'),
    weatherInfo: document.getElementById('weatherInfo'),
    errorElement: document.getElementById('error'),
    themeToggle: document.getElementById('themeToggle'),
    weatherDetails: document.getElementById('weatherDetails')
};

const detailTemplates = [
    { key: 'main.humidity', label: 'Humidity', unit: '%', icon: '💧' },
    { key: 'wind.speed', label: 'Wind Speed', unit: 'm/s', icon: '🌪️' },
    { key: 'main.pressure', label: 'Pressure', unit: 'hPa', icon: '📊' },
    { key: 'main.feels_like', label: 'Feels Like', unit: '°C', icon: '🌡️' }
];

// Initialize the application
function init() {
    initializeTheme();
    elements.weatherInfo.style.display = 'none';
    elements.errorElement.style.display = 'none';
    
    // Event listeners
    elements.form.addEventListener('submit', handleFormSubmit);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.cityInput.addEventListener('input', () => {
        elements.errorElement.style.display = 'none';
    });
    
    // Navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            
            document.querySelectorAll('.main-section').forEach(el => {
                el.style.display = 'none';
            });
            
            document.getElementById(target).style.display = 'block';
            
            if (target === 'home') {
                elements.weatherInfo.style.display = 'none';
                elements.cityInput.value = '';
            }
        });
    });
}

function initializeTheme() {
    const savedTheme = localStorage.getItem(config.themeKey) || 'dark';
    document.body.classList.toggle('light-mode', savedTheme === 'light');
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const newTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem(config.themeKey, newTheme);
}

function updateWeatherBackground(condition) {
    const weatherConditions = {
        Clear: 'sunny.jpg',
        Clouds: 'cloudy.jpg',
        Rain: 'rain.jpg',
        Snow: 'snow.jpg',
        Thunderstorm: 'storm.jpg',
        Drizzle: 'drizzle.jpg',
        Mist: 'mist.jpg',
        Fog: 'mist.jpg',
        Haze: 'mist.jpg'
    };
    
    const imageName = weatherConditions[condition] || 'cloud.jpg';
    document.body.style.backgroundImage = `url('images/${imageName}')`;
}

async function getWeatherData(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${config.units}&appid=${config.apiKey}`
        );
        
        if (!response.ok) {
            throw new Error(response.status === 404 ? 'City not found' : 'Weather data unavailable');
        }
        
        return await response.json();
    } catch (error) {
        throw new Error('Failed to fetch weather data. Please check your connection.');
    }
}

function displayWeather(data) {
    const { name, sys, main, weather, wind } = data;
    updateWeatherBackground(weather[0].main);

    document.getElementById('cityName').textContent = `${name}, ${sys.country || ''}`;
    document.getElementById('temperature').textContent = `${Math.round(main.temp)}°C`;
    document.getElementById('weatherDescription').textContent = 
        weather[0].description.charAt(0).toUpperCase() + weather[0].description.slice(1);

    document.getElementById('weatherIcon').src = 
        `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
    document.getElementById('weatherIcon').alt = weather[0].description;

    elements.weatherDetails.innerHTML = detailTemplates.map(template => {
        const value = template.key.split('.').reduce((obj, key) => obj[key], data);
        return `
            <div class="detail-item">
                <div>${template.icon} ${template.label}</div>
                <div>${Math.round(value)}${template.unit}</div>
            </div>
        `;
    }).join('');

    elements.weatherInfo.style.display = 'block';
    elements.errorElement.style.display = 'none';
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const city = elements.cityInput.value.trim();

    if (!isValidCity(city)) {
        showError('Please enter a valid city name (letters only)');
        return;
    }

    try {
        const data = await getWeatherData(city);
        displayWeather(data);
    } catch (error) {
        showError(error.message);
        elements.weatherInfo.style.display = 'none';
    }
}

function isValidCity(city) {
    return /^[a-zA-Z\u0080-\u024F\s\-']+$/.test(city) && city.length >= 2;
}

function showError(message) {
    elements.errorElement.textContent = message;
    elements.errorElement.style.display = 'block';
    elements.weatherInfo.style.display = 'none';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);