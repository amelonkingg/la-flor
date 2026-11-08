
const SUPABASE_URL = "https://vbyphvikjjsjczmbldjg.supabase.co";
const SUPABASE_KEY = "sb_publishable_6p7v08sxit1nJ4dceljBXQ_wdxUFCU8";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Supabase connected!");

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

// შესვლა
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        message.textContent = "შესვლა ვერ მოხერხდა";
    } else {
        message.textContent = "წარმატებით შეხვედი!";
        loginForm.style.display = "none";
        document.getElementById("productSection").style.display = "block";
        loadProducts();
    }
});

// პროდუქტის დამატება
const productForm = document.getElementById("productForm");
const productMessage = document.getElementById("productMessage");

productForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const price = document.getElementById("productPrice").value;
    const singlePrice = document.getElementById("productSinglePrice").value;
    const image = document.getElementById("productImage").files[0];

    if (!image) {
        productMessage.textContent = "აირჩიე ფოტო";
        return;
    }

    const fileName = Date.now() + "-" + image.name;

    const { error: uploadError } = await supabaseClient.storage
        .from("bouquet-photos")
        .upload(fileName, image);

    if (uploadError) {
        productMessage.textContent = "ფოტოს ატვირთვა ვერ მოხერხდა";
        console.log(uploadError);
        return;
    }

    const { data: imageData } = supabaseClient.storage
        .from("bouquet-photos")
        .getPublicUrl(fileName);

    const { error: insertError } = await supabaseClient
        .from("products")
        .insert({
            price: Number(price),
            single_price: singlePrice === "" ? null : Number(singlePrice),
            image_url: imageData.publicUrl
        });

    if (insertError) {
        productMessage.textContent = "პროდუქტის დამატება ვერ მოხერხდა";
        console.log(insertError);
    } else {
        productMessage.textContent = "პროდუქტი წარმატებით დაემატა!";
        productForm.reset();
        currentPage = 1;
        loadProducts();
    }
});

// გვერდებად დაყოფა
let allProducts = [];
let currentPage = 1;
const productsPerPage = 10;

const productList = document.getElementById("productList");

// Pagination ღილაკების შექმნა
function createPagination() {
    const pagination = document.createElement("div");
    pagination.className = "pagination";

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "წინა";

    const pageText = document.createElement("span");

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "შემდეგი";

    pagination.appendChild(prevBtn);
    pagination.appendChild(pageText);
    pagination.appendChild(nextBtn);

    prevBtn.addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            showProducts();

        }
    });

    nextBtn.addEventListener("click", function () {
        const totalPages = Math.ceil(
            allProducts.length / productsPerPage
        );

        if (currentPage < totalPages) {
            currentPage++;
            showProducts();

        }
    });

    return {
        element: pagination,
        prevBtn: prevBtn,
        nextBtn: nextBtn,
        pageText: pageText
    };
}

// ზედა და ქვედა Pagination
const topPagination = createPagination();
const bottomPagination = createPagination();

productList.before(topPagination.element);
productList.after(bottomPagination.element);

// პროდუქტების ჩვენება
function showProducts() {
    productList.innerHTML = "";

    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;

    const visibleProducts = allProducts.slice(start, end);

    visibleProducts.forEach(function (product) {
        const card = document.createElement("div");

        const img = document.createElement("img");
        img.src = product.image_url;
        img.style.width = "150px";

        const price = document.createElement("p");
        price.textContent = "მთლიანი: " + product.price + " ₾";

        const singlePrice = document.createElement("p");
        singlePrice.textContent = product.single_price !== null
            ? "ერთი ცალი: " + product.single_price + " ₾"
            : "ერთი ცალი: —";

        card.appendChild(img);
        card.appendChild(price);
        card.appendChild(singlePrice);

        // მთლიანი ფასის შეცვლა
        const editPriceBtn = document.createElement("button");
        editPriceBtn.textContent = "მთლიანი ფასის შეცვლა";

        editPriceBtn.addEventListener("click", async function () {
            const newPrice = prompt(
                "შეიყვანე მთლიანი თაიგულის ახალი ფასი:"
            );

            if (
                newPrice === null ||
                newPrice.trim() === "" ||
                !Number.isFinite(Number(newPrice)) ||
                Number(newPrice) < 0
            ) {
                return;
            }

            const { error } = await supabaseClient
                .from("products")
                .update({ price: Number(newPrice) })
                .eq("id", product.id);

            if (error) {
                alert("ფასი ვერ შეიცვალა");
                console.log(error);
            } else {
                loadProducts();
            }
        });

        // ერთი ცალის ფასის შეცვლა
        const editSingleBtn = document.createElement("button");
        editSingleBtn.textContent = "ერთი ცალის ფასის შეცვლა";

        editSingleBtn.addEventListener("click", async function () {
            const newPrice = prompt(
                "შეიყვანე ერთი ცალის ახალი ფასი (ცარიელი დატოვე ფასის მოსაშორებლად):",
                product.single_price ?? ""
            );

            if (newPrice === null) {
                return;
            }

            const trimmedPrice = newPrice.trim();

            let priceValue = null;

            if (trimmedPrice !== "") {
                if (
                    !Number.isFinite(Number(trimmedPrice)) ||
                    Number(trimmedPrice) < 0
                ) {
                    alert("შეიყვანე სწორი ფასი");
                    return;
                }

                priceValue = Number(trimmedPrice);
            }

            const { error } = await supabaseClient
                .from("products")
                .update({ single_price: priceValue })
                .eq("id", product.id);

            if (error) {
                alert("ფასი ვერ შეიცვალა");
                console.log(error);
            } else {
                loadProducts();
            }
        });

        // წაშლა
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "წაშლა";

        deleteBtn.addEventListener("click", async function () {
            if (!confirm("ნამდვილად გინდა პროდუქტის წაშლა?")) {
                return;
            }

            const { error } = await supabaseClient
                .from("products")
                .delete()
                .eq("id", product.id);

            if (error) {
                alert("წაშლა ვერ მოხერხდა");
                console.log(error);
                return;
            }

            // Storage-ში ფოტოს წაშლა
            if (product.image_url.includes("/bouquet-photos/")) {
                const imagePath = decodeURIComponent(
                    product.image_url.split("/bouquet-photos/")[1]
                );

                const { error: storageError } = await supabaseClient.storage
                    .from("bouquet-photos")
                    .remove([imagePath]);

                if (storageError) {
                    console.log(storageError);
                    alert("პროდუქტი წაიშალა, მაგრამ ფოტო Storage-ში დარჩა");
                }
            }

            loadProducts();
        });

        card.appendChild(editPriceBtn);
        card.appendChild(editSingleBtn);
        card.appendChild(deleteBtn);

        productList.appendChild(card);
    });

    // ორივე Pagination-ის განახლება
    const totalPages = Math.ceil(
        allProducts.length / productsPerPage
    );

    [topPagination, bottomPagination].forEach(function (nav) {
        nav.pageText.textContent = currentPage + " / " + totalPages;

        nav.prevBtn.disabled = currentPage === 1;
        nav.nextBtn.disabled = currentPage >= totalPages;

        nav.element.style.display =
            totalPages > 1 ? "flex" : "none";
    });
}

// პროდუქტების ჩატვირთვა
async function loadProducts() {
    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        productList.textContent = "პროდუქტების ჩატვირთვა ვერ მოხერხდა";
        console.log(error);
        return;
    }

    allProducts = data;

    const totalPages = Math.max(
        1,
        Math.ceil(allProducts.length / productsPerPage)
    );

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    showProducts();
}
