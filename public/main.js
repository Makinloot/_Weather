import "./lib/leaflet.js";

navigator.geolocation.getCurrentPosition(async (position) => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

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

  const res = await fetch("/api", options);
  const data = await res.json();
  console.log(data);
  headerData(data);
  hourlyData(data);
  forecastData(data);
  fetchAstro(data);
  getMapToken(lat, lon);
});

// pulls data from api for header
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

  path.forEach((item) => {
    const slider = document.getElementById("slider-item");
    const time = item.time.split(" ")[1].split(":")[0];
    const hourlyCondition = item.condition.icon;
    const hourlyTemp = Math.floor(item.temp_c);

    const root = document.createElement("div");
    // root.classList.add('slider__item', 'flex');
    root.classList.add("swiper-slide", "flex");
    root.innerHTML = `
            <p>${time}</p>
            <img class='hourly__icon' src=${hourlyCondition} alt='weather condition'>
            <strong class='hourly__temp'>${hourlyTemp}<span class='hourly__degree'>°</span></strong>
        `;
    slider.append(root);
  });
}

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
  forecastWrapper.innerHTML = "";

  let forecastPath = data.forecast.forecastday;
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

async function getMapToken(lat, lon) {
  const request = {
    map: "token",
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  };
  const res = await fetch("/map", options);
  const map_data = await res.json();
  displayMap(map_data, lat, lon);
}

function displayMap(data, lat, lon) {
  let map = L.map("map").setView([lat, lon], 12);
  let Jawg_Terrain = L.tileLayer(
    "https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token={accessToken}",
    {
      attribution:
        '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: 0,
      maxZoom: 22,
      subdomains: "abcd",
      accessToken: data,
    }
  ).addTo(map);
  let marker = L.marker([lat, lon], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
  }).addTo(map);
}
