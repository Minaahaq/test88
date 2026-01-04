import fetch from "node-fetch";
import crypto from "crypto";
import { verifySessionToken } from "./auth";

/* Stores */
const rateLimit = new Map();
const activeTokens = new Map();

/* Helpers */
function getIP(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
         req.socket.remoteAddress || "unknown";
}

function rateLimitCheck(ip, max = 20, windowMs = 10000) {
  const now = Date.now();
  const user = rateLimit.get(ip) || { count: 0, time: now };
  if (now - user.time < windowMs) {
    user.count++;
    if (user.count > max) return false;
  } else {
    user.count = 1;
    user.time = now;
  }
  rateLimit.set(ip, user);
  return true;
}

function verifyBrowser(req) {
  const headers = ["accept", "accept-language", "accept-encoding"];
  return headers.every(h => req.headers[h]);
}

function verifySignature(sig, ts, secret) {
  if (!sig || !ts) return false;
  if (Math.abs(Date.now() - Number(ts)) > 120000) return false;
  const expected = crypto.createHmac("sha256", secret).update(ts).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
}

/* Proxy Handler */
export default async function handler(req, res) {
  const ip = getIP(req);

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") return res.status(405).json({ error: "NOT_ALLOWED" });

  if (!verifyBrowser(req)) return res.status(403).json({ error: "BOT_BLOCKED" });

  const origin = req.headers.origin || "";
  if (!origin.includes(process.env.SITE_DOMAIN)) return res.status(403).json({ error: "BAD_ORIGIN" });

  /* Dynamic Client Token */
  const clientToken = req.headers["x-client-token"];
  if (!clientToken) return res.status(403).json({ error: "NO_TOKEN" });
  let secret, expires;
  try {
    [secret, expires] = Buffer.from(clientToken, "base64").toString().split(":");
    if (secret !== process.env.CLIENT_SECRET || Date.now() > Number(expires)) throw 0;
  } catch {
    return res.status(403).json({ error: "INVALID_TOKEN" });
  }

  /* IP Bind */
  if (!activeTokens.has(clientToken)) activeTokens.set(clientToken, ip);
  if (activeTokens.get(clientToken) !== ip) return res.status(403).json({ error: "IP_MISMATCH" });

  /* Session Token */
  const sessionToken = req.headers["x-session-token"];
  if (!verifySessionToken(sessionToken)) return res.status(401).json({ error: "NO_SESSION" });

  /* Request Signature */
  if (!verifySignature(req.headers["x-signature"], req.headers["x-timestamp"], process.env.SIGNATURE_SECRET))
    return res.status(403).json({ error: "BAD_SIGNATURE" });

  /* Rate Limit */
  if (!rateLimitCheck(ip)) return res.status(429).json({ error: "RATE_LIMIT" });

  /* API Logic */
  const { type, yearId, subjectId, teacherId, chapterId, lectureId } = req.query;
  const BASE = "https://platform-sigma-seven.vercel.app";
  const routes = {
    years: `${BASE}/api/years`,
    subjects: `${BASE}/api/subjects?yearId=${yearId}`,
    teachers: `${BASE}/api/teachers?yearId=${yearId}&subjectId=${subjectId}`,
    chapters: `${BASE}/api/chapters?yearId=${yearId}&subjectId=${subjectId}&teacherId=${teacherId}`,
    lectures: `${BASE}/api/lectures?yearId=${yearId}&subjectId=${subjectId}&teacherId=${teacherId}&chapterId=${chapterId}`,
    videos: `${BASE}/api/videos?yearId=${yearId}&subjectId=${subjectId}&teacherId=${teacherId}&chapterId=${chapterId}&lectureId=${lectureId}`
  };
  if (!routes[type]) return res.status(400).json({ error: "INVALID_TYPE" });

  try {
    const r = await fetch(routes[type], {
      headers: {
        "x-api-key": process.env.API_KEY,
        "x-internal-request": "true"
      }
    });
    const data = await r.json();
    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: "SERVER_ERROR" });
  }
}
