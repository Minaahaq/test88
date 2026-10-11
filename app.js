
(() => {
  "use strict";

  const ALLOWED_HOST = "test88-three.vercel.app";

  function showBlockedPage() {
    document.open();
    document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>تعذر فتح الصفحة</title>
        <style>
          * { box-sizing: border-box; }

          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            background: #0b0b12;
            color: #f5f5f5;
            font-family: Arial, sans-serif;
            text-align: center;
          }

          main {
            width: 100%;
            max-width: 380px;
            padding: 30px 24px;
            border: 1px solid #29293a;
            border-radius: 18px;
            background: #14141e;
          }

          h2 { color: #c5a7ff; }

          p {
            line-height: 1.9;
            color: #c7c7d3;
          }
        </style>
      </head>
      <body>
        <main>
          <h2>تعذر فتح الصفحة</h2>
          <p>
            الصفحة غير متاحة من وسيلة الوصول الحالية.
            يُرجى الرجوع إلى تطبيق المنصة والمحاولة مرة أخرى.
          </p>
        </main>
      </body>
      </html>
    `);
    document.close();
  }

  // 1. التحقق من HTTPS والدومين
  if (
    location.protocol !== "https:" ||
    location.hostname !== ALLOWED_HOST
  ) {
    showBlockedPage();
    return;
  }

  // 2. السماح فقط إذا ظهر اسم AppCreator24
  const ua = navigator.userAgent || "";

  if (!/AppCreator24/i.test(ua)) {
    showBlockedPage();
    return;
  }

})();

