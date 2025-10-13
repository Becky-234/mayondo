console.log('addUser.js loaded successfully');

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded');

    // SIDEBAR
    const sidebar = document.querySelector('.side-menu-container');
    const toggleBtn = document.querySelector('.fa-bars');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            console.log("Sidebar toggled");
        });
    }

});