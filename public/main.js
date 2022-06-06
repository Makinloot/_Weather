// import jeaflet.js to main.js
import "./lib/leaflet.js";

navigator.geolocation.getCurrentPosition(async (position) => {
  // send user latitude and longitude to server
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  const locationData = {
    latitude: lat,
    longitude: lon,
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(locationData)
  };
  // fetching data of weather API from server
  const res = await fetch("/api", options);
  const data = await res.json();
  console.log(data);
  headerData(data);
  hourlyData(data);
  forecastData(data);
  fetchAstro(data);
  rainData(data);
  changeBackground(data);
  // Making request for API key and MAP key
  const tokens = {
    request: "Send tokens",
  };
  const token_options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tokens),
  };
  // fetching data MAP key
  const token_res = await fetch("./token", token_options);
  const token_data = await token_res.json();
  const MAP_KEY = token_data;
  displayMap(MAP_KEY, lat, lon);
});

// displays data from api for header
function headerData(data) {
  // header data path
  const weatherData = {
    location: data.location.name,
    temperature: data.current.temp_c,
    condition: data.current.condition.text,
    maxTemp: data.forecast.forecastday[0].day.maxtemp_c,
    minTemp: data.forecast.forecastday[0].day.mintemp_c,
  }
  // creates text content for header data
  const degreeSpan = document.createElement("span");
  degreeSpan.innerText = "°";
  document.getElementById("header-location").textContent = weatherData.location;
  document.getElementById("header-temp").append(weatherData.temperature, degreeSpan);
  document.getElementById("header-condition").textContent = weatherData.condition;
  document.getElementById("header-highest").textContent = weatherData.maxTemp;
  document.getElementById("header-lowest").textContent = weatherData.minTemp;
}
// Makes slider from swiper.js
let sliderInitialView = new Date().getHours();
let swiper = new Swiper(".mySwiper", {
  slidesPerView: 6.5,
  spaceBetween: 0,
  freeMode: true,
  initialSlide: sliderInitialView // measures slider view starting point
});
// pulls data from api and displays it in slider
function hourlyData(data) {
  const path = data.forecast.forecastday[0].hour;
  // making slider items in HTML format and putting them in slider-item wrapper
  path.forEach((item) => {
    // slider data path
    const slider = document.getElementById("slider-item");
    const time = item.time.split(" ")[1].split(":")[0];
    const hourlyCondition = item.condition.icon;
    const hourlyTemp = Math.floor(item.temp_c);
    // Creates HTML for slider items and appends it slider
    const root = document.createElement("div");
    root.classList.add("swiper-slide", "flex");
    root.innerHTML = `
            <p>${time}</p>
            <img class='hourly__icon' src=${hourlyCondition} alt='weather condition'>
            <strong class='hourly__temp'>${hourlyTemp}<span class='hourly__degree'>°</span></strong>
        `;
    slider.append(root);
  });
}

// displays astro data from API
function fetchAstro(data) {
  // astro HTML elements & path
  const astroDOMElements = {
    currentAstro: document.getElementById('current-astro-text'),
    currentAstroIcon: document.getElementById('current-astro-icon'),
    pastAstro: document.getElementById('past-astro-text'),
    sunriseText: document.getElementById('sunrise'),
    sunsetText: document.getElementById('sunset'),
    barIcon: document.getElementById('progress-bar-img')
  }
  let astroPath = data.forecast.forecastday[0].astro;
  const astroData = {
    isDay: data.current.is_day,
    sunrise: astroPath.sunrise,
    sunset: astroPath.sunset
  }
  // move progress bar according to time
  let time = new Date().getHours();
  const progressBar = document.getElementById("progress-bar");
  progressBar.style.left = time * 4.1 + "%";
  // determines to display SUNRISE or SUNSET first, depending on time of the day.
  if (astroData.isDay === 1) {
    // if day
    astroDOMElements.currentAstro.textContent = astroData.sunset;
    astroDOMElements.pastAstro.textContent = astroData.sunrise;
    astroDOMElements.sunriseText.textContent = "SUNSET";
    astroDOMElements.sunsetText.textContent = "SUNRISE";
    astroDOMElements.currentAstroIcon.setAttribute("src", "../images/sunrise.png");
    astroDOMElements.barIcon.setAttribute("src", "../images/sun.png");
    astroDOMElements.barIcon.setAttribute("alt", "sun icon");
  } else {
    // if night
    astroDOMElements.currentAstro.textContent = astroData.sunrise;
    astroDOMElements.pastAstro.textContent = astroData.sunset;
    astroDOMElements.sunriseText.textContent = "SUNRISE";
    astroDOMElements.sunsetText.textContent = "SUNSET";
    astroDOMElements.currentAstroIcon.setAttribute("src", "../images/sunrise.png");
    astroDOMElements.barIcon.setAttribute("src", "../images/moon.png");
    astroDOMElements.barIcon.setAttribute("alt", "moong icon");
  }
  // displays data for 'FEELS LIKE' temperature and wind speed.
  document.getElementById(
    "feels-like-temp"
  ).textContent = `${data.current.feelslike_c}°`;
  document.getElementById(
    "wind-speed"
  ).textContent = `${data.current.wind_kph}`;
}

