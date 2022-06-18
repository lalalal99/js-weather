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

setInterval(main, 60000);

function start() {
  enterListener();
  // main();
  createGraph();
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
  // document.getElementById("informations").classList.add("invisible");
  // document.getElementById("right_side").classList.add("invisible");
  // document.getElementById("loading").classList.remove("invisible");

  city = document.getElementById("city").value;
  if (city == 0 || city.length < 3) {
    return;
  }

  getCoords(city)
    .then((coords) => {
      if (coords[0] == "API_ERROR") {
        // main();
        return;
      }
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
          let current_weather = WEATHER_CODES[data.current_weather.weathercode];

          setValue("weathercode", prettify(current_weather));
          setValue("windspeed", wind);
          setValue("temperature", temp);
          document.getElementById("city").value = city;
          document.getElementById("img").className = "qi-" + current_weather;

          scriviDataOra(new Date());

          // fai diventare visibile
          document.getElementById("loading").classList.add("invisible");
          document.getElementById("informations").classList.remove("invisible");
          document.getElementById("right_side").classList.remove("invisible");
          console.log("Finito.");
        })
        .catch((error) => {
          console.error(error);
        });
    })
    .catch((error) => {
      console.error(error);
    });
}

async function getCoords(string, n = 0) {
  let url = "https://geocode.xyz/?locate=" + string + "&json=1";
  let response = await fetch(url);
  let data = await response.json();

  if ("success" in data) {
    // console.log("Attempt n " + (n + 1));
    await getCoords(string, n + 1);
    return ["API_ERROR"];
  }

  if (isNaN(data.latt) && isNaN(data.longt) && n < 20) {
    // console.log("Attempt n " + (n + 1));
    await getCoords(string, n + 1);
  }

  // console.log("Done in " + (n + 1) + " attempts. ", data);
  return [round(data.latt), round(data.longt), data.standard.city];
}

function setValue(id, value) {
  let element = document.getElementById(id);
  element.innerHTML = value;
}

function createUrl(lat, lon) {
  // Defaults at Rome
  let url = "https://api.open-meteo.com/v1/forecast?";
  url += "latitude=" + lat + "&longitude=" + lon + "&current_weather=True";
  return url;
}

async function getData(url) {
  let response = await fetch(url);
  let data = await response.json();
  // console.log(data);
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

  const day = ((n) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][n])(
    data.getDay()
  );

  const month = ((n) =>
    [
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
    ][n])(data.getMonth());

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

function createGraph() {
  var highlight_clr_dark = "#5596f6";
  var highlight_clr_light = "#eef4fe";
  var ctx = document.getElementById("graph").getContext("2d");
  var xValues = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
  var yValues = [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15];
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
              display: false, //this will remove only the label
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              display: false,
            },
            ticks: {
              display: false, //this will remove only the label
            },
          },
        ],
      },
    },
  });
}
