// const sideMenuContainer = document.querySelec(".side-menu-container active");
// const toggleBtn = document.querySelector(".");

// faBars.addEventListener('click', () => {
//     sideMenuContainer.classList.toggle('active')
// })

const ctx1 = document.getElementById('salesChart').getContext('2d');
const salesChart = new Chart(ctx1, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Sales (Shs)',
            data: [500000, 400000, 600000, 300000, 700000, 450000],
            borderColor: '#4e73df',
            backgroundColor: 'rgba(78, 115, 223, 0.2)',
            fill: true,
            tension: 0.4, // smooth curve
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: false // hide legend for cleaner look
            },
            title: {
                display: false
            }
        },
        scales: {
            x: {
                grid: { display: false }, // cleaner x-axis
                ticks: { color: "#666" }
            },
            y: {
                beginAtZero: true,
                ticks: { color: "#666" }
            }
        }
    }
});

const ctx2 = document.getElementById('productsChart').getContext('2d');
const productsChart = new Chart(ctx2, {
    type: 'doughnut',
    data: {
        labels: ['Chairs', 'Tables', 'Sofas', 'Beds', 'Office furniture'],
        datasets: [{
            data: [12, 19, 7, 10, 5, 7],
            backgroundColor: [
                '#f6c23e',
                '#1cc88a',
                '#36b9cc',
                '#4e73df',
                '#e74a3b'
            ],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom'
            }
        },
        cutout: '70%' // makes it a ring like in your screenshot
    }
});
