/* =========================================================
   MURG KABOB — CUSTOMER WEBSITE
   script.js
========================================================= */

"use strict";


/* =========================================================
   STORAGE KEYS
========================================================= */

const PRODUCTS_KEY = "murgKabobProducts";
const ORDERS_KEY = "murgKabobOrders";
const CART_KEY = "murgKabobCart";

const DELIVERY_FEE = 10;


/* =========================================================
   DEFAULT PRODUCTS
========================================================= */

const DEFAULT_PRODUCTS = [

    {
        id: "burger-1",
        name: "Бургери классикӣ",
        price: 35,
        category: "burger",
        image: "images/burger-1.svg",
        description: "Гӯшт, салат, помидор, панир ва соуси махсус.",
        active: true
    },

    {
        id: "burger-2",
        name: "Чизбургер",
        price: 40,
        category: "burger",
        image: "images/burger-2.svg",
        description: "Гӯшт, панир, сабзавот ва соуси махсус.",
        active: true
    },

    {
        id: "chicken-1",
        name: "Мурғи бирён",
        price: 55,
        category: "chicken",
        image: "images/chicken-1.svg",
        description: "Мурғи болаззат бо қабати қирмиз ва хуштаъм.",
        active: true
    },

    {
        id: "chicken-2",
        name: "Мурғ бо картошка",
        price: 65,
        category: "chicken",
        image: "images/chicken-2.svg",
        description: "Мурғи бирён бо картошка ва соуси махсус.",
        active: true
    },

    {
        id: "combo-1",
        name: "Комбо барои 2 нафар",
        price: 99,
        category: "combo",
        image: "images/combo.svg",
        description: "Комбои болаззат барои ду нафар.",
        active: true
    },

    {
        id: "drink-1",
        name: "Нӯшокӣ",
        price: 10,
        category: "drink",
        image: "images/drink-1.svg",
        description: "Нӯшокии хунук барои ҳамроҳии хӯрок.",
        active: true
    }

];


/* =========================================================
   STATE
========================================================= */

let products = [];

let cart = [];

let activeCategory = "all";

let menuSearchValue = "";

let toastTimer = null;


/* =========================================================
   DOM HELPERS
========================================================= */

function $(selector) {

    return document.querySelector(selector);

}


