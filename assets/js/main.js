(function () {
  "use strict";

  var content = window.PORTFOLIO_CONTENT;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function schematic(type) {
    if (type === "vision") {
      return '<div class="schematic" aria-label="Vision inspection signal diagram"><svg viewBox="0 0 620 340" role="img"><title>Multi-camera inspection workflow</title><g fill="none" stroke="currentColor" stroke-width="2"><rect x="48" y="98" width="128" height="144"/><rect x="246" y="52" width="128" height="92"/><rect x="246" y="196" width="128" height="92"/><rect x="444" y="98" width="128" height="144"/><path d="M176 170H222M222 170V98H246M222 170V242H246M374 98H412V170H444M374 242H412V170" stroke="#f06414"/><circle cx="112" cy="170" r="29"/><circle cx="508" cy="170" r="29"/></g><g fill="currentColor" font-family="DM Mono" font-size="13" text-anchor="middle"><text x="112" y="174">PART</text><text x="310" y="105">CAMERA 01</text><text x="310" y="249">CAMERA 02</text><text x="508" y="174">PLC</text></g><g fill="#f06414"><circle cx="222" cy="170" r="6"/><circle cx="412" cy="170" r="6"/></g></svg></div>';
    }
    return '<div class="schematic" aria-label="Automation cell troubleshooting diagram"><svg viewBox="0 0 620 340" role="img"><title>Automation cell control layers</title><g fill="none" stroke="currentColor" stroke-width="2"><circle cx="310" cy="170" r="58"/><circle cx="310" cy="170" r="116" stroke-dasharray="7 8"/><path d="M310 54V24M310 316V286M194 170H74M546 170H426M228 88L168 30M392 252L452 312M228 252L168 312M392 88L452 30"/><rect x="20" y="143" width="90" height="54"/><rect x="510" y="143" width="90" height="54"/></g><g fill="currentColor" font-family="DM Mono" font-size="13" text-anchor="middle"><text x="310" y="174">PLC / HMI</text><text x="65" y="175">FIELD I/O</text><text x="555" y="175">MOTION</text><text x="310" y="20">VISION</text><text x="470" y="326">ROBOT</text><text x="150" y="326">EOAT</text><text x="150" y="24">SAFETY</text><text x="470" y="24">NETWORK</text></g><circle cx="310" cy="170" r="8" fill="#f06414"/></svg></div>';
  }

  function projectVisual(project) {
    if (project.visual !== "gallery") return schematic(project.visual);
    var first = project.gallery[0];
    return '<div class="gallery" data-gallery><button type="button" class="gallery-open" aria-label="Open larger screenshot"><img class="gallery-main" src="' + first.src + '" alt="' + first.alt + '" loading="lazy"></button><div class="gallery-caption"><strong>' + first.title + '</strong><span>' + first.caption + '</span></div><div class="gallery-tabs" role="tablist" aria-label="Automation Backup Manager screens">' + project.gallery.map(function (image, index) {
      return '<button type="button" role="tab" aria-selected="' + (index === 0 ? "true" : "false") + '" data-src="' + image.src + '" data-title="' + image.title + '" data-caption="' + image.caption + '" data-alt="' + image.alt + '">' + image.label + '</button>';
    }).join("") + '</div></div>';
  }

  function renderProjects() {
    document.getElementById("projects").innerHTML = content.projects.map(function (project, index) {
      return '<article class="project reveal"><button class="project-summary" type="button" aria-expanded="' + (index === 0 ? "true" : "false") + '" aria-controls="panel-' + project.id + '"><span class="mono">' + project.year + '</span><span class="project-title">' + project.title + '</span><span class="project-teaser">' + project.summary + '</span><span class="project-arrow" aria-hidden="true">↗</span></button><div class="project-panel" id="panel-' + project.id + '"' + (index === 0 ? "" : " hidden") + '><div class="project-copy"><div class="project-meta">' + project.tags.map(function (tag) { return '<span>' + tag + '</span>'; }).join("") + '</div><p>' + project.description + '</p><p><strong>Result:</strong> ' + project.outcome + '</p><ul class="project-points">' + project.points.map(function (point) { return '<li>' + point + '</li>'; }).join("") + '</ul></div><div class="project-visual">' + projectVisual(project) + '</div></div></article>';
    }).join("");
  }

  function renderExperience() {
    document.getElementById("timeline").innerHTML = content.experience.map(function (item) {
      return '<article class="role"><div><time class="role-date mono">' + item.date + '</time>' + (item.current ? '<span class="current mono">Current role</span>' : "") + '</div><div><h3>' + item.role + '</h3><p class="role-company">' + item.company + '</p></div><p class="role-detail">' + item.detail + '</p></article>';
    }).join("");
  }

  function renderCapabilities() {
    document.getElementById("capability-grid").innerHTML = content.capabilities.map(function (item, index) {
      return '<article class="capability"><span class="mono">C / ' + String(index + 1).padStart(2, "0") + '</span><div><h3>' + item.title + '</h3><ul>' + item.items.map(function (skill) { return '<li>' + skill + '</li>'; }).join("") + '</ul></div></article>';
    }).join("");
  }

  function renderEducation() {
    document.getElementById("education-list").innerHTML = content.education.map(function (item) {
      return '<article class="education-item"><h3>' + item.credential + '</h3><p>' + item.school + '</p><time class="mono">' + item.date + '</time></article>';
    }).join("");
  }

  renderProjects();
  renderExperience();
  renderCapabilities();
  renderEducation();

  var menu = document.getElementById("mobile-menu");
  var menuToggle = document.querySelector(".menu-toggle");
  var menuClose = document.querySelector(".menu-close");
  var menuLinks = Array.prototype.slice.call(menu.querySelectorAll("a"));
  var menuFocusables = [menuClose].concat(menuLinks);

  function setMenu(open) {
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("menu-open", open);
    if (open) menuClose.focus(); else menuToggle.focus();
  }

  menuToggle.addEventListener("click", function () { setMenu(true); });
  menuClose.addEventListener("click", function () { setMenu(false); });
  menuLinks.forEach(function (link) { link.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menu.classList.contains("open")) setMenu(false);
    if (event.key === "Tab" && menu.classList.contains("open")) {
      var first = menuFocusables[0];
      var last = menuFocusables[menuFocusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  document.querySelectorAll(".project-summary").forEach(function (button) {
    button.addEventListener("click", function () {
      var panel = document.getElementById(button.getAttribute("aria-controls"));
      var open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  });

  var dialog = document.getElementById("image-dialog");
  var dialogImage = document.getElementById("dialog-image");
  var dialogTitle = document.getElementById("dialog-title");
  document.querySelectorAll("[data-gallery]").forEach(function (gallery) {
    var mainImage = gallery.querySelector(".gallery-main");
    var title = gallery.querySelector(".gallery-caption strong");
    var caption = gallery.querySelector(".gallery-caption span");
    var tabs = Array.prototype.slice.call(gallery.querySelectorAll('[role="tab"]'));
    function selectTab(tab) {
      tabs.forEach(function (item) { item.setAttribute("aria-selected", item === tab ? "true" : "false"); });
      mainImage.src = tab.dataset.src;
      mainImage.alt = tab.dataset.alt;
      title.textContent = tab.dataset.title;
      caption.textContent = tab.dataset.caption;
    }
    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { selectTab(tab); });
      tab.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        var next = event.key === "ArrowRight" ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
        tabs[next].focus(); selectTab(tabs[next]);
      });
    });
    gallery.querySelector(".gallery-open").addEventListener("click", function () {
      dialogImage.src = mainImage.src; dialogImage.alt = mainImage.alt; dialogTitle.textContent = title.textContent; dialog.showModal();
    });
  });
  document.getElementById("dialog-close").addEventListener("click", function () { dialog.close(); });
  dialog.addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); });

  var header = document.getElementById("site-header");
  function updateHeader() { header.classList.toggle("scrolled", window.scrollY > 24); }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  var revealItems = document.querySelectorAll(".reveal");
  if (!reducedMotion && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); } });
    }, { threshold: .08 });
    revealItems.forEach(function (item) { observer.observe(item); });
  } else revealItems.forEach(function (item) { item.classList.add("visible"); });

  var cursor = document.querySelector(".cursor-glow");
  if (!reducedMotion && window.matchMedia("(pointer:fine)").matches) {
    document.addEventListener("pointermove", function (event) { cursor.style.left = event.clientX + "px"; cursor.style.top = event.clientY + "px"; });
  }

  var time = document.getElementById("local-time");
  function updateTime() {
    try { time.textContent = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date()); }
    catch (error) { time.textContent = "Toronto"; }
  }
  updateTime(); window.setInterval(updateTime, 60000);
  document.getElementById("year").textContent = new Date().getFullYear();

  if (new URLSearchParams(window.location.search).get("sent") === "1") {
    document.getElementById("form-status").textContent = "Thank you. Your message has been sent.";
  }
}());
