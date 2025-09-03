//side menu
const sidebar = document.querySelector('.side-menu-container');
const toggleBtn = document.querySelector('.fa-bars');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    console.log("Sidebar toggled"); // debug check
});
