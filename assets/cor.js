// Projeto 8: cada lado tem 2 cores e alterna entre elas. Guarda a escolha para as páginas de dentro.
(function () {
  var P = { ia: ["#e9e6df", "#8fb3d9"], tr: ["#ff3d7f", "#f2b544"] };      // IA: prata, azul-aço · Tráfego: rosa, âmbar
  var ON = { ia: ["#141113", "#0f141a"], tr: ["#ffffff", "#141113"] };      // cor do texto em cima da cor do lado
  var root = document.documentElement;
  function get(k) { try { return +sessionStorage.getItem("p8-" + k) || 0; } catch (e) { return 0; } }
  function apply(k, i) {
    root.style.setProperty("--" + k + "-1", P[k][i]);
    root.style.setProperty("--" + k + "-2", P[k][i]);
    root.style.setProperty("--" + k + "-on", ON[k][i]);
  }
  window.PCOR = { P: P, get: get, apply: apply,
    set: function (k, i) { apply(k, i); try { sessionStorage.setItem("p8-" + k, i); } catch (e) {} window.dispatchEvent(new Event("pcor")); } };
  apply("ia", get("ia")); apply("tr", get("tr"));
})();
