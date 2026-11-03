
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("calendarForm");
    const list = document.getElementById("calendarList");

    let events = JSON.parse(localStorage.getItem("schoolCalendarEvents")) || [];
    let editingIndex = -1;

    function saveEvents() {
        localStorage.setItem("schoolCalendarEvents", JSON.stringify(events));
        displayEvents();
    }

    function displayEvents() {
        list.innerHTML = "";

        if (events.length === 0) {
            list.textContent = "No events added yet.";
            return;
        }

        events.sort((a, b) => a.date.localeCompare(b.date));

        events.forEach((event) => {
            const index = events.indexOf(event);
            const card = document.createElement("div");
            card.className = "admin-card";

            const name = document.createElement("h3");
            name.textContent = event.name;

            const date = document.createElement("p");
            date.textContent = "Date: " + event.date;

            const type = document.createElement("p");
            type.textContent = "Type: " + event.type;

            const description = document.createElement("p");
            description.textContent = "Details: " + event.description;

            const editButton = document.createElement("button");
            editButton.textContent = "Edit Event";
            editButton.type = "button";

            editButton.addEventListener("click", function () {
                document.getElementById("eventName").value = event.name;
                document.getElementById("eventDate").value = event.date;
                document.getElementById("eventType").value = event.type;
                document.getElementById("eventDescription").value = event.description;

                editingIndex = index;
                form.querySelector('button[type="submit"]').textContent = "Update Event";
                form.scrollIntoView({ behavior: "smooth" });
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete Event";
            deleteButton.type = "button";

            deleteButton.addEventListener("click", function () {
                if (confirm("Are you sure you want to delete this event?")) {
                    events.splice(index, 1);
                    editingIndex = -1;
                    form.reset();
                    form.querySelector('button[type="submit"]').textContent = "Add Event";
                    saveEvents();
                }
            });

            card.append(name, date, type, description, editButton, deleteButton);
            list.appendChild(card);
        });
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const newEvent = {
            name: document.getElementById("eventName").value.trim(),
            date: document.getElementById("eventDate").value,
            type: document.getElementById("eventType").value,
            description: document.getElementById("eventDescription").value.trim()
        };

        if (!newEvent.name || !newEvent.date || !newEvent.type) {
            alert("Please fill all required fields.");
            return;
        }

        if (editingIndex >= 0) {
            events[editingIndex] = newEvent;
            editingIndex = -1;
            alert("Event updated successfully!");
        } else {
            events.push(newEvent);
            alert("Event added successfully!");
        }

        form.reset();
        form.querySelector('button[type="submit"]').textContent = "Add Event";
        saveEvents();
    });

    displayEvents();
});
