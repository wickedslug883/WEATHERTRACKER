
let searchHis = []
let lastCitySearched = ""

let grabCityData = function(city) {
    let apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=ce39e7239416ad754359ca762d28521a&units=imperial";

    fetch(apiUrl)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    postWeather(data);
                });
            } else {
                alert("Error: " + response.statusText);
            }
        })  

        .catch(function(error) {
            alert("No connection to OpenWeather API");
        })
};

let searchSubmitHandler = function(event) {

    event.preventDefault();
    let cityName = $("#cityName").val().trim();

    if(cityName) {

        grabCityData(cityName);
        $("#cityName").val("");
        
    } else {

        alert("Provide city name!");
    }
};

let postWeather = function(weatherData) {

    $("#headCity").text(weatherData.name + " (" + dayjs(weatherData.dt * 1000).format("MM/DD/YYYY") + ") ").append(`<img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png"></img>`);
    $("#headTemp").text("Temperature: " + weatherData.main.temp.toFixed(1) + "°F");
    $("#headWind").text("Wind Speed: " + weatherData.wind.speed.toFixed(1) + "MPH");
    $("#headHum").text("Humidity: " + weatherData.main.humidity + "%");
    fetch("https://api.openweathermap.org/data/2.5/uvi?lat=" + weatherData.coord.lat + "&lon="+ weatherData.coord.lon + "&appid=ce39e7239416ad754359ca762d28521a")
        .then(function(response) {
            response.json().then(function(data) {

                $("#UVec").text(data.value);

                if(data.value >= 11) {
                    $("#UVec").css("background-color", "#6c49cb")
                } else if (data.value < 11 && data.value >= 8) {
                    $("#UVec").css("background-color", "#d90011")
                } else if (data.value < 8 && data.value >= 6) {
                    $("#UVec").css("background-color", "#f95901")
                } else if (data.value < 6 && data.value >= 3) {
                    $("#UVec").css("background-color", "#f7e401")
                } else {
                    $("#UVec").css("background-color", "#299501")
                }      
            })
        });

    fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + weatherData.name + "&appid=ce39e7239416ad754359ca762d28521a&units=imperial")
        .then(function(response) {
            response.json().then(function(data) {

                $("#fiveDayData").empty();

                for(i = 7; i <= data.list.length; i += 8){
                    let fiveDayCard =`
                    <div id="fiveCard" class="col-md-2 m-2 py-3 card text-white bg-danger">
                        <div class="card-body p-1">
                            <h5 class="card-title">` + dayjs(data.list[i].dt * 1000).format("MM/DD/YYYY") + `</h5>
                            <img src="https://openweathermap.org/img/wn/` + data.list[i].weather[0].icon + `.png" alt="rain">
                            <p class="card-text">Temp: ` + data.list[i].main.temp + ` °F </p>
                            <p class="card-text">Wind: ` + data.list[i].wind.speed + ` MPH </p>
                            <p class="card-text">Humidity: ` + data.list[i].main.humidity + ` %</p>
                        </div>
                    </div>
                    `;
                    $("#fiveDayData").append(fiveDayCard);
               }
            })
        });
    
    lastCitySearched = weatherData.name;
    saveSearchHistory(weatherData.name);
};

let saveSearchHistory = function (city) {
    if(!searchHist.includes(city)){
        searchHist.push(city);
        $("#searchHistory").append("<a href='#' class='list-group-item list-group-item-action text-black' id='" + city + "'>" + city + "</a>")
    } 

    localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHist));
    localStorage.setItem("lastCitySearched", JSON.stringify(lastCitySearched));

    loadSearchHistory();
};

let loadSearchHistory = function() {
    searchHist = JSON.parse(localStorage.getItem("weatherSearchHistory"));
    lastCitySearched = JSON.parse(localStorage.getItem("lastCitySearched"));
    if (!searchHist) {
        searchHist = []
    }
    if (!lastCitySearched) {
        lastCitySearched = ""
    }

    $("#searchHistory").empty();

    for(i = 0 ; i < searchHist.length ;i++) {
        $("#searchHistory").append("<a href='#' class='list-group-item list-group-item-action' id='" + searchHist[i] + "'>" + searchHist[i] + "</a>");
    }
  };

loadSearchHistory();

if (lastCitySearched != ""){

    grabCityData(lastCitySearched);
}

$("#searchMain").submit(searchSubmitHandler);
$("#searchHistory").on("click", function(event){

    let lastCitySearch = $(event.target).closest("a").attr("id");

    grabCityData(lastCitySearch);

});