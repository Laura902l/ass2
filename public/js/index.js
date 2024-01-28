function showForm(cityname, country) {
    document.getElementById("bookingForm").style.display = "block";
    document.getElementById("cityName").value = cityname;

    document.getElementById("country").value = country;

    console.log("Form is shown");
}

function hideForm() {
    document.getElementById("bookingForm").style.display = "none";
    console.log("Form is hidden");
}
function hide() {
    document.getElementById("weatherInformation").style.display = "none";
    console.log("Form is hidden");
}
async function getWeather() {
    const selectedCity = document.getElementById('citySelect').value;
    const response = await fetch(`/weather?city=${selectedCity}`);
    const weatherData = await response.json();
    document.getElementById('weatherResult').innerHTML = `
        <h2>${weatherData.location}</h2>
        <p>Condition: ${weatherData.condition}</p>
        <p>Temperature: ${weatherData.temperature}°C</p>
        <p>Humidity: ${weatherData.humidity}%</p>
        <p>clouds: ${weatherData.clouds} m/s</p>
        <p>Wind Speed: ${weatherData.windSpeed} m/s</p>
    `;
}


async function getWeather(name) {

    document.getElementById("weatherInformation").style.display = "block";

    try {
        const response = await fetch(`/travel/weather/${name}`);
        const weatherData = await response.json();
        document.getElementById('weatherCityName').innerText = weatherData.location;
        document.getElementById('condition').innerText = `Condition: ${weatherData.condition}`;
        document.getElementById('temperature').innerText = `Temperature: ${weatherData.temperature}°C`;
        document.getElementById('humidity').innerText = `Humidity: ${weatherData.humidity}%`;
        document.getElementById('clouds').innerText = `Clouds: ${weatherData.clouds} m/s`;
        document.getElementById('windSpeed').innerText = `Wind Speed: ${weatherData.windSpeed} m/s`;

        // Set the city name in the weather booking form
        document.getElementById('weatherCity').value = weatherData.location;

        // Calculate and display prices based on city name
        const adultPrice = calculateAdultPrice(weatherData.location);
        const kidPrice = calculateKidPrice(weatherData.location);

        document.getElementById('Adultprice').innerText = `Adult Price: $${adultPrice}`;
        document.getElementById('Kidsprice').innerText = `Kid Price: $${kidPrice}`;
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        document.getElementById('weatherInformation').innerHTML = '<p>Error fetching weather data</p>';
    }
}

function calculateAdultPrice(cityName) {
    if (['Cairo', 'Berlin', 'San Carlos'].includes(cityName)) {
        return 1000;
    } else if (['Sydney', 'Beijing', 'Dubai'].includes(cityName)) {
        return 1400;
    } else {
        return 1250;
    }
}

function calculateKidPrice(cityName) {
    if (['Cairo', 'Berlin', 'San Carlos'].includes(cityName)) {
        return 500;
    } else if (['Sydney', 'Beijing', 'Dubai'].includes(cityName)) {
        return 750;
    } else {
        return 860;
    }
}



