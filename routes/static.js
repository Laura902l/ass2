//routes/static.js

const express = require('express');
const app = express();
app.set('view engine', 'ejs');

const router = express.Router();
var pic1 = "/img/img_1.jpg";
var pic2 = "/img/img_2.jpg";

router.get('/', (req, res) => {
    res.render('home', { pic1, pic2 }); // Pass pic1 and pic2 as properties to the template
});

router.get('/contacts', (req, res) => {
    res.render('contacts', {});
});

module.exports = router;