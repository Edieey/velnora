// ===============================
// PASSWORD PROTECTION
// ===============================
const adminPassword = "velnora2026";
const enteredPassword = prompt("Enter Admin Password:");

if (enteredPassword !== adminPassword) {
  alert("Access Denied");
  window.location.href = "https://www.google.com";
  throw new Error("Access denied");
}

// ===============================
// FIREBASE IMPORTS
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ===============================
// FIREBASE CONFIG
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyDPJCuibzsFlUh3IE0Fe9JW7alsrXXhIME",
  authDomain: "velnora-b46f3.firebaseapp.com",
  projectId: "velnora-b46f3",
  storageBucket: "velnora-b46f3.firebasestorage.app",
  messagingSenderId: "920958734888",
  appId: "1:920958734888:web:04071ed8fd20357f265b1d",
  measurementId: "G-ZJZKMJC0QZ"
};

// ===============================
// INITIALIZE FIREBASE
// ===============================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// DATA
// ===============================
let events = [];
let gallery = [];

// ===============================
// DOM
// ===============================
const eventsList = document.getElementById("eventsList");
const galleryList = document.getElementById("galleryList");

// ===============================
// FILE → BASE64
// ===============================
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function () {
      resolve(reader.result);
    };

    reader.onerror = function () {
      reject(reader.error);
    };

    reader.readAsDataURL(file);
  });
}

// ===============================
// SAVE TO FIREBASE
// ===============================
async function saveData() {
  await setDoc(doc(db, "cms", "content"), {
    events,
    gallery
  });
}

// ===============================
// LOAD FROM FIREBASE
// ===============================
async function loadData() {
  try {
    const snapshot = await getDoc(doc(db, "cms", "content"));

    if (snapshot.exists()) {
      const data = snapshot.data();
      events = data.events || [];
      gallery = data.gallery || [];
    }

    renderEvents();
    renderGallery();
  } catch (error) {
    console.error("Load error:", error);
    alert("Failed to load data from Firebase.");
  }
}

// ===============================
// ADD EVENT
// ===============================
window.addEvent = async function () {
  try {
    const title = document.getElementById("eventTitle").value.trim();
    const date = document.getElementById("eventDate").value.trim();
    const files = document.getElementById("eventImages").files;

    if (!title || !date || files.length === 0) {
      alert("Please complete all event fields and select at least one image.");
      return;
    }

    const images = [];

    for (const file of files) {
      const base64 = await toBase64(file);
      images.push(base64);
    }

    events.push({
      title,
      date,
      images
    });

    await saveData();

    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDate").value = "";
    document.getElementById("eventImages").value = "";

    renderEvents();

    alert("Event added successfully! 🎉");
  } catch (error) {
    console.error("Add Event Error:", error);
    alert("Failed to add event. Check browser console for details.");
  }
};

// ===============================
// DELETE EVENT
// ===============================
window.deleteEvent = async function (index) {
  try {
    if (!confirm("Delete this event?")) return;

    events.splice(index, 1);
    await saveData();
    renderEvents();
  } catch (error) {
    console.error("Delete Event Error:", error);
    alert("Failed to delete event.");
  }
};

// ===============================
// ADD GALLERY IMAGES
// ===============================
window.addGalleryImages = async function () {
  try {
    const files = document.getElementById("galleryImages").files;

    if (files.length === 0) {
      alert("Please select one or more images.");
      return;
    }

    for (const file of files) {
      const base64 = await toBase64(file);
      gallery.push(base64);
    }

    await saveData();

    document.getElementById("galleryImages").value = "";

    renderGallery();

    alert("Gallery images added successfully! 📸");
  } catch (error) {
    console.error("Gallery Upload Error:", error);
    alert("Failed to upload gallery images.");
  }
};

// ===============================
// DELETE GALLERY IMAGE
// ===============================
window.deleteGalleryImage = async function (index) {
  try {
    if (!confirm("Delete this image?")) return;

    gallery.splice(index, 1);
    await saveData();
    renderGallery();
  } catch (error) {
    console.error("Delete Gallery Error:", error);
    alert("Failed to delete image.");
  }
};

// ===============================
// RENDER EVENTS
// ===============================
function renderEvents() {
  if (!eventsList) return;

  eventsList.innerHTML = "";

  events.forEach((event, index) => {
    const card = document.createElement("div");
    card.className = "artist-card";

    card.innerHTML = `
      <img src="${event.images[0]}" alt="${event.title}">
      <h3>${event.title}</h3>
      <p>${event.date}</p>
      <button class="btn" onclick="deleteEvent(${index})">
        🗑 Delete Event
      </button>
    `;

    eventsList.appendChild(card);
  });
}

// ===============================
// RENDER GALLERY
// ===============================
function renderGallery() {
  if (!galleryList) return;

  galleryList.innerHTML = "";

  gallery.forEach((img, index) => {
    const card = document.createElement("div");
    card.className = "artist-card";

    card.innerHTML = `
      <img src="${img}" alt="Gallery Image">
      <button class="btn" onclick="deleteGalleryImage(${index})">
        🗑 Delete Image
      </button>
    `;

    galleryList.appendChild(card);
  });
}

// ===============================
// START
// ===============================
loadData();