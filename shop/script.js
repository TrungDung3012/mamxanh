// ===== UTIL =====
function getUser() {
  return localStorage.getItem("currentUser");
}

function showToast(msg, type = "success") {
  const div = document.createElement("div");
  div.className = "toast " + type;
  div.innerText = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2000);
}

// ===== PRODUCTS =====
const products = [
  { id: 1, name: "Rau cải/kg", price: 20000, img: "RAUCAINGOT.jpg", category: "vegetable" },
  { id: 2, name: "Táo/kg", price: 50000, img: "TÁO.jpg", category: "fruit" },
  { id: 3, name: "Cà rốt/kg", price: 15000, img: "CAROT.jpg", category: "root" },
  { id: 4, name: "Combo rau", price: 90000, img: "rau4.jpg", category: "combo" },
  
  // ===== RAU =====
  { id: 1, name: "Cải bắp/kg", price: 25000, img: "cải bắp.jpg", category: "vegetable" },
  { id: 2, name: "Rau muống/kg", price: 18000, img: "raumuong.jpg", category: "vegetable" },
  { id: 3, name: "Rau mồng tơi/kg", price: 20000, img: "mongtoi.jpg", category: "vegetable" },
  { id: 4, name: "Rau ngót/kg", price: 22000, img: "raungot.jpg", category: "vegetable" },
  { id: 5, name: "Rau dền/kg", price: 19000, img: "rauden.jpg", category: "vegetable" },

  // ===== CỦ =====
  { id: 6, name: "Củ su hào/kg", price: 30000, img: "suhao.jpg", category: "root" },
  { id: 7, name: "Củ hành/kg", price: 15000, img: "cuhanh.jpg", category: "root" }
];


// ===== FORMAT =====
function formatMoney(n) {
  return n.toLocaleString("vi-VN") + "đ";
}

// ===== RENDER PRODUCTS =====
function renderProducts(list) {
  const div = document.getElementById("products");
  if (!div) return;

  div.innerHTML = "";

  list.forEach(p => {
    div.innerHTML += `
      <div class="product">
        <img src="${p.img}">
        <h3>${p.name}</h3>
        <p>${formatMoney(p.price)}</p>
        <button onclick="addToCart(${p.id})">Mua</button>
      </div>
    `;
  });
}

// ===== FILTER =====
function filterCategory(cat) {
  if (cat === "all") renderProducts(products);
  else renderProducts(products.filter(p => p.category === cat));
}

// ===== SEARCH =====
function removeVietnameseTones(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function setupSearch() {
  const input = document.querySelector(".search");
  if (!input) return;

  input.addEventListener("input", function () {
    const keyword = removeVietnameseTones(input.value);

    if (!keyword) return renderProducts(products);

    const filtered = products.filter(p =>
      removeVietnameseTones(p.name).includes(keyword)
    );

    const div = document.getElementById("products");

    if (filtered.length === 0) {
      div.innerHTML = `<p style="padding:20px;">Không tìm thấy sản phẩm</p>`;
    } else {
      renderProducts(filtered);
    }
  });
}

// ===== CART =====
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(id) {
  if (!getUser()) {
    showToast("Đăng nhập để mua!", "error");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 800);
    return;
  }

  let cart = getCart();
  let item = cart.find(i => i.id === id);

  if (item) item.qty++;
  else cart.push({ id, qty: 1 });

  saveCart(cart);
  updateCartCount();
  showToast("Đã thêm vào giỏ");
}

function updateCartCount() {
  let cart = getCart();
  let count = cart.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById("cart-count");
  if (el) el.innerText = count;
}

// ===== RENDER CART =====
function renderCart() {
  const cartDiv = document.getElementById("cart");
  if (!cartDiv) return;

  let cart = getCart();
  cartDiv.innerHTML = "";

  let total = 0;

  cart.forEach(item => {
    let p = products.find(x => x.id === item.id);
    if (!p) return;

    let money = p.price * item.qty;
    total += money;

    cartDiv.innerHTML += `
      <div class="cart-item">
        <img src="${p.img}">
        <div class="cart-info">
          <h3>${p.name}</h3>
          <p>${formatMoney(p.price)}</p>

          <div class="qty">
            <button onclick="changeQty(${item.id}, -1)">-</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${item.id}, 1)">+</button>
          </div>

          <p class="subtotal">${formatMoney(money)}</p>
        </div>

        <button class="remove" onclick="removeItem(${item.id})">X</button>
      </div>
    `;
  });

  let ship = total > 0 ? 15000 : 0;
  let discount = total > 100000 ? 10000 : 0;
  let final = total + ship - discount;

  document.getElementById("subtotal").innerText = formatMoney(total);
  document.getElementById("total").innerText = formatMoney(final);
  document.getElementById("shipping").innerText = formatMoney(ship);
  document.getElementById("discount").innerText = formatMoney(discount);
}

// ===== CART ACTION =====
function changeQty(id, delta) {
  let cart = getCart();
  let item = cart.find(i => i.id === id);

  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);

  saveCart(cart);
  renderCart();
  updateCartCount();
}

