// ================================
// Main Application Logic
// ================================

// API Configuration
const API_BASE_URL = "http://localhost:5000"; // Update with your Flask API URL

// Sample movie database (for autocomplete)
const sampleMovies = [
  "The Matrix",
  "Inception",
  "Interstellar",
  "The Dark Knight",
  "Pulp Fiction",
  "The Shawshank Redemption",
  "The Godfather",
  "Fight Club",
  "Forrest Gump",
  "The Lord of the Rings",
  "Star Wars",
  "Avatar",
  "Titanic",
  "The Avengers",
  "The Hangover",
  "Superbad",
  "Anchorman",
  "Step Brothers",
  "The 40-Year-Old Virgin",
  "The Conjuring",
  "Insidious",
  "The Ring",
  "Get Out",
  "A Quiet Place",
  "Blade Runner 2049",
  "Ex Machina",
  "Minority Report",
  "Her",
  "Arrival",
];

// DOM Elements
const movieInput = document.getElementById("movieInput");
const searchBtn = document.getElementById("searchBtn");
const autocomplete = document.getElementById("autocomplete");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const results = document.getElementById("results");
const movieCards = document.getElementById("movieCards");
const suggestionChips = document.querySelectorAll(".chip");

// ================================
// Event Listeners
// ================================

// Search button click
searchBtn.addEventListener("click", () => {
  const movieName = movieInput.value.trim();
  if (movieName) {
    searchMovie(movieName);
  }
});

// Enter key press
movieInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const movieName = movieInput.value.trim();
    if (movieName) {
      searchMovie(movieName);
    }
  }
});

// Input for autocomplete
movieInput.addEventListener("input", (e) => {
  const value = e.target.value.trim();
  if (value.length > 2) {
    showAutocomplete(value);
  } else {
    hideAutocomplete();
  }
});

// Click outside to close autocomplete
document.addEventListener("click", (e) => {
  if (!autocomplete.contains(e.target) && e.target !== movieInput) {
    hideAutocomplete();
  }
});

// Suggestion chips
suggestionChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const movieName = chip.dataset.movie;
    movieInput.value = movieName;
    searchMovie(movieName);
  });
});

// ================================
// Search Functionality
// ================================

async function searchMovie(movieName) {
  // Hide previous results and errors
  hideError();
  hideResults();
  hideAutocomplete();

  // Show loading
  showLoading();

  try {
    // Simulate API call (replace with actual API endpoint)
    const response = await fetchRecommendations(movieName);

    if (response.status === "success") {
      displayResults(response);
    } else {
      showError(
        response.message || "Movie not found. Please try another search."
      );
    }
  } catch (err) {
    console.error("Search error:", err);
    showError("An error occurred while searching. Please try again.");
  } finally {
    hideLoading();
  }
}

// ================================
// API Functions
// ================================

