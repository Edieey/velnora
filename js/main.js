
gsap.registerPlugin(ScrollTrigger);

// Hero animation
gsap.from(".hero-content", {
  opacity: 0,
  y: 80,
  duration: 1.5,
  ease: "power3.out"
});

// Section headings
gsap.utils.toArray("h2").forEach((heading) => {
  gsap.from(heading, {
    scrollTrigger: {
      trigger: heading,
      start: "top 85%"
    },
    opacity: 0,
    y: 50,
    duration: 1
  });
});

// Artist and event cards
gsap.utils.toArray(".artist-card").forEach((card) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: "top 90%"
    },
    opacity: 0,
    y: 50,
    duration: 0.8
  });
});

// Booking form
if (document.querySelector(".booking-form")) {
  gsap.from(".booking-form", {
    scrollTrigger: {
      trigger: ".booking-form",
      start: "top 85%"
    },
    opacity: 0,
    y: 50,
    duration: 1
  });
}
const translations = {
  en: {
    home: 'Home',
    artists: 'Artists',
    events: 'Events',
    booking: 'Booking'
  },
  dv: {
    home: 'ހޯމް',
    artists: 'އާޓިސްޓްސް',
    events: 'އިވެންޓްސް',
    booking: 'ބުކިންގ'
  }
};

const switcher = document.getElementById('language-switcher');
if (switcher) {
  switcher.addEventListener('change', function () {
    localStorage.setItem('language', this.value);
    location.reload(); // Placeholder for future expansion
  });

  const savedLanguage = localStorage.getItem('language') || 'en';
  switcher.value = savedLanguage;
}
// Hero logo fade and shrink on scroll
window.addEventListener("scroll", function () {
  const heroLogo = document.querySelector(".hero-main-logo");

  if (!heroLogo) return;

  const scrollY = window.scrollY;
  const maxScroll = 300;

  // Progress between 0 and 1
  const progress = Math.min(scrollY / maxScroll, 1);

  // Fade out
  heroLogo.style.opacity = 1 - progress;

  // Shrink the logo
  const scale = 1 - progress * 0.4;
  heroLogo.style.transform = `scale(${scale})`;
});
// Event Lightbox
const eventImages = [
  "images/event12.png",
  "images/event13.png",
  "images/event14.png",
  "images/event15.png",
  "images/event16.png"
];

let currentImageIndex = 0;

function openLightbox(index) {
  currentImageIndex = index;
  document.getElementById("lightbox-image").src =
    eventImages[currentImageIndex];
  document.getElementById("lightbox").style.display = "flex";
}

function closeLightbox() {
  document.getElementById("lightbox").style.display = "none";
}

function changeImage(direction) {
  currentImageIndex += direction;

  if (currentImageIndex < 0) {
    currentImageIndex = eventImages.length - 1;
  }

  if (currentImageIndex >= eventImages.length) {
    currentImageIndex = 0;
  }

  document.getElementById("lightbox-image").src =
    eventImages[currentImageIndex];
}

// Close when clicking outside the image
window.addEventListener("click", function (e) {
  const lightbox = document.getElementById("lightbox");
  if (e.target === lightbox) {
    closeLightbox();
  }
});

// Load gallery images from Admin Dashboard into gallery.html
if (document.getElementById("galleryContainer")) {
  const savedGallery =
    JSON.parse(localStorage.getItem("velnoraGallery")) || [];

  const container = document.getElementById("galleryContainer");

  if (savedGallery.length === 0) {
    container.innerHTML = "<p>No gallery images yet. Stay tuned!</p>";
  } else {
    savedGallery.forEach((img) => {
      const card = document.createElement("div");
      card.className = "artist-card";

      card.innerHTML = `
        <img src="${img}" alt="Gallery Image">
      `;

      container.appendChild(card);
    });
  }
}


