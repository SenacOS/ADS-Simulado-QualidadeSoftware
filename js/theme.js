// theme.js — tema claro/escuro persistido em localStorage
(function () {
  "use strict";

  var STORAGE_KEY = "qs-theme";
  var root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
    updateToggleIcon();
  }

  function currentEffectiveTheme() {
    var explicit = root.getAttribute("data-theme");
    if (explicit) return explicit;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function updateToggleIcon() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    var effective = currentEffectiveTheme();
    btn.textContent = effective === "dark" ? "☀" : "☾";
    btn.setAttribute(
      "aria-label",
      effective === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
    );
  }

  function init() {
    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      /* localStorage indisponível — segue com preferência do sistema */
    }
    if (saved) applyTheme(saved);
    else updateToggleIcon();

    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = currentEffectiveTheme() === "dark" ? "light" : "dark";
        applyTheme(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch (e) {
          /* ignora falha de persistência */
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
