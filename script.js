const bar = document.getElementById('bar');
const close = document.getElementById('close');
const navbar = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        navbar.classList.toggle('active');
    });
}

if (close) {
    close.addEventListener('click', () => {
        navbar.classList.remove('active');
    });
}

// shop

window.addEventListener("DOMContentLoaded", function () {

    var MainImg = document.getElementById("MainImg");
    var SmallImg = document.getElementsByClassName("SmallImg");

    var productName = document.getElementById("productName");
    var productPrice = document.getElementById("productPrice");
    var productDesc = document.getElementById("productDesc");

    for (let i = 0; i < SmallImg.length; i++) {
        SmallImg[i].onclick = function () {

            // SAVE MAIN DATA
            let tempSrc = MainImg.src;
            let tempName = MainImg.dataset.name;
            let tempPrice = MainImg.dataset.price;
            let tempDesc = MainImg.dataset.desc;

            // SWAP IMAGES
            MainImg.src = this.src;
            this.src = tempSrc;

            // SWAP DATA (IMPORTANT)
            MainImg.dataset.name = this.dataset.name;
            MainImg.dataset.price = this.dataset.price;
            MainImg.dataset.desc = this.dataset.desc;

            this.dataset.name = tempName;
            this.dataset.price = tempPrice;
            this.dataset.desc = tempDesc;

            // UPDATE TEXT DISPLAY
            productName.innerHTML = MainImg.dataset.name;
            productPrice.innerHTML = MainImg.dataset.price;
            productDesc.innerHTML = MainImg.dataset.desc;
        }
    }

});

// cart
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let cartBody = document.getElementById("cart-body");

function renderCart(){
    if (!cartBody) return;

    cartBody.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        let emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `
            <td colspan="7" style="text-align:center; padding:20px;">Your cart is empty.</td>
        `;
        cartBody.appendChild(emptyRow);
        return;
    }

    cart.forEach((item, index) => {
        if (item.selected === undefined) {
            item.selected = true;
        }

        let price = Number(item.price) || 0;
        let qty = Number(item.quantity) || 1;
        let subtotal = price * qty;

        if (item.selected) {
            total += subtotal;
        }

        let row = document.createElement("tr");

        row.innerHTML = `
            <td><input type="checkbox" ${item.selected ? 'checked' : ''} onchange="toggleSelected(${index}, this.checked)"></td>
            <td><a href="#" onclick="removeItem(${index})"><i class="fas fa-trash"></i></a></td>
            <td><img src="${item.image || 'images/default.jpg'}" width="50" alt="${item.name}"></td>
            <td>${item.name} ${item.size ? `(Size: ${item.size})` : ""}</td>
            <td>$${price.toFixed(2)}</td>
            <td><input type="number" min="1" value="${qty}" onchange="updateQty(${index}, this.value)"></td>
            <td>$${subtotal.toFixed(2)}</td>
        `;

        cartBody.appendChild(row);
    });

    let totalRow = document.createElement("tr");
    totalRow.innerHTML = `
        <td colspan="6"><strong>Selected Total</strong></td>
        <td><strong>$${total.toFixed(2)}</strong></td>
    `;

    cartBody.appendChild(totalRow);
    localStorage.setItem("cart", JSON.stringify(cart));
}