function $$(selector) {

    return Array.from(
        document.querySelectorAll(selector)
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   NUMBER
========================================================= */

function numberValue(value) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


/* =========================================================
   MONEY
========================================================= */

function formatMoney(value) {

    return `${numberValue(value).toLocaleString("tg-TJ")} сомонӣ`;

}


/* =========================================================
   CLONE DATA
========================================================= */

function cloneData(data) {

    return JSON.parse(
        JSON.stringify(data)
    );

}


/* =========================================================
   SAFE IMAGE
========================================================= */

function safeImageSrc(value) {

    const image =
        String(value || "").trim();

    if (
        image.startsWith("images/") ||
        image.startsWith("./images/") ||
        image.startsWith("https://") ||
        image.startsWith("http://")
    ) {

        return image;

    }

    return "images/hero.png";

}


/* =========================================================
   CATEGORY NAME
========================================================= */

function categoryName(category) {

    const categories = {

        burger: "Бургер",

        chicken: "Мурғ",

        combo: "Комбо",

        drink: "Нӯшокӣ"

    };

    return categories[category] ||
        "Маҳсулот";

}


/* =========================================================
   STORAGE
========================================================= */

function readStorage(
    key,
    fallback = []
) {

    try {

        const saved =
            localStorage.getItem(key);

        if (!saved) {

            return cloneData(
                fallback
            );

        }

        const parsed =
            JSON.parse(saved);

        return parsed;

    } catch (error) {

        console.error(
            `Storage read error: ${key}`,
            error
        );

        return cloneData(
            fallback
        );

    }

}


function writeStorage(
    key,
    value
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    } catch (error) {

        console.error(
            `Storage write error: ${key}`,
            error
        );

        return false;

    }

}


/* =========================================================
   NORMALIZE PRODUCT
========================================================= */

function normalizeProduct(
    product,
    index = 0
) {

    return {

        id:
            String(
                product?.id ||
                `product-${Date.now()}-${index}`
            ),

        name:
            String(
                product?.name ||
                "Маҳсулот"
            ),

        price:
            Math.max(
                0,
                numberValue(
                    product?.price
                )
            ),

        category:
            String(
                product?.category ||
                "other"
            ),

        image:
            safeImageSrc(
                product?.image
            ),

        description:
            String(
                product?.description ||
                ""
            ),

        active:
            product?.active !== false

    };

}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

function loadProducts() {

    let saved =
        readStorage(
            PRODUCTS_KEY,
            []
        );

    if (
        !Array.isArray(saved) ||
        saved.length === 0
    ) {

        saved =
            cloneData(
                DEFAULT_PRODUCTS
            );

        writeStorage(
            PRODUCTS_KEY,
            saved
        );

    }

    products =
        saved.map(
            normalizeProduct
        );

}


/* =========================================================
   SAVE PRODUCTS
========================================================= */

function saveProducts() {

    writeStorage(
        PRODUCTS_KEY,
        products
    );

}


/* =========================================================
   MENU ELEMENTS
========================================================= */

const menuGrid =
    $("#menuGrid");

const menuSearch =
    $("#menuSearch");

const categoryButtons =
    $$(".category-button");


/* =========================================================
   GET FILTERED PRODUCTS
========================================================= */

function getFilteredProducts() {

    const search =
        menuSearchValue
            .trim()
            .toLowerCase();

    return products.filter(
        product => {

            if (
                product.active === false
            ) {

                return false;

            }

            const categoryMatches =
                activeCategory === "all" ||
                product.category === activeCategory;

            const searchMatches =
                !search ||
                product.name
                    .toLowerCase()
                    .includes(search) ||
                product.description
                    .toLowerCase()
                    .includes(search) ||
                categoryName(
                    product.category
                )
                    .toLowerCase()
                    .includes(search);

            return (
                categoryMatches &&
                searchMatches
            );

        }
    );

}


/* =========================================================
   RENDER MENU
========================================================= */

function renderMenu() {

    if (!menuGrid) {
        return;
    }

    const filteredProducts =
        getFilteredProducts();

    if (
        filteredProducts.length === 0
    ) {

        menuGrid.innerHTML = `

            <div class="menu-empty empty-menu">

                <div class="menu-empty-icon">
                    🔎
                </div>

                <h3>
                    Маҳсулот ёфт нашуд
                </h3>

                <p>
                    Категория ё калимаи дигарро санҷед.
                </p>

            </div>

        `;

        return;

    }


    menuGrid.innerHTML =
        filteredProducts
            .map(
                product => {

                    return `

                        <article class="menu-card">

                            <div class="menu-card-image">

                                <img
                                    src="${escapeHTML(
                                        safeImageSrc(
                                            product.image
                                        )
                                    )}"
                                    alt="${escapeHTML(
                                        product.name
                                    )}"
                                    loading="lazy"
                                    onerror="this.src='images/hero.png'"
                                >

                                <span class="menu-category-badge">

                                    ${escapeHTML(
                                        categoryName(
                                            product.category
                                        )
                                    )}

                                </span>

                            </div>


                            <div class="menu-card-content">

                                <div class="menu-card-top">

                                    <div>

                                        <h3>
                                            ${escapeHTML(
                                                product.name
                                            )}
                                        </h3>

                                        <p>
                                            ${escapeHTML(
                                                product.description
                                            )}
                                        </p>

                                    </div>

                                </div>


                                <div class="menu-card-footer">

                                    <strong class="menu-price">

                                        ${formatMoney(
                                            product.price
                                        )}

                                    </strong>


                                    <button
                                        type="button"
                                        class="add-to-cart-button add-cart-button"
                                        data-product-id="${escapeHTML(
                                            product.id
                                        )}"
                                    >

                                        <span>
                                            +
                                        </span>

                                        Ба сабад

                                    </button>

                                </div>

                            </div>

                        </article>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   CATEGORY BUTTONS
========================================================= */

categoryButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                activeCategory =
                    button.dataset.category ||
                    "all";

                categoryButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );

                button.classList.add(
                    "active"
                );

                renderMenu();

            }
        );

    }
);


/* =========================================================
   MENU SEARCH
========================================================= */

menuSearch?.addEventListener(
    "input",
    () => {

        menuSearchValue =
            menuSearch.value || "";

        renderMenu();

    }
);


/* =========================================================
   NORMALIZE CART ITEM
========================================================= */

function normalizeCartItem(item) {

    return {

        id:
            String(
                item?.id || ""
            ),

        name:
            String(
                item?.name ||
                "Маҳсулот"
            ),

        price:
            Math.max(
                0,
                numberValue(
                    item?.price
                )
            ),

        image:
            safeImageSrc(
                item?.image
            ),

        quantity:
            Math.max(
                1,
                Math.floor(
                    numberValue(
                        item?.quantity
                    ) || 1
                )
            )

    };

}


/* =========================================================
   LOAD CART
========================================================= */

function loadCart() {

    const saved =
        readStorage(
            CART_KEY,
            []
        );

    cart =
        Array.isArray(saved)
            ? saved
                .map(
                    normalizeCartItem
                )
                .filter(
                    item => item.id
                )
            : [];

}


/* =========================================================
   SAVE CART
========================================================= */

function saveCart() {

    writeStorage(
        CART_KEY,
        cart
    );

    updateCartUI();

}


/* =========================================================
   CART COUNT
========================================================= */

function getCartCount() {

    return cart.reduce(
        (
            total,
            item
        ) => {

            return total +
                numberValue(
                    item.quantity
                );

        },
        0
    );

}


/* =========================================================
   CART SUBTOTAL
========================================================= */

function getCartSubtotal() {

    return cart.reduce(
        (
            total,
            item
        ) => {

            return total +
                (
                    numberValue(
                        item.price
                    ) *
                    numberValue(
                        item.quantity
                    )
                );

        },
        0
    );

}


/* =========================================================
   DELIVERY
========================================================= */

function getDeliveryFee() {

    return cart.length > 0
        ? DELIVERY_FEE
        : 0;

}


/* =========================================================
   FINAL TOTAL
========================================================= */

function getFinalTotal() {

    return (
        getCartSubtotal() +
        getDeliveryFee()
    );

}


/* =========================================================
   ADD TO CART
========================================================= */

function addToCart(productId) {

    const product =
        products.find(
            item =>
                item.id === productId &&
                item.active !== false
        );

    if (!product) {

        showToast(
            "Маҳсулот ёфт нашуд."
        );

        return;

    }


    const existing =
        cart.find(
            item =>
                item.id === productId
        );


    if (existing) {

        existing.quantity += 1;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            price:
                numberValue(
                    product.price
                ),

            image:
                safeImageSrc(
                    product.image
                ),

            quantity: 1

        });

    }


    saveCart();


    showToast(
        `${product.name} ба сабад илова шуд.`
    );

}


/* =========================================================
   CHANGE CART QUANTITY
========================================================= */

function changeCartQuantity(
    productId,
    change
) {

    const item =
        cart.find(
            product =>
                product.id === productId
        );

    if (!item) {
        return;
    }


    item.quantity += change;


    if (
        item.quantity <= 0
    ) {

        cart =
            cart.filter(
                product =>
                    product.id !== productId
            );

    }


    saveCart();

}


/* =========================================================
   REMOVE CART ITEM
========================================================= */

function removeCartItem(
    productId
) {

    cart =
        cart.filter(
            item =>
                item.id !== productId
        );

    saveCart();

}


/* =========================================================
   CART ELEMENTS
========================================================= */

const cartButton =
    $("#cartButton");

const cartCount =
    $("#cartCount");

const cartOverlay =
    $("#cartOverlay");

const cartDrawer =
    $("#cartDrawer");

const closeCartButton =
    $("#closeCart");

const cartItems =
    $("#cartItems");

const cartSubtotal =
    $("#cartSubtotal");

const cartDelivery =
    $("#cartDelivery");

const cartTotal =
    $("#cartTotal");

const checkoutButton =
    $("#checkoutButton");


/* =========================================================
   UPDATE CART COUNT
========================================================= */

function updateCartCount() {

    if (!cartCount) {
        return;
    }

    cartCount.textContent =
        getCartCount();

}


/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

    if (!cartItems) {
        return;
    }


    if (
        cart.length === 0
    ) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <div class="empty-cart-icon">
                    🛒
                </div>

                <h3>
                    Сабад холӣ аст
                </h3>

                <p>
                    Аз меню хӯрок интихоб кунед.
                </p>

                <a
                    href="#menu"
                    class="empty-cart-button"
                    data-close-cart
                >
                    Дидани меню
                </a>

            </div>

        `;

    } else {

        cartItems.innerHTML =
            cart.map(
                item => {

                    const subtotal =
                        numberValue(
                            item.price
                        ) *
                        numberValue(
                            item.quantity
                        );

                    return `

                        <div
                            class="cart-item"
                            data-cart-id="${escapeHTML(
                                item.id
                            )}"
                        >

                            <img
                                src="${escapeHTML(
                                    safeImageSrc(
                                        item.image
                                    )
                                )}"
                                alt="${escapeHTML(
                                    item.name
                                )}"
                                onerror="this.src='images/hero.png'"
                            >


                            <div class="cart-item-content">

                                <div class="cart-item-top">

                                    <div>

                                        <h4>
                                            ${escapeHTML(
                                                item.name
                                            )}
                                        </h4>

                                        <span>
                                            ${formatMoney(
                                                item.price
                                            )}
                                        </span>

                                    </div>


                                    <button
                                        type="button"
                                        class="cart-remove-button"
                                        data-cart-action="remove"
                                        data-product-id="${escapeHTML(
                                            item.id
                                        )}"
                                        aria-label="Нест кардани маҳсулот"
                                    >
                                        ×
                                    </button>

                                </div>


                                <div class="cart-item-bottom">

                                    <div class="quantity-control">

                                        <button
                                            type="button"
                                            data-cart-action="decrease"
                                            data-product-id="${escapeHTML(
                                                item.id
                                            )}"
                                        >
                                            −
                                        </button>

                                        <strong>
                                            ${item.quantity}
                                        </strong>

                                        <button
                                            type="button"
                                            data-cart-action="increase"
                                            data-product-id="${escapeHTML(
                                                item.id
                                            )}"
                                        >
                                            +
                                        </button>

                                    </div>


                                    <strong class="cart-item-subtotal">

                                        ${formatMoney(
                                            subtotal
                                        )}

                                    </strong>

                                </div>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

    }


    if (cartSubtotal) {

        cartSubtotal.textContent =
            formatMoney(
                getCartSubtotal()
            );

    }


    if (cartDelivery) {

        cartDelivery.textContent =
            formatMoney(
                getDeliveryFee()
            );

    }


    if (cartTotal) {

        cartTotal.textContent =
            formatMoney(
                getFinalTotal()
            );

    }


    if (checkoutButton) {

        checkoutButton.disabled =
            cart.length === 0;

    }

}


/* =========================================================
   UPDATE CART UI
========================================================= */

function updateCartUI() {

    updateCartCount();

    renderCart();

    updateCheckoutSummary();

}


/* =========================================================
   OPEN CART
========================================================= */

function openCart() {

    cartDrawer
        ?.classList.add(
            "active"
        );

    cartOverlay
        ?.classList.add(
            "active"
        );

    document.body
        .classList.add(
            "cart-open"
        );

}


/* =========================================================
   CLOSE CART
========================================================= */

function closeCart() {

    cartDrawer
        ?.classList.remove(
            "active"
        );

    cartOverlay
        ?.classList.remove(
            "active"
        );

    document.body
        .classList.remove(
            "cart-open"
        );

}


/* =========================================================
   CART EVENTS
========================================================= */

cartButton?.addEventListener(
    "click",
    openCart
);


closeCartButton?.addEventListener(
    "click",
    closeCart
);


cartOverlay?.addEventListener(
    "click",
    closeCart
);


/* =========================================================
   MENU ADD TO CART EVENT
========================================================= */

menuGrid?.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".add-to-cart-button, .add-cart-button"
            );

        if (!button) {
            return;
        }

        const productId =
            button.dataset.productId;

        if (!productId) {
            return;
        }

        addToCart(
            productId
        );

    }
);


/* =========================================================
   CART ACTION EVENTS
========================================================= */

cartItems?.addEventListener(
    "click",
    event => {

        const closeLink =
            event.target.closest(
                "[data-close-cart]"
            );

        if (closeLink) {

            closeCart();

            return;

        }


        const button =
            event.target.closest(
                "[data-cart-action]"
            );

        if (!button) {
            return;
        }


        const action =
            button.dataset.cartAction;

        const productId =
            button.dataset.productId;


        if (!productId) {
            return;
        }


        if (
            action ===
            "increase"
        ) {

            changeCartQuantity(
                productId,
                1
            );

        }


        if (
            action ===
            "decrease"
        ) {

            changeCartQuantity(
                productId,
                -1
            );

        }


        if (
            action ===
            "remove"
        ) {

            removeCartItem(
                productId
            );

        }

    }
);


/* =========================================================
   CHECKOUT ELEMENTS
========================================================= */

const orderModal =
    $("#orderModal");

const closeOrderModalButton =
    $("#closeOrderModal");

const orderForm =
    $("#orderForm");

const customerName =
    $("#customerName");

const customerPhone =
    $("#customerPhone");

const customerAddress =
    $("#customerAddress");

const customerNote =
    $("#customerNote");

const checkoutSubtotal =
    $("#checkoutSubtotal");

const checkoutDelivery =
    $("#checkoutDelivery");

const checkoutTotal =
    $("#checkoutTotal");


/* =========================================================
   UPDATE CHECKOUT SUMMARY
========================================================= */

function updateCheckoutSummary() {

    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            formatMoney(
                getCartSubtotal()
            );

    }


    if (checkoutDelivery) {

        checkoutDelivery.textContent =
            formatMoney(
                getDeliveryFee()
            );

    }


    if (checkoutTotal) {

        checkoutTotal.textContent =
            formatMoney(
                getFinalTotal()
            );

    }

}


/* =========================================================
   OPEN CHECKOUT
========================================================= */

function openCheckout() {

    if (
        cart.length === 0
    ) {

        showToast(
            "Сабади шумо холӣ аст."
        );

        return;

    }


    closeCart();

    updateCheckoutSummary();


    orderModal
        ?.classList.add(
            "active"
        );


    document.body
        .classList.add(
            "modal-open"
        );


    setTimeout(
        () => {

            customerName
                ?.focus();

        },
        100
    );

}


/* =========================================================
   CLOSE CHECKOUT
========================================================= */

function closeCheckout() {

    orderModal
        ?.classList.remove(
            "active"
        );

    document.body
        .classList.remove(
            "modal-open"
        );

}


/* =========================================================
   CHECKOUT EVENTS
========================================================= */

checkoutButton?.addEventListener(
    "click",
    openCheckout
);


closeOrderModalButton?.addEventListener(
    "click",
    closeCheckout
);


orderModal?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            orderModal
        ) {

            closeCheckout();

        }

    }
);


/* =========================================================
   GET PAYMENT METHOD
========================================================= */

function getPaymentMethod() {

    const selected =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

    return selected?.value ||
        "Нақдӣ";

}


/* =========================================================
   PHONE VALIDATION
========================================================= */

function isValidPhone(phone) {

    const digits =
        String(phone)
            .replace(/\D/g, "");

    return (
        digits.length >= 9 &&
        digits.length <= 15
    );

}


/* =========================================================
   LOAD ORDERS
========================================================= */

function loadOrders() {

    const orders =
        readStorage(
            ORDERS_KEY,
            []
        );

    return Array.isArray(orders)
        ? orders
        : [];

}


/* =========================================================
   SAVE ORDERS
========================================================= */

function saveOrders(orders) {

    writeStorage(
        ORDERS_KEY,
        orders
    );

}


/* =========================================================
   GENERATE ORDER ID
========================================================= */

function generateOrderId() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    const hours =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );


    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const seconds =
        String(
            now.getSeconds()
        ).padStart(
            2,
            "0"
        );


    const random =
        String(
            Math.floor(
                Math.random() * 1000
            )
        ).padStart(
            3,
            "0"
        );


    return (
        `MK-${year}${month}${day}-` +
        `${hours}${minutes}${seconds}-` +
        `${random}`
    );

}


/* =========================================================
   SUBMIT ORDER
========================================================= */

orderForm?.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        if (
            cart.length === 0
        ) {

            closeCheckout();

            showToast(
                "Сабади шумо холӣ аст."
            );

            return;

        }


        const name =
            customerName
                ?.value
                .trim() || "";


        const phone =
            customerPhone
                ?.value
                .trim() || "";


        const address =
            customerAddress
                ?.value
                .trim() || "";


        const note =
            customerNote
                ?.value
                .trim() || "";


        if (!name) {

            showToast(
                "Номи худро ворид кунед."
            );

            customerName
                ?.focus();

            return;

        }


        if (!phone) {

            showToast(
                "Рақами телефонро ворид кунед."
            );

            customerPhone
                ?.focus();

            return;

        }


        if (
            !isValidPhone(
                phone
            )
        ) {

            showToast(
                "Рақами телефон нодуруст аст."
            );

            customerPhone
                ?.focus();

            return;

        }


        if (!address) {

            showToast(
                "Суроғаи худро ворид кунед."
            );

            customerAddress
                ?.focus();

            return;

        }


        const paymentMethod =
            getPaymentMethod();


        const subtotal =
            getCartSubtotal();


        const deliveryFee =
            getDeliveryFee();


        const total =
            subtotal +
            deliveryFee;


        const order = {

            id:
                generateOrderId(),

            customer: {

                name,

                phone,

                address,

                note

            },

            items:
                cart.map(
                    item => ({

                        id:
                            item.id,

                        name:
                            item.name,

                        price:
                            numberValue(
                                item.price
                            ),

                        quantity:
                            numberValue(
                                item.quantity
                            ),

                        subtotal:
                            numberValue(
                                item.price
                            ) *
                            numberValue(
                                item.quantity
                            )

                    })
                ),

            subtotal,

            deliveryFee,

            total,

            paymentMethod,

            paymentStatus:
                paymentMethod === "Корт"
                    ? "Интизори пардохт"
                    : "Ҳангоми қабул",

            status:
                "Нав",

            createdAt:
                new Date()
                    .toISOString()

        };


        const orders =
            loadOrders();


        orders.unshift(
            order
        );


        saveOrders(
            orders
        );


        /* =============================================
           CLEAR CART
        ============================================= */

        cart = [];

        saveCart();


        /* =============================================
           RESET FORM
        ============================================= */

        orderForm.reset();


        const cashPayment =
            document.querySelector(
                'input[name="paymentMethod"][value="Нақдӣ"]'
            );

        if (cashPayment) {

            cashPayment.checked =
                true;

        }


        /* =============================================
           CLOSE MODAL
        ============================================= */

        closeCheckout();


        /* =============================================
           SUCCESS MESSAGE
        ============================================= */

        showToast(
            `Фармоиши ${order.id} қабул шуд!`
        );

    }
);


/* =========================================================
   SUCCESS TOAST
========================================================= */

const successToast =
    $("#successToast");


function showToast(message) {

    if (!successToast) {
        return;
    }


    const messageElement =
        successToast.querySelector(
            ".toast-message"
        );


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    successToast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                successToast
                    .classList.remove(
                        "show"
                    );

            },
            3200
        );

}


/* =========================================================
   MOBILE MENU
========================================================= */

const mobileMenuButton =
    $("#mobileMenuButton");

const navigation =
    $("#navigation");


function closeMobileMenu() {

    navigation
        ?.classList.remove(
            "active"
        );

    mobileMenuButton
        ?.classList.remove(
            "active"
        );

    mobileMenuButton
        ?.setAttribute(
            "aria-expanded",
            "false"
        );

}


mobileMenuButton?.addEventListener(
    "click",
    () => {

        const isOpen =
            navigation
                ?.classList.toggle(
                    "active"
                );


        mobileMenuButton
            .classList.toggle(
                "active",
                Boolean(isOpen)
            );


        mobileMenuButton
            .setAttribute(
                "aria-expanded",
                isOpen
                    ? "true"
                    : "false"
            );

    }
);


/* =========================================================
   NAVIGATION LINKS
========================================================= */

$$(".nav-link").forEach(
    link => {

        link.addEventListener(
            "click",
            closeMobileMenu
        );

    }
);


/* =========================================================
   ACTIVE NAVIGATION ON SCROLL
========================================================= */

const sections =
    [
        "home",
        "menu",
        "delivery",
        "contact"
    ];


function updateActiveNavigation() {

    const scrollPosition =
        window.scrollY + 160;

    let activeSection =
        "home";


    sections.forEach(
        sectionId => {

            const section =
                document.getElementById(
                    sectionId
                );

            if (!section) {
                return;
            }


            if (
                scrollPosition >=
                section.offsetTop
            ) {

                activeSection =
                    sectionId;

            }

        }
    );


    $$(".nav-link").forEach(
        link => {

            const href =
                link.getAttribute(
                    "href"
                );

            link.classList.toggle(
                "active",
                href ===
                `#${activeSection}`
            );

        }
    );

}


window.addEventListener(
    "scroll",
    updateActiveNavigation,
    {
        passive: true
    }
);


/* =========================================================
   SECRET ADMIN LOGIN
   5 бор пахш кардани логотип → login.html
========================================================= */

const secretAdminTrigger =
    $("#secretAdminTrigger");


let secretAdminClicks = 0;

let secretAdminTimer = null;


/*
   Корбар бояд 5 бор нисбатан зуд пахш кунад.
   Агар зиёда аз 2 сония таваққуф кунад,
   ҳисоб аз нав сар мешавад.
*/

secretAdminTrigger?.addEventListener(
    "click",
    event => {

        /*
           Нагузорем пахшҳои 1–4
           ба #home гузаранд.
        */

        event.preventDefault();


        secretAdminClicks += 1;


        clearTimeout(
            secretAdminTimer
        );


        /* =============================================
           5 CLICKS
        ============================================= */

        if (
            secretAdminClicks >= 5
        ) {

            secretAdminClicks = 0;


            window.location.href =
                "login.html?signin=1";


            return;

        }


        /* =============================================
           RESET AFTER 2 SECONDS
        ============================================= */

        secretAdminTimer =
            setTimeout(
                () => {

                    secretAdminClicks = 0;

                },
                2000
            );

    }
);


/* =========================================================
   DOUBLE / RAPID CLICK PROTECTION
   Барои он ки browser text-ро select накунад.
========================================================= */

secretAdminTrigger?.addEventListener(
    "mousedown",
    event => {

        if (
            event.detail > 1
        ) {

            event.preventDefault();

        }

    }
);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        closeCart();

        closeCheckout();

        closeMobileMenu();

    }
);


/* =========================================================
   STORAGE SYNC
========================================================= */

window.addEventListener(
    "storage",
    event => {

        /* =============================================
           PRODUCTS UPDATED FROM ADMIN
        ============================================= */

        if (
            event.key ===
            PRODUCTS_KEY
        ) {

            loadProducts();

            renderMenu();

        }


        /* =============================================
           CART UPDATED
        ============================================= */

        if (
            event.key ===
            CART_KEY
        ) {

            loadCart();

            updateCartUI();

        }

    }
);


/* =========================================================
   WINDOW RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth >
            900
        ) {

            closeMobileMenu();

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeApp() {

    /* =============================================
       PRODUCTS
    ============================================= */

    loadProducts();


    /* =============================================
       CART
    ============================================= */

    loadCart();


    /* =============================================
       RENDER
    ============================================= */

    renderMenu();

    updateCartUI();

    updateCheckoutSummary();

    updateActiveNavigation();


    console.log(
        "Murg Kabob customer website loaded."
    );

}


/* =========================================================
   START APP
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );

} else {

    initializeApp();

}