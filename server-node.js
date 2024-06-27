const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let airports = [];

fs.readFile('airports.json', (err, data) => {
    if (err) throw err;
    airports = JSON.parse(data);
});

app.get('/getCityCode', (req, res) => {
    const cityName = req.query.cityName;
    const airport = airports.find(a => a.city.toLowerCase() === cityName.toLowerCase());

    if (airport) {
        res.send({ iataCode: airport.iata_code });
    } else {
        res.status(404).send({ error: 'Code IATA introuvable pour la ville donnée' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
