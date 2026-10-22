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
    return flow + '<div class="gallery" data-gallery><div id="gallery-panel-' + project.id + '" role="tabpanel" aria-labelledby="gallery-tab-' + project.id + '-0"><button type="button" class="gallery-open" aria-label="Open larger image: ' + first.title + '"><img class="gallery-main" src="' + first.src + '" alt="' + first.alt + '" loading="lazy" decoding="async"></button><div class="gallery-caption"><strong>' + first.title + '</strong><span>' + first.caption + '</span></div></div><div class="gallery-tabs' + tabClass + '" role="tablist" aria-label="' + project.title + ' images" style="--gallery-count:' + project.gallery.length + '">' + project.gallery.map(function (image, index) {
      return '<button type="button" role="tab" id="gallery-tab-' + project.id + '-' + index + '" aria-controls="gallery-panel-' + project.id + '" tabindex="' + (index === 0 ? '0' : '-1') + '" aria-selected="' + (index === 0 ? "true" : "false") + '" data-src="' + image.src + '" data-title="' + image.title + '" data-caption="' + image.caption + '" data-alt="' + image.alt + '"><span class="mono">' + String(index + 1).padStart(2, "0") + '</span>' + image.label + '</button>';
    }).join("") + '</div></div>';
  }

  function renderProjects() {
    document.getElementById("projects").innerHTML = content.projects.map(function (project, index) {
      return '<article class="project reveal" id="project-' + project.id + '"><h3 class="project-heading"><button class="project-summary" type="button" aria-expanded="' + (index === 0 ? "true" : "false") + '" aria-controls="panel-' + project.id + '"><span class="mono">' + project.year + '</span><span class="project-title">' + project.title + '</span><span class="project-teaser">' + project.summary + '</span><span class="project-arrow" aria-hidden="true">+</span><span class="project-action mono">' + (index === 0 ? 'Hide details' : 'View details') + '</span></button></h3><div class="project-panel" id="panel-' + project.id + '"' + (index === 0 ? "" : " hidden") + '><div class="project-copy"><div class="project-meta">' + project.tags.map(function (tag) { return '<span>' + tag + '</span>'; }).join("") + '</div><h4>Challenge</h4><p>' + project.challenge + '</p><h4>Engineering brief</h4><p>' + project.description + '</p><p class="project-result"><strong>Result:</strong> ' + project.outcome + '</p><h4>Implementation &amp; validation</h4><ul class="project-points">' + project.points.map(function (point) { return '<li>' + point + '</li>'; }).join("") + '</ul></div><div class="project-visual">' + projectVisual(project) + '</div></div></article>';
    }).join("");
  }

  function renderExperience() {
    var milestones = content.experience.map(function (item) {
      return { kind: "work", date: item.date, title: item.role, place: item.company, detail: item.detail, current: item.current };
    }).concat(content.education.map(function (item) {
      return { kind: "education", date: item.date, title: item.credential, place: item.school };
    }));
    function startDate(item) {
      var date = item.date.match(/([A-Za-z]+) (\d{4})/);
      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return Number(date[2]) * 12 + months.indexOf(date[1]);
    }
    milestones.sort(function (a, b) { return startDate(b) - startDate(a); });
    document.getElementById("timeline").innerHTML = milestones.map(function (item) {
      return '<article class="role reveal" data-kind="' + item.kind + '"><div><span class="milestone-kind mono">' + (item.kind === "work" ? "Work experience" : "Education") + '</span><time class="role-date mono">' + item.date + '</time>' + (item.current ? '<span class="current mono">Current role</span>' : "") + '</div><div><h3>' + item.title + '</h3><p class="role-company">' + item.place + '</p></div>' + (item.detail ? '<p class="role-detail">' + item.detail + '</p>' : "") + '</article>';
    }).join("");
    var filters = document.getElementById("journey-filters");
    var buttons = filters.querySelectorAll("button");
    function filterJourney(kind) {
      var visible = 0;
      document.querySelectorAll("#timeline .role").forEach(function (card) {
        card.hidden = kind !== "all" && card.dataset.kind !== kind;
        card.classList.toggle("role-right", !card.hidden && visible % 2 === 1);
        if (!card.hidden) visible++;
      });
      buttons.forEach(function (button) { button.setAttribute("aria-pressed", String(button.dataset.journeyFilter === kind)); });
      document.getElementById("journey-status").textContent = visible + " " + (kind === "education" ? "education" : kind === "work" ? "work experience" : "career & education") + " milestones";
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () { filterJourney(button.dataset.journeyFilter); updateNavigation(); });
    });
    filters.hidden = false;
    filterJourney("all");
  }

  function renderCapabilities() {
    document.getElementById("capability-grid").innerHTML = content.capabilities.map(function (item, index) {
      return '<article class="capability"><span class="mono">C / ' + String(index + 1).padStart(2, "0") + '</span><div><h3>' + item.title + '</h3><ul>' + item.items.map(function (skill) { return '<li>' + skill + '</li>'; }).join("") + '</ul></div></article>';
    }).join("");
  }

  renderProjects();
  renderExperience();
  renderCapabilities();

  var menu = document.getElementById("mobile-menu");
  var menuToggle = document.querySelector(".menu-toggle");
  var menuClose = document.querySelector(".menu-close");
  var menuLinks = Array.prototype.slice.call(menu.querySelectorAll("a"));
  var menuFocusables = [menuClose].concat(menuLinks);

  function setMenu(open) {
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    menu.inert = !open;
    [document.querySelector(".site-header"), document.querySelector("main"), document.querySelector("footer")].forEach(function (element) { element.inert = open; });
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("menu-open", open);
    if (open) menuClose.focus(); else menuToggle.focus();
  }

  window.addEventListener("resize", function () {
    if (window.innerWidth > 980 && menu.classList.contains("open")) setMenu(false);
  });

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
      button.querySelector(".project-action").textContent = open ? "View details" : "Hide details";
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
      tabs.forEach(function (item) {
        item.setAttribute("aria-selected", item === tab ? "true" : "false");
        item.tabIndex = item === tab ? 0 : -1;
      });
      gallery.querySelector('[role="tabpanel"]').setAttribute("aria-labelledby", tab.id);
      mainImage.src = tab.dataset.src;
      mainImage.alt = tab.dataset.alt;
      title.textContent = tab.dataset.title;
      caption.textContent = tab.dataset.caption;
      gallery.querySelector(".gallery-open").setAttribute("aria-label", "Open larger image: " + tab.dataset.title);
    }
    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { selectTab(tab); });
      tab.addEventListener("keydown", function (event) {
        if (["ArrowRight", "ArrowLeft", "Home", "End"].indexOf(event.key) === -1) return;
        event.preventDefault();
        var next = event.key === "ArrowRight" ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
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
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.remove("reveal-pending"); observer.unobserve(entry.target); } });
    }, { threshold: .08 });
    revealItems.forEach(function (item) { item.classList.add("reveal-pending"); observer.observe(item); });
  }

  var nav = document.querySelector(".desktop-nav");
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll("a"));
  var sectionLinks = navLinks.concat(menuLinks.filter(function (link) { return link.hash; }));
  function updateNavigation() {
    if (!navLinks) return;
    var active = "";
    navLinks.forEach(function (link) {
      var section = document.querySelector(link.hash);
      if (section.getBoundingClientRect().top <= Math.max(150, window.innerHeight * .3)) active = link.hash;
    });
    sectionLinks.forEach(function (link) {
      if (link.hash === active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    var selected = navLinks.filter(function (link) { return link.hash === active; })[0];
    nav.classList.toggle("has-active", Boolean(selected));
    if (selected) {
      var rect = selected.getBoundingClientRect();
      nav.style.setProperty("--pill-x", (rect.left - nav.getBoundingClientRect().left - 10) + "px");
      nav.style.setProperty("--pill-width", (rect.width + 20) + "px");
    }
  }
  window.addEventListener("scroll", updateNavigation, { passive: true });
  window.addEventListener("resize", updateNavigation, { passive: true });
  if (document.fonts) document.fonts.ready.then(updateNavigation);
  updateNavigation();

  var copyEmail = document.getElementById("copy-email");
  if (navigator.clipboard && window.isSecureContext) {
    copyEmail.parentElement.hidden = false;
    copyEmail.addEventListener("click", async function () {
      var status = document.getElementById("copy-status");
      try {
        var address = document.querySelector('.contact-copy a[href^="mailto:"]').getAttribute("href").slice(7);
        await navigator.clipboard.writeText(address);
        status.textContent = "Email address copied.";
      } catch (error) {
        status.textContent = "Copy unavailable. Use the email link above.";
      }
    });
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
