import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAmfjDF7rkJoP70GL5J4AAQ8FG-cXPJoOo",
  authDomain: "smart-student-assistant-c3805.firebaseapp.com",
  projectId: "smart-student-assistant-c3805",
  storageBucket: "smart-student-assistant-c3805.firebasestorage.app",
  messagingSenderId: "441238041255",
  appId: "1:441238041255:web:d3cee23507b7e8f8c9a182",
  measurementId: "G-1NSP413HHT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);