import "./lib/leaflet.js";
fetchApi();

async function fetchApi() {
  // Making request for API key and MAP key
  const tokens = {
    request: 'Send tokens'
  }
  const token_options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tokens)
  }
  // fetching data for IP and MAP keys
  const token_res = await fetch('./token', token_options);
  const token_data = await token_res.json();
  const IP_KEY = token_data.ip_token;
  const MAP_KEY = token_data.map_token;

  // fetching data for IP API
  const ip_res = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${IP_KEY}`);
  const ip_data = await ip_res.json();
  const lat = ip_data.latitude;
  const lon = ip_data.longitude;

  // sending data (latitude, longitude) to server to make API call with users lat, lon.
  const locationData = {
    latitude: lat,
    longitude: lon,
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(locationData),
  };
  // fetching data of weather API from server
  const res = await fetch("/api", options);
  const data = await res.json();
  console.log(data);

  headerData(data);
  hourlyData(data);
  forecastData(data);
  fetchAstro(data);
  displayMap(MAP_KEY, lat, lon);
  progressBar(data);
  rainData(data);
}

// displays data from api for header
function headerData(data) {
  const location = data.location.name;
  const temperature = data.current.temp_c;
  const condition = data.current.condition.text;
  const maxTemp = data.forecast.forecastday[0].day.maxtemp_c;
  const minTemp = data.forecast.forecastday[0].day.mintemp_c;
  const degreeSpan = document.createElement("span");

  degreeSpan.innerText = "°";

  document.getElementById("header-location").textContent = location;
  document.getElementById("header-temp").append(temperature, degreeSpan);
  document.getElementById("header-condition").textContent = condition;
  document.getElementById("header-highest").textContent = maxTemp;
  document.getElementById("header-lowest").textContent = minTemp;
}

// pulls data from api and displays it in slider
function hourlyData(data) {
  const path = data.forecast.forecastday[0].hour;

  // making slider items in HTML format and putting them in slider-item wrapper
  path.forEach((item) => {
    const slider = document.getElementById("slider-item");
    const time = item.time.split(" ")[1].split(":")[0];
    const hourlyCondition = item.condition.icon;
    const hourlyTemp = Math.floor(item.temp_c);

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
  const currentAstro = document.getElementById("current-astro-text");
  const currentAstroIcon = document.getElementById("current-astro-icon");
  const pastAstro = document.getElementById("past-astro-text");
  const sunriseText = document.getElementById("sunrise");
  const sunsetText = document.getElementById("sunset");
  const astroPath = data.forecast.forecastday[0].astro;
  const sunrise = astroPath.sunrise;
  const sunset = astroPath.sunset;
  let time = new Date().getHours();

  // determines to display SUNRISE or SUNSET first, depending on time of the day.
  if (time >= sunrise.split(":")[0]) {
    currentAstro.textContent = sunset;
    pastAstro.textContent = sunrise;
    sunriseText.textContent = "SUNSET";
    sunsetText.textContent = "SUNRISE";
    currentAstroIcon.setAttribute("src", "../images/sunrise.png");
  } else if (time <= sunrise.split(":")[0]) {
    currentAstro.textContent = sunrise;
    pastAstro.textContent = sunset;
    sunriseText.textContent = "SUNRISE";
    sunsetText.textContent = "SUNSET";
    currentAstroIcon.setAttribute("src", "../images/sunrise.png");
  }

  // displays data for 'FEELS LIKE' temperature and wind speed.
  document.getElementById(
    "feels-like-temp"
  ).textContent = `${data.current.feelslike_c}°`;
  document.getElementById(
    "wind-speed"
  ).textContent = `${data.current.wind_kph}`;
}

// creates progress bar for sunrise and sunset
function progressBar(data) {
  const barWrapper = document.getElementById('progress-bar-wrapper');
  const progressBar = document.getElementById('progress-bar');
  const barIcon = document.getElementById('progress-bar-img');

  let time = new Date().getHours();
  let isDay = data.current.isDay;

  // display progress bar icon according to time
  if(isDay === 1) {
    barIcon.setAttribute('src', '../images/sun.png');
    barIcon.setAttribute('alt', 'sun icon');
  } else {
    barIcon.setAttribute('src', '../images/moon.png');
    barIcon.setAttribute('alt', 'moong icon');
  }

  // move progress bar according to time
  progressBar.style.left = time * 4.1 + '%';
}

// pulls data from api for 3 day forecast
function forecastData(data) {
  const forecastWrapper = document.getElementById("forecast-wrapper");
  let forecastPath = data.forecast.forecastday;
  // loops through forecast data array and craetes: Hour, Icon, Temperature in HTML format, then appends it in forecast wrapper.
  for (let i = 0; i < forecastPath.length; i++) {
    let iconPath = forecastPath[i].day.condition.icon;
    let minPath = Math.floor(forecastPath[i].day.mintemp_c);
    let maxPath = Math.floor(forecastPath[i].day.maxtemp_c);
    let fulldate = new Date();
    fulldate.setDate(fulldate.getDate() + i);
    const currDay = fulldate.toLocaleString("en-us", { weekday: "long" });

    const root = document.createElement("div");
    root.classList.add("forecast__row", "flex");
    root.innerHTML = `
            <p class='row__day'>${currDay}</p>
            <img class='row__icon' src=${iconPath} alt='condition img'>
            <div class='min-max__row flex'>
                <p class='row__max-temp'><span>H:</span>${maxPath}°</p>
                <p class='row__min-temp'><span>H:</span>${minPath}°</p>
            </div>
        `;
    forecastWrapper.append(root);
  }
}
// Creates and displays map on page with swiper.js library
function displayMap(key, lat, lon) {
  let map = L.map("map").setView([lat, lon], 10); // create map
  // map terrain
  let Jawg_Terrain = L.tileLayer(
    "https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token={accessToken}",
    {
      attribution:
        '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: 0,
      maxZoom: 22,
      subdomains: "abcd",
      accessToken: key,
      zoomControl: false
    }
  ).addTo(map);
  // // map marker
  // let marker = L.marker([lat, lon], {
  //   color: 'red',
  //   fillColor: '#f03',
  //   fillOpacity: 0.5,
  //   radius: 500
  // }).addTo(map);
}

// display rain and visibility data on page
function rainData(data) {
  const rainText = document.getElementById('chance-of-rain');
  const snowText = document.getElementById('chance-of-snow');

  let chanceOfRain = data.forecast.forecastday[0].day.daily_chance_of_rain;
  let chanceOfSnow = data.forecast.forecastday[0].day.daily_chance_of_snow;

  rainText.textContent = `${chanceOfRain}%`
  snowText.textContent = `: ${chanceOfSnow}%`
}