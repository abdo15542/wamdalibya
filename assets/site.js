/* ومضة ليبية — سكربت خفيف: قائمة الجوال، البحث، عرض المزيد، نسخ الرابط */
(function () {
  "use strict";

  // قائمة الجوال
  var toggle = document.getElementById("menuToggle");
  var nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // البحث الفوري + عرض المزيد (الصفحة الرئيسية فقط)
  var grid = document.getElementById("articleGrid");
  var input = document.getElementById("searchInput");
  var loadBtn = document.getElementById("loadMoreBtn");
  var hint = document.getElementById("searchHint");
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".card"));
    var BATCH = 12;
    var shown = BATCH;

    function applySearch() {
      var q = (input ? input.value : "").trim();
      var visible = 0;
      cards.forEach(function (card) {
        var hay = (card.getAttribute("data-title") || "") + " " +
                  (card.getAttribute("data-cat") || "") + " " +
                  (card.getAttribute("data-excerpt") || "");
        var match = !q || hay.indexOf(q) !== -1;
        card.classList.toggle("card-hidden", !match);
        if (match) visible++;
      });
      if (q) {
        if (loadBtn) loadBtn.style.display = "none";
        if (hint) hint.textContent = "نتائج البحث عن «" + q + "»: " + visible + " مقالاً";
      } else {
        if (hint) hint.textContent = "";
        showBatch(shown);
      }
    }

    function showBatch(n) {
      var count = 0;
      cards.forEach(function (card) {
        if (count < n) { card.classList.remove("card-hidden"); count++; }
        else { card.classList.add("card-hidden"); }
      });
      if (loadBtn) {
        loadBtn.style.display = count < cards.length ? "" : "none";
        loadBtn.textContent = count < cards.length ? "عرض المزيد" : "لا مزيد";
      }
    }

    if (input) input.addEventListener("input", applySearch);
    if (loadBtn) loadBtn.addEventListener("click", function () {
      shown += BATCH;
      showBatch(shown);
    });
    showBatch(shown);
  }

  // نسخ رابط المقال
  var copyBtn = document.getElementById("copyLinkBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var url = copyBtn.getAttribute("data-url");
      function done() { copyBtn.textContent = "تم النسخ ✓"; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { fallback(); });
      } else { fallback(); }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = url; document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
      }
    });
  }
})();