async function fetchRecommendations(movieName) {
  // Try to use real API first, fallback to mock data if unavailable
  try {
    const response = await fetch(`${API_BASE_URL}/api/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movie_name: movieName,
        n_recommendations: 5,
      }),
    });

    if (!response.ok) {
      // If API is not available, use mock data
      console.warn("API not available, using mock data");
      return await useMockData(movieName);
    }

    return await response.json();
  } catch (error) {
    // Fallback to mock data if API call fails
    console.warn("API error, using mock data:", error);
    return await useMockData(movieName);
  }
}

// Mock data fallback function
async function useMockData(movieName) {
  await sleep(1500); // Simulate network delay

  // Check if movie exists
  const movieExists = sampleMovies.some((movie) =>
    movie.toLowerCase().includes(movieName.toLowerCase())
  );

  if (!movieExists) {
    return {
      status: "error",
      message: "Movie not found in database. Please try another search.",
    };
  }

  // Generate mock recommendations
  const recommendations = generateMockRecommendations(movieName);

  return {
    status: "success",
    input_movie: movieName,
    cluster: Math.floor(Math.random() * 12),
    total_cluster_movies: Math.floor(Math.random() * 500) + 100,
    recommendations: recommendations,
  };
}

function generateMockRecommendations(movieName) {
  // Generate different recommendations based on movie type
  const movieLower = movieName.toLowerCase();

  if (
    movieLower.includes("matrix") ||
    movieLower.includes("inception") ||
    movieLower.includes("interstellar")
  ) {
    return [
      { title: "Blade Runner 2049", year: 2017, genre: "Sci-Fi", rating: 8.0 },
      { title: "Ex Machina", year: 2014, genre: "Sci-Fi", rating: 7.7 },
      { title: "Arrival", year: 2016, genre: "Sci-Fi", rating: 7.9 },
      { title: "Minority Report", year: 2002, genre: "Sci-Fi", rating: 7.6 },
      { title: "Her", year: 2013, genre: "Sci-Fi", rating: 8.0 },
    ];
  } else if (
    movieLower.includes("hangover") ||
    movieLower.includes("superbad")
  ) {
    return [
      { title: "Anchorman", year: 2004, genre: "Comedy", rating: 7.2 },
      { title: "Step Brothers", year: 2008, genre: "Comedy", rating: 6.9 },
      { title: "Knocked Up", year: 2007, genre: "Comedy", rating: 6.9 },
      { title: "Old School", year: 2003, genre: "Comedy", rating: 7.0 },
      { title: "Wedding Crashers", year: 2005, genre: "Comedy", rating: 6.9 },
    ];
  } else if (
    movieLower.includes("conjuring") ||
    movieLower.includes("insidious")
  ) {
    return [
      { title: "The Ring", year: 2002, genre: "Horror", rating: 7.1 },
      { title: "Sinister", year: 2012, genre: "Horror", rating: 6.8 },
      { title: "Get Out", year: 2017, genre: "Horror", rating: 7.7 },
      { title: "A Quiet Place", year: 2018, genre: "Horror", rating: 7.5 },
      { title: "Hereditary", year: 2018, genre: "Horror", rating: 7.3 },
    ];
  } else {
    // Default recommendations
    return [
      {
        title: "The Shawshank Redemption",
        year: 1994,
        genre: "Drama",
        rating: 9.3,
      },
      { title: "The Godfather", year: 1972, genre: "Crime", rating: 9.2 },
      { title: "The Dark Knight", year: 2008, genre: "Action", rating: 9.0 },
      { title: "Pulp Fiction", year: 1994, genre: "Crime", rating: 8.9 },
      { title: "Forrest Gump", year: 1994, genre: "Drama", rating: 8.8 },
    ];
  }
}

// ================================
// UI Display Functions
// ================================

function displayResults(data) {
  // Update search info
  document.getElementById("searchedMovie").textContent = data.input_movie;
  document.getElementById("clusterNumber").textContent = data.cluster;
  document.getElementById("totalMovies").textContent =
    data.total_cluster_movies;

  // Clear previous cards
  movieCards.innerHTML = "";

  // Create movie cards
  data.recommendations.forEach((movie, index) => {
    const card = createMovieCard(movie, index);
    movieCards.appendChild(card);
  });

  // Show results with animation
  results.classList.remove("hidden");
  results.classList.add("animate-fade-in-up");

  // Scroll to results
  setTimeout(() => {
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 300);
}

function createMovieCard(movie, index) {
  const card = document.createElement("div");
  card.className = "movie-card";
  card.style.animationDelay = `${index * 0.1}s`;

  card.innerHTML = `
        <div class="movie-icon">
            <i class="fas fa-film"></i>
        </div>
        <h3 class="movie-title">${movie.title}</h3>
        <div class="movie-details">
            <div class="movie-detail">
                <i class="fas fa-calendar"></i>
                <span>${movie.year}</span>
            </div>
            <div class="movie-detail">
                <i class="fas fa-theater-masks"></i>
                <span>${movie.genre}</span>
            </div>
            <div class="movie-detail">
                <i class="fas fa-star"></i>
                <span>${movie.rating}/10</span>
            </div>
        </div>
    `;

  // Add hover effect
  card.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-10px) scale(1.02)";
  });

  card.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0) scale(1)";
  });

  return card;
}

// ================================
// Autocomplete
// ================================

function showAutocomplete(query) {
  const matches = sampleMovies
    .filter((movie) => movie.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  if (matches.length > 0) {
    autocomplete.innerHTML = matches
      .map(
        (movie) => `
            <div class="autocomplete-item" data-movie="${movie}">
                <i class="fas fa-film" style="margin-right: 10px; color: var(--primary-color);"></i>
                ${movie}
            </div>
        `
      )
      .join("");

    // Add click listeners
    document.querySelectorAll(".autocomplete-item").forEach((item) => {
      item.addEventListener("click", () => {
        movieInput.value = item.dataset.movie;
        hideAutocomplete();
        searchMovie(item.dataset.movie);
      });
    });

    autocomplete.classList.add("show");
  } else {
    hideAutocomplete();
  }
}

function hideAutocomplete() {
  autocomplete.classList.remove("show");
}

// ================================
// Loading & Error States
// ================================

function showLoading() {
  loading.classList.remove("hidden");
  loading.classList.add("animate-fade-in");
}

function hideLoading() {
  loading.classList.add("hidden");
}

function showError(message) {
  document.getElementById("errorText").textContent = message;
  error.classList.remove("hidden");
  error.classList.add("animate-fade-in", "shake");

  setTimeout(() => {
    error.classList.remove("shake");
  }, 500);
}

function hideError() {
  error.classList.add("hidden");
}

function hideResults() {
  results.classList.add("hidden");
}

// ================================
// Utility Functions
// ================================

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ================================
// Smooth Scroll for Navigation
// ================================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Update active nav link
      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.classList.remove("active");
      });
      this.classList.add("active");

      // Close mobile menu if open
      document.querySelector(".nav-links").classList.remove("active");
    }
  });
});

// ================================
// Mobile Menu Toggle
// ================================

const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  hamburger.classList.toggle("active");
});

// ================================
// Back to Top Button
// ================================

const backToTopBtn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (window.pageYOffset > 300) {
    backToTopBtn.classList.add("show");
  } else {
    backToTopBtn.classList.remove("show");
  }

  // Update navbar on scroll
  const navbar = document.querySelector(".navbar");
  if (window.pageYOffset > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// ================================
// Counter Animation
// ================================

function animateCounter(element) {
  const target = parseInt(element.dataset.target);
  const duration = 2000;
  const increment = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }
  }, 16);
}

// Intersection Observer for counter animation
const observerOptions = {
  threshold: 0.5,
  rootMargin: "0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll("[data-target]");
      counters.forEach((counter) => {
        if (!counter.classList.contains("counted")) {
          animateCounter(counter);
          counter.classList.add("counted");
        }
      });
    }
  });
}, observerOptions);

// Observe stat sections
document.querySelectorAll(".hero-stats, .stats-grid").forEach((section) => {
  observer.observe(section);
});

// ================================
// Scroll Reveal Animation
// ================================

const revealElements = document.querySelectorAll(
  ".feature-card, .step, .stat-card"
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
      }
    });
  },
  {
    threshold: 0.1,
  }
);

revealElements.forEach((element) => {
  element.classList.add("scroll-reveal");
  revealObserver.observe(element);
});

// ================================
// Initialize on Load
// ================================

window.addEventListener("load", () => {
  console.log("🎬 Movie Recommendation System Loaded!");

  // Add initial animations
  document.querySelector(".hero-content").classList.add("animate-fade-in");
});

// ================================
// Console Welcome Message
// ================================

console.log(
  "%c🎬 Movie Recommendation System",
  "color: #6366f1; font-size: 20px; font-weight: bold;"
);
console.log(
  "%cPowered by DBSCAN Clustering Algorithm",
  "color: #ec4899; font-size: 14px;"
);
console.log("%cDeveloped by Lucky Sharma", "color: #10b981; font-size: 12px;");
