let menuItems = JSON.parse(localStorage.getItem('zaiqaMenu')) || [
    { id: 1, name: "Delicious Pizza", price: 350, category: "desi", inStock: true },
    { id: 2, name: "Tasty Burger", price: 450, category: "fastfood", inStock: true },
    { id: 3, name: "French Fries", price: 200, category: "fastfood", inStock: true }
];

let cart = [];
let orders = JSON.parse(localStorage.getItem('zaiqaOrders')) || [];

function showSection(id) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if(id === 'menu') filterMenu('all');
    if(id === 'admin') checkAdminAuth();
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// MENU SYSTEM (Feane Card Style)
function filterMenu(cat, btn) {
    if(btn) {
        document.querySelectorAll('.filters_menu li').forEach(l => l.classList.remove('active'));
        btn.classList.add('active');
    }
    const grid = document.getElementById('menu-grid');
    grid.innerHTML = '';
    const items = cat === 'all' ? menuItems : menuItems.filter(i => i.category === cat);
    
    items.forEach(item => {
        // Use a default image if none is provided
        const imgSrc = item.image || 'images/default-food.jpg'; 
        
        grid.innerHTML += `
            <div class="menu_item">
                <div class="item_img_box" style="text-align:center; margin-bottom:20px;">
                    <img src="${imgSrc}" alt="${item.name}" style="width:150px; height:150px; border-radius:50%; object-fit:cover; border: 5px solid #2d343e;">
                </div>
                <h3 class="heading_font">${item.name}</h3>
                <p>Freshly prepared with authentic Zaiqa spices.</p>
                <div class="price_row">
                    <span>Rs. ${item.price}</span>
                    <button class="add_to_cart_btn" onclick="addToCart(${item.id})">🛒</button>
                </div>
            </div>`;
    });
}

// ADMIN DASHBOARD
function handleLogin() {
    const e = document.getElementById('adminEmail').value;
    const p = document.getElementById('adminPass').value;
    if(e === "admin@zaiqa.com" && p === "zaiqa123") {
        sessionStorage.setItem('isAdmin', 'true');
        checkAdminAuth();
    } else { alert("Invalid Credentials"); }
}

function checkAdminAuth() {
    const isAuth = sessionStorage.getItem('isAdmin') === 'true';
    document.getElementById('login-gate').style.display = isAuth ? 'none' : 'block';
    document.getElementById('admin-panel').style.display = isAuth ? 'block' : 'none';
    if(isAuth) renderAdmin();
}

function handleLogout() { sessionStorage.removeItem('isAdmin'); checkAdminAuth(); }

function addItem() {
    const name = document.getElementById('itemName').value;
    const img = document.getElementById('itemImg').value;
    const price = document.getElementById('itemPrice').value;
    const cat = document.getElementById('itemCategory').value;

    if(!name || !price) return alert("Fill required fields");

    menuItems.push({
        id: Date.now(),
        name: name,
        image: img, // Save the image path
        price: parseInt(price),
        category: cat
    });

    localStorage.setItem('zaiqaMenu', JSON.stringify(menuItems));
    renderAdmin();
    alert("Dish added!");
}

