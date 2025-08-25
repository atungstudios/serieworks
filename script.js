let apps = [];

const grid = document.getElementById('projectsGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

function renderApps(list) {
    grid.innerHTML = '';
    if (list.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#888;">No apps found.</p>';
        return;
    }
    list.forEach(app => {
        const card = document.createElement('div');
        card.className = 'card';
        // Use app.image if present, otherwise fallback to placeholder
        const imageSrc = app.image && app.image.trim() !== '' ? app.image : 'https://placehold.co/300x180?text=App+Image';
        // Add category as a class for color styling
        const categoryClass = `card-category ${app.category}`;
        card.innerHTML = `
            <div class="card-image">
                <img src="${imageSrc}" alt="${app.title} image" onerror="this.onerror=null;this.src='https://placehold.co/300x180?text=App+Image';" />
            </div>
            <div class="card-content">
                <div class="card-title-category-row">
                    <div class="card-title">${app.title}</div>
                    <div class="${categoryClass}">${app.category.charAt(0).toUpperCase() + app.category.slice(1)}</div>
                </div>
                <div class="card-desc">${app.description}</div>
                <div class="card-links">
                    <a href="${app.appStore}" target="_blank" rel="noopener" class="store-link">
                        <img src="assets/app-store-badge.svg" alt="Download on the App Store" />
                    </a>
                    <a href="${app.playStore}" target="_blank" rel="noopener" class="store-link">
                        <img src="assets/google-play-badge.svg" alt="Get it on Google Play" />
                    </a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterAndSearch() {
    const search = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const filtered = apps.filter(a => {
        const matchesCategory = category === 'all' || a.category === category;
        const matchesSearch = a.title.toLowerCase().includes(search);
        return matchesCategory && matchesSearch;
    });
    renderApps(filtered);
}

searchInput.addEventListener('input', filterAndSearch);
categoryFilter.addEventListener('change', filterAndSearch);

// Fetch apps from JSON and render
fetch('apps.json')
    .then(res => res.json())
    .then(data => {
        apps = data;
        renderApps(apps);
    });
