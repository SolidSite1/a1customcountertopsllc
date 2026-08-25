// Year in footer

const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Smooth section awareness for active nav state

const navLinks = document.querySelectorAll(".nav-link");
const pageSections = document.querySelectorAll("section[id]");

const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const primaryNav = document.getElementById("primary-nav");

if (siteHeader && navToggle && primaryNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteHeader.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        siteHeader.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  });
}

if (navLinks.length && pageSections.length && "IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const id = entry.target.getAttribute("id");

        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    {
      root: null,
      threshold: 0.45,
      rootMargin: "-15% 0px -40% 0px"
    }
  );

  pageSections.forEach((section) => navObserver.observe(section));
}

// Ensure broken images degrade gracefully with a local generated fallback

function buildImageFallback(label) {
  const cleanLabel = encodeURIComponent(label);

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#332a23"/><stop offset="100%" stop-color="#1b1714"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><text x="50%" y="50%" fill="#d8c3a0" font-family="Segoe UI, sans-serif" font-size="42" text-anchor="middle" dominant-baseline="middle">${cleanLabel}</text></svg>`
  )}`;
}

document.querySelectorAll("img").forEach((img) => {
  img.loading = img.loading || "lazy";
  img.decoding = img.decoding || "async";

  img.addEventListener("error", () => {
    img.src = buildImageFallback(img.alt || "A1 Custom Countertops image");
  });
});

// Gallery filtering

const filterButtons = document.querySelectorAll(".filter-btn");
const galleryItems = document.querySelectorAll(".gallery-item");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;

    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    galleryItems.forEach((item) => {
      const category = item.dataset.category;
      item.style.display = filter === "all" || category === filter ? "block" : "none";
    });
  });
});

// Contact form (basic prevent default)

const contactForm = document.querySelector("#quoteForm");
const quoteStatus = document.getElementById("quoteStatus");

function setQuoteStatus(message, isError = false) {
  if (!quoteStatus) {
    return;
  }

  quoteStatus.textContent = message;
  quoteStatus.classList.toggle("is-error", isError);
  quoteStatus.classList.toggle("is-success", !isError && Boolean(message));
}

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const endpoint = contactForm.dataset.endpoint;
    if (!endpoint || endpoint.includes("your_form_id")) {
      setQuoteStatus("Set a real form endpoint in data-endpoint before submitting.", true);
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    setQuoteStatus("Sending request...");

    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setQuoteStatus("Quote request sent successfully.");
      contactForm.reset();
    } catch (error) {
      setQuoteStatus("Could not submit right now. Please try again shortly.", true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Request";
      }
    }
  });
}

// Contact carousel

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector("[data-carousel-track]");
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");

  if (!track || !prevButton || !nextButton) {
    return;
  }

  const slides = Array.from(track.children);
  if (!slides.length) {
    return;
  }

  let currentIndex = 0;
  let autoScrollId;

  function render() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  function goTo(index) {
    currentIndex = (index + slides.length) % slides.length;
    render();
  }

  function next() {
    goTo(currentIndex + 1);
  }

  function prev() {
    goTo(currentIndex - 1);
  }

  function startAutoScroll() {
    stopAutoScroll();
    autoScrollId = window.setInterval(next, 3500);
  }

  function stopAutoScroll() {
    if (autoScrollId) {
      window.clearInterval(autoScrollId);
      autoScrollId = undefined;
    }
  }

  function restartAutoScroll() {
    stopAutoScroll();
    startAutoScroll();
  }

  prevButton.addEventListener("click", () => {
    prev();
    restartAutoScroll();
  });

  nextButton.addEventListener("click", () => {
    next();
    restartAutoScroll();
  });

  carousel.addEventListener("mouseenter", stopAutoScroll);
  carousel.addEventListener("mouseleave", startAutoScroll);
  carousel.addEventListener("focusin", stopAutoScroll);
  carousel.addEventListener("focusout", startAutoScroll);

  render();
  startAutoScroll();
});
