const cityInput = document.getElementById("city-input");
const genreSelect = document.getElementById("genre-select");
const submitBtn = document.getElementById("submit-btn");



function getEvents() {
    //event.preventDefault();
    //const city = cityInput.value;
    //const genre = genreSelect.value;

    city = "Atlanta"
    genre = "Family"
    const apiKey = "wy3QS9URmfZvHQ2lCwVKwAL3t4c4AkDc";
    const queryUrl = `https://app.ticketmaster.com/discovery/v2/events.json?city=${city}&genre=${genre}&apikey=${apiKey}`;

    fetch(queryUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const events = data._embedded.events;
            for (let i = 0; i < 5; i++) {
                const event = events[i];
                const eventTitle = event.name;
                const eventDescription = event.info;
                const eventDate = event.dates.start.localDate;

                const eventBox = document.createElement("div");
                eventBox.classList.add("event-box");
                eventContainer.appendChild(eventBox);

                const title = document.createElement("h3");
                title.innerHTML = eventTitle;
                eventBox.appendChild(title);

                const description = document.createElement("p");
                description.innerHTML = eventDescription;
                eventBox.appendChild(description);

                const date = document.createElement("p");
                date.innerHTML = eventDate;
                eventBox.appendChild(date);
            }
        })
        .catch(error => console.error(error))

}


getEvents();

//submitBtn.addEventListener('click', getEvents);
