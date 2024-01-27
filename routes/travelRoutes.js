// routes/travelRoutes.js
const fs = require('fs');
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
const axios = require('axios');
app.use(express.static("public"));
const path = require('path');
const tourHistoryFilePath = path.join(__dirname, 'tourHistory.json');

const router = express.Router();
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Array to store tour history data
const tourHistory = [];

router.get('/', (req, res) => {
    res.render('home');
});


// Move the function definitions to the top
const generateRandomAlphaNumeric = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
};

// Function to generate a random number within a given range
const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Read tours from JSON file
router.post('/submitForm', async (req, res) => {
    try {
        // Extract data from the submitted form
        const cityName = req.body.cityName;
        const adults = parseInt(req.body.adults) || 0;
        const children = parseInt(req.body.children) || 0;
        const phone = req.body.phone;
        const hotelRating = parseInt(req.body.hotelRating) || 1; // Assume 1 star if not provided
        const dateArrival = new Date(req.body.dateArrival);
        const dateDeparture = new Date(req.body.dateDeparture);
        const weatherCondition = req.body.weatherCondition; // Assuming you have a field for weather condition
        console.log('Before API call');

        const formattedDateArrival = dateArrival.toLocaleString('en-US', { timeZone: 'UTC' });
        const formattedDateDeparture = dateDeparture.toLocaleString('en-US', { timeZone: 'UTC' });
        const apiKey = 'd680bf725eceee752a55d0d17100d4a7';
        const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${cityName}&APPID=${apiKey}&units=metric`);
        console.log('Weather Description:', weatherResponse.data.weather[0].description);

        const weatherData = {
            location: weatherResponse.data.name,
            temperature: weatherResponse.data.main.temp,
            condition: weatherResponse.data.weather[0].description,
            humidity: weatherResponse.data.main.humidity,
            windSpeed: weatherResponse.data.wind.speed,
            clouds: weatherResponse.data.clouds.all
        };

        if (['mist', 'broken clouds', 'haze'].includes(weatherResponse.data.weather[0].description)) {
            // If the weather conditions indicate foggy weather, redirect to the home page
            // Assuming you are rendering 'cancel.ejs' in your route handler
        return res.render('cancel');
        } else {
            let baseCost;
            if (['Cairo', 'Berlin', 'San Carlos'].includes(cityName)) {
                baseCost = (adults + 0.5 * children) * 1500;
                baseCost *= hotelRating;
            } else if (['Sydney', 'Beijing', 'Dubai'].includes(cityName)) {
                baseCost = (adults + 0.5 * children) * 1000;
                baseCost *= hotelRating;
            } else {
                // Default case for other cities
                // Calculate the duration of the stay in days
                const durationInDays = Math.ceil((dateDeparture - dateArrival) / (1000 * 60 * 60 * 24));
                // Example: calculate base cost based on the number of adults, children, and hotel rating
                baseCost = (adults + 0.5 * children) * 1250; // Assuming $100 per adult and $50 per child
                baseCost *= hotelRating; // Increase cost based on hotel rating
                console.log("baseCost", baseCost)
            }

            // Example: calculate discount based on the number of children
            const discountForChildren = children > 5 ? 0.1 * baseCost : 0; // 10% discount if more than 5 children

            // Total cost
            const totalCost = baseCost - discountForChildren;
            console.log("totalCost", totalCost)
            
            const flightNumber = generateRandomAlphaNumeric(2).toUpperCase() + generateRandomNumber(1000, 9999);
            
            // Save the booking details to tourHistory array (or your database)
            const bookingDetails = {
                flightNumber,
                cityName,
                adults,
                children,
                phone,
                hotelRating,
                formattedDateArrival,
                formattedDateDeparture,
                totalCost
            };
            tourHistory.push(bookingDetails);

            fs.writeFileSync(tourHistoryFilePath, JSON.stringify(tourHistory, null, 2));
    

            res.render('result', {
                flightNumber,
                cityName,
                adults,
                children,
                phone,
                hotelRating,
                formattedDateArrival,
                formattedDateDeparture,
                totalCost,
            });
            res.render('tourHistory', { tourHistory, bookingDetails });

        }
    } catch (error) {
        console.error('Error processing form submission:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/travelagency', (req, res) => {
    const filePath = path.join(__dirname, '../public/html', 'index.html'); // Update the path
    res.sendFile(filePath);
});

router.get('/cancel', (req, res) => {
    const alertMessage = 'Your cancellation message here';
    res.render('cancel', { alertMessage });
});

router.get('/tourHistory', (req, res) => {
    res.render('tourHistory', { tourHistory });
});

router.get('/weather/:city', async (req, res) => {
    console.log('Weather route called');
    try {
        const apiKey = 'd680bf725eceee752a55d0d17100d4a7';
        const cityName = req.params.city || 'Moscow'; // Get the city name from the route parameter

        // Step 1: Find the city ID by name
        const citySearchResponse = await axios.get(`http://api.openweathermap.org/data/2.5/find?q=${cityName}&type=like&sort=population&APPID=${apiKey}`);

        if (!citySearchResponse.data || !citySearchResponse.data.list || citySearchResponse.data.list.length === 0) {
            throw new Error('City not found');
        }

        // Step 2: Get weather information using the city ID
        const cityId = citySearchResponse.data.list[0].id;
        const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather?id=${cityId}&lang=en&units=metric&APPID=${apiKey}`);

        if (!weatherResponse.data || !weatherResponse.data.name) {
            throw new Error('Weather data not found');
        }

        // Extract relevant weather information from the API response
        const weatherData = {
            location: weatherResponse.data.name,
            temperature: weatherResponse.data.main.temp,
            condition: weatherResponse.data.weather[0].description,
            humidity: weatherResponse.data.main.humidity,
            windSpeed: weatherResponse.data.wind.speed,
            clouds: weatherResponse.data.clouds.all
        };

        // Send the weather information as a JSON response
        res.json(weatherData);
    } catch (error) {
        // Handle errors
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/addTour', (req, res) => {
    const newTour = req.body;
    newTour.id = generateRandomId(); // Generate a unique ID for the new tour
    tourHistory.push(newTour);
});

// PUT request to update a tour
router.put('/updateTour/:id', (req, res) => {
    const tourId = req.params.id;
    const updatedTour = req.body;

    // Find the index of the tour with the specified ID
    const index = tourHistory.findIndex(tour => tour.id === tourId);

    if (index !== -1) {
        // Update the tour
        tourHistory[index] = { ...tourHistory[index], ...updatedTour };
    } else {
        res.status(404).json({ error: 'Tour not found' });
    }
});

// DELETE request to delete a tour
router.delete('/deleteTour/:id', (req, res) => {
    const tourIdToDelete = req.params.id;

    // Filter out the tour with the specified ID
    tourHistory = tourHistory.filter(tour => tour.id !== tourIdToDelete);

    res.json({ message: 'Tour deleted successfully' });
});
module.exports = router;
