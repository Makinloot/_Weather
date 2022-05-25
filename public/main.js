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
});

// pulls data from api for header
function headerData(data) {
    const location = data.location.name;
    const temperature = data.current.temp_c;
    const condition = data.current.condition.text;
    const maxTemp = data.forecast.forecastday[0].day.maxtemp_c;
    const minTemp = data.forecast.forecastday[0].day.mintemp_c;

    document.getElementById('header-location').textContent = location;
    document.getElementById('header-temp').textContent = `${temperature}°`;
    document.getElementById('header-condition').textContent = condition;
    document.getElementById('header-highest').textContent = maxTemp;
    document.getElementById('header-lowest').textContent = minTemp;
}