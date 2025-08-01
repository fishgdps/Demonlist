import getRoundedPoints from "./getRoundedPoints.js";

let roles = {}

async function loadRoles() {
	const res = await fetch('./src/roles.json');
        roles = await res.json();
	console.log(roles);
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

function getUserPoints(data) {
        let returnValue = 0;
        data.forEach((id) => {
                const index = demons.findIndex((demon) => demon.id === id);
                const rank = index !== -1 ? index + 1 : null;
                returnValue += getRoundedPoints(rank - 1) || 0;
        });
        return returnValue;
}

function sortPlayersByPoints(playersArray) {
        return playersArray.slice().sort((a, b) => {
                return (
                        getUserPoints(b.levels?.Demons ?? []) -
                        getUserPoints(a.levels?.Demons ?? [])
                );
        });
}

function renderDemon(demon, demonList) {
        const template = document.getElementById('template-demon-entry');
        
        const clone = template.content.cloneNode(true);

        const tooltip = clone.querySelector('.custom-tooltip');
        tooltip.dataset.demonId = demon.id;
        tooltip.dataset.loaded = 'false';
        
        const videoWrapper = clone.querySelector('.video-wrapper');
        videoWrapper.dataset.videoId = demon.videoId;
        
        const img = clone.querySelector('.video-wrapper img');
        img.src = `https://i3.ytimg.com/vi/${demon.videoId}/hqdefault.jpg`;
        img.alt = `${demon.name} video thumbnail`;
        
        const demonName = clone.querySelector('.demon-name');
        demonName.textContent = `${demon.name} (#${demon.rank})`;
        
        const demonCreator = clone.querySelector('.demon-creator');
        demonCreator.innerHTML = `By ${demon.creator}<br /> Verified by ${demon.verifier}`;

        clone.querySelector('#text-data-difficulty').textContent = demon.difficulty;
        clone.querySelector('#text-data-points').textContent = `${getRoundedPoints(demon.rank-1)} Points`;
        clone.querySelector('#text-data-id').textContent = `ID: ${demon.id}`;


        clone.addEventListener("mouseenter", async () => {
                const tooltip =
                        clone.querySelector(
                                ".custom-tooltip",
                        );
                const alreadyLoaded =
                        tooltip.getAttribute("data-loaded");
                if (alreadyLoaded) return;

                const snapshot = await db
                        .ref("players")
                        .once("value");
                const playersData = snapshot.val() || {};
                const demonId = parseInt(
                        tooltip.getAttribute("data-demon-id"),
                        10,
                );
                const matched = [];

                for (const key in playersData) {
                        const player = playersData[key];
                        const completed =
                                player?.levels?.Demons ?? [];
                        if (completed.includes(demonId)) {
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
                console.log("added tooltip");
        });

        if (!videoWrapper) return;

        videoWrapper.addEventListener("click", (e) => {
                e.stopPropagation();
                if (demon.videoId) {
                        openVideo(demon.videoId);
                }
        });

        console.log("child complete");

        demonList.appendChild(clone);
}

function renderPlayer(player, demonList) {
        const points = getUserPoints(
                player.levels?.Demons ?? [],
        );

        if (points > 0) {
                id++;
                const verifs =
                        Object.keys(player.verifications ?? [])
                                .length ?? 0;

                const tpl = document.querySelector(
                        "#template-player-entry",
                );
                const clone = tpl.content.cloneNode(true);

                const img = clone.querySelector("img");
                img.src =
                        player.profile?.icon ??
                        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";

                const linker =
                        clone.querySelector("#player-linker");
                linker.addEventListener("click", () => {
                        window.location.href = `/account?q=${encodeURIComponent(player.name)}#Completions`;
                });

                const playerName =
                        clone.querySelector("#text-playername");
                playerName.innerText = `${player.name}`;

                roles.forEach(({ role, idPrefix }) => {
                        if (!player.profile?.[role]) {
                                clone.querySelector(
                                        `#${idPrefix}`,
                                )?.remove();
                        }
                });

                const dataPoints =
                        clone.querySelector(
                                "#text-data-points",
                        );
                dataPoints.innerText = `${points} Points`;

                const dataVerifications = clone.querySelector(
                        "#text-data-verifications",
                );
                dataVerifications.innerText = `${verifs} Verification${verifs === 1 ? '' : 's'}`;

                demonList.appendChild(clone);
        }
}

function renderList() {
        console.log("starting renderList();");
        const demonList = document.querySelector("#demonList");

        demonList.innerHTML = ''

        if (IsDemon) {
                demons.forEach((demon, index) => {
                        renderDemon(demon, demonList)
                });
        } elseif (IsChallenges) {
		challenges.forEach((challenge, index) => {
                        renderDemon(challenge, demonList)
                });
	} else {
                const sortedPlayers = sortPlayersByPoints(players);

                sortedPlayers.forEach((player, _) => {
                        renderPlayer(player, demonList)
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

        const hash = window.location.hash || "#demons";

        document.querySelector(
                `nav.demonlist-tabs a[href='/${hash}']`,
        )?.classList.add("active");

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
