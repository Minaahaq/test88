
(() => {
  "use strict";

  // غيّر الرابط ده لرابط موقعك الأساسي
  const ALLOWED_HOST = "test88-three.vercel.app";

  // التحقق من HTTPS والدومين
  if (
    location.protocol !== "https:" ||
    location.hostname !== ALLOWED_HOST
  ) {
    showBlockedPage();
    return;
  }

  // محاولة اكتشاف Android WebView
  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  const isWebView = /\bwv\b/i.test(ua);

  if (isAndroid && !isWebView) {
    showBlockedPage();
    return;
  }

  function showBlockedPage() {
    document.open();
    document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport"
              content="width=device-width, initial-scale=1">
        <title>تعذر فتح الصفحة</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #0b0b12;
            color: #f5f5f5;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 24px;
          }
          main {
            max-width: 380px;
            padding: 30px 24px;
            border: 1px solid #29293a;
            border-radius: 18px;
            background: #14141e;
          }
          h2 { color: #c5a7ff; }
          p { line-height: 1.9; color: #c7c7d3; }
        </style>
      </head>
      <body>
        <main>
          <h2>تعذر فتح الصفحة</h2>
          <p>
            الصفحة غير متاحة حاليًا أو أن رابط الوصول غير صحيح.
            يُرجى الرجوع إلى التطبيق والمحاولة مرة أخرى.
          </p>
        </main>
      </body>
      </html>
    `);
    document.close();
  }
})();
