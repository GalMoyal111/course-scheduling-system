import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyABLBgHKQgSqzqcXBCIsrT0zG5aeuagu_M",
  authDomain: "course-scheduling-server.firebaseapp.com",
  projectId: "course-scheduling-server",
  storageBucket: "course-scheduling-server.firebasestorage.app",
  messagingSenderId: "360227137364",
  appId: "1:360227137364:web:af484be4ac49eac46a8ac1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);