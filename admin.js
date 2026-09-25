/* =========================================================
   MURG KABOB — ADMIN PANEL
   admin.js
========================================================= */

"use strict";


/* =========================================================
   STORAGE KEYS
========================================================= */

const ORDERS_KEY = "murgKabobOrders";
const PRODUCTS_KEY = "murgKabobProducts";

const AUTH_KEY = "murgKabobAdminAuth";
const REMEMBER_KEY = "murgKabobRememberAdmin";


/* =========================================================
   ORDER STATUSES
========================================================= */

const ORDER_STATUSES = [
    "Нав",
    "Тайёр мешавад",
    "Тайёр",
    "Расонида шуд"
];


/* =========================================================
   DEFAULT PRODUCTS
========================================================= */

const DEFAULT_PRODUCTS = [

    {
        id: "burger-1",
        name: "Бургери классикӣ",
        price: 35,
        category: "burger",
        image: "images/burger-1.jpg",
        description: "Гӯшт, салат, помидор, панир ва соуси махсус.",
        active: true
    },

    {
        id: "burger-2",
        name: "Чизбургер",
        price: 40,
        category: "burger",
        image: "images/burger-2.jpg",
        description: "Гӯшт, панир, сабзавот ва соуси махсус.",
        active: true
    },

    {
        id: "chicken-1",
        name: "Мурғи бирён",
        price: 55,
        category: "chicken",
        image: "images/chicken-1.jpg",
        description: "Мурғи болаззат бо қабати қирмиз ва хуштаъм.",
        active: true
    },

    {
        id: "chicken-2",
        name: "Мурғ бо картошка",
        price: 65,
        category: "chicken",
        image: "images/chicken-2.jpg",
        description: "Мурғи бирён бо картошка ва соуси махсус.",
        active: true
    },

    {
        id: "combo-1",
        name: "Комбо барои 2 нафар",
        price: 99,
        category: "combo",
        image: "images/combo.jpg",
        description: "Комбои болаззат барои ду нафар.",
        active: true
    },

    {
        id: "drink-1",
        name: "Нӯшокӣ",
        price: 10,
        category: "drink",
        image: "images/drink-1.jpg",
        description: "Нӯшокии хунук барои ҳамроҳии хӯрок.",
        active: true
    }

];


/* =========================================================
   STATE
========================================================= */

let orders = [];
let products = [];

let currentSection = "dashboard";
let currentReportPeriod = "today";

let deleteTarget = null;

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

    const number = Number(value);

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
   DATE
========================================================= */

function formatDateTime(value) {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString(
        "tg-TJ",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString(
        "tg-TJ",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* =========================================================
   SAFE STORAGE
========================================================= */

function readStorage(key, fallback = []) {

    try {

        const saved =
            localStorage.getItem(key);

        if (!saved) {
            return fallback;
        }

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            "Storage read error:",
            key,
            error
        );

        return fallback;

    }

}


function writeStorage(key, value) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    } catch (error) {

        console.error(
            "Storage write error:",
            key,
            error
        );

        return false;

    }

}


/* =========================================================
   AUTH — GET DATA
========================================================= */

function getAuthData() {

    let auth = null;

    try {

        const localAuth =
            localStorage.getItem(
                AUTH_KEY
            );

        const sessionAuth =
            sessionStorage.getItem(
                AUTH_KEY
            );

        const saved =
            localAuth ||
            sessionAuth;

        if (saved) {

            auth =
                JSON.parse(saved);

        }

    } catch (error) {

        console.error(
            "Auth read error:",
            error
        );

    }

    return auth;

}


/* =========================================================
   AUTH — CHECK
========================================================= */

function isAdminAuthenticated() {

    const auth =
        getAuthData();

    return Boolean(
        auth &&
        auth.authenticated === true &&
        auth.username === "admin"
    );

}


/* =========================================================
   AUTH — PROTECT ADMIN
========================================================= */

function protectAdminPage() {

    if (
        !isAdminAuthenticated()
    ) {

        window.location.replace(
            "login.html"
        );

        return false;

    }

    return true;

}


/* =========================================================
   LOGOUT
========================================================= */

