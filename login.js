/* =========================================================
   MURG KABOB — ADMIN LOGIN
   login.js
========================================================= */

"use strict";


/* =========================================================
   DEMO LOGIN DATA
   Муҳим: танҳо барои Demo.
========================================================= */

const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "2026";


/* =========================================================
   AUTH STORAGE KEYS
========================================================= */

const AUTH_KEY = "murgKabobAdminAuth";
const REMEMBER_KEY = "murgKabobRememberAdmin";


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
   ELEMENTS
========================================================= */

const loginForm = $("#loginForm");

const usernameInput = $("#username");
const passwordInput = $("#password");

const usernameWrapper = $("#usernameWrapper");
const passwordWrapper = $("#passwordWrapper");

const usernameStatus = $("#usernameStatus");

const usernameError = $("#usernameError");
const passwordError = $("#passwordError");

const rememberMe = $("#rememberMe");

const passwordToggle = $("#passwordToggle");

const loginButton = $("#loginButton");
const loginButtonText = $("#loginButtonText");

const loginError = $("#loginError");
const loginErrorText = $("#loginErrorText");

const loginSuccess = $("#loginSuccess");

const fillDemoButton = $("#fillDemoButton");

const loginToast = $("#loginToast");

const toastTitle = $("#toastTitle");
const toastText = $("#toastText");


/* =========================================================
   STATE
========================================================= */

let toastTimer = null;
let loginInProgress = false;


/* =========================================================
   SAFE STORAGE
========================================================= */

function getLocalStorage(key) {

    try {

        return localStorage.getItem(key);

    } catch (error) {

        console.error(
            "LocalStorage read error:",
            error
        );

        return null;

    }

}


function setLocalStorage(key, value) {

    try {

        localStorage.setItem(
            key,
            value
        );

        return true;

    } catch (error) {

        console.error(
            "LocalStorage write error:",
            error
        );

        return false;

    }

}


function removeLocalStorage(key) {

    try {

        localStorage.removeItem(key);

    } catch (error) {

        console.error(
            "LocalStorage remove error:",
            error
        );

    }

}


function getSessionStorage(key) {

    try {

        return sessionStorage.getItem(key);

    } catch (error) {

        console.error(
            "SessionStorage read error:",
            error
        );

        return null;

    }

}


function setSessionStorage(key, value) {

    try {

        sessionStorage.setItem(
            key,
            value
        );

        return true;

    } catch (error) {

        console.error(
            "SessionStorage write error:",
            error
        );

        return false;

    }

}


/* =========================================================
   CREATE AUTH DATA
========================================================= */

function createAuthData() {

    return JSON.stringify({

        authenticated: true,

        username: DEMO_USERNAME,

        loginAt:
            new Date().toISOString()

    });

}


/* =========================================================
   CHECK EXISTING AUTH
========================================================= */

function isAlreadyLoggedIn() {

    let authData = null;

    const localAuth =
        getLocalStorage(AUTH_KEY);

    const sessionAuth =
        getSessionStorage(AUTH_KEY);


    try {

        if (localAuth) {

            authData =
                JSON.parse(localAuth);

        } else if (sessionAuth) {

            authData =
                JSON.parse(sessionAuth);

        }

    } catch (error) {

        authData = null;

    }


    return Boolean(
        authData &&
        authData.authenticated === true &&
        authData.username === DEMO_USERNAME
    );

}


/* =========================================================
   REDIRECT TO ADMIN
========================================================= */

function redirectToAdmin() {

    window.location.href =
        "admin.html";

}


/* =========================================================
   CLEAR FIELD ERROR
========================================================= */

function clearUsernameError() {

    usernameWrapper
        ?.classList.remove(
            "error"
        );

    if (usernameError) {
        usernameError.textContent = "";
    }

}


function clearPasswordError() {

    passwordWrapper
        ?.classList.remove(
            "error"
        );

    if (passwordError) {
        passwordError.textContent = "";
    }

}


/* =========================================================
   SET FIELD ERROR
========================================================= */

function setUsernameError(message) {

    usernameWrapper
        ?.classList.add(
            "error"
        );

    usernameWrapper
        ?.classList.remove(
            "success"
        );

    if (usernameStatus) {
        usernameStatus.textContent = "";
    }

    if (usernameError) {
        usernameError.textContent =
            message;
    }

}


function setPasswordError(message) {

    passwordWrapper
        ?.classList.add(
            "error"
        );

    passwordWrapper
        ?.classList.remove(
            "success"
        );

    if (passwordError) {
        passwordError.textContent =
            message;
    }

}


/* =========================================================
   CLEAR GLOBAL MESSAGES
========================================================= */

function clearMessages() {

    loginError
        ?.classList.remove(
            "show"
        );

    loginSuccess
        ?.classList.remove(
            "show"
        );

}


/* =========================================================
   VALIDATE USERNAME
========================================================= */

function validateUsername() {

    clearUsernameError();

    const username =
        usernameInput
            ?.value
            .trim() || "";

    if (!username) {

        setUsernameError(
            "Логинро ворид кунед."
        );

        return false;

    }

    return true;

}


