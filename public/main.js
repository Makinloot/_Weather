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
    hourlyData(data);
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

// pulls data from api and displays it in slider
function hourlyData(data) {
    const path = data.forecast.forecastday[0].hour;

    path.forEach( item => {
        const slider = document.getElementById('slider-item');
        const time = item.time.split(' ')[1].split(':')[0];
        const hourlyCondition = item.condition.icon;
        const hourlyTemp = Math.floor(item.temp_c);
        
        const root = document.createElement('div');
        root.classList.add('slider__item', 'flex');
        root.innerHTML = `
            <p>${time}</p>
            <img class='hourly__icon' src=${hourlyCondition} alt='weather condition'>
            <strong class='hourly__temp'>${hourlyTemp}<span class='hourly__degree'>°</span></strong>
        `;
        slider.append(root);
    })
}




const slider = document.getElementById('slider');
const sliderItem = document.getElementById('slider-item');
let isDown = false;
let startX;
let x;

window.addEventListener('mouseup', () => {
    isDown = false;
})

slider.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.offsetX - sliderItem.offsetLeft;
    slider.style.cursor = 'grabbing';
});

slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.style.cursor = 'grab';
});

slider.addEventListener('mouseenter', () => {
    slider.style.cursor = 'grab';
})

slider.addEventListener('mouseleave', () => {
    isDown = false;
});

slider.addEventListener('mousemove', (e) => {
    if(!isDown) return;
    e.preventDefault();
    x = e.offsetX;

    sliderItem.style.left = `${x - startX}px`;
    boundary();
});

slider.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.targetTouches[0].clientX - sliderItem.offsetLeft;
}, {passive: true});

slider.addEventListener('touchmove', (e) => {
    if(!isDown) return;
    x = e.targetTouches[0].clientX;

    sliderItem.style.left = `${x - startX}px`
    boundary();
}, {passive: true});

function boundary() {
    let outer = slider.getBoundingClientRect();
    let inner = sliderItem.getBoundingClientRect();

    if(parseInt(sliderItem.style.left) > 0) {
        sliderItem.style.left = '0px';
    } else if(inner.right < outer.right) {
        sliderItem.style.left = `-${inner.width - outer.width}px`;
    }
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
                <p class='row__max-temp'><span>H:</span>${maxPath}°</p>
                <p class='row__min-temp'><span>H:</span>${minPath}°</p>
            </div>
        `
        forecastWrapper.append(root);
    }
}