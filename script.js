// New code for hiding and showing the navbar
let lastScrollY = window.scrollY;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > lastScrollY) {
    // Scrolling down
    navbar.style.transform = 'translateY(-100%)';
  } else {
    // Scrolling up
    navbar.style.transform = 'translateY(0)';
  }
  lastScrollY = window.scrollY;
});

document.addEventListener('DOMContentLoaded', function() {
  // Typing animation
  const typingElement = document.getElementById('typing');
  const text = 'Rudra 🐒';
  let index = 0;

  function type() {
    if (index < text.length) {
      typingElement.textContent += text.charAt(index);
      index++;
      setTimeout(type, 150);
    }
  }

  type();

  // Scroll animations
  const sections = document.querySelectorAll('.fade-in-blur');
  
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

  sections.forEach(section => observer.observe(section));

  // Menu functionality
  const menuContainer = document.querySelector('.menu-container');
  const menu = document.getElementById('menu');
  const hamburger = document.getElementById('hamburger');
  let hideTimeout;

  menuContainer.addEventListener('mouseenter', function() {
    clearTimeout(hideTimeout);
    menu.style.transform = 'translateX(0)';
    menu.style.opacity = '1';
    hamburger.style.opacity = '0';
  });

  menuContainer.addEventListener('mouseleave', function() {
    hideTimeout = setTimeout(function() {
      menu.style.transform = 'translateX(100%)';
      menu.style.opacity = '0';
      hamburger.style.opacity = '1';
    }, 1000);
  });

  menu.addEventListener('mouseenter', function() {
    clearTimeout(hideTimeout);
  });

  menu.addEventListener('mouseleave', function() {
    hideTimeout = setTimeout(function() {
      menu.style.transform = 'translateX(100%)';
      menu.style.opacity = '0';
      hamburger.style.opacity = '1';
    }, 1000);
  });
});

// Welcome Popup
document.addEventListener('DOMContentLoaded', () => {
  const welcomeModal = document.getElementById('welcomeModal');
  const closeWelcome = document.getElementById('closeWelcome');

  // Show modal with animation
  setTimeout(() => {
    welcomeModal.classList.remove('hidden');
    setTimeout(() => {
      welcomeModal.querySelector('div').classList.remove('scale-95', 'opacity-0');
    }, 50);
  }, 500);

  // Close modal
  closeWelcome.addEventListener('click', () => {
    welcomeModal.querySelector('div').classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      welcomeModal.classList.add('hidden');
    }, 500);
  });

  // Close modal when clicking outside
  welcomeModal.addEventListener('click', (e) => {
    if (e.target === welcomeModal) {
      welcomeModal.querySelector('div').classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        welcomeModal.classList.add('hidden');
      }, 500);
    }
  });
});