/* =========================================================
   VALIDATE PASSWORD
========================================================= */

function validatePassword() {

    clearPasswordError();

    const password =
        passwordInput
            ?.value || "";

    if (!password) {

        setPasswordError(
            "Паролро ворид кунед."
        );

        return false;

    }

    return true;

}


/* =========================================================
   VALIDATE FORM
========================================================= */

function validateForm() {

    const usernameValid =
        validateUsername();

    const passwordValid =
        validatePassword();

    return (
        usernameValid &&
        passwordValid
    );

}


/* =========================================================
   SHOW LOGIN ERROR
========================================================= */

function showLoginError(message) {

    loginSuccess
        ?.classList.remove(
            "show"
        );

    if (loginErrorText) {

        loginErrorText.textContent =
            message;

    }

    loginError
        ?.classList.add(
            "show"
        );

}


/* =========================================================
   SHOW LOGIN SUCCESS
========================================================= */

function showLoginSuccess() {

    loginError
        ?.classList.remove(
            "show"
        );

    loginSuccess
        ?.classList.add(
            "show"
        );

}


/* =========================================================
   LOGIN BUTTON LOADING
========================================================= */

function setLoginLoading(loading) {

    if (!loginButton) {
        return;
    }

    loginButton.disabled =
        loading;

    loginButton.classList.toggle(
        "loading",
        loading
    );

    if (loginButtonText) {

        loginButtonText.textContent =
            loading
                ? "Санҷида истодааст..."
                : "Ворид шудан";

    }

}


/* =========================================================
   SAVE AUTH
========================================================= */

function saveAuthentication() {

    const authData =
        createAuthData();

    if (
        rememberMe?.checked
    ) {

        /*
            Агар "Маро дар хотир нигоҳ дор"
            фаъол бошад, login дар localStorage
            мемонад.
        */

        setLocalStorage(
            AUTH_KEY,
            authData
        );

        try {

            sessionStorage.removeItem(
                AUTH_KEY
            );

        } catch (error) {

            console.error(error);

        }

        setLocalStorage(
            REMEMBER_KEY,
            "true"
        );

    } else {

        /*
            Агар Remember Me фаъол набошад,
            login танҳо дар sessionStorage мемонад.
        */

        setSessionStorage(
            AUTH_KEY,
            authData
        );

        removeLocalStorage(
            AUTH_KEY
        );

        removeLocalStorage(
            REMEMBER_KEY
        );

    }

}


/* =========================================================
   HANDLE LOGIN
========================================================= */

function handleLogin(event) {

    event.preventDefault();


    if (loginInProgress) {
        return;
    }


    clearMessages();


    if (!validateForm()) {
        return;
    }


    const username =
        usernameInput.value
            .trim();

    const password =
        passwordInput.value;


    loginInProgress = true;

    setLoginLoading(true);


    /*
        Каме delay танҳо барои эффекти Demo.
    */

    setTimeout(
        () => {

            const usernameCorrect =
                username ===
                DEMO_USERNAME;

            const passwordCorrect =
                password ===
                DEMO_PASSWORD;


            if (
                !usernameCorrect ||
                !passwordCorrect
            ) {

                loginInProgress =
                    false;

                setLoginLoading(
                    false
                );


                if (!usernameCorrect) {

                    setUsernameError(
                        "Логин нодуруст аст."
                    );

                }


                if (!passwordCorrect) {

                    setPasswordError(
                        "Парол нодуруст аст."
                    );

                }


                showLoginError(
                    "Логин ё парол нодуруст аст."
                );


                if (
                    !usernameCorrect
                ) {

                    usernameInput
                        ?.focus();

                } else {

                    passwordInput
                        ?.focus();

                }


                return;

            }


            /* =============================================
               SUCCESS
            ============================================= */

            usernameWrapper
                ?.classList.remove(
                    "error"
                );

            usernameWrapper
                ?.classList.add(
                    "success"
                );


            passwordWrapper
                ?.classList.remove(
                    "error"
                );

            passwordWrapper
                ?.classList.add(
                    "success"
                );


            if (usernameStatus) {

                usernameStatus.textContent =
                    "✓";

            }


            saveAuthentication();

            showLoginSuccess();


            if (loginButtonText) {

                loginButtonText.textContent =
                    "Муваффақ ✓";

            }


            /*
                Баъди login ба Admin Panel мегузарад.
            */

            setTimeout(
                redirectToAdmin,
                900
            );

        },
        600
    );

}


/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

function togglePassword() {

    if (!passwordInput) {
        return;
    }


    const isPassword =
        passwordInput.type ===
        "password";


    passwordInput.type =
        isPassword
            ? "text"
            : "password";


    if (passwordToggle) {

        passwordToggle.textContent =
            isPassword
                ? "🙈"
                : "👁️";


        passwordToggle.setAttribute(
            "aria-pressed",
            isPassword
                ? "true"
                : "false"
        );


        passwordToggle.setAttribute(
            "aria-label",
            isPassword
                ? "Пинҳон кардани парол"
                : "Нишон додани парол"
        );

    }

}


