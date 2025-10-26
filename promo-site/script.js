// smooth scroll behavior for a
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = 80; // take into account navbar height
      const targetPosition =
        target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  });
});

// navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > 100) {
    navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
  } else {
    navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
  }

  lastScroll = currentScroll;
});

// intersection observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// observe feature cards
document.querySelectorAll('.feature-card').forEach((card, index) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(30px)';
  card.style.transition = `all 0.6s ease ${index * 0.1}s`;
  observer.observe(card);
});

// observe testimonials
document.querySelectorAll('.testimonial').forEach((testimonial, index) => {
  testimonial.style.opacity = '0';
  testimonial.style.transform = 'translateY(30px)';
  testimonial.style.transition = `all 0.6s ease ${index * 0.1}s`;
  observer.observe(testimonial);
});

// observe steps
document.querySelectorAll('.step').forEach((step, index) => {
  step.style.opacity = '0';
  step.style.transform = 'translateY(30px)';
  step.style.transition = `all 0.6s ease ${index * 0.2}s`;
  observer.observe(step);
});

// button click handlers
document.querySelectorAll('.btn-primary').forEach((btn) => {
  btn.addEventListener('click', () => {
    alert('🎬 Welcome to FilmPin! In production, this would launch the app.');
    // window.location.href = '/app';
  });
});

document.querySelectorAll('.btn-secondary').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    if (btn.textContent.includes('Watch Demo')) {
      e.preventDefault();
      alert(
        "🎥 Demo video would play here! This showcases FilmPin's amazing features."
      );
    }
  });
});

// parallax effect for hero background
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.hero');
      if (hero && scrolled < window.innerHeight) {
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent) {
          heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
      }
      ticking = false;
    });
    ticking = true;
  }
});

// animate stats counter on scroll
const animateCounter = (element, target, duration = 2000) => {
  const start = 0;
  const increment = target / (duration / 16); // 60fps
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = formatNumber(target);
      clearInterval(timer);
    } else {
      element.textContent = formatNumber(Math.floor(current));
    }
  }, 16);
};

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K+';
  }
  return num + '+';
};

// trigger counter animation when stats come into view
const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        const numbers = entry.target.querySelectorAll('.stat-number');

        // extract actual numbers from text
        const targets = [3000, 300, 1000];
        numbers.forEach((number, index) => {
          setTimeout(() => {
            animateCounter(number, targets[index], 1500);
          }, index * 200);
        });
      }
    });
  },
  { threshold: 0.5 }
);

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  statsObserver.observe(heroStats);
}

// add active state to floating cards on hover
document.querySelectorAll('.floating-card').forEach((card) => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'scale(1.05) translateY(-10px)';
    card.style.zIndex = '10';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.zIndex = '';
  });
});

// prevent default on demo links
document.querySelectorAll('footer a').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Footer link clicked:', link.textContent);
  });
});
