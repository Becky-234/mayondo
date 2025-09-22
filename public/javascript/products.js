// Sidebar toggle (safe)
const sidebar = document.querySelector('.side-menu-container');
const toggleBtn = document.querySelector('.fa-bars');

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        sidebar?.classList.toggle('collapsed'); // Toggle 'collapsed' class
        console.log('Sidebar toggled');
    });
} else {
    console.log('Toggle button (.fa-bars) not found');
}


//Search
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("searchProduct");
    const mainSections = document.querySelectorAll(".pdt-section");
    const subSections = document.querySelectorAll(".subcategory-section");

    input.addEventListener("input", () => {
        const query = input.value.toLowerCase().trim();

        mainSections.forEach(mainSec => {
            // check if main category matches or if any of its subcategories match query
            const mainName = mainSec.dataset.name.toLowerCase();

            // Check subcategories inside this main section for match
            const matchingSubsections = [...mainSec.querySelectorAll(".subcategory-section")].some(subSec => {
                return subSec.dataset.name.toLowerCase().includes(query);
            });

            // Show main section if name matches or any subcategory matches
            if (!query || mainName.includes(query) || matchingSubsections) {
                mainSec.style.display = "";
            } else {
                mainSec.style.display = "none";
            }
        });

        // Also filter subcategories independently
        subSections.forEach(subSec => {
            const subName = subSec.dataset.name.toLowerCase();
            if (!query || subName.includes(query)) {
                subSec.style.display = "";
            } else {
                subSec.style.display = "none";
            }
        });
    });
});
