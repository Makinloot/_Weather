navigator.geolocation.getCurrentPosition(async position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const locationData = {
        latitude: lat,
        longitude: lon
    }
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(locationData)
    }

    const res = await fetch('/api', options);
    const data = await res.json();
    console.log(data);
    headerData(data);
    forecastData(data);
});

// pulls data from api for header
function headerData(data) {
    const location = data.location.name;
    const temperature = data.current.temp_c;
    const condition = data.current.condition.text;
    const maxTemp = data.forecast.forecastday[0].day.maxtemp_c;
    const minTemp = data.forecast.forecastday[0].day.mintemp_c;
    const degreeSpan = document.createElement('span');

    degreeSpan.innerText = '°';

    document.getElementById('header-location').textContent = location;
    document.getElementById('header-temp').append(temperature, degreeSpan)
    document.getElementById('header-condition').textContent = condition;
    document.getElementById('header-highest').textContent = maxTemp;
    document.getElementById('header-lowest').textContent = minTemp;
}

// pulls data from api for 3 day forecast
function forecastData(data) {
    const forecastWrapper = document.getElementById('forecast-wrapper');
    forecastWrapper.innerHTML = '';

    let forecastPath = data.forecast.forecastday;
    for(let i = 0; i < forecastPath.length; i++) {
        let iconPath = forecastPath[i].day.condition.icon;
        let minPath = Math.floor(forecastPath[i].day.mintemp_c);
        let maxPath = Math.floor(forecastPath[i].day.maxtemp_c);
        let fulldate = new Date()
        fulldate.setDate(fulldate.getDate() + i)
        const currDay = fulldate.toLocaleString('en-us', {weekday:'long'});

        const root = document.createElement('div');
        root.classList.add('forecast__row');
        root.innerHTML = `
            <p class='row__day'>${currDay}</p>
            <img class='row__icon' src=${iconPath} alt='condition img'>
            <div class='min-max__row flex'>
                <p>H:${maxPath}°</p>
                <p>H:${minPath}°</p>
            </div>
        `
        forecastWrapper.append(root);
    }
}