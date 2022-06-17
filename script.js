let WEATHER_CODES = {
  0: "Clear Sky",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime Depositing Fog",
  51: "Light Drizzle",
  53: "Moderate Drizzle",
  55: "Dense Drizzle",
  56: "Light Freezing Drizzle",
  57: "dense Freezing Drizzle",
  61: "Slight Rain",
  63: "Moderate Rain",
  65: "Heavy Rain ",
  66: "Light Freezing Rain",
  67: "Heavy Freezing Rain",
  71: "Slight Snow Fall",
  73: "Moderate Snow Fall",
  75: "Heavy Snow Fall",
  77: "Snow grains",
  80: "Slight Rain Showers",
  81: "Moderate Rain Showers",
  82: "Violent Rain Showers",
  85: "Slight Snow Showers",
  86: "Snow Showers heavy",
  95: "Thunderstorm",
  96: "Thunderstorm With Slight Hail",
  99: "Thunderstorm With Heavy Hail",
};

function createUrl(lat, lon) {
  // Defaults at Rome
  let url = "https://api.open-meteo.com/v1/forecast?";
  url += "latitude=" + lat + "&longitude=" + lon + "&current_weather=True";
  return url;
}

async function getData(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

function setValue(id, value) {
  let element = document.getElementById(id);
  element.innerHTML = value;
}

async function getCoords(string) {
  let url = "https://geocode.xyz/?locate=" + string + "&json=1";
  let response = await fetch(url);
  let data = await response.json();
  return [round(data.latt), round(data.longt)];
}

function main(n = 0) {
  city = document.getElementById("city").value;

  if (city == 0 || city.length < 3) {
    return;
  }

  getCoords(city)
    .then((coords) => {
      let lat = coords[0];
      let lon = coords[1];

      // console.log(coords, lat, lon);

      if (isNaN(lat) && isNaN(lon)) {
        if (n < 10) {
          console.log("Attempt n " + n);
          main(n + 1);
        } else {
          console.log("Errore");
        }
        return;
      }
      setValue("latitude", lat);
      setValue("longitude", lon);
      setValue("city_text", capitalizeFirstLetter(city));
      let url = createUrl(lat, lon);

      getData(url)
        .then((data) => {
          // console.log(data);
          let temp = data.current_weather.temperature + " °C";
          let wind = data.current_weather.windspeed + " km/s";
          let current_weather = WEATHER_CODES[data.current_weather.weathercode];
          setValue("weathercode", current_weather);
        })
        .catch((error) => {
          console.error(error);
        });
    })
    .catch((error) => {
      console.error(error);
    });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function round(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

setInterval(main, 60000);