// pulls data from api for 3 day forecast
function forecastData(data) {
  const forecastWrapper = document.getElementById("forecast-wrapper");
  let forecastPath = data.forecast.forecastday;
  // loops through forecast data array and craetes: Hour, Icon, Temperature in HTML format, then appends it in forecast wrapper.
  for (let i = 0; i < forecastPath.length; i++) {
    // forecast data path
    let iconPath = forecastPath[i].day.condition.icon;
    let minPath = Math.floor(forecastPath[i].day.mintemp_c);
    let maxPath = Math.floor(forecastPath[i].day.maxtemp_c);
    let fulldate = new Date();
    fulldate.setDate(fulldate.getDate() + i);
    const currDay = fulldate.toLocaleString("en-us", { weekday: "long" });
    // Creates HTML for forecast and appends it to forecast wrapper
    const root = document.createElement("div");
    root.classList.add("forecast__row", "flex");
    root.innerHTML = `
            <p class='row__day'>${currDay}</p>
            <img class='row__icon' src=${iconPath} alt='condition img'>
            <div class='min-max__row flex'>
                <p class='row__max-temp'><span>H:</span>${maxPath}°</p>
                <p class='row__min-temp'><span>L:</span>${minPath}°</p>
            </div>
        `;
    forecastWrapper.append(root);
  }
}

// Creates and displays map on page with swiper.js library
function displayMap(key, lat, lon) {
  let map = L.map("map").setView([lat, lon], 12); // create map
  // map terrain
  let Jawg_Terrain = L.tileLayer(
    "https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token={accessToken}",
    {
      attribution:
        '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: 0,
      maxZoom: 22,
      subdomains: "abcd",
      accessToken: key, // MAP KEY HERE
      zoomControl: false,
    }
  ).addTo(map);
  // adds marker on map
  // // map marker
  let marker = L.marker([lat, lon], {
    color: "red",
    fillColor: "#f03",
    fillOpacity: 0.5,
    radius: 500,
  }).addTo(map);
  // console.log(marker)
}

// display rain and visibility data on page
function rainData(data) {
  const rainText = document.getElementById("chance-of-rain");
  const snowText = document.getElementById("chance-of-snow");
  const visibilityText = document.getElementById("visibility");
  const airQuality = document.getElementById("air-quality");
  // path for data
  let chanceOfRain = data.forecast.forecastday[0].day.daily_chance_of_rain;
  let chanceOfSnow = data.forecast.forecastday[0].day.daily_chance_of_snow;
  let visibilityKm = data.current.vis_km;
  let airQualityIndex = data.current.air_quality["us-epa-index"];
  // air quality text according to its quality
  if (airQualityIndex == "1") airQuality.textContent = "Good";
  else if (airQualityIndex == "2") airQuality.textContent = "Moderate";
  else if (airQualityIndex >= "3" && airQualityIndex <= "4")
    airQuality.textContent = "Unhealthy";
  else if (airQualityIndex == "5") airQuality.textContent = "Too unhealthy";
  else if (airQualityIndex == "6") airQuality.textContent = "Hazardous";
  // insert data in HTML
  rainText.textContent = `${chanceOfRain}%`;
  snowText.textContent = `: ${chanceOfSnow}%`;
  visibilityText.textContent = `${visibilityKm} km`;
}

// change background image of wrapper according to weather condition
function changeBackground(data) {
  const body = document.querySelector(".bg-main");
  let conditionDay = data.current.condition.icon.split("/")[5];
  let condition = data.current.condition.icon.split("/")[6].split(".")[0];
  // check weather condition and whether it is day or night, then display background image
  // background image sunny
  if (condition == 113) {
    if (conditionDay === "day") body.style.background = "url(./images/day/sunny.jpg)";
    else body.style.background = "url(./images/night/clear.jpg)";
    // CLOUDY CONDITIONS
  } else if (condition >= 116 && condition <= 122) {
    if (conditionDay === "day") body.style.background = "url(./images/day/cloudy.jpg)";
    else body.style.background = "url(./images/night/cloudy.jpg)";
    // background image mist
  } else if (condition == 143 || condition == 248 || condition == 260) {
    if (conditionDay === "day") body.style.background = "url(./images/day/mist.jpg";
    else body.style.background = "url(./images/night/mist.jpg";
    // background image light/medium rain
  } else if (condition == 176 || condition == 185 || condition == 311 || condition == 353 || (condition >= 263 && condition <= 284) || (condition >= 293 && condition <= 302) || (condition >= 317 && condition <= 320)) {
    if (conditionDay === "day") body.style.background = "url(./images/day/light_rain.jpg";
    else body.style.background = "url(./images/night/light_rain.jpg";
    // background image heavy rain
  } else if (condition == 182 || condition === 314 || condition == 350 || (condition >= 305 && condition <= 308) || (condition >= 356 && condition <= 359) || (condition >= 374 && condition <= 377)) {
    if (conditionDay === "day") body.style.background = "url(./images/day/heavy_rain.jpg";
    else body.style.background = "url(./images/night/heavy_rain.jpg";
    // background image rain with thunder
  } else if (condition == 386 || condition == 389) {
    if (conditionDay === "day")body.style.background = "url(./images/day/light_thunder.jpg)";
    else body.style.background = "url(./images/night/light_thunder.jpg)";
    // thundery outbreak image
  } else if (condition == 200) {
    if (conditionDay === "day") body.style.background = "url(./images/day/thundery_outbreak.jpg";
    else body.style.background = "url(./images/night/thundery_outbreak.jpg";
    // light snow
  } else if (condition == 179 || (condition >= 323 && condition <= 329) || (condition >= 362 && condition <= 368) || condition == 392) {
    if (conditionDay === "day") body.style.background = "url(./images/day/light_snow.jpg";
    else body.style.background = "url(./images/night/light_snow.jpg";
    // heavy snow
  } else if ((condition >= 227 && condition <= 330) || (condition >= 332 && condition <= 338) || condition == 371 || condition == 395) {
    if (conditionDay === "day") body.style.background = "url(./images/day/heavy_snow.jpg";
    else body.style.background = "url(./images/night/heavy_snow.jpg";
  }
  // center background image
  body.style.backgroundPosition = "center";
  body.style.backgroundRepeat = "no-repeat";
  body.style.backgroundSize = "cover";
}