function createUrl(lat = 42, lon = 13) {
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

function main() {
  let url = createUrl();
  let text = document.getElementById("weathercode");
  getData(url).then((data) => {
    console.log(url);
    console.log(data);
    // console.log(data.current_weather.weathercode);
    text.innerHTML = data.current_weather.weathercode;
    console.log(text)
  });
}
