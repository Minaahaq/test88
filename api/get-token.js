import crypto from "crypto";

const sessions = new Map();

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "NOT_ALLOWED" });
  }

  const { code, device } = req.body || {};

  if (!code || !device) {
    return res.status(400).json({ error: "MISSING_DATA" });
  }

  // توليد توكن
  const token = crypto.randomBytes(24).toString("hex");

  sessions.set(token, {
    code,
    device,
    ip:
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress,
    time: Date.now()
  });

  return res.json({ token });
}

// 👇 مهم: نحتاجها في proxy
export function getSession(token) {
  return sessions.get(token);
}
