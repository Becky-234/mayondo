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



 