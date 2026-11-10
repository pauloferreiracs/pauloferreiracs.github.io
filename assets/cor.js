// Projeto 8: cada lado tem 2 cores e alterna entre elas. Guarda a escolha para as páginas de dentro.
(function () {
  var P = { ia: ["#e9e6df", "#8fb3d9"], tr: ["#ff3d7f", "#f2b544"] };      // IA: prata, azul-aço · Tráfego: rosa, âmbar
  var ON = { ia: ["#141113", "#0f141a"], tr: ["#ffffff", "#141113"] };      // cor do texto em cima da cor do lado
  var root = document.documentElement;
  function get(k) { try { var v = sessionStorage.getItem("p8-" + k); return v === null ? 1 : +v; } catch (e) { return 1; } } // 1 = azul (IA) e amarelo (Tráfego) ao abrir o site
  function apply(k, i) {
    root.style.setProperty("--" + k + "-1", P[k][i]);
    root.style.setProperty("--" + k + "-2", P[k][i]);
    root.style.setProperty("--" + k + "-on", ON[k][i]);
  }
  window.PCOR = { P: P, get: get, apply: apply,
    set: function (k, i) { apply(k, i); try { sessionStorage.setItem("p8-" + k, i); } catch (e) {} window.dispatchEvent(new Event("pcor")); } };
  apply("ia", get("ia")); apply("tr", get("tr"));
  var w = null;
  try { w = sessionStorage.getItem("p8-wipe"); if (w) { sessionStorage.removeItem("p8-wipe"); root.classList.add("wipe-in-" + w); } } catch (e) {}
  // transição entre páginas feita pelo navegador: só quando veio pela cortina (Voltar e outros links ficam normais)
  window.addEventListener("pagereveal", function (e) { if (!e.viewTransition) return; if (w) root.classList.add("vt"); else e.viewTransition.skipTransition(); });
})();
