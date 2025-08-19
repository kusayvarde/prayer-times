const BASE_URL = "https://api.aladhan.com/v1/";

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
            const stringQuery = `timings?latitude=${lat}&longitude=${lon}`;
            return axios.get(url + stringQuery);
        })
        .then(response => {
            const prayerTimes = response.data.data;
            console.log(prayerTimes);
            return prayerTimes;
        })
        .catch(error => {
            console.error("Error fetching prayer times:", error);
        });
}


function getCityName(lat, lon) {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    return axios.get(url)
        .then(response => {
            const city = response.city || "Unknown";
            console.log("City:", city);
            return city;
        })
        .catch(error => {
            console.error("Error fetching city name:", error);
        });
}

function getPrayerTimesByCity(city, month) {
    try {
        const stringQueryAdress = `calendarByAddress/2025/${month}?address=${city}`;
        const url = `${BASE_URL}${stringQueryAdress}`;
        return axios.get(url)
            .then(response => {
                const prayerTimes = response.data.data;
                console.log("Prayer Times for", city, ":", prayerTimes);
                return prayerTimes;
            })
            .catch(error => {
                console.error("Error fetching prayer times:", error);
            });
    } catch (error) {
        console.error("Wrong city:", city);
    }
}



function showPrayerTimes(prayerTimes) {
    const tableBody = document.getElementById('prayer-times-info');
    tableBody.innerHTML = '';
    let nextMarked = false; // mark the first upcoming day

    for (const prayer of prayerTimes) {
        const row = document.createElement('tr');
        const today = new Date();
        const prayerDate = new Date(prayer.date.readable);
        
        // Compare only the day
        const isToday = today.getDate() === prayerDate.getDate();
        if (isToday)
            row.classList.add('today-date');

        // Better differentiation (without changing your today logic):
        // Use API gregorian date and weekday for robust labels/classes
        const apiDateStr = prayer?.date?.gregorian?.date; // e.g., "20-08-2025"
        let y = prayerDate.getFullYear();
        let m = prayerDate.getMonth() + 1;
        let d = prayerDate.getDate();
        if (apiDateStr && /^\d{2}-\d{2}-\d{4}$/.test(apiDateStr)) {
            const [dd, mm, yyyy] = apiDateStr.split('-').map(Number);
            d = dd; m = mm; y = yyyy;
        }
        const plainToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const plainPrayer = new Date(y, m - 1, d);

        const weekday = (prayer?.date?.gregorian?.weekday?.en) || ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][plainPrayer.getDay()];
        const isFriday = weekday === 'Friday';
        const isWeekend = weekday === 'Saturday' || weekday === 'Sunday';
        const isPast = plainPrayer < plainToday;
        const isFuture = plainPrayer > plainToday;

        if (isFriday) row.classList.add('friday');
        if (isWeekend) row.classList.add('weekend');
        if (!isToday) {
            if (isPast) row.classList.add('past');
            if (isFuture) {
                row.classList.add('future');
                if (!nextMarked) { row.classList.add('next'); nextMarked = true; }
            }
        }

        row.innerHTML = `
            <td>${prayer.date.readable}</td>
            <td>${prayer.timings.Fajr.trim().split(/\s+/)[0]}</td>
            <td>${prayer.timings.Sunrise.trim().split(/\s+/)[0]}</td>
            <td>${prayer.timings.Dhuhr.trim().split(/\s+/)[0]}</td>
            <td>${prayer.timings.Asr.trim().split(/\s+/)[0]}</td>
            <td>${prayer.timings.Maghrib.trim().split(/\s+/)[0]}</td>
            <td>${prayer.timings.Isha.trim().split(/\s+/)[0]}</td>
        `;
        tableBody.appendChild(row);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('fetch-prayer-times');
    if (!btn) {
        console.warn('Button with id "fetch-prayer-times" not found.');
        return;
    }

    btn.addEventListener('click', () => {
        const city = document.getElementById('city-input')?.value || '';
        const month = document.getElementById('month-input')?.value || '';

        const cityOutput = document.getElementById('city-output');
        cityOutput.innerText = city;

        getPrayerTimesByCity(city, month)
            .then(prayerTimes => {
                showPrayerTimes(prayerTimes);
            })
            .catch(error => {
                console.error("Error:", error);
            });
    });
});

