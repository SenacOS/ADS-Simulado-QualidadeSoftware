// quiz.js — motor de renderização e execução dos questionários.
// Não conhece o conteúdo: recebe a lista de questões via Quiz.mount().
// Cada bloco de quiz é independente (um por conteúdo teórico) e usa apenas
// as questões daquele conteúdo — nunca mistura conteúdos diferentes.
(function () {
  "use strict";

  function shuffle(array) {
    var a = array.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  var LETTERS = ["A", "B", "C", "D", "E"];

  function buildRuntimeQuestions(rawQuestions) {
    // Embaralha a ORDEM das questões e, para cada MC, embaralha as
    // alternativas, preservando qual delas é a correta (por conteúdo do
    // texto, não por índice fixo) — o gabarito nunca muda com o shuffle.
    var shuffledOrder = shuffle(rawQuestions);
    return shuffledOrder.map(function (q) {
      if (q.type === "mc") {
        var opts = q.options.map(function (text, idx) {
          return { text: text, isCorrect: idx === q.correct };
        });
        opts = shuffle(opts);
        return {
          type: "mc",
          q: q.q,
          explanation: q.explanation,
          options: opts,
        };
      }
      return {
        type: "dissertativa",
        q: q.q,
        expected: q.expected,
      };
    });
  }

  function QuizController(root, questions) {
    this.root = root;
    this.raw = questions || [];
    this.state = null;

    this.introEl = root.querySelector(".js-quiz-intro");
    this.playEl = root.querySelector(".js-quiz-play");
    this.resultEl = root.querySelector(".js-quiz-result");
    this.startBtn = root.querySelector(".js-quiz-start");
    this.restartBtns = root.querySelectorAll(".js-quiz-restart");

    this.progressBar = root.querySelector(".js-quiz-progressbar");
    this.statusCurrent = root.querySelector(".js-quiz-current");
    this.statusScore = root.querySelector(".js-quiz-score");
    this.questionHost = root.querySelector(".js-quiz-question-host");

    this.resultScore = root.querySelector(".js-result-score");
    this.resultText = root.querySelector(".js-result-text");

    var mcCount = this.raw.filter(function (q) { return q.type === "mc"; }).length;
    var disCount = this.raw.length - mcCount;
    var metaEl = root.querySelector(".js-quiz-meta");
    if (metaEl) {
      metaEl.textContent =
        this.raw.length +
        " questões (" +
        mcCount +
        " de múltipla escolha" +
        (disCount ? " + " + disCount + " dissertativa" + (disCount > 1 ? "s" : "") : "") +
        ")";
    }

    this.bindEvents();
  }

  QuizController.prototype.bindEvents = function () {
    var self = this;
    if (this.startBtn) {
      this.startBtn.addEventListener("click", function () {
        self.start();
      });
    }
    this.restartBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        self.start();
      });
    });
  };

  QuizController.prototype.start = function () {
    this.state = {
      questions: buildRuntimeQuestions(this.raw),
      index: 0,
      score: 0,
      scored: 0, // quantidade de MC já respondidas (para % de acerto)
    };
    this.introEl.hidden = true;
    this.resultEl.hidden = true;
    this.playEl.hidden = false;
    this.renderQuestion();
  };

  QuizController.prototype.renderQuestion = function () {
    var st = this.state;
    var total = st.questions.length;
    var current = st.questions[st.index];
    var pct = Math.round((st.index / total) * 100);

    this.progressBar.style.width = pct + "%";
    this.statusCurrent.textContent = "Questão " + (st.index + 1) + " de " + total;
    this.statusScore.textContent = "Acertos: " + st.score + (st.scored ? " / " + st.scored : "");

    this.questionHost.innerHTML = "";
    if (current.type === "mc") {
      this.renderMC(current);
    } else {
      this.renderEssay(current);
    }
  };

  QuizController.prototype.renderMC = function (question) {
    var self = this;
    var card = document.createElement("div");
    card.className = "question-card";

    var kind = document.createElement("span");
    kind.className = "q-kind";
    kind.textContent = "Múltipla escolha";
    card.appendChild(kind);

    var qText = document.createElement("p");
    qText.className = "q-text";
    qText.textContent = question.q;
    card.appendChild(qText);

    var feedback = document.createElement("div");
    feedback.className = "feedback";
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");

    var list = document.createElement("ul");
    list.className = "options";
    list.setAttribute("role", "list");

    var answered = false;

    question.options.forEach(function (opt, i) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";

      var letter = document.createElement("span");
      letter.className = "opt-letter";
      letter.textContent = LETTERS[i] + ".";
      btn.appendChild(letter);

      var span = document.createElement("span");
      span.textContent = opt.text;
      btn.appendChild(span);

      btn.addEventListener("click", function () {
        if (answered) return;
        answered = true;
        self.state.scored++;

        var allOptionButtons = list.querySelectorAll(".option");
        allOptionButtons.forEach(function (b, idx) {
          b.disabled = true;
          var o = question.options[idx];
          if (o.isCorrect) {
            b.classList.add("is-correct");
          } else if (b === btn) {
            b.classList.add("is-wrong");
          } else {
            b.classList.add("is-muted");
          }
        });

        feedback.classList.add("is-visible");
        if (opt.isCorrect) {
          self.state.score++;
          feedback.classList.add("correct");
          feedback.innerHTML =
            '<strong class="verdict">Correto.</strong>' +
            "<span>" + question.explanation + "</span>" +
            '<span class="feedback-tag">Fundamentado no conteúdo teórico acima.</span>';
        } else {
          feedback.classList.add("incorrect");
          feedback.innerHTML =
            '<strong class="verdict">Incorreto.</strong>' +
            "<span>" + question.explanation + "</span>" +
            '<span class="feedback-tag">Fundamentado no conteúdo teórico acima.</span>';
        }

        self.statusScore.textContent =
          "Acertos: " + self.state.score + " / " + self.state.scored;

        nextBtn.disabled = false;
        nextBtn.focus();
      });

      li.appendChild(btn);
      list.appendChild(li);
    });

    card.appendChild(list);
    card.appendChild(feedback);

    var actions = document.createElement("div");
    actions.className = "q-actions";
    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "btn btn-primary js-next";
    nextBtn.disabled = true;
    nextBtn.textContent =
      this.state.index === this.state.questions.length - 1
        ? "Ver resultado →"
        : "Próxima questão →";
    var self2 = this;
    nextBtn.addEventListener("click", function () {
      self2.advance();
    });
    actions.appendChild(nextBtn);
    card.appendChild(actions);

    this.questionHost.appendChild(card);
  };

  QuizController.prototype.renderEssay = function (question) {
    var self = this;
    var card = document.createElement("div");
    card.className = "question-card";

    var kind = document.createElement("span");
    kind.className = "q-kind";
    kind.textContent = "Dissertativa · sem correção automática";
    card.appendChild(kind);

    var qText = document.createElement("p");
    qText.className = "q-text";
    qText.textContent = question.q;
    card.appendChild(qText);

    var textarea = document.createElement("textarea");
    textarea.className = "essay-area";
    textarea.setAttribute("aria-label", "Sua resposta");
    textarea.placeholder = "Escreva sua resposta aqui...";
    card.appendChild(textarea);

    var answerBox = document.createElement("div");
    answerBox.className = "essay-answer";
    answerBox.innerHTML =
      '<span class="verdict">Resposta esperada / gabarito comentado — compare manualmente com o que você escreveu:</span>' +
      "<span>" + question.expected + "</span>";
    card.appendChild(answerBox);

    var actions = document.createElement("div");
    actions.className = "q-actions";

    var submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.className = "btn btn-ghost js-submit-essay";
    submitBtn.textContent = "Enviar e ver resposta esperada";

    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "btn btn-primary js-next";
    nextBtn.disabled = true;
    nextBtn.textContent =
      this.state.index === this.state.questions.length - 1
        ? "Ver resultado →"
        : "Próxima questão →";

    submitBtn.addEventListener("click", function () {
      answerBox.classList.add("is-visible");
      submitBtn.disabled = true;
      textarea.disabled = true;
      nextBtn.disabled = false;
      nextBtn.focus();
    });

    nextBtn.addEventListener("click", function () {
      self.advance();
    });

    actions.appendChild(submitBtn);
    actions.appendChild(nextBtn);
    card.appendChild(actions);

    this.questionHost.appendChild(card);
  };

  QuizController.prototype.advance = function () {
    var st = this.state;
    if (st.index < st.questions.length - 1) {
      st.index++;
      this.renderQuestion();
    } else {
      this.showResult();
    }
  };

  QuizController.prototype.showResult = function () {
    var st = this.state;
    this.progressBar.style.width = "100%";
    this.playEl.hidden = true;
    this.resultEl.hidden = false;

    var pct = st.scored ? Math.round((st.score / st.scored) * 100) : 0;
    this.resultScore.textContent = st.score + " / " + st.scored;

    var msg;
    if (pct >= 80) {
      msg = "Excelente domínio deste conteúdo (" + pct + "% de acerto nas questões objetivas). ";
    } else if (pct >= 60) {
      msg = "Bom resultado (" + pct + "% de acerto), mas vale revisar os pontos que você errou. ";
    } else {
      msg = "Esse conteúdo ainda precisa de revisão (" + pct + "% de acerto). ";
    }
    msg +=
      "As questões dissertativas não entram nessa contagem automática — revise-as manualmente comparando com a resposta esperada.";
    this.resultText.textContent = msg;
  };

  // API pública: js/app.js chama Quiz.mount(elemento, questoes) para cada bloco.
  window.Quiz = {
    mount: function (root, questions) {
      return new QuizController(root, questions);
    },
  };
})();
