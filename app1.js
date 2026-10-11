
(function () {
  "use strict";

  const inAppCreator =
    ua.includes("AppCreator24") ||
    ua.includes("wv") ||
    ua.includes("WebView");

  if (!inAppCreator) {
    document.open();
    document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>تعذر فتح الصفحة</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #0b0b12;
            color: #fff;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
            box-sizing: border-box;
          }
          main {
            max-width: 360px;
            padding: 28px;
            border-radius: 16px;
            background: #171722;
          }
        </style>
      </head>
      <body>
        <main>
          <h2>تعذر فتح الصفحة</h2>
          <p>يرجى فتح المنصة من التطبيق.</p>
        </main>
      </body>
      </html>
    `);
    document.close();
  }
})();
