import crypto from "crypto";
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });

  const { code, device } = req.body || {};
  if (!code || !device) return res.status(400).json({ error: "MISSING_DATA" });

  const SECRET = process.env.SESSION_SECRET;
  if (!SECRET) return res.status(500).json({ error: "NO_SECRET" });

  // السماح فقط للتطبيق أو WebView
  const ua = req.headers["user-agent"] || "";
  if (!(/AppCreator24|wv|WebView/i.test(ua))) return res.status(403).json({ error: "APP_ONLY" });

  // ===== فحص Session حالية =====
  const cookies = req.headers.cookie || "";
  const match = cookies.match(/session=([^;]+)/);
  if (match) {
    try {
      const existing = JSON.parse(Buffer.from(match[1], "base64").toString("utf-8"));
      if (existing?.payload?.c === code && existing?.payload?.d === device) {
        return res.status(200).json({ ok: true, message: "SESSION_ALREADY_EXISTS" });
      }
    } catch (e) {}
  }

  // ===== التحقق من Google Sheet =====
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json", // ملف الخدمة الخاص بـ Google API
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });
    const SHEET_ID = process.env.SHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:D" // A=الكود، B=الاسم، C=الشعبة، D=تاريخ الانتهاء
    });

    const rows = response.data.values || [];
    const user = rows.find(r => r[0] === code);

    if (!user) return res.status(401).json({ ok: false, message: "كود غير صالح" });

    const payload = {
      c: code,
      d: device,
      ua,
      t: Date.now(),
      name: user[1],
      section: user[2],
      end_date: user[3]
    };

    const sig = crypto.createHmac("sha256", SECRET).update(JSON.stringify(payload)).digest("hex");
    const session = Buffer.from(JSON.stringify({ payload, sig })).toString("base64");

    res.setHeader("Set-Cookie", [
      `session=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000`
    ]);

    return res.status(200).json({ ok: true, message: "SESSION_CREATED", ...payload });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "خطأ في التحقق من الشيت" });
  }
}
