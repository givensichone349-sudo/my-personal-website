/* ==========================================================
   Given Sichone Portfolio - js/script.js
   Features:
     1. Contact form validation and preview (compulsory)
     2. Mobile navigation menu
     3. Light / dark theme switch
     4. Photo gallery viewer (Previous / Next)
   ========================================================== */

/* ----------------------------------------------------------
   Shared helper: get an element by id (returns null if missing)
   ---------------------------------------------------------- */
function byId(id) {
  return document.getElementById(id);
}

/* ==========================================================
   FEATURE 1: CONTACT FORM VALIDATION AND PREVIEW
   ========================================================== */

// Simple email pattern: text, one @, text, a dot, then at least 2 letters
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Shows an error message under a field and marks the field as invalid.
 * Passing an empty message clears the error.
 */
function setFieldError(inputId, message) {
  const input = byId(inputId);
  const errorBox = byId(inputId + "-error");
  if (!input || !errorBox) return;

  const wrapper = input.closest(".field");
  errorBox.textContent = message;

  if (message) {
    input.setAttribute("aria-invalid", "true");
    if (wrapper) wrapper.classList.add("invalid");
  } else {
    input.removeAttribute("aria-invalid");
    if (wrapper) wrapper.classList.remove("invalid");
  }
}

/**
 * Checks the name, email and message values.
 * Returns an object: { valid, errors, values }
 * trim() makes whitespace-only input count as empty.
 */
function validateContactForm(form) {
  const name = form.elements["name"].value.trim();
  const email = form.elements["email"].value.trim();
  const topic = form.elements["topic"].value;
  const message = form.elements["message"].value.trim();
  const errors = {};

  if (name === "") {
    errors.name = "Please enter your name (spaces alone are not accepted).";
  } else if (name.length < 2) {
    errors.name = "Your name must be at least 2 characters long.";
  }

  if (email === "") {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email, for example name@example.com.";
  }

  if (message === "") {
    errors.message = "Please type a message (spaces alone are not accepted).";
  } else if (message.length < 10) {
    errors.message = "Your message must be at least 10 characters long.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: errors,
    values: { name: name, email: email, topic: topic, message: message }
  };
}

/**
 * Builds the preview summary on the page.
 * textContent is used for every user-entered value, so nothing typed
 * by the visitor is ever treated as HTML.
 */
function showPreview(values) {
  const feedback = byId("form-feedback");
  if (!feedback) return;
  feedback.textContent = "";

  const box = document.createElement("div");
  box.className = "preview";

  const heading = document.createElement("h3");
  heading.textContent = "Validation successful";
  box.appendChild(heading);

  const note = document.createElement("p");
  note.textContent =
    "Your details were validated in the browser. No message was sent or delivered.";
  box.appendChild(note);

  const list = document.createElement("dl");
  const rows = [
    ["Name", values.name],
    ["Email", values.email],
    ["Topic", values.topic],
    ["Message", values.message]
  ];

  rows.forEach(function (row) {
    const term = document.createElement("dt");
    term.textContent = row[0];
    const detail = document.createElement("dd");
    detail.textContent = row[1];
    list.appendChild(term);
    list.appendChild(detail);
  });

  box.appendChild(list);
  feedback.appendChild(box);
}

/**
 * Shows a short form-level message when validation fails.
 */
function showFormProblem(count) {
  const feedback = byId("form-feedback");
  if (!feedback) return;
  feedback.textContent = "";

  const msg = document.createElement("p");
  msg.className = "error";
  msg.textContent =
    "Please fix the " + count + (count === 1 ? " problem" : " problems") +
    " shown above and try again.";
  feedback.appendChild(msg);
}

/**
 * Sets up the contact form events: submit and live error clearing.
 */
function initContactForm() {
  const form = byId("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    // Keep everything local: the page must not reload or send data
    event.preventDefault();

    const result = validateContactForm(form);

    // Show or clear each field's error
    setFieldError("name", result.errors.name || "");
    setFieldError("email", result.errors.email || "");
    setFieldError("message", result.errors.message || "");

    if (!result.valid) {
      showFormProblem(Object.keys(result.errors).length);
      // Move keyboard focus to the first field with a problem
      const firstBad = ["name", "email", "message"].find(function (id) {
        return result.errors[id];
      });
      if (firstBad) byId(firstBad).focus();
      return;
    }

    showPreview(result.values);
    form.reset();
  });

  // Clear a field's error as soon as the visitor starts correcting it
  ["name", "email", "message"].forEach(function (id) {
    const input = byId(id);
    if (input) {
      input.addEventListener("input", function () {
        setFieldError(id, "");
      });
    }
  });
}

