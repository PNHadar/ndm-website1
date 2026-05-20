import './style.css'

// Mobile Menu Toggle
const mobileBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileBtn && navLinks) {
  mobileBtn.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });
}

// Fade-in Animation using IntersectionObserver
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Optional: stop observing once it's visible if you only want it to animate once
      // observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach(el => observer.observe(el));
  
  // For safety, fallback to visible if JS observer fails or takes too long
  setTimeout(() => {
    fadeElements.forEach(el => el.classList.add('visible'));
  }, 1000);
});

// Loading screen fade out
function hideLoader() {
  const loader = document.getElementById('loading-screen');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }, 600);
  }
}

if (document.readyState === 'complete') {
  hideLoader();
} else {
  window.addEventListener('load', hideLoader);
  // Fallback just in case load event fails or takes too long
  setTimeout(hideLoader, 3000);
}
