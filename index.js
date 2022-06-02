const express = require("express");
const app = express();
const fetch = require("node-fetch");
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening at ${PORT}`));
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
require("dotenv").config();
// sending weather data to user
app.post("/api", async (request, response) => {
  // recieve info from user
  const data = request.body;
  let lat = data.latitude;
  let lon = data.longitude;
  // get user location
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en`
  const res = await fetch(url);
  const street_data = await res.json();
  let city = street_data.address.city;
  // call weather data based on user location
  const API_KEY = process.env.API_KEY;
  const weather_url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=10&aqi=yes`;
  const weather_res = await fetch(weather_url);
  const weather_data = await weather_res.json();
  // send user weather data
  response.json(weather_data);
});
// sending map key
app.post("/token", async (request, response) => {
  const mapKey = process.env.MAP_TOKEN;
  const token = mapKey;
  response.json(token);
});