function renderAdmin() {
    // 1. Calculate Revenue from ALL orders (even completed ones)
    const totalRev = orders.reduce((acc, curr) => acc + parseInt(curr.total), 0);
    document.getElementById('stat-revenue').innerText = "Rs. " + totalRev.toLocaleString();
    
    // 2. Count only "Active" orders for the stat box
    const activeOrders = orders.filter(o => !o.completed);
    document.getElementById('stat-orders').innerText = activeOrders.length;

    // 3. Render Menu Catalog (Existing logic)
    const adminList = document.getElementById('admin-list');
    if(adminList) {
        adminList.innerHTML = menuItems.map(item => `
            <div class="admin_item_row">
                <div class="item_info">
                    <h4>${item.name}</h4>
                    <span>Rs. ${item.price} • ${item.category.toUpperCase()}</span>
                </div>
                <div class="admin_actions">
                    <button class="btn_edit" onclick="openEdit(${item.id})">Edit</button>
                    <button class="btn_delete" onclick="deleteItem(${item.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // 4. Render Live Order Queue (Filtered to only show non-completed orders)
    const orderList = document.getElementById('admin-orders');
    if(orderList) {
        // Inside your renderAdmin() function, replace the orderList.innerHTML part:

const liveOrders = orders.filter(o => !o.completed).slice().reverse();

if (liveOrders.length === 0) {
    orderList.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">No active orders in queue.</p>';
} else {
    orderList.innerHTML = liveOrders.map(o => `
        <div class="order_queue_card">
            <div class="order_header">
                <div class="order_id_group">
                    <span class="order_label">ORDER ID</span>
                    <strong>${o.id}</strong>
                </div>
                <span class="order_time">${o.time}</span>
            </div>
            
            <div class="customer_profile">
                <div class="profile_item">
                    <span class="icon">👤</span>
                    <div>
                        <small>Customer Name</small>
                        <p>${o.customer}</p>
                    </div>
                </div>
                <div class="profile_item">
                    <span class="icon">📞</span>
                    <div>
                        <small>Phone Number</small>
                        <p>${o.phone}</p>
                    </div>
                </div>
                <div class="profile_item address_block">
                    <span class="icon">📍</span>
                    <div>
                        <small>Delivery Address</small>
                        <p>${o.address}</p>
                    </div>
                </div>
            </div>

            <div class="items_summary">
                <small>Ordered Items</small>
                <p>${o.items}</p>
            </div>

            <div class="order_footer">
                <div class="order_total">
                    <small>Total Bill</small>
                    <div>Rs. ${o.total}</div>
                </div>
                <button class="btn_complete" onclick="completeOrder('${o.id}')">
                    ✔ Dispatch & Complete
                </button>
            </div>
        </div>
    `).join('');
}
    }
}

// FUNCTION TO REMOVE ORDER FROM LIVE QUEUE
function completeOrder(orderId) {
    // Find the order and mark it as completed
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        // We set a flag instead of deleting so the Revenue stays correct
        orders[orderIndex].completed = true; 
        
        // Save the updated status to LocalStorage
        localStorage.setItem('zaiqaOrders', JSON.stringify(orders));
        
        // Refresh the dashboard
        renderAdmin();
    }
}

// Fixed addItem function to clear inputs after adding
function addItem() {
    const nameInput = document.getElementById('itemName');
    const priceInput = document.getElementById('itemPrice');
    const catInput = document.getElementById('itemCategory');

    if(!nameInput.value || !priceInput.value) {
        alert("Please enter both name and price.");
        return;
    }

    const newItem = {
        id: Date.now(),
        name: nameInput.value,
        price: parseInt(priceInput.value),
        category: catInput.value,
        inStock: true
    };

    menuItems.push(newItem);
    localStorage.setItem('zaiqaMenu', JSON.stringify(menuItems));
    
    // Clear inputs
    nameInput.value = '';
    priceInput.value = '';
    
    renderAdmin();
    alert("Item added successfully!");
}

// EDIT SYSTEM
function openEdit(id) {
    const item = menuItems.find(i => i.id === id);
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = item.name;
    document.getElementById('editImg').value = item.image || ''; // Load image path
    document.getElementById('editPrice').value = item.price;
    document.getElementById('editCategory').value = item.category;
    document.getElementById('edit-modal').style.display = 'flex';
}
function closeEditModal() { document.getElementById('edit-modal').style.display = 'none'; }

function saveEdit() {
    const id = parseInt(document.getElementById('editId').value);
    const item = menuItems.find(i => i.id === id);
    
    item.name = document.getElementById('editName').value;
    item.image = document.getElementById('editImg').value; // Save new path
    item.price = parseInt(document.getElementById('editPrice').value);
    item.category = document.getElementById('editCategory').value;
    
    localStorage.setItem('zaiqaMenu', JSON.stringify(menuItems));
    renderAdmin();
    closeEditModal();
}
function deleteItem(id) {
    menuItems = menuItems.filter(i => i.id !== id);
    localStorage.setItem('zaiqaMenu', JSON.stringify(menuItems));
    renderAdmin();
}

// CART
function toggleCart() { document.getElementById('cart-sidebar').classList.toggle('active'); }
function addToCart(id) {
    const item = menuItems.find(i => i.id === id);
    cart.push(item);
    document.getElementById('cart-count').innerText = cart.length;
    renderCart();
}
function renderCart() {
    let total = cart.reduce((a, b) => a + b.price, 0);
    document.getElementById('cart-items-container').innerHTML = cart.map(i => `<div>${i.name} - Rs.${i.price}</div>`).join('');
    document.getElementById('cart-total').innerText = total;
}
function processCheckout() {
    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;
    const address = document.getElementById('custAddress').value;
    const total = document.getElementById('cart-total').innerText;

    if(!name || !phone || !address || cart.length === 0) {
        alert("Please fill in all details.");
        return;
    }

    // Generate Order Data
    const orderID = "#Z" + Math.floor(1000 + Math.random() * 9000);
    const itemNames = cart.map(i => i.name).join(", ");

    const order = {
        id: orderID,
        customer: name,
        phone: phone,
        address: address,
        total: total,
        items: itemNames,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Save to LocalStorage
    orders.push(order);
    localStorage.setItem('zaiqaOrders', JSON.stringify(orders));

    // --- POPULATE CONFIRMATION PAGE ---
    document.getElementById('conf-order-id').innerText = orderID;
    document.getElementById('conf-items').innerText = itemNames;
    document.getElementById('conf-total').innerText = "Rs. " + total;
    document.getElementById('conf-phone').innerText = phone;

    // --- SWITCH UI VIEW ---
    toggleCart(); // Close the sidebar
    showSection('order-success'); // Switch to the success section

    // Reset Cart for next time
    cart = [];
    document.getElementById('cart-count').innerText = 0;
    renderCart();
    
    // Clear the form
    document.getElementById('custName').value = '';
    document.getElementById('custPhone').value = '';
    document.getElementById('custAddress').value = '';
}
// FUNCTION TO RESET REVENUE AND ORDER HISTORY
function resetRevenue() {
    // 1. Double-check with the admin (Safety First!)
    const confirmAction = confirm("Are you sure? This will delete all order history and reset total revenue to Rs. 0. This cannot be undone.");

    if (confirmAction) {
        // 2. Clear the orders array
        orders = [];
        
        // 3. Update LocalStorage
        localStorage.setItem('zaiqaOrders', JSON.stringify(orders));
        
        // 4. Refresh the Admin UI
        renderAdmin();
        
        alert("Revenue and History have been successfully reset.");
    }
}
window.onload = () => filterMenu('all');