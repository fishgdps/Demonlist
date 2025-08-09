import getRoundedPoints from "./getRoundedPoints.js";

let roles = {};

async function loadRoles() {
        const res = await fetch("./src/roles.json");
        roles = await res.json();
}

loadRoles();

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
let challenges = [];

const demonList = document.querySelector("#demonList");

let player = undefined;
let isVerif = true;
let isDemon = true;

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

db.ref("demons")
        .once("value")
        .then((snapshot) => {
                demons = Object.values(snapshot.val() || {}).sort(
                        (a, b) => a.rank - b.rank,
                );
        });

db.ref("challenges")
        .once("value")
        .then((snapshot) => {
                challenges = Object.values(snapshot.val() || {}).sort(
                        (a, b) => a.rank - b.rank,
                );
        });

function openVideo(id) {
        const modal = document.querySelector("#videoModal");
        const iframe = document.querySelector("#videoFrame");
        iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
        modal.classList.add("active");
}

function closeVideo() {
        const modal = document.querySelector("#videoModal");
        const iframe = document.querySelector("#videoFrame");
        iframe.src = "";
        modal.classList.remove("active");
}

function getUserPoints(data, normal) {
        if (!data || data.length < 1) {
                return;
        }
        let returnValue = 0;
        data.forEach((id) => {
                let index = 0;
                if (normal) {
                        index = demons.findIndex((demon) => demon.id === id);
                } else {
                        index = challenges.findIndex(
                                (demon) => demon.id === id,
                        );
                }
                returnValue += getRoundedPoints(index) || 0;
        });
        return returnValue;
}

function setupUI(type) {
        try {
                if (!player) {
                        return;
                }
        } catch (e) {
                return;
        }

        roles.forEach(({ role, idPrefix }) => {
                if (player.profile?.[role]) {
                        return;
                }
                document.querySelector(`#${idPrefix}`)?.remove();
        });

        try {
                document.querySelector("#user-avatar").src =
                        player.profile?.icon;
        } catch (e) {
                document.querySelector("#user-avatar").src =
                        "https://wallpapers.com/images/hd/placeholder-profile-icon-8qmjk1094ijhbem9.jpg";
        }

        document.querySelector("#user-name").innerHTML = player.name;

        if (type === "Demons") {
                document.querySelector("#bubble-points").innerHTML =
                        "Points: " +
                        (getUserPoints(player.levels.Demons, true) ?? 0);
                document.querySelector("#bubble-completions").innerHTML =
                        "Completions: " + (player.levels.Demons.length ?? 0);
                document.querySelector("#bubble-verifications").innerHTML =
                        "Verifications: " +
                        Object.keys(player.verifications.Demons ?? []).length;
        } else {
                document.querySelector("#bubble-points").innerHTML =
                        "Points: " +
                        (getUserPoints(player.levels.Challenges, false) ?? 0);
                document.querySelector("#bubble-completions").innerHTML =
                        "Completions: " +
                        (player.levels.Challenges?.length ?? 0);
                document.querySelector("#bubble-verifications").innerHTML =
                        "Verifications: " +
                        Object.keys(player.verifications.Challenges ?? [])
                                .length;
        }

        if (isVerif) {
                if (type === "Demons") {
                        demons.forEach((demon, _) => {
                                if (
                                        !player.verifications.Demons.includes(
                                                demon.id,
                                        )
                                ) {
                                        return;
                                }
                                renderDemon(demon, demonList);
                        });

                        const observer = new IntersectionObserver(
                                (entries) => {
                                        entries.forEach((entry) => {
                                                entry.target.classList.toggle(
                                                        "visible",
                                                        entry.isIntersecting,
                                                );
                                        });
                                },
                                { threshold: 0.1 },
                        );

                        document.querySelectorAll(".demon-entry").forEach(
                                (entry) => {
                                        observer.observe(entry);
                                },
                        );
                } else {
                        challenges.forEach((demon, _) => {
                                if (
                                        !player.verifications.Challenges.includes(
                                                demon.id,
                                        )
                                ) {
                                        return;
                                }
                                renderDemon(demon, demonList);
                        });

                        const observer = new IntersectionObserver(
                                (entries) => {
                                        entries.forEach((entry) => {
                                                entry.target.classList.toggle(
                                                        "visible",
                                                        entry.isIntersecting,
                                                );
                                        });
                                },
                                { threshold: 0.1 },
                        );

                        document.querySelectorAll(".demon-entry").forEach(
                                (entry) => {
                                        observer.observe(entry);
                                },
                        );
                }
        } else {
                if (type === "Demons") {
                        demons.forEach((demon, _) => {
                                if (!player.levels.Demons.includes(demon.id)) {
                                        return;
                                }
                                renderDemon(demon, demonList);
                        });

                        const observer = new IntersectionObserver(
                                (entries) => {
                                        entries.forEach((entry) => {
                                                entry.target.classList.toggle(
                                                        "visible",
                                                        entry.isIntersecting,
                                                );
                                        });
                                },
                                { threshold: 0.1 },
                        );

                        document.querySelectorAll(".demon-entry").forEach(
                                (entry) => {
                                        observer.observe(entry);
                                },
                        );
                } else {
                        challenges.forEach((demon, _) => {
                                if (
                                        !player.levels.Challenges.includes(
                                                demon.id,
                                        )
                                ) {
                                        return;
                                }
                                renderDemon(demon, demonList);
                        });

                        const observer = new IntersectionObserver(
                                (entries) => {
                                        entries.forEach((entry) => {
                                                entry.target.classList.toggle(
                                                        "visible",
                                                        entry.isIntersecting,
                                                );
                                        });
                                },
                                { threshold: 0.1 },
                        );

                        document.querySelectorAll(".demon-entry").forEach(
                                (entry) => {
                                        observer.observe(entry);
                                },
                        );
                }
        }
}