function removeItem(index){
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

function toggleSelected(index, checked) {
    cart[index].selected = checked;
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

function updateQty(index, value){
    let qty = Number(value);
    if (qty < 1 || Number.isNaN(qty)) {
        qty = 1;
    }
    cart[index].quantity = qty;
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

renderCart();

let checkoutBtn = document.getElementById("checkoutBtn");
let orderStatus = document.getElementById("order-status");
let receiptSection = document.getElementById("receipt");
let receiptNumber = document.getElementById("receipt-number");
let receiptDate = document.getElementById("receipt-date");
let receiptItemsContainer = document.getElementById("receipt-items");
let receiptTotal = document.getElementById("receipt-total");

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", handleCheckout);
}

function updateCheckoutState() {
    if (!checkoutBtn) return;
    checkoutBtn.disabled = cart.length === 0;
    checkoutBtn.style.opacity = cart.length === 0 ? "0.6" : "1";
    checkoutBtn.style.cursor = cart.length === 0 ? "not-allowed" : "pointer";
}

function formatCurrency(value) {
    return "$" + Number(value).toFixed(2);
}

function renderReceipt(receipt) {
    if (!receiptSection || !receiptItemsContainer || !receiptNumber || !receiptDate || !receiptTotal) return;

    receiptNumber.innerText = `Order #${receipt.orderNumber}`;
    receiptDate.innerText = receipt.date;
    receiptItemsContainer.innerHTML = receipt.items.map(item => `
        <div class="receipt-item">
            <span>${item.name} ${item.size ? `(Size ${item.size})` : ""} x${item.quantity}</span>
            <span>${formatCurrency(item.price * item.quantity)}</span>
        </div>
    `).join("");
    receiptTotal.innerText = formatCurrency(receipt.total);
    receiptSection.style.display = "block";
}

function displayReceiptIfExists() {
    let receipt = JSON.parse(localStorage.getItem("lastReceipt"));
    if (!receipt) return;
    if (orderStatus) {
        orderStatus.textContent = "Order completed. See your receipt below.";
    }
    renderReceipt(receipt);
    localStorage.removeItem("lastReceipt");
}

window.addEventListener("beforeunload", function() {
    localStorage.removeItem("lastReceipt");
});

function handleCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    let selectedItems = cart.filter(item => item.selected);
    if (selectedItems.length === 0) {
        alert("Please select one or more items to checkout.");
        return;
    }

    let totalAmount = selectedItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    let receipt = {
        orderNumber: Math.floor(Math.random() * 900000) + 100000,
        date: new Date().toLocaleString(),
        items: selectedItems.map(item => ({
    name: item.name,
    size: item.size,
    quantity: Number(item.quantity),
    price: Number(item.price),
    image: item.image
})),
        total: totalAmount
    };

    localStorage.setItem("lastReceipt", JSON.stringify(receipt));
    cart = cart.filter(item => !item.selected);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    updateCheckoutState();
    if (orderStatus) {
        orderStatus.textContent = "Order completed for selected items. Receipt generated below.";
    }
    renderReceipt(receipt);
}

updateCheckoutState();

displayReceiptIfExists();

// add to cart

function addCurrentProductToCart() {
    let productNameEl = document.getElementById("productName");
    let productPriceEl = document.getElementById("productPrice");
    let productDescEl = document.getElementById("productDesc");
    let quantityInput = document.querySelector("input[type='number']");
    let sizeSelect = document.querySelector("select");
    let mainImg = document.getElementById("MainImg");

    if (!productNameEl || !productPriceEl || !quantityInput || !sizeSelect) {
        return;
    }

    let name = productNameEl.innerText.trim();
    let price = productPriceEl.innerText.replace(/[^0-9\.]/g, "");
    let qty = Number(quantityInput.value) || 1;
    let size = sizeSelect.value;
    let image = mainImg ? mainImg.src : "images/default.jpg";

    if (size === "Select size"){
        alert("Please select a size.");
        return;
    }

    if (qty < 1) {
        qty = 1;
    }

    let existingItem = cart.find(item => item.name === name && item.size === size);

    if (existingItem) {
        existingItem.quantity = Number(existingItem.quantity) + qty;
    } else {
        cart.push({
            name: name,
            price: Number(price).toFixed(2),
            quantity: qty,
            size: size,
            image: image
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    if (orderStatus) {
        orderStatus.textContent = "Item added to cart. You can continue shopping.";
    }
}

let addToCartButtons = Array.from(document.querySelectorAll("button.normal")).filter(btn => btn.textContent.trim().toLowerCase() === "add to cart");
addToCartButtons.forEach(btn => btn.addEventListener("click", addCurrentProductToCart));


// pagination
let totalPages = 3; // This can be dynamically set based on your data
let currentPage = 1;

let pagination = document.getElementById("pagination");

if (pagination) {
    function buildPagination() {
        pagination.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            let link = document.createElement("a");
            link.href = "#";
            link.innerText = i;

            if (i === currentPage) {
                link.style.backgroundColor = "#088178";
                link.style.color = "#fff";
            }

            link.addEventListener("click", function(e){
                e.preventDefault();
                currentPage = i;
                buildPagination();
            });

            pagination.appendChild(link);
        }

        let nextBtn = document.createElement("a");
        nextBtn.href = "#";
        nextBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';

        nextBtn.addEventListener("click", function(e){
            e.preventDefault();
            if(currentPage < totalPages){
                currentPage++;
                buildPagination();
            }
        });

        pagination.appendChild(nextBtn);
    }

    buildPagination();
}


// blog

// addPost
function addPost() {
    let title = document.getElementById("title").value;
    let content = document.getElementById("content").value;
    let file = document.getElementById("imageInput").files[0];

    if (!title || !content || !file) return;

    let reader = new FileReader();

    reader.onload = function(e) {

        let post = {
            title: title,
            content: content,
            image: e.target.result
        };

        let posts = JSON.parse(localStorage.getItem("posts")) || [];
        posts.unshift(post);

        localStorage.setItem("posts", JSON.stringify(posts));

        renderPosts();
    };

    reader.readAsDataURL(file);
}

// renderPosts
function renderPosts() {
    let blog = document.getElementById("blog");
    blog.innerHTML = "";

    let posts = JSON.parse(localStorage.getItem("posts")) || [];

    posts.forEach(post => {
        let div = document.createElement("div");
        div.classList.add("blog-box");

        div.innerHTML = `
            <div class="blog-img">
                <img src="${post.image}">
            </div>
            <div class="blog-details">
                <h4>${post.title}</h4>
                <p>${post.content}</p>
                <a href="#">CONTINUE READING</a>
            </div>
        `;

        blog.appendChild(div);
    });
}

window.onload = function() {
    renderPosts();
};

// cart

const helpForm = document.getElementById("contactForm");
if (helpForm) {
    helpForm.addEventListener("submit", function (e) {
        e.preventDefault();

        let name = document.getElementById("name").value;
        let email = document.getElementById("email").value;
        let subject = document.getElementById("subject").value;
        let message = document.getElementById("message").value;

        if (name && email && subject && message) {
            const statusEl = document.getElementById("status");
            if (statusEl) {
                statusEl.innerText = "Message sent successfully!";
            }
            console.log("Name:", name);
            console.log("Email:", email);
            console.log("Subject:", subject);
            console.log("Message:", message);
            this.reset();
        } else {
            const statusEl = document.getElementById("status");
            if (statusEl) {
                statusEl.innerText = "Please fill all fields.";
            }
        }
    });
}

const faqQuestions = document.querySelectorAll(".question");
if (faqQuestions.length > 0) {
    faqQuestions.forEach(q => {
        q.addEventListener("click", () => {
            const answer = q.nextElementSibling;
            if (answer) {
                answer.style.display = (answer.style.display === "block") ? "none" : "block";
            }
        });
    });
}

const searchInput = document.getElementById("search");
if (searchInput) {
    searchInput.addEventListener("keyup", function () {
        let filter = this.value.toLowerCase();
        let faqs = document.querySelectorAll(".faq");

        faqs.forEach(faq => {
            let text = faq.innerText.toLowerCase();
            faq.style.display = text.includes(filter) ? "block" : "none";
        });
    });
}

window.sendMessage = function () {
    alert("Message sent successfully!");
};

// logout
function logout(){
    localStorage.removeItem("user");
    alert("Logged out successfully");

    // redirect to homepage (clean reset)
    window.location.href = "index.html";
}

window.onload = function () {
    let user = localStorage.getItem("user");

    let loginBtn = document.getElementById("loginBtn");
    let logoutBtn = document.getElementById("logoutBtn");

    if (user) {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
    } else {
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
    }
};

function logout(){
    let confirmLogout = confirm("Are you sure you want to logout?");

    if(confirmLogout){
        localStorage.removeItem("user");
        window.location.href = "index.html";
    }
}

