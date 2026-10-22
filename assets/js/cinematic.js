/* One paused-video seek engine. Cursor and scroll are mutually exclusive modes. */
(function () {
  "use strict";
  var hero = document.getElementById("hero");
  var video = document.getElementById("cinematic-video");
  var toggle = document.getElementById("motion-toggle");
  var hint = document.getElementById("cinematic-hint");
  if (!hero || !video) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var compact = window.matchMedia("(max-width: 660px)");
  var connection = navigator.connection;
  var constrained = (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (connection && connection.saveData);
  var controller = new AbortController();
  var options = { signal: controller.signal, passive: true };
  var enabled = false;
  var paused = false;
  var failed = false;
  var visible = true;
  var mode = "scroll";
  var cursorProgress = 0;
  var scrollProgress = 0;
  var duration = 0;
  var current = 0;
  var x = 0, y = 0, targetX = 0, targetY = 0;
  var raf = 0, lastFrame = 0, lastSeek = 0;
  var frameCallback = 0;
  var seekCount = 0;
  var clamp = function (v, min, max) { return Math.min(max, Math.max(min, v)); };

  function cancel() {
    cancelAnimationFrame(raf);
    raf = 0;
    lastFrame = 0;
    if (frameCallback && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(frameCallback);
    frameCallback = 0;
  }
  function wake() {
    if (enabled && !paused && visible && !document.hidden && !raf) raf = requestAnimationFrame(tick);
  }
  function tick(now) {
    raf = 0;
    if (!enabled || paused || !visible || document.hidden) return;
    // Frame-rate-independent equivalent of current += (target-current) * 0.10.
    var alpha = 1 - Math.pow(0.90, Math.min(64, now - (lastFrame || now - 16.67)) / 16.67);
    lastFrame = now;
    var progress = mode === "cursor" ? cursorProgress : scrollProgress;
    var target = clamp(progress, 0, 1) * duration;
    current += (target - current) * alpha;
    x += (targetX - x) * alpha;
    y += (targetY - y) * alpha;
    hero.style.setProperty("--hero-ry", (x * 1.2).toFixed(3) + "deg");
    hero.style.setProperty("--hero-rx", (-y * .7).toFixed(3) + "deg");
    if (duration && !video.seeking && now - lastSeek >= 70 && Math.abs(video.currentTime - current) >= .035) {
      video.pause();
      video.currentTime = clamp(current, 0, duration);
      seekCount++;
      lastSeek = now;
    }
    if (Math.abs(current - target) > .025 || Math.abs(x - targetX) > .005 || Math.abs(y - targetY) > .005 ||
        (duration && !video.seeking && Math.abs(video.currentTime - target) > .05)) wake();
  }
  function updateScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    document.documentElement.style.setProperty("--progress", max > 0 ? clamp(window.scrollY / max, 0, 1) : 0);
    var rect = hero.getBoundingClientRect();
    scrollProgress = clamp(-rect.top / Math.max(1, rect.height * .85), 0, 1);
    mode = "scroll";
    wake();
  }
  function configure() {
    enabled = !reduced.matches && fine.matches && !compact.matches && !constrained && !failed;
    document.documentElement.classList.toggle("motion-enabled", enabled && !paused);
    toggle.hidden = !enabled;
    toggle.textContent = paused ? "Enable motion" : "Pause motion";
    toggle.setAttribute("aria-pressed", String(paused));
    hint.textContent = enabled ? "Move cursor / scroll to scrub" : "Scarborough, Ontario";
    if (enabled && !video.hasAttribute("src")) {
      video.src = video.dataset.src;
      video.preload = "metadata";
      video.load();
    }
    if (!enabled || paused) {
      cancel();
      video.pause();
      hero.style.removeProperty("--hero-rx");
      hero.style.removeProperty("--hero-ry");
      if (!enabled) video.classList.remove("is-ready");
    } else wake();
  }
  video.addEventListener("loadedmetadata", function () {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    duration = Math.max(0, video.duration - 1 / 24);
    video.pause();
    wake();
  }, options);
  video.addEventListener("loadeddata", function () {
    if (enabled) video.classList.add("is-ready");
  }, options);
  video.addEventListener("seeked", function () {
    if (enabled) {
      video.classList.add("is-ready");
      if (video.requestVideoFrameCallback && !frameCallback) {
        frameCallback = video.requestVideoFrameCallback(function () { frameCallback = 0; });
      }
      wake();
    }
  }, options);
  video.addEventListener("error", function () { failed = true; configure(); }, options);
  hero.addEventListener("pointermove", function (event) {
    if (!enabled || paused || event.pointerType === "touch") return;
    var rect = hero.getBoundingClientRect();
    cursorProgress = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    targetX = cursorProgress * 2 - 1;
    targetY = clamp((event.clientY - rect.top) / rect.height, 0, 1) * 2 - 1;
    hero.style.setProperty("--light-x", (cursorProgress * 100) + "%");
    hero.style.setProperty("--light-y", ((targetY + 1) * 50) + "%");
    mode = "cursor";
    wake();
  }, options);
  hero.addEventListener("pointerleave", function () { targetX = targetY = 0; wake(); }, options);
  toggle.addEventListener("click", function () { paused = !paused; configure(); }, { signal: controller.signal });
  window.addEventListener("scroll", updateScroll, options);
  window.addEventListener("resize", updateScroll, options);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) cancel(); else wake();
  }, options);
  [reduced, fine, compact].forEach(function (query) { query.addEventListener("change", configure, { signal: controller.signal }); });
  var observer = window.IntersectionObserver ? new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    if (visible) wake(); else cancel();
  }) : null;
  if (observer) observer.observe(hero);

  document.querySelectorAll(".button, .project-visual, .capability").forEach(function (element) {
    element.addEventListener("pointermove", function (event) {
      if (!enabled || paused || event.pointerType === "touch") return;
      var rect = element.getBoundingClientRect();
      var px = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      var py = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      element.style.setProperty("--spot-x", px * 100 + "%");
      element.style.setProperty("--spot-y", py * 100 + "%");
      if (element.matches(".button")) element.style.transform = "translate(" + ((px - .5) * 6) + "px," + ((py - .5) * 6) + "px)";
      if (element.matches(".project-visual")) {
        element.style.setProperty("--card-rx", (-(py - .5) * 3) + "deg");
        element.style.setProperty("--card-ry", ((px - .5) * 3) + "deg");
      }
    }, options);
    function reset() {
      element.style.removeProperty("transform");
      ["--card-rx", "--card-ry", "--spot-x", "--spot-y"].forEach(function (property) { element.style.removeProperty(property); });
    }
    element.addEventListener("pointerleave", reset, options);
    toggle.addEventListener("click", reset, { signal: controller.signal });
    reduced.addEventListener("change", reset, { signal: controller.signal });
  });
  window.addEventListener("pagehide", function (event) {
    cancel();
    if (!event.persisted) { if (observer) observer.disconnect(); controller.abort(); }
  }, options);
  window.addEventListener("pageshow", wake, options);
  // Read-only diagnostics for smoke tests; no personal information or telemetry.
  Object.defineProperty(video, "cinematicState", { get: function () {
    return { mode: mode, enabled: enabled, paused: paused, target: (mode === "cursor" ? cursorProgress : scrollProgress) * duration, seeks: seekCount, scheduled: Boolean(raf) };
  } });
  configure();
  updateScroll();
}());
