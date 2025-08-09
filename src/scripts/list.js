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

firebase.initializeApp(firebaseConfig);

let IsDemon = true;
let IsChallenges = false;

let demons = [];
let challenges = [];
let players = [];

let id = 1;

const db = firebase.database();

function fetchData() {
        db.ref("demons")
                .once("value")
                .then((snapshot) => {
                        const data = snapshot.val() || {};
                        demons = Object.values(data).sort(
                                (a, b) => a.rank - b.rank,
                        );
                        updateTabUI();
                });
        db.ref("challenges")
                .once("value")
                .then((snapshot) => {
                        const data = snapshot.val() || {};
                        challenges = Object.values(data).sort(
                                (a, b) => a.rank - b.rank,
                        );
                        updateTabUI();
                });

        db.ref("players")
                .once("value")
                .then((snapshot) => {
                        const data = snapshot.val() || {};
                        players = Object.values(data);
                        updateTabUI();
                });
}

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

function getUserPoints(data, normal = true) {
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
                const rank = index !== -1 ? index + 1 : null;
                returnValue += getRoundedPoints(rank - 1) || 0;
        });
        return returnValue;
}

function sortPlayersByPoints(playersArray, normal) {
        if (normal) {
                return playersArray.slice().sort((a, b) => {
                        return (
                                getUserPoints(b.levels?.Demons ?? [], true) -
                                getUserPoints(a.levels?.Demons ?? [], true)
                        );
                });
        } else {
                return playersArray.slice().sort((a, b) => {
                        return (
                                getUserPoints(
                                        b.levels?.Challenges ?? [],
                                        false,
                                ) -
                                getUserPoints(a.levels?.Challenges ?? [], false)
                        );
                });
        }
}

function renderLevel(demon, demonList) {
        const template = document.querySelector("#template-demon-entry");

        const clone = template.content.cloneNode(true);

        const tooltip = clone.querySelector(".custom-tooltip");
        tooltip.dataset.demonId = demon.id;
        tooltip.dataset.loaded = "false";

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

function completeLevelRenderer() {
        document.querySelectorAll(".demon-entry").forEach((clone) => {
                clone.addEventListener("mouseover", async () => {
                        const tooltip = clone.querySelector(".custom-tooltip");
                        const alreadyLoaded =
                                tooltip.getAttribute("data-loaded");
                        if (alreadyLoaded === "true") return;

                        const snapshot = await db.ref("players").once("value");
                        const playersData = snapshot.val() || {};
                        const demonId = parseInt(
                                tooltip.getAttribute("data-demon-id"),
                                10,
                        );

                        const matched = [];

                        for (const key in playersData) {
                                const player = playersData[key];
                                const completed = player?.levels?.Demons ?? [];
                                const completed2 =
                                        player?.levels?.Challenges ?? [];
                                if (completed.includes(demonId)) {
                                        matched.push(player.name);
                                } else if (completed2.includes(demonId)) {
                                        matched.push(player.name);
                                }
                        }

                        if (matched.length === 0) {
                                tooltip.innerText = "No victors yet.";
                        } else {
                                tooltip.innerHTML = `
                                        <div class='text-left'>
                                        <strong>Victors:</strong><br>
                                        ${matched.map((name) => `<div>${name}</div>`).join("")}
                                        </div>`;
                        }

                        tooltip.setAttribute("data-loaded", true);
                });
        });
}

function renderPlayer(player, demonList, normal) {
        let points = undefined;
        if (normal) {
                points = getUserPoints(player.levels?.Demons ?? [], true);
        } else {
                points = getUserPoints(player.levels?.Challenges ?? [], false);
        }

        console.log(getUserPoints(player.levels?.Challenges ?? [], false));

        if (points > 0) {
                console.log("points are greater than 0");
                id++;
                let verifs = undefined;
                if (normal) {
                        verifs =
                                Object.keys(player.verifications?.Demons ?? [])
                                        .length ?? 0;
                } else {
                        verifs =
                                Object.keys(
                                        player.verifications?.Challenges ?? [],
                                ).length ?? 0;
                }

                const tpl = document.querySelector("#template-player-entry");
                const clone = tpl.content.cloneNode(true);

                const img = clone.querySelector("img");
                img.src =
                        player.profile?.icon ??
                        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";

                const linker = clone.querySelector("#player-linker");
                linker.addEventListener("click", () => {
                        location.href = `/account.html?q=${encodeURIComponent(player.name)}#Completions`;
                });

                const playerName = clone.querySelector("#text-playername");
                playerName.innerText = `${player.name}`;

                roles.forEach(({ role, idPrefix }) => {
                        if (!player.profile?.[role]) {
                                clone.querySelector(`#${idPrefix}`)?.remove();
                        }
                });

                const dataPoints = clone.querySelector("#text-data-points");
                dataPoints.innerText = `${points} Points`;

                const dataVerifications = clone.querySelector(
                        "#text-data-verifications",
                );
                dataVerifications.innerText = `${verifs} Verification${verifs === 1 ? "" : "s"}`;

                demonList.appendChild(clone);
        }
}

function renderList() {
        const demonList = document.querySelector("#demonList");

        demonList.innerHTML = "";

        if (IsDemon) {
                demons.forEach((demon, _) => {
                        renderLevel(demon, demonList);
                });
                completeLevelRenderer();
        } else if (IsChallenges) {
                challenges.forEach((challenge, _) => {
                        renderLevel(challenge, demonList);
                });
                completeLevelRenderer();
        } else {
                const subNav = document
                        .querySelector("#template-subnavbar")
                        .content.cloneNode(true);
                demonList.appendChild(subNav);

                document.querySelector("#DemonsSelector").classList.toggle(
                        "active",
                        location.hash === "#leaderboard",
                );
                document.querySelector("#ChallengesSelector").classList.toggle(
                        "active",
                        location.hash === "#cleaderboard",
                );

                const sortedPlayers = sortPlayersByPoints(
                        players,
                        location.hash === "#leaderboard",
                );

                sortedPlayers.forEach((player, _) => {
                        renderPlayer(
                                player,
                                demonList,
                                location.hash === "#leaderboard",
                        );
                });
        }

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

        document.querySelectorAll(".demon-entry").forEach((entry) => {
                observer.observe(entry);
        });
}

function updateTabUI() {
        document.querySelectorAll("nav.demonlist-tabs a").forEach((link) => {
                link.classList.remove("active");
        });

        const hash = location.hash || "#demons";

        document.querySelector(
                `nav.demonlist-tabs a[href='/${hash}']`,
        )?.classList.add("active");
        if (hash === "#cleaderboard") {
                document.querySelector(
                        "nav.demonlist-tabs a[href='/#leaderboard']",
                )?.classList.add("active");
        }

        IsDemon = hash === "#demons";
        IsChallenges = hash === "#challenges";

        renderList();
}

window.addEventListener("hashchange", () => {
        updateTabUI();
});

document.querySelector("#videoModal").addEventListener("click", () => {
        closeVideo();
});

document.querySelector("#modal-prop-selector").addEventListener(
        "click",
        (event) => {
                event.stopPropagation();
        },
);

fetchData();