function removeItem(id) {
  let cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

function clearCart() {
  localStorage.removeItem("cart");
  renderCart();
  updateCartCount();
}

// ===== ADDRESS =====
function getAddresses() {
  const user = getUser();
  return JSON.parse(localStorage.getItem("addr_" + user)) || [];
}

function saveAddresses(arr) {
  const user = getUser();
  localStorage.setItem("addr_" + user, JSON.stringify(arr));
}

function openAddressModal() {
  document.getElementById("address-modal").style.display = "flex";
}

function closeAddressModal() {
  document.getElementById("address-modal").style.display = "none";
}

function saveAddressModal() {
  const name = document.getElementById("m-name").value.trim();
  const phone = document.getElementById("m-phone").value.trim();
  const province = document.getElementById("m-province").value.trim();
  const district = document.getElementById("m-district").value.trim();
  const address = document.getElementById("m-address").value.trim();

  if (!name || !phone || !province || !district || !address) {
    showToast("Nhập thiếu!", "error");
    return;
  }

  let list = getAddresses();
  list.push({ name, phone, province, district, address });

  saveAddresses(list);
  renderAddresses();
  closeAddressModal();

  showToast("Đã lưu địa chỉ");
}

function renderAddresses() {
  const div = document.getElementById("address-list");
  if (!div) return;

  let list = getAddresses();
  let selected = localStorage.getItem("selectedAddress");

  div.innerHTML = "";

  list.forEach((a, i) => {
    div.innerHTML += `
      <div class="address-item">
        <input type="radio" name="addr"
          ${selected == i ? "checked" : ""}
          onchange="selectAddress(${i})">

        <b>${a.name}</b> - ${a.phone}<br>
        ${a.address}, ${a.district}, ${a.province}

        <button onclick="deleteAddress(${i})">❌</button>
      </div>
    `;
  });
}

function selectAddress(i) {
  localStorage.setItem("selectedAddress", i);
}

function deleteAddress(i) {
  let list = getAddresses();
  list.splice(i, 1);
  saveAddresses(list);
  renderAddresses();
}

// ===== CHECKOUT =====
function checkout() {
  let user = getUser();
  if (!user) {
    showToast("Đăng nhập trước!", "error");
    location.href = "login.html";
    return;
  }

  let cart = getCart();
  if (cart.length === 0) {
    showToast("Giỏ trống!", "error");
    return;
  }

  let list = getAddresses();

  if (list.length === 0) {
    showToast("Thêm địa chỉ!");
    openAddressModal();
    return;
  }

  let selected = localStorage.getItem("selectedAddress");

  if (selected === null || !list[selected]) {
    showToast("Chọn địa chỉ!", "error");
    return;
  }

  showToast("Đặt hàng thành công!");
  clearCart();
}

// ===== USERS =====
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function register() {
  const phone = document.getElementById("phone").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (!phone || !pass) {
    showToast("Nhập đủ thông tin!", "error");
    return;
  }

  let users = getUsers();

  if (users.find(u => u.phone === phone)) {
    showToast("Tài khoản đã tồn tại!", "error");
    return;
  }

  users.push({ phone, pass });
  localStorage.setItem("users", JSON.stringify(users));

  showToast("Đăng ký thành công!");
  setTimeout(() => window.location.href = "login.html", 800);
}

function login() {
  const phone = document.getElementById("phone").value.trim();
  const pass = document.getElementById("password").value.trim();

  let users = getUsers();
  let user = users.find(u => u.phone === phone && u.pass === pass);

  if (user) {
    localStorage.setItem("currentUser", phone);
    showToast("Đăng nhập thành công!");
    setTimeout(() => window.location.href = "index.html", 800);
  } else {
    showToast("Sai tài khoản!", "error");
  }
}

// ===== LOGOUT FIX =====
function logout() {
  localStorage.removeItem("currentUser");
  showToast("Đã đăng xuất");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 300);
}

// ===== USER UI =====
function setupUser() {
  const user = getUser();

  const userName = document.getElementById("user-name");
  const greeting = document.getElementById("user-greeting");
  const dropdown = document.getElementById("dropdown");
  const userMenu = document.getElementById("user-menu");

  if (!userName) return;

  if (user) {
    userName.innerText = user + " ▼";

    if (greeting) greeting.innerText = "Xin chào " + user;

    userMenu.onclick = function (e) {
      e.stopPropagation();
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
    };

    // 🔥 FIX QUAN TRỌNG
    dropdown.onclick = function (e) {
      e.stopPropagation();
    };

    document.addEventListener("click", function () {
      dropdown.style.display = "none";
    });
        setTimeout(() => {
      const btn = document.getElementById("logout-btn");

      if (btn) {
        btn.onclick = function (e) {
          e.stopPropagation();

          localStorage.removeItem("currentUser");

          showToast("Đã đăng xuất");

          setTimeout(() => {
            window.location.href = "index.html";
          }, 300);
        };
      }
    }, 0);


  } else {
    userName.innerHTML =
      '<a href="login.html">Đăng nhập</a> | <a href="register.html">Đăng ký</a>';
  }
}

// ===== LOAD =====
window.onload = function () {
  renderProducts(products);
  renderCart();
  renderAddresses();
  updateCartCount();
  setupSearch();
  setupUser();
  startSlider();
};
// ===== FIX LOGOUT CUỐI FILE =====
window.addEventListener("load", function () {
  const btn = document.getElementById("logout-btn");

  if (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();

      localStorage.removeItem("currentUser");

      alert("Đã đăng xuất");

      window.location.href = "index.html";
    });
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("logout-btn");

  console.log("logout-btn =", btn); // test xem có bắt được không

  if (btn) {
    btn.addEventListener("click", function () {
      console.log("CLICK LOGOUT OK");

      localStorage.removeItem("currentUser");

      alert("Đã đăng xuất");

      window.location.href = "index.html";
    });
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("logout-btn");

  if (btn) {
    btn.addEventListener("click", function () {
      localStorage.removeItem("currentUser");

      alert("Đã đăng xuất");

      window.location.href = "index.html";
    });
  }
});
let currentSlide = 0;

function startSlider() {
  const slides = document.getElementById("slides");
  if (!slides) return;

  setInterval(() => {
    currentSlide = currentSlide === 0 ? 1 : 0;
    slides.style.transform = `translateX(-${currentSlide * 100}%)`;
  }, 3000);
}


