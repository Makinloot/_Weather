const express = require('express');
const app = express();
const fetch = require('node-fetch');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening at ${PORT}`));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));
require('dotenv').config();

app.post('/api', async (request, response) => {
    const API_KEY = process.env.API_KEY;
    const data = request.body;
    const lat = data.latitude;
    const lon = data.longitude;
    const weather_url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=10`;

    const weather_res = await fetch(weather_url);
    const weather_data = await weather_res.json();

    response.json(weather_data);
})