/* ==========================================================
   FEATURE 2: MOBILE NAVIGATION
   ========================================================== */

/**
 * Opens or closes the menu and keeps the button state clear
 * for both sighted users (text) and screen readers (aria-expanded).
 */
function setMenuOpen(isOpen) {
  const toggle = byId("nav-toggle");
  const links = byId("nav-links");
  if (!toggle || !links) return;

  links.classList.toggle("open", isOpen);
  toggle.setAttribute("aria-expanded", String(isOpen));
  toggle.textContent = isOpen ? "Close" : "Menu";
}

function initMobileNav() {
  const toggle = byId("nav-toggle");
  const links = byId("nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", function () {
    setMenuOpen(!links.classList.contains("open"));
  });

  // Close the menu after a link is chosen
  links.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenuOpen(false);
    });
  });

  // Close with the Escape key and return focus to the button
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && links.classList.contains("open")) {
      setMenuOpen(false);
      toggle.focus();
    }
  });

  // Reset the menu state when the window becomes wide again
  window.addEventListener("resize", function () {
    if (window.innerWidth > 760) {
      setMenuOpen(false);
    }
  });
}

/* ==========================================================
   FEATURE 3: LIGHT / DARK THEME SWITCH
   ========================================================== */

const THEME_KEY = "portfolio-theme";

/**
 * Applies a theme ("dark" or "light") to the whole page
 * and updates the button icon and accessible label.
 */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  const button = byId("theme-toggle");
  const icon = byId("theme-icon");
  const label = byId("theme-label");
  if (!button || !icon || !label) return;

  const isLight = theme === "light";
  button.setAttribute("aria-pressed", String(isLight));
  icon.innerHTML = isLight ? "&#9790;" : "&#9728;"; // moon : sun (fixed symbols only)
  label.textContent = isLight ? "Switch to dark theme" : "Switch to light theme";
}

/**
 * Reads the saved theme (optional feature). Falls back to dark
 * if storage is blocked or empty.
 */
function getSavedTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" ? "light" : "dark";
  } catch (error) {
    return "dark";
  }
}

function initThemeSwitch() {
  const button = byId("theme-toggle");
  applyTheme(getSavedTheme());
  if (!button) return;

  button.addEventListener("click", function () {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (error) {
      /* Saving is optional, so ignore storage errors */
    }
  });
}

/* ==========================================================
   FEATURE 4: PHOTO GALLERY VIEWER
   ========================================================== */

// Each photo has a file, descriptive alt text and a caption
const galleryPhotos = [
  {
    src: "images/photo2.jpeg",
    alt: "Given Sichone sitting outdoors under a tree",
    caption: "Me outdoors, taking a break from studying."
  },
  {
    src: "images/photo3.jpeg",
    alt: "Given Sichone at Mulungushi University campus",
    caption: "On campus at Mulungushi University."
  },
  {
    src: "images/photo1.jpeg",
    alt: "Portrait of Given Sichone",
    caption: "A portrait of me, the student behind this portfolio."
  }
];

let currentPhoto = 0;

/**
 * Shows the photo at the given position and updates caption and counter.
 * The index wraps around: Next on the last photo goes to the first,
 * and Previous on the first photo goes to the last.
 */
function showPhoto(index) {
  const image = byId("gallery-image");
  const caption = byId("gallery-caption");
  const count = byId("gallery-count");
  if (!image || !caption || !count) return;

  const total = galleryPhotos.length;
  currentPhoto = (index + total) % total;

  const photo = galleryPhotos[currentPhoto];
  image.src = photo.src;
  image.alt = photo.alt;
  caption.textContent = photo.caption;
  count.textContent = "Photo " + (currentPhoto + 1) + " of " + total;
}

function initGallery() {
  const prev = byId("gallery-prev");
  const next = byId("gallery-next");
  if (!prev || !next) return;

  prev.addEventListener("click", function () {
    showPhoto(currentPhoto - 1);
  });
  next.addEventListener("click", function () {
    showPhoto(currentPhoto + 1);
  });

  showPhoto(0);
}

/* ==========================================================
   START EVERYTHING (the script is loaded with defer, so the
   page is already parsed when this runs)
   ========================================================== */
initContactForm();
initMobileNav();
initThemeSwitch();
initGallery();