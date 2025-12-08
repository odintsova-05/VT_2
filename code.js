const priceModifiers = {
    size: { "200": 0, "300": 10, "400": 20 },
    milk: { "whole": 0, "oat": 15, "almond": 20 },
    sugar: { "0": 0, "1": 5, "2": 8 }
};

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let detailQty = 1;

document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item');
    const coffeeCards = document.querySelectorAll('.coffee-card');
    const searchInput = document.getElementById('searchInput');

    coffeeCards.forEach(card => {
        const existing = card.querySelector('.drink-controls');
        if (existing) existing.remove();

        const controls = document.createElement('div');
        controls.className = 'drink-controls';
        controls.innerHTML = `
            <button class="qty-btn dec">−</button>
            <span class="qty-value">1</span>
            <button class="qty-btn inc">+</button>
            <button class="choose-btn">Выбрать</button>
        `;
        card.appendChild(controls);

        let qty = 1;

        card.addEventListener('click', (e) => {
            if (e.target.closest('.drink-controls')) return;
            document.querySelectorAll('.coffee-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });

        controls.querySelector('.dec').addEventListener('click', (e) => {
            e.stopPropagation();
            if (qty > 1) qty--;
            controls.querySelector('.qty-value').textContent = qty;
        });
        controls.querySelector('.inc').addEventListener('click', (e) => {
            e.stopPropagation();
            qty++;
            controls.querySelector('.qty-value').textContent = qty;
        });

    
        controls.querySelector('.choose-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const drink = {
                name: card.querySelector('h2').textContent,
                type: card.dataset.type,
                basePrice: parseInt(card.querySelector('p').textContent.match(/\d+/)[0]),
                img: card.querySelector('img').src
            };
            localStorage.setItem('selectedDrink', JSON.stringify(drink));
            localStorage.setItem('selectedQty', qty); 
            showDetailPage(drink, qty);            
        });
    });

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const type = item.dataset.type;
            coffeeCards.forEach(card => {
                card.style.display = (type === 'all' || card.dataset.type === type) ? 'block' : 'none';
            });
        });
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        coffeeCards.forEach(card => {
            const name = card.querySelector('h2').textContent.toLowerCase();
            const type = card.dataset.type.toLowerCase();
            let matchesType = false;

            if (type === 'latte') matchesType = query.includes('latte') || query.includes('латте') || query.includes('ла');
            else if (type === 'espresso') matchesType = query.includes('espresso') || query.includes('эспрессо') || query.includes('эс');
            else if (type === 'cappuccino') matchesType = query.includes('cappuccino') || query.includes('капучино') || query.includes('cap');
            else if (type === 'raf') matchesType = query.includes('raf') || query.includes('раф');
            else if (type === 'mokkachino') matchesType = query.includes('mokkachino') || query.includes('макк') || query.includes('mokka');

            card.style.display = (name.includes(query) || matchesType || query === '') ? 'block' : 'none';
        });
    });

    document.getElementById('cartBtn').addEventListener('click', () => {
        document.getElementById('cartSidebar').classList.add('open');
        renderCart();
    });

    document.getElementById('closeCart').addEventListener('click', () => {
        document.getElementById('cartSidebar').classList.remove('open');
    });

    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('cartSidebar');
        const btn = document.getElementById('cartBtn');
        if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== btn) {
            sidebar.classList.remove('open');
        }
    });

    document.getElementById('backBtn').addEventListener('click', () => {
        document.getElementById('detailPage').style.display = 'none';
        document.getElementById('listPage').style.display = 'block';
        document.querySelectorAll('.qty-value').forEach(el => el.textContent = '1');
        detailQty = 1;
    });
 
    document.getElementById('incQty').addEventListener('click', () => {
        detailQty++;
        document.getElementById('qtyDisplay').textContent = detailQty;
        const drink = JSON.parse(localStorage.getItem('selectedDrink'));
        updateDetailPrice(drink.basePrice, detailQty);
    });

    document.getElementById('decQty').addEventListener('click', () => {
        if (detailQty > 1) {
            detailQty--;
            document.getElementById('qtyDisplay').textContent = detailQty;
            const drink = JSON.parse(localStorage.getItem('selectedDrink'));
            updateDetailPrice(drink.basePrice, detailQty);
        }
    });

    document.getElementById('addToCartBtn').addEventListener('click', () => {
        const drink = JSON.parse(localStorage.getItem('selectedDrink'));
        const qty = detailQty;
        const size = document.querySelector('#sizeOptions .option-btn.active').dataset.value;
        const milk = document.querySelector('#milkOptions .option-btn.active').dataset.value;
        const sugar = document.querySelector('#sugarOptions .option-btn.active').dataset.value;

        const base = drink.basePrice;
        const extra = priceModifiers.size[size] + priceModifiers.milk[milk] + priceModifiers.sugar[sugar];
        const total = (base + extra) * qty;

        const item = {
            ...drink,
            quantity: qty,
            options: { size, milk, sugar },
            extra,
            total
        };

        const exists = cart.find(i =>
            i.name === item.name &&
            i.options.size === item.options.size &&
            i.options.milk === item.options.milk &&
            i.options.sugar === item.options.sugar
        );

        if (exists) {
            exists.quantity += qty;
            exists.total = (base + extra) * exists.quantity;
        } else {
            cart.push(item);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        document.getElementById('backBtn').click();
    });

    document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (cart.length === 0) return;
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        document.getElementById('cartSidebar').classList.remove('open');
    });

    updateCartBadge();
});


