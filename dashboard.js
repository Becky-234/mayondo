// const sideMenuContainer = document.querySelec(".side-menu-container active");
// const toggleBtn = document.querySelector(".");

// faBars.addEventListener('click', () => {
//     sideMenuContainer.classList.toggle('active')
// })


 const ctx = document.getElementById('pieChart').getContext('2d');
   const data = {
    labels: ['Raw Materials', 'Finished Products'],
    datasets: [{
      label: 'Sales in a Month',
      data: [450, 250],
      backgroundColor: ['blue', 'yellow',],
      hoverOffset:4
    }]
   };
   const config = {
    type: 'pie',
    data: data,
   }