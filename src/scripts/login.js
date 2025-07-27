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
const auth = firebase.auth();

const loginForm = document.getElementById("loginForm");
const messageP = document.getElementById("message");

window.location.href = 'https://fishgdps.com/offline'

loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;

        auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                        messageP.textContent =
                                "Logged in as " + userCredential.user.email;
                })
                .catch((error) => {
                        messageP.textContent = "Login failed: " + error.message;
                });
});

auth.onAuthStateChanged((user) => {
        if (user) {
                messageP.textContent = "Logged in as " + user.email;
        } else {
                messageP.textContent = "Please log in.";
        }
});

const taskBar = setInterval(() => {
        if (document.querySelector("#account"))
                document.querySelector("#account").classList.add("active");
        clearInterval(taskBar);
}, 100);
