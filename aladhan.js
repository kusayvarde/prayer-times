const BASE_URL = "https://api.aladhan.com/v1/timings";

function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    resolve({ lat, lon });
                },
                (error) => {
                    reject(error);
                }
            );
        } else {
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
}

async function getPrayerTimes() {
    getUserLocation()
        .then(coords => {
            const { lat, lon } = coords;
            const url = `${BASE_URL}`;
            const stringQuery = `?latitude=${lat}&longitude=${lon}`;
            return axios.get(url + stringQuery);
        })
        .then(response => {
            const prayerTimes = response.data.data.timings;
            console.log(prayerTimes);
            return prayerTimes;
        })
        .catch(error => {
            console.error("Error fetching prayer times:", error);
        });
}





