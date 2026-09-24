// app.js — monta a página a partir de content/chapters.json.
//
// Para adicionar um conteúdo novo:
//   1. content/theory/NN-slug.html      (teoria)
//   2. content/questions/NN-slug.json   (questões)
//   3. uma entrada em content/chapters.json
// Menu, sumário, capítulo, questionário e chips de fontes são gerados aqui.
(function () {
  "use strict";

  var CONTENT = "content/";

  function fetchOk(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error(url + " (" + res.status + ")");
      return res;
    });
  }

  function num(i) {
    return (i < 9 ? "0" : "") + (i + 1);
  }

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function link(href, html, className) {
    var a = el("a", className, html);
    a.href = href;
    return a;
  }

  // ---- Navegação --------------------------------------------------------

  function renderMenu(chapters) {
    var menu = document.getElementById("site-menu");
    var inner = el("div", "wrap site-menu-list");
    inner.appendChild(link("#conteudos", "Sumário dos conteúdos"));
    chapters.forEach(function (ch, i) {
      inner.appendChild(link("#" + ch.id, (i + 1) + ". " + ch.label));
    });
    inner.appendChild(link("#fontes", "Fontes"));
    menu.appendChild(inner);
  }

  function renderToc(host, chapters) {
    chapters.forEach(function (ch, i) {
      host.appendChild(link("#" + ch.id, '<span class="toc-n">' + num(i) + "</span>" + ch.toc));
    });
  }

  // ---- Capítulos --------------------------------------------------------

  function quizBlockHtml(ch, i) {
    return (
      '<div class="quiz-block-head">' +
        "<h4>Simulado — Conteúdo " + num(i) + ": " + ch.toc + "</h4>" +
        '<span class="quiz-meta js-quiz-meta"></span>' +
      "</div>" +
      '<div class="quiz-intro js-quiz-intro">' +
        "<p>As alternativas de múltipla escolha são embaralhadas a cada início. As dissertativas " +
        "não têm correção automática: você confere sua resposta com o gabarito comentado.</p>" +
        '<button type="button" class="btn btn-primary js-quiz-start">Iniciar simulado</button>' +
      "</div>" +
      '<div class="quiz-play js-quiz-play" hidden>' +
        '<div class="quiz-status"><span class="js-quiz-current">Questão 1</span>' +
        '<span class="js-quiz-score">Acertos: 0</span></div>' +
        '<div class="quiz-progress"><div class="quiz-progress-bar js-quiz-progressbar"></div></div>' +
        '<div class="js-quiz-question-host"></div>' +
      "</div>" +
      '<div class="quiz-result js-quiz-result" hidden>' +
        "<p>Resultado (questões objetivas)</p>" +
        '<div class="score-big js-result-score">0 / 0</div>' +
        '<p class="js-result-text"></p>' +
        '<button type="button" class="btn btn-primary js-quiz-restart">Refazer simulado</button>' +
      "</div>"
    );
  }

  function renderChapter(ch, i, theoryHtml, questions) {
    var article = el("article", "chapter", theoryHtml);
    article.id = ch.id;
    var quiz = el("div", "quiz-block", quizBlockHtml(ch, i));
    quiz.setAttribute("data-quiz", ch.slug);
    article.appendChild(quiz);
    window.Quiz.mount(quiz, questions);
    return article;
  }

  function loadChapter(ch) {
    return Promise.all([
      fetchOk(CONTENT + "theory/" + ch.slug + ".html").then(function (r) { return r.text(); }),
      fetchOk(CONTENT + "questions/" + ch.slug + ".json").then(function (r) { return r.json(); }),
    ]);
  }

  // Tenta carregar todos e, se algum falhar, lista TODOS os arquivos com problema
  // (Promise.all sozinho reportaria só o primeiro).
  function loadAll(chapters) {
    return Promise.allSettled(chapters.map(loadChapter)).then(function (results) {
      var failed = results.filter(function (r) { return r.status === "rejected"; });
      if (failed.length) {
        throw new Error(failed.map(function (r) { return r.reason.message; }).join("; "));
      }
      return results.map(function (r) { return r.value; });
    });
  }

  // ---- Inicialização ----------------------------------------------------

  function showError(err) {
    var box = document.getElementById("loading");
    if (!box) return;
    box.classList.add("loading-error");
    box.textContent =
      "Não foi possível carregar: " + err.message + ". " +
      "Confira se a pasta content/ está completa (e commitada) e se a página está sendo servida " +
      "por um servidor estático, não aberta direto do disco.";
  }

  function init() {
    fetchOk(CONTENT + "chapters.json")
      .then(function (r) { return r.json(); })
      .then(function (chapters) {
        renderMenu(chapters);
        renderToc(document.getElementById("toc"), chapters);
        renderToc(document.getElementById("sources-toc"), chapters);
        return loadAll(chapters).then(function (loaded) {
          var host = document.querySelector("#chapters .wrap");
          var total = 0;
          host.innerHTML = "";
          chapters.forEach(function (ch, i) {
            total += loaded[i][1].length;
            host.appendChild(renderChapter(ch, i, loaded[i][0], loaded[i][1]));
          });
          var totalEl = document.getElementById("total-questions");
          if (totalEl) totalEl.textContent = total;
          // Âncora na URL (ex.: #c3): o alvo só existe depois da montagem.
          if (location.hash) {
            var target = document.getElementById(location.hash.slice(1));
            if (target) target.scrollIntoView();
          }
        });
      })
      .catch(showError);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
