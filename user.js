const searchInput = document.getElementById('userSearch');
const userItems = document.querySelectorAll('.table-content');

searchInput.addEventListener('input', ()=>{
    const query = searchInput.value.toLowerCase();
    userItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none'; 
    });
});





 

