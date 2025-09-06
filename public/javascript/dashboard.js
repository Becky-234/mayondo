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


// Sales Chart (bar)
const ctx1 = document.getElementById('salesChart').getContext('2d');
const salesChart = new Chart(ctx1, {
    type: 'bar',
    data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Sales (Shs)',
            data: [500000, 400000, 600000, 300000, 700000, 200000, 450000],
            borderColor: '#caba9c',
            backgroundColor: '#4c6444',
            fill: true,
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            // title: {display: true, text: 'Weekly Sales Overview' }
        },
        scales: {
            y: { beginAtZero: true }
        }
    }
});

// Products Chart (Pie)
const ctx2 = document.getElementById('productsChart').getContext('2d');
const productsChart = new Chart(ctx2, {
    type: 'pie',
    data: {
        labels: ['Chairs', 'Tables', 'Sofas', 'Beds', 'Cabinets'],
        datasets: [{
            label: 'Product Share',
            data: [12, 19, 7, 10, 5], // sample data
            backgroundColor: [
                '#534332',
                '#394032',
                '#454F2D',
                '#9F7E4A',
                '#caba9c'
            ],
            borderColor: [
                '#fff',
                '#fff',
                '#fff',
                '#fff',
                '#fff'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'right' },
            // title: {display: true, text: 'Product Category Distribution' }
        }
    }
});

//Finished vs Raw Products (Doughnut)
const ctx3 = document.getElementById('stockChart').getContext('2d');
const stockChart = new Chart(ctx3, {
    type: 'doughnut',
    data: {
        labels: ['Finished', 'Raw'],
        datasets: [{
            label: 'Stock Distribution',
            data: [65, 35], // values
            backgroundColor: [
                '#4c6444',   // Finished Products
                '#caba9c'    // Raw Products
            ],
            borderColor: [
                '#fff',
                '#fff'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'right' },
            // title: {display: true, text: 'Finished vs Raw Products' }
        }
    }
});


