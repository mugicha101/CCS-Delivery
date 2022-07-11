// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDLn8DmXLVp6NUBKShGt1OP0M-pn48lh8c",
    authDomain: "ccs-houqin.firebaseapp.com",
    databaseURL: "https://ccs-houqin-default-rtdb.firebaseio.com",
    projectId: "ccs-houqin",
    storageBucket: "ccs-houqin.appspot.com",
    messagingSenderId: "1047592591446",
    appId: "1:1047592591446:web:ba3b850aaeb74b1cc39bf7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export default app;