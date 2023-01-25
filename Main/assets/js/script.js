const cityInput = document.getElementById("city-input");
const genreSelect = document.getElementById("genre-select");
const submitBtn = document.getElementById("submit-btn");
const eventContainer = document.getElementById("event-container")
const eventAddressesArray = [];
let eventCordinatesArray = [];
const city = "Austin"
const genre = ""
const apiKey = "wy3QS9URmfZvHQ2lCwVKwAL3t4c4AkDc";
const today = new Date();
const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
const startDate = today.toISOString().slice(0, 10);
const endDate = sevenDaysFromNow.toISOString().slice(0, 10);
const queryUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${city}&startDateTime=${startDate}T00:00:00Z&endDateTime=${endDate}T00:00:00Z&classificationName=${genre}&attributes=images`;

function getEvents() {
    //event.preventDefault();
    //const city = cityInput.value;
    //const genre = genreSelect.value;

    fetch(queryUrl)
        .then(response => response.json())
        .then(data => {
            let events = data._embedded.events;
            events = events.filter(event => {
                const eventDate = new Date(event.dates.start.localDate);
                return eventDate >= today;
            });
            events = sortEventsByDateAscending(events);
            for (let i = 0; i < events.length; i++) {
                const event = events[i];
                if (!event.info) {
                    continue;
                }
                addEventAddresses(event);
                console.log(eventAddressesArray);
                getEventCoordinates(eventAddressesArray, city);
                console.log(eventCordinatesArray);
                displayEvent(event);
            }
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
function displayEvent(event) {
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
    eventBox.classList.add("event-box");
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
    if(event._embedded && event._embedded.venues && event._embedded.venues[0].name){
        eventAddressesArray.push(event._embedded.venues[0].name);
    }
}

//Get longitude and latitude based on venue name and default to city if venue is not recognized
function getEventCoordinates(eventAddressesArray, city) {
    for (let i = 0; i < eventAddressesArray.length; i++) {
        const eventAddress = eventAddressesArray[i];
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${eventAddress}&key=${GOOGLE_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (data.results[0]) {
                    const lat = data.results[0].geometry.location.lat;
                    const lng = data.results[0].geometry.location.lng;
                    eventCordinatesArray.push({ lat, lng });
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

getEvents();

//submitBtn.addEventListener('click', getEvents);
