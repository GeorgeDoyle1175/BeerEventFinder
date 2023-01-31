const cityInput = document.getElementById("city-input");
const genreSelect = document.getElementById("genre-select");
const submitBtn = document.getElementById("submit-btn");
const eventContainer = document.getElementById("event-container")
const eventAddressesArray = [];
let eventCordinatesArray = [];
let cityButtonContainer = document.getElementById("city-button-container");
let cityButtons = [];
let breweryData = [];

function getEvents() {
    event.preventDefault();
    const city = cityInput.value;
    //city = formatString(city);
    //const genre = genreSelect.value;
    createCityButton(city);
    const genre = ""
    const apiKey = "wy3QS9URmfZvHQ2lCwVKwAL3t4c4AkDc";
    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
    const startDate = today.toISOString().slice(0, 10);
    const endDate = sevenDaysFromNow.toISOString().slice(0, 10);

    while (eventContainer.hasChildNodes()) {
        eventContainer.removeChild(eventContainer.firstChild);
    }

    const queryUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${city}&startDateTime=${startDate}T00:00:00Z&endDateTime=${endDate}T00:00:00Z&classificationName=${genre}&attributes=images`;

    fetch(queryUrl)
        .then(response => response.json())
        .then(data => {
            let events = data._embedded.events;
            events = events.filter(event => {
                const eventDate = new Date(event.dates.start.localDate);
                return eventDate >= today;
            });
            events = sortEventsByDateAscending(events);
            const eventContainer = document.querySelector('.events-container');
            for (let i = 0; i < events.length; i++) {
                const event = events[i];
                if (!event.info) {
                    continue;
                }
                displayEvent(event, i);
                addEventAddresses(event);
                getEventCoordinates(eventAddressesArray, city);
                console.log(eventAddressesArray);
                breweryData = [];

            }

            //appendBrewery(breweryData);

        })
        .catch(error => console.error(error))

}

// Formats date example Monday January 15, 2023
function formatDate(date) {
    const day = date.toLocaleString('en-us', { weekday: 'long' });
    const month = date.toLocaleString('en-us', { month: 'long' });
    const dateNum = date.getDate();
    const year = date.getFullYear();
    return `${day} ${month} ${dateNum}, ${year}`;
}

// Sorts Events by Ascending Date
function sortEventsByDateAscending(events) {
    events.sort(function (a, b) {
        const dateA = new Date(a.dates.start.localDate);
        const dateB = new Date(b.dates.start.localDate);
        return dateA - dateB;
    });
    return events;
}

//Appends Date, Time of Event, Event Title, Description, Image and link to tickets to page
function displayEvent(event, i) {
    const eventTitle = event.name;
    const eventDescription = event.info;
    const eventDate = new Date(event.dates.start.localDate);
    const eventDateFormatted = formatDate(eventDate);
    const eventTicketLink = event.url;
    let eventImage;
    // check if event has images
    if (event.images) {
        eventImage = event.images[0].url;
    }
    else {
        eventImage = "";
    }


    const eventBox = document.createElement("div");
    eventBox.classList.add("event-box"); // add a unique class name
    eventContainer.appendChild(eventBox);

    const eventDateElement = document.createElement("p");
    eventDateElement.innerHTML = `${eventDateFormatted}`;
    eventBox.appendChild(eventDateElement);

    const title = document.createElement("h3");
    title.innerHTML = eventTitle;
    eventBox.appendChild(title);

    const description = document.createElement("p");
    description.innerHTML = eventDescription;
    eventBox.appendChild(description);

    const eventImg = document.createElement("img");
    eventImg.src = eventImage;
    eventBox.appendChild(eventImg);

    const ticketLink = document.createElement("a");
    ticketLink.href = eventTicketLink;
    ticketLink.innerHTML = "Get Tickets";
    eventBox.appendChild(ticketLink);
}
//Add Event Addresses to empty array
function addEventAddresses(event) {
    if (event._embedded && event._embedded.venues && event._embedded.venues[0].name) {
        eventAddressesArray.push(event._embedded.venues[0].name);
    }
}

const GOOGLE_API_KEY = 'AIzaSyDiLlSmuGbSjo_oel7A1au_rubVEv450rg';

function getEventCoordinates(eventAddressesArray, city) {
    for (let i = 0; i < eventAddressesArray.length; i++) {
        const eventAddress = eventAddressesArray[i];
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${eventAddress}&key=${GOOGLE_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (data.results[0]) {
                    const lat = data.results[0].geometry.location.lat;
                    const lng = data.results[0].geometry.location.lng;
                    fetchBrew(lat, lng, breweryData, city);
                    console.log(breweryData);
                    //displayBreweryData(breweryData);
                    eventCordinatesArray.push({lat,lng });

                }
            })
            .catch(error => {
                try {
                    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${GOOGLE_API_KEY}`)
                        .then(response => response.json())
                        .then(cityData => {
                            if (cityData.results[0]) {
                                const lat = cityData.results[0].geometry.location.lat;
                                const lng = cityData.results[0].geometry.location.lng;
                                fetchBrew(lat, lng, breweryData, city)
                                eventCordinatesArray.push({ lat, lng });
                            }
                        })
                        .catch(error => {
                            console.error(error)
                        });
                } catch (error) {
                    console.error(error)
                }
            });
    }
}