function renderDemon(demon, demonList) {
        const template = document.getElementById("template-demon-entry");

        const clone = template.content.cloneNode(true);

        const videoWrapper = clone.querySelector(".video-wrapper");
        videoWrapper.dataset.videoId = demon.videoId;

        const img = clone.querySelector(".video-wrapper img");
        img.src = `https://i3.ytimg.com/vi/${demon.videoId}/hqdefault.jpg`;
        img.alt = `${demon.name} video thumbnail`;

        const demonName = clone.querySelector(".demon-name");
        demonName.textContent = `${demon.name} (#${demon.rank})`;
        const demonCreator = clone.querySelector(".demon-creator");
        demonCreator.innerHTML = `By ${demon.creator}<br /> Verified by ${demon.verifier}`;

        clone.querySelector("#text-data-difficulty").textContent =
                demon.difficulty;
        clone.querySelector("#text-data-points").textContent =
                `${getRoundedPoints(demon.rank - 1)} Points`;
        clone.querySelector("#text-data-id").textContent = `ID: ${demon.id}`;

        if (!videoWrapper) return;

        videoWrapper.addEventListener("click", (e) => {
                e.stopPropagation();
                if (demon.videoId) {
                        openVideo(demon.videoId);
                }
        });

        demonList.appendChild(clone);
}

function updateTabUI() {
        const hash = window.location.hash || "#Completions";
        const params = new URLSearchParams(window.location.search);
        let param = params.get("type");

        if (!param) param = "Demons";

        isVerif = hash != "#Completions";
        isDemon = param != "Challenges";

        document.querySelector("#VerLi").classList.toggle("active", !isVerif);
        document.querySelector("#CompLi").classList.toggle("active", isVerif);

        document.querySelector("#ChallengeSelector").classList.toggle(
                "active",
                !isDemon,
        );
        document.querySelector("#DemonSelector").classList.toggle(
                "active",
                isDemon,
        );

        setupUI(param);
}

window.addEventListener("hashchange", () => {
        location.reload();
});

const params = new URLSearchParams(window.location.search);
const uuid = params.get("q");

function fetchData() {
        const playersPromise = db.ref(`players/${uuid}`).once("value");

        Promise.all([playersPromise]).then(([snapshot]) => {
                if (snapshot.exists()) {
                        player = snapshot.val();
                        updateTabUI();
                } else {
                        window.location = uuid ? "/404" : "/login";
                }
        });
}

document.querySelector("#videoModal").addEventListener("click", () => {
        closeVideo();
});

fetchData();

document.querySelector("#DemonSelector").addEventListener("click", (event) => {
        event.preventDefault();
        const params = new URLSearchParams(window.location.search);

        if (params.get("type") || params.get("type") === "Demons") return;

        params.set("type", "Demons");

        const url =
                window.location.pathname +
                        "?" +
                        params.toString() +
                        window.location.hash || "#Completions";

        window.history.replaceState({}, "", url);

        console.log(url);

        location.reload();
});

document.querySelector("#ChallengeSelector").addEventListener(
        "click",
        (event) => {
                event.preventDefault();
                const params = new URLSearchParams(window.location.search);

                if (params.get("type") === "Challenges") return;

                params.set("type", "Challenges");

                const url =
                        window.location.pathname +
                                "?" +
                                params.toString() +
                                window.location.hash || "#Completions";

                window.history.replaceState({}, "", url);

                console.log(url);

                location.reload();
        },
);
