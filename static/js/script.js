(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------------------------------------------
     0. TELA DE CARREGAMENTO (PRELOADER)
     Fica visível por um tempo mínimo curto e some assim que a
     página termina de carregar — o que vier depois.
     ------------------------------------------------------- */
  (function () {
    var preloader = document.getElementById("preloader");
    if (!preloader) return;

    document.body.classList.add("is-loading");

    var minDelay = reduceMotion ? 200 : 600;
    var pageReady = document.readyState === "complete";
    var timeUp = false;

    function hidePreloader() {
      if (!pageReady || !timeUp) return;
      document.body.classList.remove("is-loading");
      preloader.classList.add("is-hidden");
      window.setTimeout(function () {
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
      }, 500);
    }

    if (!pageReady) {
      window.addEventListener(
        "load",
        function () {
          pageReady = true;
          hidePreloader();
        },
        { once: true }
      );
    }

    window.setTimeout(function () {
      timeUp = true;
      hidePreloader();
    }, minDelay);
  })();

  /* -------------------------------------------------------
     1. MENU MOBILE (hambúrguer)
     ------------------------------------------------------- */
  var menuToggle = document.getElementById("menuToggle");
  var mainNav = document.getElementById("menuPrincipal");

  function closeMenu() {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu de navegação");
  }

  function openMenu() {
    mainNav.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Fechar menu de navegação");
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.contains("is-open");
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    /* Fecha o menu ao clicar em um link (útil em telas pequenas) */
    mainNav.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    /* Fecha o menu com a tecla Esc, devolvendo o foco ao botão */
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && mainNav.classList.contains("is-open")) {
        closeMenu();
        menuToggle.focus();
      }
    });

    /* Se a tela for redimensionada para desktop, garante que o menu não fique "preso" aberto */
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) {
        closeMenu();
      }
    });
  }

  /* -------------------------------------------------------
     2. ROLAGEM SUAVE ENTRE SEÇÕES
     A propriedade CSS "scroll-behavior: smooth" já cobre a
     maioria dos navegadores; o listener abaixo garante o
     comportamento também em navegadores mais antigos e
     ajusta o foco para acessibilidade de teclado/leitor de tela.
     ------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      var targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      var target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      if (targetId === "#topo") {
        /* O cabeçalho é "position: fixed", então scrollIntoView não
           funciona nele (já está sempre visível). Rolamos a janela
           para o topo diretamente. */
        window.scrollTo({
          top: 0,
          behavior: reduceMotion ? "auto" : "smooth"
        });
      } else {
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start"
        });
      }

      /* Move o foco para a seção de destino após a rolagem,
         beneficiando quem navega por teclado ou leitor de tela.
         Para "#topo" isso é desnecessário, pois o cabeçalho fixo
         não é um destino de leitura em si. */
      if (targetId !== "#topo") {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });

  /* -------------------------------------------------------
     3. ANIMAÇÕES DE ENTRADA AO ROLAR A PÁGINA
     ------------------------------------------------------- */
  var revealElements = document.querySelectorAll("[data-reveal]");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    /* Sem observer: mostra tudo de uma vez, sem animação */
    revealElements.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* -------------------------------------------------------
     4. CONTADORES DA SEÇÃO DE IMPACTO
     ------------------------------------------------------- */
  var statCards = document.querySelectorAll(".stat-card");

  function animateCount(card) {
    var target = parseInt(card.getAttribute("data-count"), 10) || 0;
    var suffix = card.getAttribute("data-suffix") || "";
    var numberEl = card.querySelector(".stat-number");
    if (!numberEl) return;

    if (reduceMotion) {
      numberEl.textContent = target + suffix;
      return;
    }

    var duration = 1200;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var value = Math.floor(progress * target);
      numberEl.textContent = value + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        numberEl.textContent = target + suffix;
      }
    }

    window.requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var statsObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    statCards.forEach(function (card) {
      statsObserver.observe(card);
    });
  } else {
    statCards.forEach(animateCount);
  }

  /* -------------------------------------------------------
     6. ANO ATUAL NO RODAPÉ
     ------------------------------------------------------- */
  var anoEl = document.getElementById("anoAtual");
  if (anoEl) {
    anoEl.textContent = new Date().getFullYear();
  }
})();
