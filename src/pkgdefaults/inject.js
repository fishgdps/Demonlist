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
const db = firebase.database();

(async () => {
        try {
                const user = await new Promise((resolve) => {
                        const unsubscribe = firebase
                                .auth()
                                .onAuthStateChanged((u) => {
                                        unsubscribe();
                                        resolve(u);
                                });
                });

                const res = await fetch("src/pkgdefaults/nav.html");
                const navHTML = await res.text();

                const container = document.createElement("div");
                container.innerHTML = navHTML;
                container.innerHTML += `<div id="bg-visual"></div>`;

                if (user) {
                        const uid = user.uid;

                        const modRef = firebase
                                .database()
                                .ref(`moderators/${uid}`);
                        const snapshot = await modRef.once("value");

                        if (snapshot.exists() && snapshot.val() === true) {
                        } else {
                                container.querySelector("#ModBtn").remove();
                        }
                } else {
                        container.querySelector("#ModBtn").remove();
                        container.querySelector("#SubLvl").remove();
                        container.querySelector("#SubRul").remove();
                }

                document.body.insertAdjacentElement("afterbegin", container);
        } catch (err) {
                console.error("Failed to load navbar:", err);
        }
})();
