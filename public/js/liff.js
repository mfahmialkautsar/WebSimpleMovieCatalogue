import { sleep } from "./utility.js";

let liffProfile;
let liffStarted = false;
startLiff();

async function startLiff() {
    liffStarted = true;
    const useNodeJS = true; // if you are not using a node server, set this value to false

    // DO NOT CHANGE THIS
    let myLiffId = "";

    // if node is used, fetch the environment variable and pass it to the LIFF method
    // otherwise, pass defaultLiffId
    if (useNodeJS) {
        await fetch("/send-id")
            .then(function (reqResponse) {
                return reqResponse.json();
            })
            .then(async function (jsonResponse) {
                myLiffId = jsonResponse.id;
                await initializeLiffOrDie(myLiffId);
                if (location.search.match(/\/?code=.+/)) {
                    alert(
                        "If you've just tried to log in and haven't logged in yet (it's a bug from LINE), just log in again.\nElse, ignore this message."
                    );
                }
            })
            .catch(function (error) {
                liffStarted = false;
            });
    } else {
        await initializeLiffOrDie(myLiffId);
    }
}

/**
 * Check if myLiffId is null. If null do not initiate liff.
 * @param {string} myLiffId The LIFF ID of the selected element
 */

async function initializeLiffOrDie(myLiffId) {
    if (myLiffId) {
        await initializeLiff(myLiffId);
    }
}

/**
 * Initialize LIFF
 * @param {string} myLiffId The LIFF ID of the selected element
 */
async function initializeLiff(myLiffId) {
    await liff
        .init({
            liffId: myLiffId,
        })
        .then(async () => {
            // start to use LIFF's api
            await initializeApp();
        })
        .catch((err) => {});
}

/**
 * Initialize the app by calling functions handling individual app components
 */
async function initializeApp() {
    // check if the user is logged in/out, and disable inappropriate button
    if (liff.isLoggedIn()) {
        liffProfile = await liff.getProfile();
        setupProfile();
    } else {
        const loginButton = document.getElementById("login");
        loginButton.innerHTML =
            '<div id="loginButton" class="btn nodecor-link">Login</div>';
        loginButton.classList.remove("hidden");
    }

    liffStarted = false;
    registerButtonHandlers();
}

function registerButtonHandlers() {
    try {
        document
            .getElementById("loginButton")
            .addEventListener("click", function () {
                if (liff.isLoggedIn()) {
                    liff.logout();
                    window.location.reload();
                } else {
                    liff.login();
                }
            });
    } catch (error) {}
}

function setupProfile() {
    const login = document.getElementById("login");
    const img = document.createElement("img");
    img.src = liffProfile.pictureUrl;
    img.alt = "Profile Picture";
    img.id = "profile-picture";
    const name = document.createElement("div");
    name.innerHTML = liffProfile.displayName;
    name.id = "lineName";

    const profile = document.createElement("div");
    profile.classList.add("profile");
    profile.classList.add("hidden");
    profile.classList.add("focused");
    const loginButton = document.createElement("div");
    loginButton.setAttribute("id", "loginButton");
    loginButton.classList.add("btn", "nodecor-link");
    loginButton.innerHTML = "Logout";

    profile.appendChild(name);
    profile.appendChild(loginButton);

    login.classList.add("loggedin");
    login.innerHTML = "";
    login.appendChild(img);
    login.appendChild(profile);
    login.classList.remove("hidden");

    img.classList.add("pointer");
    img.onclick = function () {
        if (profile.classList.contains("hidden")) {
            profile.classList.remove("hidden");
        } else {
            profile.classList.add("hidden");
        }
    };

    const watchlistTab = document.getElementById("watchlist");
    if (watchlistTab) {
        watchlistTab.classList.remove("hidden");
    }
}

async function getProfile() {
    try {
        if (!liffProfile) {
            if (!liffStarted) {
                await startLiff();
            } else {
                await sleep(500);
                return getProfile();
            }
        }
        return liffProfile;
    } catch (error) {}
}

export { getProfile };
