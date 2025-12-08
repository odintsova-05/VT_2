const drinkQuantities = {};

document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item');
    const coffeeCards = document.querySelectorAll('.coffee-card');
    const searchInput = document.getElementById('searchInput');

    let currentType = 'all';
    let searchQuery = '';

    function filterCoffee() {
        coffeeCards.forEach(card => {
            const type = card.dataset.type;
            const name = card.querySelector('h2').textContent.toLowerCase();
            const matchesType = (currentType === 'all' || type === currentType);
            const matchesSearch = name.includes(searchQuery);
            card.style.display = (matchesType && matchesSearch) ? 'block' : 'none';
        });
    }

    function updateQuantityDisplay(card, qty) {
        const qtyEl = card.querySelector('.qty-value');
        if (qtyEl) qtyEl.textContent = qty;
    }

    coffeeCards.forEach((card, index) => {
        const drinkId = `drink_${index}`;
        drinkQuantities[drinkId] = 1;

        const controls = document.createElement('div');
        controls.className = 'drink-controls';
        controls.innerHTML = `
            <button class="qty-btn dec" data-id="${drinkId}">−</button>
            <span class="qty-value">1</span>
            <button class="qty-btn inc" data-id="${drinkId}">+</button>
            <button class="add-btn" data-id="${drinkId}">Добавить</button>
        `;
        card.appendChild(controls);

        card.addEventListener('click', (e) => {
            if (e.target.closest('.drink-controls')) return;
            document.querySelectorAll('.coffee-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });

        controls.querySelector('.dec').addEventListener('click', (e) => {
            e.stopPropagation();
            if (drinkQuantities[drinkId] > 1) {
                drinkQuantities[drinkId]--;
                updateQuantityDisplay(card, drinkQuantities[drinkId]);
            }
        });

        controls.querySelector('.inc').addEventListener('click', (e) => {
            e.stopPropagation();
            drinkQuantities[drinkId]++;
            updateQuantityDisplay(card, drinkQuantities[drinkId]);
        });

        controls.querySelector('.add-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const name = card.querySelector('h2').textContent;
            const qty = drinkQuantities[drinkId];
            console.log(`Добавлено: ${name}, количество: ${qty}`);
        });
    });

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentType = item.dataset.type;
            filterCoffee();
        });
    });

    searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value.trim().toLowerCase();
        filterCoffee();
    });
});