function createCityButton(city) {
    // Check if a button with the same class already exists
    var cityClass = "." + city.toLowerCase();
    var existingButton = document.querySelector(cityClass);
    if (existingButton) {
      return;
    }

    var button = document.createElement("button");
    city = formatString(city);
    button.innerHTML = city;
    button.setAttribute("class", "modern-btn " + cityClass.substring(1));

    // Add the city to the array
    var cities = localStorage.getItem("cities");
    if (!cities) {
      cities = [];
    } else {
      cities = JSON.parse(cities);
    }

    if (cities.indexOf(city) === -1) {
      if (cities.length === 5) {
        cities.shift();
      }
      cities.push(city);
      localStorage.setItem("cities", JSON.stringify(cities));
    }

    // Create a container for the button
    var container = document.createElement("div");
    container.appendChild(button);

    // Append the container to the body
    var searchResultsContainer = document.getElementById("search-results-container");
    searchResultsContainer.appendChild(container);
  }

//createCityButton(city);

function checkCityArrayLength(arr) {
    if (arr.length > 5) {
        arr.splice(5, arr.length - 5);
    }
    return arr;
}

function fetchBrew(lat, lng, breweryData, city) {
    const url =  "https://api.openbrewerydb.org/breweries?by_dist="+lat+","+lng+"&per_page=1";
    fetch(url, {
        cache: 'no-cache'
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            const brewery = {
                phone: data[0].phone,
                name: data[0].name,
                street: data[0].street,
                website: data[0].website_url
            };

            breweryData.push(brewery);
            appendBrewery(breweryData, city);

        })
        .catch(function (error) {
            console.log(error);
        });
}

function appendBrewery(breweryData, city) {
    let breweryList = document.getElementById("brewery-container");
    let brewery = breweryData[0];
    let breweryExists = false;
    let breweryElements = breweryList.getElementsByTagName("li");

    for (let i = 0; i < breweryElements.length; i++) {
        let breweryElement = breweryElements[i];
        if (breweryElement.innerHTML.includes(brewery.name)) {
            breweryExists = true;
            break;
        }
        breweryList.removeChild(breweryElement);
    }

    if (!breweryExists) {
        let breweryElement = document.createElement("li");
        brewery.name = brewery.name || "";
        brewery.street = brewery.street || "";
        brewery.phone = brewery.phone || "";
        brewery.website = brewery.website || "";
        breweryElement.innerHTML = `<strong>${brewery.name}</strong> - ${brewery.street} - ${brewery.phone} - <a href="${brewery.website}" target="_blank">${brewery.website}</a>`;
        breweryList.appendChild(breweryElement);
    }
}


var formatString = function(str) {
    var result = [];
    var words = str.split(" ");

    for (var i = 0; i < words.length; i++) {
      var word = words[i].split("");

      word[0] = word[0].toUpperCase();

      result.push(word.join(""));
    }
    return result.join(" ");
  };

  function recreateCityButtons() {
    var cities = localStorage.getItem("cities");
    if (!cities) {
      return;
    }
    cities = JSON.parse(cities);

    var searchResultsContainer = document.getElementById("search-results-container");
    searchResultsContainer.innerHTML = "";

    for (var i = 0; i < cities.length; i++) {
      var city = cities[i];
      var button = document.createElement("button");
      button.innerHTML = city;
      button.setAttribute("class", "modern-btn " + city.toLowerCase());

      // Add event listener to run getEvents on click
      button.addEventListener("click", function() {
        getEvents();
      });

      var container = document.createElement("div");
      container.appendChild(button);

      searchResultsContainer.appendChild(container);
    }
  }

recreateCityButtons();


submitBtn.addEventListener('click', getEvents);
