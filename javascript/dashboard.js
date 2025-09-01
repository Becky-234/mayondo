//side menu
const menuToggle = document.getElementById('menu-toggle');
const sideMenu = document.querySelector('.side-menu-container');

menuToggle.addEventListener('click', () => {
    sideMenu.classList.toggle('active');
});


//Search
const searchInput = document.getElementById('dashSearch');
const dashboardItems = document.querySelectorAll('.dash-card');

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    dashboardItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
    });
});

//Calendar
document.addEventListener('DOMContentLoaded', function () {
    const monthYear = document.getElementById('month-year');
    const daysContainer = document.getElementById('days');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');

    // Modal elements
    const modal = document.getElementById('eventModal');
    const closeBtn = document.querySelector('.close');
    const selectedDateEl = document.getElementById('selected-date');
    const eventInput = document.getElementById('event-input');
    const saveEventBtn = document.getElementById('save-event');
    const eventList = document.getElementById('event-list');

    const months = [
        'January', 'February', 'March',
        'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
    ];

    let currentDate = new Date();
    let today = new Date();
    let events = {}; // Store events as { "YYYY-MM-DD": ["Event1", "Event2"] }

    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();

        monthYear.textContent = `${months[month]} ${year}`;
        daysContainer.innerHTML = '';

        // Empty slots before the 1st day
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('empty');
            daysContainer.appendChild(emptyDiv);
        }

        // Current month's days
        for (let i = 1; i <= lastDay; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = i;

            const thisDate = new Date(year, month, i);
            const dateKey = thisDate.toISOString().split('T')[0]; // YYYY-MM-DD

            if (thisDate < today.setHours(0, 0, 0, 0)) {
                dayDiv.classList.add('past');
            } else if (
                i === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
            ) {
                dayDiv.classList.add('today');
            }

            // If this day has events → mark with dot
            if (events[dateKey] && events[dateKey].length > 0) {
                dayDiv.classList.add('has-event');
            }

            // Make future days clickable
            if (thisDate >= today.setHours(0, 0, 0, 0)) {
                dayDiv.classList.add('clickable');
                dayDiv.addEventListener('click', () => openModal(thisDate));
            }

            daysContainer.appendChild(dayDiv);
        }
    }

    // Open modal for selected date
    function openModal(date) {
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        selectedDateEl.textContent = dateKey;
        eventInput.value = '';
        eventList.innerHTML = '';

        if (events[dateKey]) {
            events[dateKey].forEach(ev => {
                const p = document.createElement('p');
                p.textContent = "• " + ev;
                eventList.appendChild(p);
            });
        }

        modal.style.display = 'flex';
        saveEventBtn.onclick = () => saveEvent(dateKey);
    }

    // Save event
    function saveEvent(dateKey) {
        const eventText = eventInput.value.trim();
        if (!eventText) return;

        if (!events[dateKey]) {
            events[dateKey] = [];
        }
        events[dateKey].push(eventText);

        eventInput.value = '';
        renderCalendar(currentDate); // refresh calendar to show dot
        openModal(new Date(dateKey)); // refresh modal list
    }

    // Close modal
    closeBtn.onclick = () => (modal.style.display = 'none');
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };

    // Navigation
    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    renderCalendar(currentDate);
});
