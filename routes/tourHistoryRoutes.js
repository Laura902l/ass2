const express = require('express');
const router = express.Router();
const fs = require('fs');
const axios = require('axios');

const historyFilePath = 'routes/tourHistory.json';
let historyJson = JSON.parse(fs.readFileSync(historyFilePath, 'utf8'));

router.get('/history', (req, res) => {
    let tourHistory = JSON.parse(fs.readFileSync(historyFilePath, 'utf8'));
    res.render('manageIterm', { tourHistory });
});

const generateRandomAlphaNumeric = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
};

const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

router.get('/cancel', (req, res) => {
    const alertMessage = 'Your cancellation message here';
    res.render('cancel', { alertMessage });
});
router.post('/history/edit/:index', async (req, res) => {
    try {
        console.log('Received edit request:', req.body);

        historyJson = JSON.parse(fs.readFileSync(historyFilePath, 'utf8'));
        const index = req.params.index;
        const adults = parseInt(req.body.adultsEdit) || 0;
        const children = parseInt(req.body.childrenEdit) || 0;
        const phone = req.body.phoneEdit;
        const hotelRating = parseInt(req.body.hotelRatingEdit) || 1; // Assume 1 star if not provided
        const formattedDateArrival = new Date(req.body.formattedDateArrivalEdit);
        const dateDeparture = new Date(req.body.formattedDateDepartureEdit);
        const cityName = req.body.cityNameEdit;
        const apiKey = 'd680bf725eceee752a55d0d17100d4a7';
        const citySearchResponse = await axios.get(`http://api.openweathermap.org/data/2.5/find?q=${cityName}&type=like&sort=population&APPID=${apiKey}`);
        const cityId = citySearchResponse.data.list[0].id;
        const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather?id=${cityId}&lang=en&units=metric&APPID=${apiKey}`);

        if (!citySearchResponse.data || !citySearchResponse.data.list || citySearchResponse.data.list.length === 0) {
            throw new Error('City not found');
        }

        const weatherData = {
            location: weatherResponse.data.name,
            temperature: weatherResponse.data.main.temp,
            condition: weatherResponse.data.weather[0].description,
            humidity: weatherResponse.data.main.humidity,
            windSpeed: weatherResponse.data.wind.speed,
            clouds: weatherResponse.data.clouds.all
        };
        console.log('Before rendering or redirecting');

        if (['mist', 'broken clouds', 'haze'].includes(weatherResponse.data.weather[0].description)) {
            console.log('Before rendering or redirecting');

            return res.render('cancel');
        } else {
            let baseCost = 1500;

            if (['Cairo', 'Berlin', 'San Carlos'].includes(cityName)) {
                baseCost = (adults + 0.5 * children) * 1500;
                baseCost *= hotelRating;
            } else if (['Sydney', 'Beijing', 'Dubai'].includes(cityName)) {
                baseCost = (adults + 0.5 * children) * 1000;
                baseCost *= hotelRating;
            } else {
                baseCost = (adults + 0.5 * children) * 1250;
                console.log("baseCost", baseCost);
                baseCost *= hotelRating;
            }

            const discountForChildren = children > 5 ? 0.1 * baseCost : 0;
            const totalcost = baseCost - discountForChildren;

            const flightNumber = generateRandomAlphaNumeric(2).toUpperCase() + generateRandomNumber(1000, 9999);

            const data = {
                flightNumber: flightNumber,
                cityName: req.body.cityNameEdit,
                hotelRating: req.body.hotelRatingEdit,
                phone: req.body.phoneEdit,
                formattedDateArrival: req.body.formattedDateArrivalEdit,
                formattedDateDeparture: req.body.formattedDateDepartureEdit,
                adults: req.body.adultsEdit,
                children: req.body.childrenEdit,
                totalCost: totalcost,
            };

           
            historyJson[index] = data;

            fs.writeFileSync(historyFilePath, JSON.stringify(historyJson, null, 2));

            return res.redirect('/history');


        }
    } catch (error) {
        console.error('Error processing form submission:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/history/delete/:index', (req, res) => {
    const index = req.params.index;
    historyJson.splice(index, 1);

    fs.writeFileSync(historyFilePath, JSON.stringify(historyJson, null, 2));

    res.redirect('/history');
});
module.exports = router;
