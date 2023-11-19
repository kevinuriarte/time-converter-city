let lastSelectedTimeZone = null; // To store the last selected time zone
const timeZoneDbApiKey = 'XA7KFN1XIPMU'; // Replace with your TimeZoneDB API key
const openCageApiKey = 'bdf95248dd2f40a2b07754ea162354d3'; // Replace with your OpenCage Geocoder API key

function convertTime() {
    const cityName = document.getElementById('cityName').value;
    getCoordinates(cityName)
        .then(coords => getTimeZoneInfo(coords))
        .then(timeZone => {
            lastSelectedTimeZone = timeZone;
            displayConvertedTime(cityName, timeZone);
        })
        .catch(error => console.error('Error:', error));
}

function getCoordinates(cityName) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(cityName)}&key=${openCageApiKey}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry;
                return { lat, lng };
            } else {
                throw new Error('Location not found');
            }
        });
}

function getTimeZoneInfo({ lat, lng }) {
    const url = `https://api.timezonedb.com/v2.1/get-time-zone?key=${timeZoneDbApiKey}&format=json&by=position&lat=${lat}&lng=${lng}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'OK') {
                return data.zoneName;
            } else {
                throw new Error('Time zone info not found');
            }
        });
}

function displayConvertedTime(cityName, timeZone) {
    const options = { timeZone: timeZone, hour: 'numeric', minute: 'numeric', hour12: true };
    const convertedTime = new Intl.DateTimeFormat('en-US', options).format(new Date());
    document.getElementById('result').textContent = `Current time in ${cityName}: ${convertedTime}`;
}

function convertSpecificTime() {
    const specificTimeInput = document.getElementById('specificTime').value;
    const cityName = document.getElementById('cityName').value;

    if (!lastSelectedTimeZone) {
        alert("Please select a city first.");
        return;
    }

    if (!specificTimeInput) {
        alert("Please enter a specific time.");
        return;
    }

    const time = convertInputTimeToISO(specificTimeInput);
    const specificTimeInCityTimeZone = new Date(time).toLocaleString("en-US", { timeZone: lastSelectedTimeZone, hour: 'numeric', minute: 'numeric', hour12: true });

    document.getElementById('result').textContent = `Time in ${cityName} for your ${specificTimeInput} is ${specificTimeInCityTimeZone}`;
}

function convertInputTimeToISO(timeInput) {
    const [hours, minutes] = timeInput.split(':');
    const now = new Date();
    now.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return now.toISOString();
}
