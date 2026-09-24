// nav.js — menu hambúrguer (dentro do header sticky, então acompanha a rolagem).
// Os links são gerados por app.js; aqui só cuidamos de abrir/fechar.
(function () {
  "use strict";

  function init() {
    var toggle = document.getElementById("nav-toggle");
    var menu = document.getElementById("site-menu");
    var header = document.getElementById("site-header");
    if (!toggle || !menu) return;

    function setOpen(open) {
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fechar menu de navegação" : "Abrir menu de navegação");
    }

    toggle.addEventListener("click", function () {
      setOpen(menu.hidden);
    });

    // Fecha ao escolher um link (delegação: os links são criados depois).
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    // Fecha com Esc ou clicando fora do header.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (!menu.hidden && header && !header.contains(e.target)) setOpen(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
