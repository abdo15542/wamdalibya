/* ومضة ليبية — سكربت خفيف: قائمة الجوال، البحث، عرض المزيد، نسخ الرابط */
(function () {
  "use strict";

  // صور المقالات: لو صورة لسه ما اترفعتش على السيرفر (404) بدّلها بغلاف الموقع
  // بدل ما تظهر كمربع فاضي وعلامة صورة مكسورة. يشتغل على كل الصفحات.
  var FALLBACK_IMG = "https://abdo15542.github.io/wamdalibya/assets/cover.jpg";
  function fixImg(img) {
    if (!img || img.getAttribute("data-fb-done")) return;
    if (img.src.indexOf("/images/") === -1) return;
    img.setAttribute("data-fb-done", "1");
    img.src = FALLBACK_IMG;
  }
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG") fixImg(t);
  }, true);
  Array.prototype.forEach.call(document.images, function (img) {
    if (img.complete && img.naturalWidth === 0) fixImg(img);
  });

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

  // لوحة الإعلانات + تنبيه تحديث التطبيق (يقرأ announcements.json)
  var annBoard = document.getElementById("annBoard");
  var isAnnPage = /announcements\.html$/.test(location.pathname);
  var lang = (document.documentElement.lang || "ar").slice(0, 2);
  var ANN_TXT = lang === "en"
    ? { empty: "No announcements yet.", update: "A new version of the app is available", dl: "Download update", close: "Dismiss" }
    : { empty: "لا توجد إعلانات بعد.", update: "إصدار جديد من التطبيق متوفر", dl: "تنزيل التحديث", close: "إغلاق" };
  function siteBasePath() {
    // مسار جذر الموقع: /wamdalibya أو /libyapulse على GitHub Pages، فارغ على نطاق جذري
    var p = location.pathname.replace(/\/$/, "");
    p = p.replace(/\/articles\/[^/]+$/, "").replace(/\/categories\/[^/]+$/, "").replace(/\/[^/]+\.html$/, "");
    return p;
  }
  function escHtml(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function loadAnnouncements(cb) {
    try {
      fetch(siteBasePath() + "/announcements.json", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d) cb(d); })
        .catch(function () { /* silent: no banner, board keeps its empty state */ });
    } catch (e) { /* silent */ }
  }
  function renderBoard(data) {
    if (!annBoard) return;
    var items = (data && data.items) || [];
    if (!items.length) return; // keep the shell's empty-state line
    var html = "";
    items.forEach(function (it) {
      html += '<article class="card ann-card">';
      if (it.image) html += '<img src="' + escHtml(it.image) + '" alt="" loading="lazy">';
      html += '<div class="card-body"><h3>' + escHtml(it.title || "") + "</h3>";
      if (it.text) html += "<p>" + escHtml(it.text) + "</p>";
      if (it.date) html += '<p class="card-meta">' + escHtml(it.date) + "</p>";
      if (it.button_text && it.button_url) html += '<p><a class="btn btn-gold" href="' + escHtml(it.button_url) + '">' + escHtml(it.button_text) + "</a></p>";
      html += "</div></article>";
    });
    annBoard.innerHTML = html;
  }
  function showUpdateBanner(data) {
    if (!data || !data.apk_url) return;
    try {
      if (sessionStorage.getItem("wamda-update-dismissed") === String(data.latest_version_code)) return;
    } catch (e) { /* ignore */ }
    var bar = document.createElement("div");
    bar.className = "update-banner";
    bar.setAttribute("role", "alert");
    bar.innerHTML = "<span>" + escHtml(ANN_TXT.update) + "</span> " +
      '<a class="btn btn-gold" href="' + escHtml(data.apk_url) + '">' + escHtml(ANN_TXT.dl) + "</a> " +
      '<button type="button" class="update-close" aria-label="' + escHtml(ANN_TXT.close) + '">✕</button>';
    bar.querySelector(".update-close").addEventListener("click", function () {
      try { sessionStorage.setItem("wamda-update-dismissed", String(data.latest_version_code)); } catch (e) { /* ignore */ }
      if (bar.parentNode) bar.parentNode.removeChild(bar);
    });
    document.body.insertBefore(bar, document.body.firstChild);
  }
  if (annBoard) loadAnnouncements(renderBoard);
  if (!isAnnPage) {
    // تنبيه التحديث يظهر داخل التطبيق فقط، وعندما يحمل التطبيق رمز إصدار vc
    var vcMatch = navigator.userAgent.match(/WamdaApp\/1\.0 vc(\d+)/);
    if (vcMatch) {
      loadAnnouncements(function (data) {
        var installed = parseInt(vcMatch[1], 10);
        if (data.latest_version_code && installed < data.latest_version_code) showUpdateBanner(data);
      });
    }
  }
})();
