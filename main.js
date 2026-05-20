import './style.css'

// Mobile menu toggle
const initMobileMenu = () => {
  const btn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.nav-links');
  
  if (btn && nav) {
    btn.addEventListener('click', () => {
      nav.classList.toggle('show');
      const isExpanded = nav.classList.contains('show');
      btn.innerHTML = isExpanded ? '✕' : '☰';
    });
  }
};

// Scroll animations (Intersection Observer)
const initScrollAnimations = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
};

// Active link highlighting
const highlightActiveLink = () => {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentPath === linkPath || (currentPath === '/' && linkPath === '/index.html')) {
      link.classList.add('active');
    } else if (currentPath.includes(linkPath) && linkPath !== '/') {
      link.classList.add('active');
    }
  });
};

// Initialize all features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initScrollAnimations();
  highlightActiveLink();
});
