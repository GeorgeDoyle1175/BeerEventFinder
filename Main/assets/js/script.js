const cityInput = document.getElementById("city-input");
const genreSelect = document.getElementById("genre-select");
const submitBtn = document.getElementById("submit-btn");

function getEvents() {
    //event.preventDefault();
    //const city = cityInput.value;
    //const genre = genreSelect.value;

    city = "Los Angeles"
    genre = ""
    const apiKey = "wy3QS9URmfZvHQ2lCwVKwAL3t4c4AkDc";
    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
    const startDate = today.toISOString().slice(0, 10);
    const endDate = sevenDaysFromNow.toISOString().slice(0, 10);
    const queryUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${city}&startDateTime=${startDate}T00:00:00Z&endDateTime=${endDate}T00:00:00Z&classificationName=${genre}&attributes=images`;

    fetch(queryUrl)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const events = data._embedded.events;
        events = sortEventsByDateAscending(events);
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            if (!event.info) {
                continue;
            }
            //Checks to make sure event is occuring today or after
            const eventDate = new Date(event.dates.start.localDate);
            if (eventDate >= today) {
              appendEvent(event);
            }
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
    events.sort(function(a, b) {
        const dateA = new Date(a.dates.start.localDate);
        const dateB = new Date(b.dates.start.localDate);
        return dateA - dateB;
    });
    return events;
}

//Appends Date, Event Title, Description and Image to page
function displayEvent(event) {
    const eventTitle = event.name;
    const eventDescription = event.info;
    const eventDate = new Date(event.dates.start.localDate);
    const eventDateFormatted = formatDate(eventDate);
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
    eventDateElement.innerHTML = eventDateFormatted;
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
}


getEvents();

//submitBtn.addEventListener('click', getEvents);
