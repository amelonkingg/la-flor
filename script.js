const SUPABASE_URL = "https://vbyphvikjjsjczmbldjg.supabase.co";
const SUPABASE_KEY = "sb_publishable_6p7v08sxit1nJ4dceljBXQ_wdxUFCU8";


const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// მობილური მენიუ
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.querySelector(".nav-links");

menuBtn.addEventListener("click", function () {
    navLinks.classList.toggle("active");

    if (navLinks.classList.contains("active")) {
        menuBtn.innerHTML = "✕";
    } else {
        menuBtn.innerHTML = "☰";
    }
});

navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
        navLinks.classList.remove("active");
        menuBtn.innerHTML = "☰";
    });
});

// პროდუქტების ჩატვირთვა
let allProducts = [];
let visibleCount = 12;

async function loadProducts() {
    const productGrid = document.querySelector(".product-grid");
    const loadMoreBtn = document.getElementById("loadMoreBtn");

    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) {
        console.log("პროდუქტების ჩატვირთვის შეცდომა:", error);
        return;
    }

    allProducts = data;
    visibleCount = 12;

    showProducts();
}

function showProducts() {
    const productGrid = document.querySelector(".product-grid");
    const loadMoreBtn = document.getElementById("loadMoreBtn");

    productGrid.innerHTML = "";

    const visibleProducts = allProducts.slice(0, visibleCount);

    visibleProducts.forEach(function (product) {
        const card = document.createElement("div");
        card.className = "product-card";

        const img = document.createElement("img");
        img.src = product.image_url;
        img.alt = "ყვავილების თაიგული";

        const info = document.createElement("div");
        info.className = "product-info";

        const price = document.createElement("p");
        price.className = "price";
        price.textContent = product.price + " ₾";

        info.appendChild(price);

        if (product.single_price !== null) {
            const singlePrice = document.createElement("p");
            singlePrice.className = "price";
            singlePrice.textContent =
                "ერთი ცალი: " + product.single_price + " ₾";

            info.appendChild(singlePrice);
        }

        card.appendChild(img);
        card.appendChild(info);

        productGrid.appendChild(card);
    });

    loadMoreBtn.style.display =
        visibleCount < allProducts.length ? "block" : "none";
}

document.getElementById("loadMoreBtn").addEventListener("click", function () {
    visibleCount += 12;
    showProducts();
});

loadProducts();
// Back to Top
const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
        backToTop.style.display = "block";
    } else {
        backToTop.style.display = "none";
    }
});

backToTop.addEventListener("click", function () {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});