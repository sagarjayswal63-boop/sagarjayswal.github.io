(function () {
  "use strict";

  var content = window.PORTFOLIO_CONTENT;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function projectVisual(project) {
    if (!project.gallery || !project.gallery.length) return "";
    var first = project.gallery[0];
    var flow = project.flow ? '<ol class="project-flow" aria-label="' + project.title + ' workflow">' + project.flow.map(function (step, index) {
      return '<li><span class="mono">' + String(index + 1).padStart(2, "0") + '</span><strong>' + step + '</strong></li>';
    }).join("") + '</ol>' : "";
    var tabClass = project.gallery.length % 2 ? " gallery-tabs-odd" : "";
    return flow + '<div class="gallery" data-gallery><button type="button" class="gallery-open" aria-label="Open larger image: ' + first.title + '"><img class="gallery-main" src="' + first.src + '" alt="' + first.alt + '" loading="lazy" decoding="async"></button><div class="gallery-caption"><strong>' + first.title + '</strong><span>' + first.caption + '</span></div><div class="gallery-tabs' + tabClass + '" role="tablist" aria-label="' + project.title + ' images" style="--gallery-count:' + project.gallery.length + '">' + project.gallery.map(function (image, index) {
      return '<button type="button" role="tab" aria-selected="' + (index === 0 ? "true" : "false") + '" data-src="' + image.src + '" data-title="' + image.title + '" data-caption="' + image.caption + '" data-alt="' + image.alt + '"><span class="mono">' + String(index + 1).padStart(2, "0") + '</span>' + image.label + '</button>';
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
      gallery.querySelector(".gallery-open").setAttribute("aria-label", "Open larger image: " + tab.dataset.title);
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
