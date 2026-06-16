function openCart() {
    document.getElementById('cartSidebar')
        .classList.remove('right-[-400px]');

    document.getElementById('cartSidebar')
        .classList.add('right-0');

    document.getElementById('cartOverlay')
        .classList.remove('hidden');

    loadCart();
}

function closeCart() {
    document.getElementById('cartSidebar')
        .classList.remove('right-0');

    document.getElementById('cartSidebar')
        .classList.add('right-[-400px]');

    document.getElementById('cartOverlay')
        .classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('cartOverlay');

    if (overlay) {
        overlay.addEventListener('click', closeCart);
    }
});

async function loadCart() {
    const res = await fetch('/cart/sidebar');
    const html = await res.text();

    document.getElementById('cartContent').innerHTML = html;
}