const express = require('express');
const router = express.Router();
const app = express();

app.set('view engine', 'ejs');

// Assuming you have the tourHistory array available
const tourHistory = [];

// Route to view tour history
router.get('/', (req, res) => {
    res.render('tourHistory', { tourHistory });
});

module.exports = router;