/* =========================================================
   FILL DEMO LOGIN
========================================================= */

function fillDemoCredentials() {

    if (usernameInput) {

        usernameInput.value =
            DEMO_USERNAME;

    }


    if (passwordInput) {

        passwordInput.value =
            DEMO_PASSWORD;

    }


    clearUsernameError();

    clearPasswordError();

    clearMessages();


    usernameWrapper
        ?.classList.add(
            "success"
        );


    passwordWrapper
        ?.classList.add(
            "success"
        );


    if (usernameStatus) {

        usernameStatus.textContent =
            "✓";

    }


    showToast(
        "⚡",
        "Demo пур шуд",
        "Логин ва парол автоматӣ ворид шуданд."
    );


    passwordInput
        ?.focus();

}


/* =========================================================
   COPY TEXT
========================================================= */

async function copyText(text) {

    try {

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard
                .writeText(text);

        } else {

            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value =
                text;

            textarea.style.position =
                "fixed";

            textarea.style.opacity =
                "0";

            textarea.style.pointerEvents =
                "none";

            document.body.appendChild(
                textarea
            );

            textarea.select();

            document.execCommand(
                "copy"
            );

            textarea.remove();

        }


        showToast(
            "📋",
            "Нусхабардорӣ шуд",
            "Маълумот нусхабардорӣ шуд."
        );


    } catch (error) {

        console.error(
            "Copy error:",
            error
        );


        showToast(
            "⚠️",
            "Нусхабардорӣ нашуд",
            "Маълумотро дастӣ нусхабардорӣ кунед."
        );

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    icon = "✅",
    title = "Тайёр",
    text = ""
) {

    if (!loginToast) {
        return;
    }


    const iconElement =
        loginToast.querySelector(
            ".login-toast-icon"
        );


    if (iconElement) {

        iconElement.textContent =
            icon;

    }


    if (toastTitle) {

        toastTitle.textContent =
            title;

    }


    if (toastText) {

        toastText.textContent =
            text;

    }


    loginToast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                loginToast
                    .classList.remove(
                        "show"
                    );

            },
            2800
        );

}


/* =========================================================
   USERNAME INPUT
========================================================= */

usernameInput
    ?.addEventListener(
        "input",
        () => {

            clearUsernameError();

            clearMessages();


            const value =
                usernameInput.value
                    .trim();


            if (!value) {

                usernameWrapper
                    ?.classList.remove(
                        "success"
                    );

                if (usernameStatus) {

                    usernameStatus.textContent =
                        "";

                }

                return;

            }


            if (
                value ===
                DEMO_USERNAME
            ) {

                usernameWrapper
                    ?.classList.add(
                        "success"
                    );

                if (usernameStatus) {

                    usernameStatus.textContent =
                        "✓";

                }

            } else {

                usernameWrapper
                    ?.classList.remove(
                        "success"
                    );

                if (usernameStatus) {

                    usernameStatus.textContent =
                        "";

                }

            }

        }
    );


/* =========================================================
   PASSWORD INPUT
========================================================= */

passwordInput
    ?.addEventListener(
        "input",
        () => {

            clearPasswordError();

            clearMessages();


            if (
                passwordInput.value
            ) {

                passwordWrapper
                    ?.classList.remove(
                        "error"
                    );

            }

        }
    );


/* =========================================================
   ENTER KEY
========================================================= */

usernameInput
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                passwordInput
                    ?.focus();

            }

        }
    );


/* =========================================================
   LOGIN FORM EVENT
========================================================= */

loginForm
    ?.addEventListener(
        "submit",
        handleLogin
    );


/* =========================================================
   PASSWORD TOGGLE EVENT
========================================================= */

passwordToggle
    ?.addEventListener(
        "click",
        togglePassword
    );


/* =========================================================
   FILL DEMO EVENT
========================================================= */

fillDemoButton
    ?.addEventListener(
        "click",
        fillDemoCredentials
    );


/* =========================================================
   COPY BUTTONS
========================================================= */

$$(".copy-button")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const value =
                        button.dataset.copy ||
                        "";

                    copyText(value);

                }
            );

        }
    );


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            clearMessages();

            loginToast
                ?.classList.remove(
                    "show"
                );

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeLogin() {

    /*
        Агар Admin аллакай login карда бошад,
        рост ба admin.html мегузарад.
    */

    const showLoginForm =
        new URLSearchParams(
            window.location.search
        ).get("signin") === "1";


    if (
        isAlreadyLoggedIn() &&
        !showLoginForm
    ) {

        redirectToAdmin();

        return;

    }


    /*
        Remember Me ҳолати пешинаро нишон медиҳад.
    */

    const remembered =
        getLocalStorage(
            REMEMBER_KEY
        );


    if (
        rememberMe &&
        remembered === "true"
    ) {

        rememberMe.checked =
            true;

    }


    /*
        Аввал cursor ба login.
    */

    setTimeout(
        () => {

            usernameInput
                ?.focus();

        },
        150
    );

}


/* =========================================================
   START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeLogin
    );

} else {

    initializeLogin();

}