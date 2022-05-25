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
    const body = document.body;
    body.append(document.createElement('p').textContent = data)
})