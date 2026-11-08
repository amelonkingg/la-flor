

const SUPABASE_URL = "https://vbyphvikjjsjczmbldjg.supabase.co";
const SUPABASE_KEY = "sb_publishable_6p7v08sxit1nJ4dceljBXQ_wdxUFCU8";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// მენიუ
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

// Lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const closeBtn = document.getElementById("closeBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let images = [];
let currentIndex = 0;

function updateImages() {
    images = Array.from(
        document.querySelectorAll(".bouquet-card img")
    );

    images.forEach(function (img, index) {
        img.onclick = function () {
            openLightbox(index);
        };
    });
}

function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = images[currentIndex].src;
    lightbox.classList.add("active");
}

function closeLightbox() {
    lightbox.classList.remove("active");
}

function showNext() {
    if (images.length === 0) return;

    currentIndex++;

    if (currentIndex >= images.length) {
        currentIndex = 0;
    }

    lightboxImg.src = images[currentIndex].src;
}

function showPrev() {
    if (images.length === 0) return;

    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = images.length - 1;
    }

    lightboxImg.src = images[currentIndex].src;
}

closeBtn.addEventListener("click", closeLightbox);
nextBtn.addEventListener("click", showNext);
prevBtn.addEventListener("click", showPrev);

lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
});

// პროდუქტების ჩატვირთვა
let allProducts = [];
let visibleProducts = 12;

const bouquetGrid = document.querySelector(".bouquet-grid");

// მეტის ნახვის ღილაკი
const loadMoreBtn = document.createElement("button");
loadMoreBtn.textContent = "მეტის ნახვა";
loadMoreBtn.className = "load-more-btn";

bouquetGrid.after(loadMoreBtn);

function showProducts() {
    const nextProducts = allProducts.slice(
        0,
        visibleProducts
    );

    bouquetGrid.innerHTML = "";

    nextProducts.forEach(function (product) {
        const card = document.createElement("div");
        card.className = "bouquet-card";

        const img = document.createElement("img");
        img.src = product.image_url;
        img.alt = "ყვავილების თაიგული";

        const price = document.createElement("p");
        price.textContent = product.price + " ₾";

        card.appendChild(img);
        card.appendChild(price);

        if (product.single_price !== null) {
            const singlePrice = document.createElement("p");
            singlePrice.textContent =
                "ერთი ცალი: " + product.single_price + " ₾";

            card.appendChild(singlePrice);
        }

        bouquetGrid.appendChild(card);
    });

    updateImages();

    if (visibleProducts >= allProducts.length) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "block";
    }
}

async function loadGalleryProducts() {
    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.log("პროდუქტების ჩატვირთვის შეცდომა:", error);
        return;
    }

    allProducts = data;
    showProducts();
}

// მეტის ნახვა
loadMoreBtn.addEventListener("click", function () {
    visibleProducts += 12;
    showProducts();
});

loadGalleryProducts();

// Back to top
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
