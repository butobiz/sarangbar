import { initializeApp } from "[https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js](https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js)";
import { getAuth, GoogleAuthProvider } from "[https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js](https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js)";
import { getFirestore } from "[https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js](https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js)";

// Konfigurasi Rahasia Anda
export const firebaseConfig = {
  apiKey: "AIzaSyCNkkptoB5ReU6RxGe6IKvYII2NBkUdQk0",
  authDomain: "sarangbar-app.firebaseapp.com",
  projectId: "sarangbar-app",
  storageBucket: "sarangbar-app.firebasestorage.app",
  messagingSenderId: "572885330047",
  appId: "1:572885330047:web:2d4c3e26e0833a9bdd374a"
};

// Ekspor Variabel Inti
export const appId = firebaseConfig.projectId;
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
