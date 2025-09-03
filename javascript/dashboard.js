//side menu
const sidebar = document.querySelector('.side-menu-container');
const toggleBtn = document.querySelector('.fa-bars');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    console.log("Sidebar toggled"); // debug check
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

 