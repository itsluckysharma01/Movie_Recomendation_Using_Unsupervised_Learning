// ================================
// Advanced Animation Effects
// ================================

// Mouse parallax effect
document.addEventListener("mousemove", (e) => {
  const cards = document.querySelectorAll(
    ".floating-card, .feature-card, .movie-card"
  );
  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;

  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const cardX = rect.left + rect.width / 2;
    const cardY = rect.top + rect.height / 2;

    const distX = (e.clientX - cardX) / 50;
    const distY = (e.clientY - cardY) / 50;

    card.style.transition = "transform 0.3s ease";
  });
});

// Typewriter effect for hero title
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.innerHTML = "";

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

// Cursor trail effect
class CursorTrail {
  constructor() {
    this.trail = [];
    this.maxTrail = 20;
    this.init();
  }

  init() {
    document.addEventListener("mousemove", (e) => {
      this.addDot(e.clientX, e.clientY);
    });
  }

  addDot(x, y) {
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    dot.style.left = x + "px";
    dot.style.top = y + "px";
    document.body.appendChild(dot);

    this.trail.push(dot);

    if (this.trail.length > this.maxTrail) {
      const oldDot = this.trail.shift();
      oldDot.remove();
    }

    setTimeout(() => {
      dot.style.opacity = "0";
      setTimeout(() => dot.remove(), 500);
    }, 100);
  }
}

// Tilt effect for cards
class TiltEffect {
  constructor(element) {
    this.element = element;
    this.init();
  }

  init() {
    this.element.addEventListener(
      "mouseenter",
      this.handleMouseEnter.bind(this)
    );
    this.element.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.element.addEventListener(
      "mouseleave",
      this.handleMouseLeave.bind(this)
    );
  }

  handleMouseEnter() {
    this.element.style.transition = "transform 0.1s ease";
  }

  handleMouseMove(e) {
    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    this.element.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            scale3d(1.05, 1.05, 1.05)
        `;
  }

  handleMouseLeave() {
    this.element.style.transition = "transform 0.5s ease";
    this.element.style.transform =
      "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
  }
}

// Apply tilt effect to movie cards
document.addEventListener("DOMContentLoaded", () => {
  // Wait for dynamic cards to be created
  const observer = new MutationObserver(() => {
    const movieCards = document.querySelectorAll(".movie-card");
    movieCards.forEach((card) => {
      if (!card.classList.contains("tilt-enabled")) {
        new TiltEffect(card);
        card.classList.add("tilt-enabled");
      }
    });
  });

  const movieCardsContainer = document.getElementById("movieCards");
  if (movieCardsContainer) {
    observer.observe(movieCardsContainer, { childList: true });
  }
});

// Magnetic button effect
class MagneticButton {
  constructor(element) {
    this.element = element;
    this.init();
  }

  init() {
    this.element.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.element.addEventListener(
      "mouseleave",
      this.handleMouseLeave.bind(this)
    );
  }

  handleMouseMove(e) {
    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    this.element.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  }

  handleMouseLeave() {
    this.element.style.transform = "translate(0, 0)";
  }
}

// Apply magnetic effect to buttons
document.querySelectorAll(".btn-primary, .search-btn").forEach((btn) => {
  new MagneticButton(btn);
});

// Gradient animation for backgrounds
class GradientAnimation {
  constructor(element) {
    this.element = element;
    this.hue = 0;
    this.init();
  }

  init() {
    setInterval(() => {
      this.hue = (this.hue + 1) % 360;
      this.element.style.background = `
                linear-gradient(
                    135deg,
                    hsl(${this.hue}, 70%, 60%) 0%,
                    hsl(${(this.hue + 60) % 360}, 70%, 60%) 100%
                )
            `;
    }, 50);
  }
}

// Text scramble effect
class TextScramble {
  constructor(element) {
    this.element = element;
    this.chars = "!<>-_\\/[]{}—=+*^?#________";
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.element.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = "";
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];

      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="scramble">${char}</span>`;
      } else {
        output += from;
      }
    }

    this.element.innerHTML = output;

    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// Scroll progress indicator
function createScrollProgress() {
  const progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #6366f1, #ec4899);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
  document.body.appendChild(progressBar);

  window.addEventListener("scroll", () => {
    const windowHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = scrolled + "%";
  });
}

createScrollProgress();

// Ripple effect on click
document.querySelectorAll(".btn, .chip, .movie-card").forEach((element) => {
  element.addEventListener("click", function (e) {
    const ripple = document.createElement("span");
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            top: ${y}px;
            left: ${x}px;
            pointer-events: none;
            animation: ripple 0.6s ease-out;
        `;

    this.style.position = "relative";
    this.style.overflow = "hidden";
    this.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
});

// Add ripple animation
const style = document.createElement("style");
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .cursor-dot {
        position: fixed;
        width: 10px;
        height: 10px;
        background: rgba(99, 102, 241, 0.5);
        border-radius: 50%;
        pointer-events: none;
        transform: translate(-50%, -50%);
        transition: opacity 0.5s ease;
        z-index: 9999;
    }
    
    .scramble {
        color: #ec4899;
    }
`;
document.head.appendChild(style);

// Lazy loading for images
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.add("loaded");
      imageObserver.unobserve(img);
    }
  });
});

document.querySelectorAll("img[data-src]").forEach((img) => {
  imageObserver.observe(img);
});

// Smooth reveal on scroll
const scrollReveal = () => {
  const reveals = document.querySelectorAll(".scroll-reveal");

  reveals.forEach((element) => {
    const windowHeight = window.innerHeight;
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;

    if (elementTop < windowHeight - elementVisible) {
      element.classList.add("revealed");
    }
  });
};

window.addEventListener("scroll", scrollReveal);
scrollReveal(); // Initial check

// Parallax scrolling effect
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll(".parallax");

  parallaxElements.forEach((element) => {
    const speed = element.dataset.speed || 0.5;
    element.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

// Console art
console.log(
  `
%c
    ██████╗ ███╗   ███╗ ██████╗ ██╗   ██╗██╗███████╗     █████╗ ██╗
    ██╔════╝ ████╗ ████║██╔═══██╗██║   ██║██║██╔════╝    ██╔══██╗██║
    ██║  ███╗██╔████╔██║██║   ██║██║   ██║██║█████╗      ███████║██║
    ██║   ██║██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██║██╔══╝      ██╔══██║██║
    ╚██████╔╝██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ██║███████╗    ██║  ██║██║
     ╚═════╝ ╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚═╝╚══════╝    ╚═╝  ╚═╝╚═╝
`,
  "color: #6366f1; font-weight: bold;"
);

console.log(
  "%cMovie Recommendation System v1.0",
  "color: #ec4899; font-size: 16px; font-weight: bold;"
);
console.log(
  "%cBuilt with ❤️ using Python, DBSCAN & Machine Learning",
  "color: #10b981; font-size: 12px;"
);