function showDetailPage(drink, qty) {
    document.getElementById('listPage').style.display = 'none';
    document.getElementById('detailPage').style.display = 'block';

    document.getElementById('detailName').textContent = drink.name;
    document.getElementById('basePrice').textContent = drink.basePrice;
    document.getElementById('detailImg').src = drink.img;
    document.getElementById('qtyDisplay').textContent = qty;
    detailQty = qty; 

    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-value="200"]`).classList.add('active');
    document.querySelector(`[data-value="whole"]`).classList.add('active');
    document.querySelector(`[data-value="0"]`).classList.add('active');

    updateDetailPrice(drink.basePrice, qty);
}
function updateDetailPrice(basePrice, qty) {
    const size = document.querySelector('#sizeOptions .option-btn.active').dataset.value;
    const milk = document.querySelector('#milkOptions .option-btn.active').dataset.value;
    const sugar = document.querySelector('#sugarOptions .option-btn.active').dataset.value;

    const extra = priceModifiers.size[size] + priceModifiers.milk[milk] + priceModifiers.sugar[sugar];
    const total = (basePrice + extra) * qty;

    document.getElementById('totalDetailPrice').textContent = total;
}
document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const group = btn.closest('.options');
        group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const drink = JSON.parse(localStorage.getItem('selectedDrink'));
        updateDetailPrice(drink.basePrice, detailQty);
    });
});

function updateCartBadge() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartBadge').textContent = total;
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p>Корзина пуста</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.total;
            const div = document.createElement('div');
            div.className = 'cart-item';
            const milkText = item.options.milk === 'whole' ? 'Обычное' : item.options.milk === 'oat' ? 'Овсяное' : 'Миндальное';
            const sugarText = item.options.sugar === '0' ? 'Без сахара' : `${item.options.sugar} ложка(и)`;
            div.innerHTML = `
                <img src="${item.img}" width="60" height="60" style="border-radius:5px;">
                <div class="cart-item-info">
                    <div><strong>${item.name}</strong></div>
                    <div>Размер: ${item.options.size} мл</div>
                    <div>Молоко: ${milkText}</div>
                    <div>Сахар: ${sugarText}</div>
                    <div>Кол-во: ${item.quantity}</div>
                    <div><strong>${item.total} ₽</strong></div>
                </div>
                <button class="remove-from-cart" data-index="${index}">×</button>
            `;
            container.appendChild(div);

            div.querySelector('.remove-from-cart').addEventListener('click', () => {
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartBadge();
                renderCart();
            });
        });
    }
    totalEl.textContent = total + ' ₽';
}