function logoutAdmin() {

    try {

        localStorage.removeItem(
            AUTH_KEY
        );

        localStorage.removeItem(
            REMEMBER_KEY
        );

        sessionStorage.removeItem(
            AUTH_KEY
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

    window.location.replace(
        "login.html"
    );

}


/* =========================================================
   IMPORTANT:
   CHECK LOGIN IMMEDIATELY
========================================================= */

const adminIsAllowed =
    protectAdminPage();


/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(status) {

    return ORDER_STATUSES.includes(status)
        ? status
        : "Нав";

}


/* =========================================================
   NORMALIZE PAYMENT METHOD
========================================================= */

function normalizePaymentMethod(value) {

    return value === "Корт"
        ? "Корт"
        : "Нақдӣ";

}


/* =========================================================
   NORMALIZE PAYMENT STATUS
========================================================= */

function normalizePaymentStatus(
    value,
    paymentMethod
) {

    if (value) {
        return String(value);
    }

    return paymentMethod === "Корт"
        ? "Интизори пардохт"
        : "Ҳангоми қабул";

}


/* =========================================================
   NORMALIZE ORDER
========================================================= */

function normalizeOrder(
    order,
    index = 0
) {

    const paymentMethod =
        normalizePaymentMethod(
            order?.paymentMethod
        );

    const items =
        Array.isArray(order?.items)
            ? order.items.map(
                item => ({

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
                        numberValue(
                            item?.price
                        ),

                    quantity:
                        Math.max(
                            1,
                            numberValue(
                                item?.quantity
                            )
                        ),

                    subtotal:
                        numberValue(
                            item?.subtotal
                        ) ||
                        (
                            numberValue(
                                item?.price
                            ) *
                            Math.max(
                                1,
                                numberValue(
                                    item?.quantity
                                )
                            )
                        )

                })
            )
            : [];

    const subtotal =
        numberValue(
            order?.subtotal
        ) ||
        items.reduce(
            (total, item) =>
                total +
                numberValue(
                    item.subtotal
                ),
            0
        );

    const deliveryFee =
        numberValue(
            order?.deliveryFee
        );

    const total =
        numberValue(
            order?.total
        ) ||
        (
            subtotal +
            deliveryFee
        );

    return {

        id:
            String(
                order?.id ||
                `MK-${Date.now()}-${index}`
            ),

        customer: {

            name:
                String(
                    order?.customer?.name ||
                    "Муштарӣ"
                ),

            phone:
                String(
                    order?.customer?.phone ||
                    "—"
                ),

            address:
                String(
                    order?.customer?.address ||
                    "—"
                ),

            note:
                String(
                    order?.customer?.note ||
                    ""
                )

        },

        items,

        subtotal,

        deliveryFee,

        total,

        paymentMethod,

        paymentStatus:
            normalizePaymentStatus(
                order?.paymentStatus,
                paymentMethod
            ),

        status:
            normalizeStatus(
                order?.status
            ),

        createdAt:
            order?.createdAt ||
            new Date().toISOString()

    };

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
                "burger"
            ),

        image:
            String(
                product?.image ||
                "images/hero.jpg"
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
   LOAD ORDERS
========================================================= */

function loadOrders() {

    const saved =
        readStorage(
            ORDERS_KEY,
            []
        );

    orders =
        Array.isArray(saved)
            ? saved.map(
                normalizeOrder
            )
            : [];

}


/* =========================================================
   SAVE ORDERS
========================================================= */

function saveOrders() {

    writeStorage(
        ORDERS_KEY,
        orders
    );

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
            DEFAULT_PRODUCTS;

        writeStorage(
            PRODUCTS_KEY,
            saved
        );

    } else {

        let changed = false;

        saved = saved.map(product => {

            const nextImage =
                productJpgPath(
                    product?.image
                );

            if (
                nextImage &&
                nextImage !== product?.image
            ) {

                changed = true;

                return {
                    ...product,
                    image: nextImage
                };

            }

            return product;

        });

        if (changed) {

            writeStorage(
                PRODUCTS_KEY,
                saved
            );

        }

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
        "Дигар";

}


/* =========================================================
   SAFE IMAGE
========================================================= */

const JPG_BY_SVG_FILE = {

    "burger-1.svg": "images/burger-1.jpg",

    "burger-2.svg": "images/burger-2.jpg",

    "chicken-1.svg": "images/chicken-1.jpg",

    "chicken-2.svg": "images/chicken-2.jpg",

    "combo.svg": "images/combo.jpg",

    "drink-1.svg": "images/drink-1.jpg"

};


function productJpgPath(image) {

    const value =
        String(image || "")
            .trim()
            .replace(/^\.\//, "");

    const file =
        value
            .split("/")
            .pop()
            .split("?")[0]
            .toLowerCase();

    if (JPG_BY_SVG_FILE[file]) {

        return JPG_BY_SVG_FILE[file];

    }

    if (/\.svg(\?.*)?$/i.test(value)) {

        return "images/hero.jpg";

    }

    return value;

}


function safeImageSrc(value) {

    const image =
        productJpgPath(value);

    if (
        image.startsWith("images/") ||
        image.startsWith("https://") ||
        image.startsWith("http://")
    ) {

        return image;

    }

    return "images/hero.jpg";

}


/* =========================================================
   STATUS CLASS
========================================================= */

function statusClass(status) {

    switch (status) {

        case "Нав":
            return "status-new";

        case "Тайёр мешавад":
            return "status-cooking";

        case "Тайёр":
            return "status-ready";

        case "Расонида шуд":
            return "status-delivered";

        default:
            return "status-new";

    }

}


/* =========================================================
   PAYMENT CLASS
========================================================= */

function paymentClass(method) {

    return method === "Корт"
        ? "payment-card"
        : "payment-cash";

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    title = "Тайёр",
    text = "",
    icon = "✅"
) {

    const toast =
        $("#toast");

    if (!toast) {
        return;
    }

    const toastIcon =
        $("#toastIcon");

    const toastTitle =
        $("#toastTitle");

    const toastText =
        $("#toastText");

    if (toastIcon) {
        toastIcon.textContent = icon;
    }

    if (toastTitle) {
        toastTitle.textContent = title;
    }

    if (toastText) {
        toastText.textContent = text;
    }

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================================
   DATE / TIME TOPBAR
========================================================= */

function updateCurrentDateTime() {

    const now =
        new Date();

    const currentTime =
        $("#currentTime");

    const currentDate =
        $("#currentDate");

    if (currentTime) {

        currentTime.textContent =
            now.toLocaleTimeString(
                "tg-TJ",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

    }

    if (currentDate) {

        currentDate.textContent =
            now.toLocaleDateString(
                "tg-TJ",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                }
            );

    }

}


/* =========================================================
   SECTION CONFIG
========================================================= */

const SECTION_CONFIG = {

    dashboard: {
        id: "dashboardSection",
        title: "Dashboard"
    },

    orders: {
        id: "ordersSection",
        title: "Фармоишҳо"
    },

    "new-orders": {
        id: "newOrdersSection",
        title: "Фармоишҳои нав"
    },

    menu: {
        id: "menuSection",
        title: "Меню"
    },

    reports: {
        id: "reportsSection",
        title: "Ҳисобот"
    }

};


/* =========================================================
   SIDEBAR
========================================================= */

function openSidebar() {

    $("#sidebar")
        ?.classList.add(
            "active"
        );

    $("#sidebarOverlay")
        ?.classList.add(
            "active"
        );

}


function closeSidebar() {

    $("#sidebar")
        ?.classList.remove(
            "active"
        );

    $("#sidebarOverlay")
        ?.classList.remove(
            "active"
        );

}


/* =========================================================
   SHOW SECTION
========================================================= */

function showSection(sectionName) {

    if (
        !SECTION_CONFIG[
            sectionName
        ]
    ) {

        sectionName =
            "dashboard";

    }

    currentSection =
        sectionName;

    $$(".admin-section")
        .forEach(
            section => {

                section.classList.remove(
                    "active"
                );

            }
        );

    const config =
        SECTION_CONFIG[
            sectionName
        ];

    document
        .getElementById(
            config.id
        )
        ?.classList.add(
            "active"
        );

    $$(".nav-item")
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.section ===
                    sectionName
                );

            }
        );

    const pageTitle =
        $("#pageTitle");

    if (pageTitle) {

        pageTitle.textContent =
            config.title;

    }

    window.location.hash =
        sectionName;

    closeSidebar();


    if (
        sectionName ===
        "dashboard"
    ) {

        updateDashboard();

    }

    if (
        sectionName ===
        "orders"
    ) {

        renderOrders();

    }

    if (
        sectionName ===
        "new-orders"
    ) {

        renderNewOrders();

    }

    if (
        sectionName ===
        "menu"
    ) {

        renderProducts();

    }

    if (
        sectionName ===
        "reports"
    ) {

        renderReports();

    }

}


/* =========================================================
   COUNTS
========================================================= */

function updateNavigationCounts() {

    const newCount =
        orders.filter(
            order =>
                order.status === "Нав"
        ).length;

    const sidebarOrderCount =
        $("#sidebarOrderCount");

    const sidebarNewCount =
        $("#sidebarNewCount");

    const sidebarMenuCount =
        $("#sidebarMenuCount");

    const notificationCount =
        $("#notificationCount");

    if (sidebarOrderCount) {

        sidebarOrderCount.textContent =
            orders.length;

    }

    if (sidebarNewCount) {

        sidebarNewCount.textContent =
            newCount;

    }

    if (sidebarMenuCount) {

        sidebarMenuCount.textContent =
            products.length;

    }

    if (notificationCount) {

        notificationCount.textContent =
            newCount;

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const total =
        orders.length;

    const newOrders =
        orders.filter(
            order =>
                order.status === "Нав"
        ).length;

    const cooking =
        orders.filter(
            order =>
                order.status ===
                "Тайёр мешавад"
        ).length;

    const ready =
        orders.filter(
            order =>
                order.status ===
                "Тайёр"
        ).length;

    const delivered =
        orders.filter(
            order =>
                order.status ===
                "Расонида шуд"
        );

    const revenue =
        delivered.reduce(
            (sum, order) =>
                sum +
                numberValue(
                    order.total
                ),
            0
        );

    setText(
        "#totalOrders",
        total
    );

    setText(
        "#newOrders",
        newOrders
    );

    setText(
        "#cookingOrders",
        cooking
    );

    setText(
        "#readyOrders",
        ready
    );

    setText(
        "#totalRevenue",
        formatMoney(
            revenue
        )
    );


    setText(
        "#summaryNew",
        newOrders
    );

    setText(
        "#summaryCooking",
        cooking
    );

    setText(
        "#summaryReady",
        ready
    );

    setText(
        "#summaryDelivered",
        delivered.length
    );


    updateProgress(
        "#newProgress",
        newOrders,
        total
    );

    updateProgress(
        "#cookingProgress",
        cooking,
        total
    );

    updateProgress(
        "#readyProgress",
        ready,
        total
    );

    updateProgress(
        "#deliveredProgress",
        delivered.length,
        total
    );


    renderRecentOrders();

    updateNavigationCounts();

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(
    selector,
    value
) {

    const element =
        $(selector);

    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   PROGRESS
========================================================= */

function updateProgress(
    selector,
    count,
    total
) {

    const element =
        $(selector);

    if (!element) {
        return;
    }

    const percentage =
        total > 0
            ? Math.min(
                100,
                (
                    count /
                    total
                ) * 100
            )
            : 0;

    element.style.width =
        `${percentage}%`;

}


/* =========================================================
   RECENT ORDERS
========================================================= */

function renderRecentOrders() {

    const container =
        $("#recentOrders");

    if (!container) {
        return;
    }

    const recent =
        [...orders]
            .sort(
                (a, b) =>
                    new Date(
                        b.createdAt
                    ) -
                    new Date(
                        a.createdAt
                    )
            )
            .slice(
                0,
                5
            );

    if (
        recent.length === 0
    ) {

        container.innerHTML =
            emptyState(
                "📦",
                "Фармоиш нест",
                "Фармоишҳои нав дар ин ҷо нишон дода мешаванд."
            );

        return;

    }

    container.innerHTML =
        recent.map(
            order =>
                createRecentOrderHTML(
                    order
                )
        ).join("");

}


/* =========================================================
   RECENT ORDER HTML
========================================================= */

function createRecentOrderHTML(
    order
) {

    return `

        <button
            type="button"
            class="recent-order-item"
            data-view-order="${escapeHTML(
                order.id
            )}"
        >

            <div>

                <strong>
                    ${escapeHTML(
                        order.id
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        order.customer.name
                    )}
                </span>

            </div>

            <div>

                <span
                    class="status-badge ${statusClass(
                        order.status
                    )}"
                >
                    ${escapeHTML(
                        order.status
                    )}
                </span>

                <strong>
                    ${formatMoney(
                        order.total
                    )}
                </strong>

            </div>

        </button>

    `;

}


/* =========================================================
   ORDER FILTER
========================================================= */

function getFilteredOrders() {

    const search =
        (
            $("#orderSearch")
                ?.value ||
            ""
        )
            .trim()
            .toLowerCase();

    const status =
        $("#statusFilter")
            ?.value ||
        "all";

    return orders.filter(
        order => {

            const searchText =
                [
                    order.id,
                    order.customer.name,
                    order.customer.phone,
                    order.customer.address
                ]
                    .join(" ")
                    .toLowerCase();

            const searchMatch =
                !search ||
                searchText.includes(
                    search
                );

            const statusMatch =
                status === "all" ||
                order.status === status;

            return (
                searchMatch &&
                statusMatch
            );

        }
    );

}


/* =========================================================
   RENDER ORDERS
========================================================= */

function renderOrders() {

    const container =
        $("#ordersList");

    if (!container) {
        return;
    }

    const filtered =
        getFilteredOrders();

    if (
        filtered.length === 0
    ) {

        container.innerHTML =
            emptyState(
                "🔎",
                "Фармоиш ёфт нашуд",
                "Ҷустуҷӯ ё филтрро тағйир диҳед."
            );

        return;

    }

    container.innerHTML =
        filtered
            .map(
                createOrderCardHTML
            )
            .join("");

}


/* =========================================================
   ORDER CARD
========================================================= */

function createOrderCardHTML(
    order
) {

    const itemCount =
        order.items.reduce(
            (sum, item) =>
                sum +
                numberValue(
                    item.quantity
                ),
            0
        );

    const statusButtons =
        ORDER_STATUSES
            .map(
                status => `

                    <button
                        type="button"
                        class="order-status-button ${
                            order.status === status
                                ? "active"
                                : ""
                        }"
                        data-order-status="${escapeHTML(
                            status
                        )}"
                        data-order-id="${escapeHTML(
                            order.id
                        )}"
                    >
                        ${escapeHTML(
                            status
                        )}
                    </button>

                `
            )
            .join("");

    return `

        <article
            class="order-card"
            data-order-card="${escapeHTML(
                order.id
            )}"
        >

            <div class="order-card-header">

                <div>

                    <span class="order-number">
                        ${escapeHTML(
                            order.id
                        )}
                    </span>

                    <span class="order-date">
                        ${escapeHTML(
                            formatDateTime(
                                order.createdAt
                            )
                        )}
                    </span>

                </div>

                <span
                    class="status-badge ${statusClass(
                        order.status
                    )}"
                >
                    ${escapeHTML(
                        order.status
                    )}
                </span>

            </div>


            <div class="order-card-body">

                <div class="order-info-block">

                    <span>
                        Муштарӣ
                    </span>

                    <strong>
                        ${escapeHTML(
                            order.customer.name
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            order.customer.phone
                        )}
                    </small>

                </div>


                <div class="order-info-block">

                    <span>
                        Суроға
                    </span>

                    <strong>
                        ${escapeHTML(
                            order.customer.address
                        )}
                    </strong>

                </div>


                <div class="order-info-block">

                    <span>
                        Маҳсулот
                    </span>

                    <strong>
                        ${itemCount} дона
                    </strong>

                    <small>
                        ${order.items.length} намуд
                    </small>

                </div>


                <div class="order-info-block">

                    <span>
                        Пардохт
                    </span>

                    <strong>
                        ${escapeHTML(
                            order.paymentMethod
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            order.paymentStatus
                        )}
                    </small>

                </div>


                <div class="order-info-block">

                    <span>
                        Ҷамъ
                    </span>

                    <strong>
                        ${formatMoney(
                            order.total
                        )}
                    </strong>

                </div>

            </div>


            <div class="order-status-actions">

                ${statusButtons}

            </div>


            <div class="order-card-actions">

                <button
                    type="button"
                    class="secondary-admin-button"
                    data-view-order="${escapeHTML(
                        order.id
                    )}"
                >
                    Дидан
                </button>

                <button
                    type="button"
                    class="danger-admin-button"
                    data-delete-order="${escapeHTML(
                        order.id
                    )}"
                >
                    Нест кардан
                </button>

            </div>

        </article>

    `;

}


/* =========================================================
   NEW ORDERS
========================================================= */

function renderNewOrders() {

    const container =
        $("#newOrdersList");

    if (!container) {
        return;
    }

    const newOrders =
        orders.filter(
            order =>
                order.status === "Нав"
        );

    if (
        newOrders.length === 0
    ) {

        container.innerHTML =
            emptyState(
                "✅",
                "Фармоиши нав нест",
                "Ҳамаи фармоишҳои нав дида шудаанд."
            );

        return;

    }

    container.innerHTML =
        newOrders
            .map(
                createOrderCardHTML
            )
            .join("");

}


/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

function updateOrderStatus(
    orderId,
    status
) {

    if (
        !ORDER_STATUSES.includes(
            status
        )
    ) {
        return;
    }

    const order =
        orders.find(
            item =>
                item.id === orderId
        );

    if (!order) {
        return;
    }

    order.status =
        status;

    saveOrders();

    refreshAll();

    showToast(
        "Ҳолат тағйир ёфт",
        `${order.id} → ${status}`,
        "📦"
    );

}


/* =========================================================
   ORDER MODAL
========================================================= */

function openOrderModal(
    orderId
) {

    const order =
        orders.find(
            item =>
                item.id === orderId
        );

    if (!order) {
        return;
    }

    const modal =
        $("#orderModal");

    const body =
        $("#orderModalBody");

    const title =
        $("#modalOrderId");

    if (title) {

        title.textContent =
            order.id;

    }

    if (body) {

        body.innerHTML =
            createOrderDetailHTML(
                order
            );

    }

    modal
        ?.classList.add(
            "active"
        );

    document.body
        .classList.add(
            "modal-open"
        );

}

function createOrderDetailHTML(
    order
) {

    const items =
        order.items
            .map(
                item => `

                    <div class="order-detail-item">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    item.name
                                )}
                            </strong>

                            <span>
                                ${item.quantity}
                                ×
                                ${formatMoney(
                                    item.price
                                )}
                            </span>

                        </div>

                        <strong>
                            ${formatMoney(
                                item.subtotal
                            )}
                        </strong>

                    </div>

                `
            )
            .join("");

    return `

        <div class="order-detail-grid">

            <div class="order-detail-box">

                <span>
                    Муштарӣ
                </span>

                <strong>
                    ${escapeHTML(
                        order.customer.name
                    )}
                </strong>

            </div>


            <div class="order-detail-box">

                <span>
                    Телефон
                </span>

                <strong>
                    ${escapeHTML(
                        order.customer.phone
                    )}
                </strong>

            </div>


            <div class="order-detail-box">

                <span>
                    Суроға
                </span>

                <strong>
                    ${escapeHTML(
                        order.customer.address
                    )}
                </strong>

            </div>


            <div class="order-detail-box">

                <span>
                    Пардохт
                </span>

                <strong>
                    ${escapeHTML(
                        order.paymentMethod
                    )}
                </strong>

            </div>

        </div>


        ${
            order.customer.note
                ? `

                    <div class="order-note">

                        <span>
                            Эзоҳ
                        </span>

                        <p>
                            ${escapeHTML(
                                order.customer.note
                            )}
                        </p>

                    </div>

                `
                : ""
        }


        <div class="order-detail-products">

            <h4>
                Маҳсулот
            </h4>

            ${items}

        </div>


        <div class="order-detail-summary">

            <div>

                <span>
                    Маҳсулот
                </span>

                <strong>
                    ${formatMoney(
                        order.subtotal
                    )}
                </strong>

            </div>

            <div>

                <span>
                    Доставка
                </span>

                <strong>
                    ${formatMoney(
                        order.deliveryFee
                    )}
                </strong>

            </div>

            <div class="order-detail-total">

                <span>
                    Ҷамъ
                </span>

                <strong>
                    ${formatMoney(
                        order.total
                    )}
                </strong>

            </div>

        </div>

    `;

}


/* =========================================================
   PRODUCTS FILTER
========================================================= */

function getFilteredProducts() {

    const search =
        (
            $("#productSearch")
                ?.value ||
            ""
        )
            .trim()
            .toLowerCase();

    const category =
        $("#productCategoryFilter")
            ?.value ||
        "all";

    return products.filter(
        product => {

            const searchMatch =
                !search ||
                product.name
                    .toLowerCase()
                    .includes(search) ||
                product.description
                    .toLowerCase()
                    .includes(search);

            const categoryMatch =
                category === "all" ||
                product.category ===
                category;

            return (
                searchMatch &&
                categoryMatch
            );

        }
    );

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    const grid =
        $("#adminProductsGrid");

    if (!grid) {
        return;
    }

    const filtered =
        getFilteredProducts();

    if (
        filtered.length === 0
    ) {

        grid.innerHTML =
            emptyState(
                "🍔",
                "Маҳсулот ёфт нашуд",
                "Маҳсулоти нав илова кунед."
            );

        return;

    }

    grid.innerHTML =
        filtered
            .map(
                product => `

                    <article class="admin-product-card">

                        <div class="admin-product-image">

                            <img
                                src="${escapeHTML(
                                    safeImageSrc(
                                        product.image
                                    )
                                )}"
                                alt="${escapeHTML(
                                    product.name
                                )}"
                                onerror="this.onerror=null;this.src='images/hero.jpg'"
                            >

                            <span
                                class="product-status ${
                                    product.active
                                        ? "active"
                                        : "inactive"
                                }"
                            >
                                ${
                                    product.active
                                        ? "Фаъол"
                                        : "Хомӯш"
                                }
                            </span>

                        </div>


                        <div class="admin-product-content">

                            <span class="admin-product-category">
                                ${escapeHTML(
                                    categoryName(
                                        product.category
                                    )
                                )}
                            </span>

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

                            <strong class="admin-product-price">
                                ${formatMoney(
                                    product.price
                                )}
                            </strong>

                        </div>


                        <div class="admin-product-footer">

                            <button
                                type="button"
                                class="secondary-admin-button"
                                data-edit-product="${escapeHTML(
                                    product.id
                                )}"
                            >
                                Таҳрир
                            </button>

                            <button
                                type="button"
                                class="product-toggle-button"
                                data-toggle-product="${escapeHTML(
                                    product.id
                                )}"
                            >
                                ${
                                    product.active
                                        ? "Хомӯш кардан"
                                        : "Фаъол кардан"
                                }
                            </button>

                            <button
                                type="button"
                                class="danger-admin-button"
                                data-delete-product="${escapeHTML(
                                    product.id
                                )}"
                            >
                                Нест кардан
                            </button>

                        </div>

                    </article>

                `
            )
            .join("");

}


/* =========================================================
   PRODUCT MODAL
========================================================= */

function openProductModal(
    productId = null
) {

    const modal =
        $("#productModal");

    const form =
        $("#productForm");

    form?.reset();

    setText(
        "#productModalTitle",
        productId
            ? "Таҳрири маҳсулот"
            : "Маҳсулоти нав"
    );

    setInputValue(
        "#productId",
        ""
    );

    setInputValue(
        "#productName",
        ""
    );

    setInputValue(
        "#productPrice",
        ""
    );

    setInputValue(
        "#productCategory",
        "burger"
    );

    setInputValue(
        "#productImage",
        ""
    );

    setInputValue(
        "#productDescription",
        ""
    );

    const activeInput =
        $("#productActive");

    if (activeInput) {

        activeInput.checked =
            true;

    }


    if (productId) {

        const product =
            products.find(
                item =>
                    item.id === productId
            );

        if (!product) {
            return;
        }

        setInputValue(
            "#productId",
            product.id
        );

        setInputValue(
            "#productName",
            product.name
        );

        setInputValue(
            "#productPrice",
            product.price
        );

        setInputValue(
            "#productCategory",
            product.category
        );

        setInputValue(
            "#productImage",
            product.image
        );

        setInputValue(
            "#productDescription",
            product.description
        );

        if (activeInput) {

            activeInput.checked =
                product.active;

        }

    }


    modal
        ?.classList.add(
            "active"
        );

    document.body
        .classList.add(
            "modal-open"
        );

}

function setInputValue(
    selector,
    value
) {

    const input =
        $(selector);

    if (input) {

        input.value =
            value;

    }

}


/* =========================================================
   SAVE PRODUCT FORM
========================================================= */

function handleProductSubmit(
    event
) {

    event.preventDefault();

    const id =
        $("#productId")
            ?.value
            .trim();

    const name =
        $("#productName")
            ?.value
            .trim();

    const price =
        numberValue(
            $("#productPrice")
                ?.value
        );

    const category =
        $("#productCategory")
            ?.value ||
        "burger";

    const image =
        $("#productImage")
            ?.value
            .trim() ||
        "images/hero.jpg";

    const description =
        $("#productDescription")
            ?.value
            .trim() ||
        "";

    const active =
        $("#productActive")
            ?.checked !== false;


    if (!name) {

        showToast(
            "Хато",
            "Номи маҳсулотро ворид кунед.",
            "⚠️"
        );

        return;

    }


    if (
        price <= 0
    ) {

        showToast(
            "Хато",
            "Нархи маҳсулотро дуруст ворид кунед.",
            "⚠️"
        );

        return;

    }


    if (id) {

        const product =
            products.find(
                item =>
                    item.id === id
            );

        if (!product) {
            return;
        }

        product.name =
            name;

        product.price =
            price;

        product.category =
            category;

        product.image =
            image;

        product.description =
            description;

        product.active =
            active;

    } else {

        products.unshift({

            id:
                `product-${Date.now()}`,

            name,

            price,

            category,

            image,

            description,

            active

        });

    }


    saveProducts();

    closeModal(
        "productModal"
    );

    refreshAll();


    showToast(
        "Меню нав шуд",
        "Тағйирот нигоҳ дошта шуд.",
        "🍔"
    );

}


/* =========================================================
   TOGGLE PRODUCT
========================================================= */

function toggleProduct(
    productId
) {

    const product =
        products.find(
            item =>
                item.id === productId
        );

    if (!product) {
        return;
    }

    product.active =
        !product.active;

    saveProducts();

    refreshAll();

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal(id) {

    document
        .getElementById(id)
        ?.classList.remove(
            "active"
        );

    if (
        !document.querySelector(
            ".modal.active"
        )
    ) {

        document.body
            .classList.remove(
                "modal-open"
            );

    }

}


/* =========================================================
   DELETE CONFIRM
========================================================= */

function openDeleteModal(
    type,
    id,
    title,
    text
) {

    deleteTarget = {
        type,
        id
    };

    setText(
        "#deleteTitle",
        title
    );

    setText(
        "#deleteText",
        text
    );

    $("#deleteModal")
        ?.classList.add(
            "active"
        );

    document.body
        .classList.add(
            "modal-open"
        );

}


/* =========================================================
   CONFIRM DELETE
========================================================= */

function confirmDelete() {

    if (!deleteTarget) {
        return;
    }

    if (
        deleteTarget.type ===
        "order"
    ) {

        orders =
            orders.filter(
                order =>
                    order.id !==
                    deleteTarget.id
            );

        saveOrders();

    }


    if (
        deleteTarget.type ===
        "product"
    ) {

        products =
            products.filter(
                product =>
                    product.id !==
                    deleteTarget.id
            );

        saveProducts();

    }


    deleteTarget = null;

    closeModal(
        "deleteModal"
    );

    refreshAll();

    showToast(
        "Нест карда шуд",
        "Маълумот нест карда шуд.",
        "🗑️"
    );

}


/* =========================================================
   REPORT DATE RANGE
========================================================= */

function getReportRange(
    period
) {

    const now =
        new Date();

    let start =
        new Date(now);

    let end =
        new Date(now);


    end.setHours(
        23,
        59,
        59,
        999
    );


    if (
        period ===
        "today"
    ) {

        start.setHours(
            0,
            0,
            0,
            0
        );

    }


    if (
        period ===
        "week"
    ) {

        const day =
            start.getDay();

        const diff =
            day === 0
                ? -6
                : 1 - day;

        start.setDate(
            start.getDate() +
            diff
        );

        start.setHours(
            0,
            0,
            0,
            0
        );

    }


    if (
        period ===
        "month"
    ) {

        start =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

    }


    return {
        start,
        end
    };

}


/* =========================================================
   GET REPORT ORDERS
========================================================= */

function getReportOrders() {

    const {
        start,
        end
    } =
        getReportRange(
            currentReportPeriod
        );

    return orders.filter(
        order => {

            const date =
                new Date(
                    order.createdAt
                );

            return (
                date >= start &&
                date <= end
            );

        }
    );

}


/* =========================================================
   REPORTS
========================================================= */

function renderReports() {

    const reportOrders =
        getReportOrders();

    const delivered =
        reportOrders.filter(
            order =>
                order.status ===
                "Расонида шуд"
        );

    const cashRevenue =
        delivered
            .filter(
                order =>
                    order.paymentMethod ===
                    "Нақдӣ"
            )
            .reduce(
                (sum, order) =>
                    sum +
                    numberValue(
                        order.total
                    ),
                0
            );

    const cardRevenue =
        delivered
            .filter(
                order =>
                    order.paymentMethod ===
                    "Корт"
            )
            .reduce(
                (sum, order) =>
                    sum +
                    numberValue(
                        order.total
                    ),
                0
            );

    const totalRevenue =
        cashRevenue +
        cardRevenue;


    setText(
        "#reportTotalOrders",
        reportOrders.length
    );

    setText(
        "#reportDeliveredOrders",
        delivered.length
    );

    setText(
        "#reportCashRevenue",
        formatMoney(
            cashRevenue
        )
    );

    setText(
        "#reportCardRevenue",
        formatMoney(
            cardRevenue
        )
    );

    setText(
        "#reportTotalRevenue",
        formatMoney(
            totalRevenue
        )
    );

    setText(
        "#reportCashAmount",
        formatMoney(
            cashRevenue
        )
    );

    setText(
        "#reportCardAmount",
        formatMoney(
            cardRevenue
        )
    );


    setText(
        "#reportNewCount",
        reportOrders.filter(
            order =>
                order.status === "Нав"
        ).length
    );

    setText(
        "#reportCookingCount",
        reportOrders.filter(
            order =>
                order.status ===
                "Тайёр мешавад"
        ).length
    );

    setText(
        "#reportReadyCount",
        reportOrders.filter(
            order =>
                order.status ===
                "Тайёр"
        ).length
    );

    setText(
        "#reportDeliveredCount",
        delivered.length
    );


    const periodNames = {

        today:
            "Имрӯз",

        week:
            "Ин ҳафта",

        month:
            "Ин моҳ"

    };


    setText(
        "#reportPeriodText",
        periodNames[
            currentReportPeriod
        ]
    );


    renderReportTable(
        reportOrders
    );

}


/* =========================================================
   REPORT TABLE
========================================================= */

function renderReportTable(
    reportOrders
) {

    const body =
        $("#reportTableBody");

    const empty =
        $("#reportEmpty");

    if (!body) {
        return;
    }


    if (
        reportOrders.length === 0
    ) {

        body.innerHTML = "";

        empty?.classList.add(
            "show"
        );

        return;

    }


    empty?.classList.remove(
        "show"
    );


    body.innerHTML =
        reportOrders
            .map(
                order => `

                    <tr>

                        <td>
                            ${escapeHTML(
                                order.id
                            )}
                        </td>

                        <td>

                            <div class="report-customer">

                                <strong>
                                    ${escapeHTML(
                                        order.customer.name
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        order.customer.phone
                                    )}
                                </span>

                            </div>

                        </td>

                        <td>
                            ${escapeHTML(
                                formatDateTime(
                                    order.createdAt
                                )
                            )}
                        </td>

                        <td>

                            <span
                                class="status-badge ${statusClass(
                                    order.status
                                )}"
                            >
                                ${escapeHTML(
                                    order.status
                                )}
                            </span>

                        </td>

                        <td>

                            <span
                                class="payment-badge ${paymentClass(
                                    order.paymentMethod
                                )}"
                            >
                                ${escapeHTML(
                                    order.paymentMethod
                                )}
                            </span>

                        </td>

                        <td>
                            <strong>
                                ${formatMoney(
                                    order.total
                                )}
                            </strong>
                        </td>

                    </tr>

                `
            )
            .join("");

}


/* =========================================================
   PRINT REPORT
========================================================= */

function printReport() {

    const reportOrders =
        getReportOrders();

    const periodNames = {

        today:
            "Имрӯз",

        week:
            "Ин ҳафта",

        month:
            "Ин моҳ"

    };

    const delivered =
        reportOrders.filter(
            order =>
                order.status ===
                "Расонида шуд"
        );

    const revenue =
        delivered.reduce(
            (sum, order) =>
                sum +
                numberValue(
                    order.total
                ),
            0
        );


    const rows =
        reportOrders
            .map(
                order => `

                    <tr>

                        <td>
                            ${escapeHTML(
                                order.id
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                order.customer.name
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                formatDateTime(
                                    order.createdAt
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                order.status
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                order.paymentMethod
                            )}
                        </td>

                        <td>
                            ${formatMoney(
                                order.total
                            )}
                        </td>

                    </tr>

                `
            )
            .join("");


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=1000,height=800"
        );


    if (!printWindow) {

        showToast(
            "Чоп нашуд",
            "Popup-ро иҷозат диҳед.",
            "⚠️"
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html lang="tg">

        <head>

            <meta charset="UTF-8">

            <title>
                Murg Kabob — Ҳисобот
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    font-family:
                        Arial,
                        sans-serif;

                    padding: 30px;

                    color: #111;
                }

                h1 {
                    margin-bottom: 5px;
                }

                .subtitle {
                    color: #666;
                    margin-bottom: 25px;
                }

                .summary {
                    display: flex;
                    gap: 30px;
                    margin-bottom: 25px;
                }

                .summary div {
                    padding: 15px;
                    background: #f5f5f5;
                    border-radius: 10px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th,
                td {
                    padding: 10px;
                    border-bottom:
                        1px solid #ddd;

                    text-align: left;
                    font-size: 12px;
                }

                th {
                    background: #111;
                    color: white;
                }

                @media print {

                    body {
                        padding: 0;
                    }

                }

            </style>

        </head>

        <body>

            <h1>
                Murg Kabob
            </h1>

            <div class="subtitle">
                Ҳисобот —
                ${periodNames[
                    currentReportPeriod
                ]}
            </div>


            <div class="summary">

                <div>
                    Фармоишҳо:
                    <strong>
                        ${reportOrders.length}
                    </strong>
                </div>

                <div>
                    Расонида шуд:
                    <strong>
                        ${delivered.length}
                    </strong>
                </div>

                <div>
                    Даромад:
                    <strong>
                        ${formatMoney(
                            revenue
                        )}
                    </strong>
                </div>

            </div>


            <table>

                <thead>

                    <tr>

                        <th>
                            ID
                        </th>

                        <th>
                            Муштарӣ
                        </th>

                        <th>
                            Сана
                        </th>

                        <th>
                            Ҳолат
                        </th>

                        <th>
                            Пардохт
                        </th>

                        <th>
                            Ҷамъ
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${rows}

                </tbody>

            </table>


            <script>

                window.onload = function () {

                    window.print();

                };

            <\/script>

        </body>

        </html>

    `);

    printWindow.document.close();

}


/* =========================================================
   EMPTY STATE
========================================================= */

function emptyState(
    icon,
    title,
    text
) {

    return `

        <div class="empty-state">

            <div class="empty-state-icon">
                ${icon}
            </div>

            <h3>
                ${escapeHTML(
                    title
                )}
            </h3>

            <p>
                ${escapeHTML(
                    text
                )}
            </p>

        </div>

    `;

}


/* =========================================================
   REFRESH ALL
========================================================= */

function refreshAll() {

    updateNavigationCounts();

    updateDashboard();

    renderOrders();

    renderNewOrders();

    renderProducts();

    renderReports();

}


/* =========================================================
   GLOBAL CLICK EVENTS
========================================================= */

document.addEventListener(
    "click",
    event => {

        /* NAVIGATION */

        const navItem =
            event.target.closest(
                ".nav-item[data-section]"
            );

        if (navItem) {

            event.preventDefault();

            showSection(
                navItem.dataset.section
            );

            return;

        }


        /* VIEW ORDER */

        const viewOrder =
            event.target.closest(
                "[data-view-order]"
            );

        if (viewOrder) {

            openOrderModal(
                viewOrder.dataset.viewOrder
            );

            return;

        }


        /* STATUS */

        const statusButton =
            event.target.closest(
                "[data-order-status]"
            );

        if (statusButton) {

            updateOrderStatus(
                statusButton.dataset.orderId,
                statusButton.dataset.orderStatus
            );

            return;

        }


        /* DELETE ORDER */

        const deleteOrder =
            event.target.closest(
                "[data-delete-order]"
            );

        if (deleteOrder) {

            openDeleteModal(
                "order",
                deleteOrder.dataset.deleteOrder,
                "Фармоиш нест карда шавад?",
                "Ин амалро баргардонидан мумкин нест."
            );

            return;

        }


        /* EDIT PRODUCT */

        const editProduct =
            event.target.closest(
                "[data-edit-product]"
            );

        if (editProduct) {

            openProductModal(
                editProduct.dataset.editProduct
            );

            return;

        }


        /* TOGGLE PRODUCT */

        const toggleProductButton =
            event.target.closest(
                "[data-toggle-product]"
            );

        if (toggleProductButton) {

            toggleProduct(
                toggleProductButton.dataset.toggleProduct
            );

            return;

        }


        /* DELETE PRODUCT */

        const deleteProduct =
            event.target.closest(
                "[data-delete-product]"
            );

        if (deleteProduct) {

            openDeleteModal(
                "product",
                deleteProduct.dataset.deleteProduct,
                "Маҳсулот нест карда шавад?",
                "Маҳсулот аз меню нест карда мешавад."
            );

            return;

        }


        /* LOGOUT */

        const logoutButton =
            event.target.closest(
                "#logoutButton, [data-admin-logout]"
            );

        if (logoutButton) {

            event.preventDefault();

            logoutAdmin();

        }

    }
);


/* =========================================================
   STATIC EVENTS
========================================================= */

$("#menuToggle")
    ?.addEventListener(
        "click",
        openSidebar
    );


$("#sidebarClose")
    ?.addEventListener(
        "click",
        closeSidebar
    );


$("#sidebarOverlay")
    ?.addEventListener(
        "click",
        closeSidebar
    );


$("#showAllOrders")
    ?.addEventListener(
        "click",
        () => {

            showSection(
                "orders"
            );

        }
    );


$("#refreshOrders")
    ?.addEventListener(
        "click",
        () => {

            loadOrders();

            refreshAll();

            showToast(
                "Нав шуд",
                "Фармоишҳо нав карда шуданд.",
                "🔄"
            );

        }
    );


$("#notificationButton")
    ?.addEventListener(
        "click",
        () => {

            showSection(
                "new-orders"
            );

        }
    );


$("#addProductButton")
    ?.addEventListener(
        "click",
        () => {

            openProductModal();

        }
    );


$("#closeOrderModal")
    ?.addEventListener(
        "click",
        () => {

            closeModal(
                "orderModal"
            );

        }
    );


$("#closeProductModal")
    ?.addEventListener(
        "click",
        () => {

            closeModal(
                "productModal"
            );

        }
    );


$("#cancelProductButton")
    ?.addEventListener(
        "click",
        () => {

            closeModal(
                "productModal"
            );

        }
    );


$("#cancelDelete")
    ?.addEventListener(
        "click",
        () => {

            deleteTarget = null;

            closeModal(
                "deleteModal"
            );

        }
    );


$("#confirmDelete")
    ?.addEventListener(
        "click",
        confirmDelete
    );


$("#productForm")
    ?.addEventListener(
        "submit",
        handleProductSubmit
    );


$("#orderSearch")
    ?.addEventListener(
        "input",
        renderOrders
    );


$("#statusFilter")
    ?.addEventListener(
        "change",
        renderOrders
    );


$("#productSearch")
    ?.addEventListener(
        "input",
        renderProducts
    );


$("#productCategoryFilter")
    ?.addEventListener(
        "change",
        renderProducts
    );


$("#printReportButton")
    ?.addEventListener(
        "click",
        printReport
    );


/* =========================================================
   REPORT PERIOD BUTTONS
========================================================= */

$$(".report-period-button")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    currentReportPeriod =
                        button.dataset.period ||
                        "today";

                    $$(".report-period-button")
                        .forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );

                    button.classList.add(
                        "active"
                    );

                    renderReports();

                }
            );

        }
    );


/* =========================================================
   MODAL BACKDROP
========================================================= */

[
    "orderModal",
    "productModal",
    "deleteModal"
]
.forEach(
    id => {

        const modal =
            document.getElementById(
                id
            );

        modal?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    if (
                        id ===
                        "deleteModal"
                    ) {

                        deleteTarget =
                            null;

                    }

                    closeModal(
                        id
                    );

                }

            }
        );

    }
);


/* =========================================================
   ESC
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

        closeSidebar();

        closeModal(
            "orderModal"
        );

        closeModal(
            "productModal"
        );

        closeModal(
            "deleteModal"
        );

    }
);


/* =========================================================
   STORAGE SYNC
========================================================= */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key ===
            ORDERS_KEY
        ) {

            loadOrders();

            refreshAll();

        }


        if (
            event.key ===
            PRODUCTS_KEY
        ) {

            loadProducts();

            refreshAll();

        }


        /*
           Агар login аз tab-и дигар нест карда шавад,
           Admin Panel баста мешавад.
        */

        if (
            event.key ===
            AUTH_KEY &&
            !isAdminAuthenticated()
        ) {

            window.location.replace(
                "login.html"
            );

        }

    }
);


/* =========================================================
   HASH CHANGE
========================================================= */

window.addEventListener(
    "hashchange",
    () => {

        const section =
            window.location.hash
                .replace(
                    "#",
                    ""
                );

        if (
            SECTION_CONFIG[
                section
            ]
        ) {

            showSection(
                section
            );

        }

    }
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth >
            850
        ) {

            closeSidebar();

        }

    }
);


/* =========================================================
   INITIALIZE ADMIN
========================================================= */

function initializeAdmin() {

    /*
       Боз як бор login-ро месанҷем.
    */

    if (
        !isAdminAuthenticated()
    ) {

        window.location.replace(
            "login.html"
        );

        return;

    }


    /* LOAD DATA */

    loadOrders();

    loadProducts();


    /* DATE / TIME */

    updateCurrentDateTime();

    setInterval(
        updateCurrentDateTime,
        30000
    );


    /* INITIAL SECTION */

    const hashSection =
        window.location.hash
            .replace(
                "#",
                ""
            );

    const firstSection =
        SECTION_CONFIG[
            hashSection
        ]
            ? hashSection
            : "dashboard";


    showSection(
        firstSection
    );


    /* REFRESH */

    refreshAll();


    console.log(
        "Murg Kabob Admin Panel loaded."
    );

}


/* =========================================================
   START
========================================================= */

if (adminIsAllowed) {

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeAdmin
        );

    } else {

        initializeAdmin();

    }

}