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

                let htmlPath = "src/pkgdefaults/pkgdefaults.html";

                /*if (user) {
                        const uid = user.uid;

                        const modRef = firebase
                                .database()
                                .ref(`moderators/${uid}`);
                        const snapshot = await modRef.once("value");

                        if (snapshot.exists() && snapshot.val() === true) {
                                htmlPath = "src/pkgdefaults/moderatorpkg.html";
                        } else {
                                htmlPath = "src/pkgdefaults/localpkg.html";
                        }
                }*/

                const res = await fetch(htmlPath);
                const html = await res.text();

                const container = document.createElement("div");
                container.innerHTML = html;
                container.innerHTML += `<div id="bg-visual"></div>`;
                document.body.insertAdjacentElement("afterbegin", container);
        } catch (err) {
                console.error("Failed to load navbar:", err);
        }
})();
