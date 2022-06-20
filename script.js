let WEATHER_CODES = {
  0: "sunny",
  1: "cloudy",
  2: "partly-cloudy",
  3: "overcast",
  45: "foggy",
  48: "dense-fog",
  51: "drizzle-rain",
  53: "drizzle-rain",
  55: "drizzle-rain",
  56: "drizzle-rain",
  57: "drizzle-rain",
  61: "light-rain",
  63: "moderate-rain",
  65: "heavy-rain",
  66: "light-rain",
  67: "heavy-rain",
  71: "light-snow",
  73: "moderate-snow",
  75: "heavy-snow",
  77: "snow",
  80: "shower-rain",
  81: "thundershower",
  82: "heavy-rain",
  85: "light-snow",
  86: "heavy-snow",
  95: "heavy-thunderstorm",
  96: "heavy-thunderstorm",
  99: "heavy-thunderstorm",
};
let DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
setInterval(main, 60000);

function start() {
  document.getElementById("city").value = "Roma";
  enterListener();
  main();
  // createGraph();
}

function enterListener() {
  // Make sure this code gets executed after the DOM is loaded.
  document.querySelector("#city").addEventListener("keyup", (event) => {
    if (event.key !== "Enter") return; // Use `.key` instead.
    document.querySelector("#search_button").click(); // Things you want to do.
    event.preventDefault(); // No need to `return false;`.
  });
}

function main() {
  document.getElementById("left_side").classList.add("invisible");
  document.getElementById("right_side").classList.add("invisible");
  document.getElementById("loading_container").classList.remove("invisible");

  city = document.getElementById("city").value;

  if (city == 0 || city.length < 3) {
    console.log("Troppe poche lettere inserite.");
    return;
  }

  getCoords(city)
    .then((coords) => {
      let lat = coords[0];
      let lon = coords[1];
      city = coords[2];

      setValue("latitude", lat);
      setValue("longitude", lon);
      let url = createUrl(lat, lon);

      getData(url)
        .then((data) => {
          let temp = data.current_weather.temperature;
          let wind = data.current_weather.windspeed + " km/s";

          let temperatures = data.daily.temperature_2m_max;
          let current_weather = WEATHER_CODES[data.current_weather.weathercode];
          let current_temp = temperatures[0];
          let tomorrow_weather = WEATHER_CODES[data.daily.weathercode[1]];
          let temp_tomorrow = temperatures[1];
          let ttomorrow_weather = WEATHER_CODES[data.daily.weathercode[2]];
          let temp_ttomorrow = temperatures[2];

          createGraph([current_temp, temp_tomorrow, temp_ttomorrow]);

          console.log(
            temp,
            current_weather,
            temp_tomorrow,
            tomorrow_weather,
            temp_ttomorrow,
            ttomorrow_weather
          );

          //card_img1
          document.getElementById("card_img1").className =
            "qi-" + current_weather;
          setValue("weather_text1", prettify(current_weather));
          setValue("temp_number1", current_temp + " °C");

          //card_img2
          document.getElementById("card_img2").className =
            "qi-" + tomorrow_weather;
          stringa =
            MONTHS[new Date(Date.now() + 86400000).getUTCMonth()] +
            " " +
            new Date(Date.now() + 86400000).getDate();
          setValue("day2", stringa);
          setValue("weather_text2", prettify(tomorrow_weather));
          setValue("temp_number2", temp_tomorrow + " °C");

          //card_img3
          document.getElementById("card_img3").className =
            "qi-" + ttomorrow_weather;
          stringa =
            MONTHS[new Date(Date.now() + 86400000 * 2).getUTCMonth()] +
            " " +
            new Date(Date.now() + 86400000 * 2).getDate();
          setValue("day3", stringa);
          setValue("weather_text3", prettify(ttomorrow_weather));
          setValue("temp_number3", temp_ttomorrow + " °C");

          setValue("weathercode", prettify(current_weather));
          setValue("windspeed", wind);
          setValue("temperature", temp);
          document.getElementById("city").value = city;
          document.getElementById("img").className = "qi-" + current_weather;

          scriviDataOra(new Date());

          // fai diventare visibile
          document
            .getElementById("loading_container")
            .classList.add("invisible");
          document.getElementById("left_side").classList.remove("invisible");
          document.getElementById("right_side").classList.remove("invisible");

          console.log("Operation successfull.");
        })
        .catch((error) => {
          console.log("API_ERROR [open-meteo.com]", error);
        });
    })
    .catch((error) => {
      console.log("API_ERROR [Geocode.xyz]", error);
    });
}

async function getCoords(string) {
  let url = "https://geocode.xyz/?locate=" + string + "&json=1";
  let start_time = performance.now();

  let eol_time;
  do {
    var response = await fetch(url);
    var data = await response.json();

    eol_time = performance.now();
    if (eol_time - start_time > 5000) {
      document.getElementById("loading").innerHTML = "Very long wait";
    }
  } while ("success" in data);
  document.getElementById("loading").innerHTML = "Loading";

  // console.log("Operation took " + (eol_time - start_time) + " ms");
  // console.log(data);

  return [round(data.latt), round(data.longt), data.standard.city];
}

function setValue(id, value) {
  let element = document.getElementById(id);
  element.innerHTML = value;
}

function createUrl(lat, lon) {
  // Defaults at Rome
  let url = "https://api.open-meteo.com/v1/forecast?";
  url +=
    "latitude=" +
    lat +
    "&longitude=" +
    lon +
    "&current_weather=true" +
    "&past_days=0" +
    "&hourly=temperature_2m" +
    "&daily=temperature_2m_max" +
    "&daily=weathercode" +
    "&timezone=CET";
  return url;
}

async function getData(url) {
  let response = await fetch(url);
  let data = await response.json();
  console.log(url, data);
  return data;
}

function scriviDataOra(data) {
  let res = "";

  let hours = data.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  let minutes = data.getMinutes();
  minutes = minutes < 10 ? "0" + minutes : minutes;

  const day = ((n) => DAYS[n])(data.getDay());

  const month = ((n) => MONTHS[n])(data.getMonth());

  const dayN = data.getDate();
  const year = data.getFullYear();

  res =
    hours +
    ":" +
    minutes +
    " " +
    ampm +
    ", " +
    day +
    ", " +
    month +
    " " +
    dayN +
    "," +
    year;

  document.getElementById("data").innerHTML = res;
}

function prettify(string) {
  string = string.split("-");
  string = string.map(capitalizeFirstLetter);
  string = string.join(" ");
  return string;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function round(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

function avg(array) {
  return array.reduce((a, b) => a + b) / array.length;
}

function createGraph(temperatures = [30, 26, 29.5]) {
  var highlight_clr_dark = "#5596f6";
  var highlight_clr_light = "#eef4fe";

  var minValue = Math.min.apply(null, temperatures) - 0.01;
  var maxValue = Math.max.apply(null, temperatures) + 0.01;
  var ctx = document.getElementById("graph").getContext("2d");
  var xValues = [0, 10, 50, 80, 100];
  var yValues = [minValue].concat(temperatures).concat([maxValue]);
  new Chart(ctx, {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          borderColor: highlight_clr_dark,
          backgroundColor: highlight_clr_light,
          borderJoinStyle: "miter",
          data: yValues,
          // tension: 0.4,
        },
      ],
    },
    options: {
      legend: { display: false },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false,
            },
            ticks: {
              display: false,
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              display: false,
            },
            ticks: {
              display: false,
            },
          },
        ],
      },
    },
  });
}
