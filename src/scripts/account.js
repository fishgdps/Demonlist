import getRoundedPoints from "./getRoundedPoints.js";
let roles = {}

async function loadRoles() {
	const res = await fetch('./src/roles.json');
        roles = await res.json();
	console.log(roles);
}

loadRoles();
// Change Taskbar //
const taskBar = setInterval(() => {
        if (document.querySelector("#account"))
                document.querySelector("#account").classList.add("active");
        clearInterval(taskBar);
}, 100);

const firebaseConfig = {
        apiKey: "AIzaSyDzrEW_30fwkz1ssjsQIkJHNqaQ5oHVL3U",
        authDomain: "fishgdps.firebaseapp.com",
        projectId: "fishgdps",
        storageBucket: "fishgdps.firebasestorage.app",
        databaseURL: "https://fishgdps-default-rtdb.firebaseio.com",
        messagingSenderId: "680849924893",
        appId: "1:680849924893:web:bd3555666e75f6ec4cb7f4",
};

let demons = [];
let isVerif = true;

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

function getUserPoints(data) {
        if (demons.length() < 1) return;
        let returnValue = 0;
        data.forEach((id) => {
                const index = demons.findIndex((demon) => demon.id === id);
                returnValue += getRoundedPoints(index - 1) || 0;
        });
        return returnValue;
}

function setupUI() {
        try {
                roles.forEach(({ role, id }) => {
                        if (!player[2]?.[role]) {
                                document.getElementById(
                                        id + elementSuffix,
                                )?.remove();
                        }
                });
        } catch (e) {
                console.log("Failed to load badges or player has none. " + e);
        }

        try {
                document.getElementById("user-avatar").src = player[2].icon;
        } catch (e) {
                console.log("Failed to load avatar or player has none. " + e);
                document.getElementById("user-avatar").src =
                        "https://wallpapers.com/images/hd/placeholder-profile-icon-8qmjk1094ijhbem9.jpg";
        }

        try {
                document.getElementById("user-name").innerHTML = player[1];
                document.getElementById("bubble-points").innerHTML =
                        "Points: " + (getUserPoints(player[0].Demons) ?? 0);
                document.getElementById("bubble-verifications").innerHTML =
                        "Verifications: " + Object.keys(player[3] ?? []).length;
        } catch {
                const params = new URLSearchParams(window.location.search);
                const uuid = params.get("q");
                window.location = uuid ? "/404" : "/login";
        }
}

function updateTabUI() {
        const hash = window.location.hash || "#Completions";

        IsVerif = hash === "#Completions";

        document.getElementById("VerLi").classList.toggle("active", IsVerif);
        document.getElementById("CompLi").classList.toggle("active", !IsVerif);

        setupUI();
}

window.addEventListener("hashchange", () => {
        updateTabUI();
});

const params = new URLSearchParams(window.location.search);
const uuid = params.get("q");

function fetchData() {
        const playersPromise = db.ref(`players/${uuid}`).once("value");

        Promise.all([playersPromise]).then(() => {
                updateTabUI();
        });
}

fetchData();

document.querySelector("#videoModal").addEventListener("click", () => {
        closeVideo();
});

document.querySelector("#modal-prop-selector").addEventListener(
        "click",
        (event) => {
                event.stopPropagation();
        },
);
