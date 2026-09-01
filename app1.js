/**
 * ============================================================
 *  app.js — THE BEST Platform (iOS Style)
 *  نسخة متطورة تجمع بين:
 *    - منع الاهتزاز والرجّة والفرش (Overscroll / Bounce)
 *    - إضافة كلاس `scrollable` تلقائياً للعناصر المحتاجة تمرير
 *    - مؤشر تحميل أنيق (Loader) بتصميم iOS
 *    - تنقل سلس يشبه تطبيقات iPhone
 *    - متوافق مع iOS Safari و WebView
 * ============================================================
 */

(function () {
  "use strict";

  /* ============================================================
     1.  إعدادات أساسية
     ============================================================ */
  const DELAY = 180; // تأخير بسيط قبل الانتقال للصفحة

  /* ============================================================
     2.  منع الاهتزاز والرجّة والفرش (Overscroll / Bounce) — كامل
     ============================================================ */

  // 2.1 منع bounce في iOS Safari و WebView
  document.addEventListener(
    "touchmove",
    function (e) {
      let target = e.target;
      while (target && target !== document.body) {
        const style = window.getComputedStyle(target);
        const overflowY = style.overflowY;
        const overflowX = style.overflowX;

        const canScrollY =
          (overflowY === "scroll" || overflowY === "auto" || overflowY === "overlay") &&
          target.scrollHeight > target.clientHeight;

        const canScrollX =
          (overflowX === "scroll" || overflowX === "auto" || overflowX === "overlay") &&
          target.scrollWidth > target.clientWidth;

        if (canScrollY || canScrollX) {
          return; // يسمح بالتمرير الطبيعي داخل العناصر القابلة للتمرير
        }
        target = target.parentElement;
      }
      e.preventDefault(); // يمنع الاهتزاز في باقي الصفحة
    },
    { passive: false }
  );

  // 2.2 منع pull‑to‑refresh (سحب من الأعلى لتحديث الصفحة)
  let startY = 0;
  document.addEventListener(
    "touchstart",
    function (e) {
      startY = e.touches[0].clientY;
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    function (e) {
      if (e.touches[0].clientY - startY > 10 && window.scrollY === 0) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // 2.3 منع التمرير باستخدام عجلة الفأرة أو لوحة اللمس (سطح المكتب)
  document.addEventListener(
    "wheel",
    function (e) {
      const target = e.target;
      let scrollable = false;
      let el = target;
      while (el && el !== document.body) {
        const style = window.getComputedStyle(el);
        if (
          (style.overflowY === "scroll" || style.overflowY === "auto") &&
          el.scrollHeight > el.clientHeight
        ) {
          scrollable = true;
          break;
        }
        el = el.parentElement;
      }
      if (!scrollable) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  /* ============================================================
     3.  مؤشر التحميل (Loader) — تصميم أنيق (كما هو مع تحسينات)
     ============================================================ */

  const loader = document.createElement("div");
  loader.id = "tb-app-loader";
  loader.innerHTML = `
    <div class="tb-loader">
      <div class="tb-ring outer"></div>
      <div class="tb-ring inner"></div>
      <div class="tb-dot"></div>
    </div>
  `;

  const loaderStyle = document.createElement("style");
  loaderStyle.textContent = `
    /* ===== Loader ===== */
    #tb-app-loader {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.45);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.22s ease, visibility 0.22s ease;
    }
    #tb-app-loader.show {
      opacity: 1;
      visibility: visible;
    }
    .tb-loader {
      position: relative;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: scale(0.88);
      transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    #tb-app-loader.show .tb-loader {
      transform: scale(1);
    }
    .tb-ring {
      position: absolute;
      border-radius: 50%;
      box-sizing: border-box;
    }
    .tb-ring.outer {
      width: 56px;
      height: 56px;
      border: 3px solid rgba(37,99,235,0.12);
      border-top-color: #2563eb;
      border-right-color: #2563eb;
      animation: tbOuterSpin 0.85s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }
    .tb-ring.inner {
      width: 36px;
      height: 36px;
      border: 2.5px solid rgba(96,165,250,0.12);
      border-bottom-color: #60a5fa;
      border-left-color: #60a5fa;
      animation: tbInnerSpin 0.65s linear infinite reverse;
    }
    .tb-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #2563eb;
      box-shadow: 0 0 7px rgba(37,99,235,0.55), 0 0 15px rgba(37,99,235,0.25);
      animation: tbPulse 1s ease-in-out infinite;
    }
    @keyframes tbOuterSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes tbInnerSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes tbPulse {
      0%, 100% { transform: scale(0.72); opacity: 0.65; }
      50% { transform: scale(1); opacity: 1; }
    }
    @media (prefers-reduced-motion: reduce) {
      .tb-ring, .tb-dot { animation: none; }
    }
  `;
  document.head.appendChild(loaderStyle);
  document.body.appendChild(loader);

  function showLoader() {
    loader.classList.add("show");
  }
  function hideLoader() {
    loader.classList.remove("show");
  }

  /* ============================================================
     4.  إخفاء الـ Loader تلقائياً عند تحميل الصفحة
     ============================================================ */
  window.addEventListener("load", function () {
    setTimeout(hideLoader, 120);
  });

  /* ============================================================
     5.  تنقل سلس يشبه تطبيقات iPhone (App‑like Navigation)
     ============================================================ */
  document.addEventListener(
    "click",
    function (event) {
      const link = event.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      // تجاهل الروابط الخاصة
      if (
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.target === "_blank" ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      let url;
      try {
        url = new URL(href, window.location.href);
      } catch (_) {
        return;
      }

      // تجاهل الروابط الخارجية
      if (url.origin !== window.location.origin) {
        return;
      }

      // منع الضغط المتكرر
      if (document.body.dataset.navigating === "true") {
        event.preventDefault();
        return;
      }

      document.body.dataset.navigating = "true";
      event.preventDefault();
      showLoader();

      setTimeout(function () {
        window.location.href = url.href;
      }, DELAY);
    },
    false
  );

  /* ============================================================
     6.  إعادة ضبط الحالة عند الرجوع / التقديم
     ============================================================ */
  window.addEventListener("pageshow", function () {
    document.body.dataset.navigating = "false";
    hideLoader();
  });

  /* ============================================================
     7.  إضافة الكلاس `scrollable` تلقائياً (احترافي)
     ============================================================ */

  function applyScrollableClass() {
    const selectors = [
      'ul',
      '.playlist',
      '.teachers-list',
      '.chapters-list',
      '.subjects-grid',
      '.scrollable-candidate'
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.classList.contains('scrollable')) {
          if (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) {
            el.classList.add('scrollable');
          }
        }
      });
    });
  }

  window.addEventListener('load', function () {
    setTimeout(applyScrollableClass, 400);
  });

  if (window.MutationObserver) {
    const observer = new MutationObserver(function () {
      applyScrollableClass();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'complete') {
    setTimeout(applyScrollableClass, 200);
  }

  /* ============================================================
     8.  إضافة CSS تلقائياً لمنع الاهتزاز من الجذور
     ============================================================ */
  const rootStyle = document.createElement("style");
  rootStyle.textContent = `
    html, body {
      overscroll-behavior: none;
      -webkit-overflow-scrolling: touch;
      overflow: hidden;
      height: 100%;
      width: 100%;
      position: fixed;
    }
    .scrollable {
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      height: 100%;
      width: 100%;
    }
    .scrollable::-webkit-scrollbar {
      width: 4px;
    }
    .scrollable::-webkit-scrollbar-track {
      background: transparent;
    }
    .scrollable::-webkit-scrollbar-thumb {
      background: #c6c6c8;
      border-radius: 10px;
    }
    .dark-mode .scrollable::-webkit-scrollbar-thumb {
      background: #48484a;
    }
  `;
  document.head.appendChild(rootStyle);

  console.log("✅ THE BEST — iOS App Style + تلقائي scrollable فعال");

})();
