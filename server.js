

// // server.js (Groq + Rule-based hybrid)
// import express from "express";
// import fs from "fs/promises";
// import path from "path";
// import cors from "cors";
// import multer from "multer";
// import fetch from "node-fetch";

// const app = express();

// app.use(cors());
// app.use(express.json());

// // ---------- Static public folder ----------
// app.use(express.static(path.join(process.cwd(), "public")));

// // ---------- Uploads ----------
// const uploadsDir = path.join(process.cwd(), "data", "uploads");
// await fs.mkdir(uploadsDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadsDir),
//   filename: (req, file, cb) => {
//     const safe = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
//     cb(null, safe);
//   }
// });
// const upload = multer({ storage });

// // ---------- Products file ----------
// const productsFile = path.join(process.cwd(), "data", "products.json");

// async function loadProducts() {
//   try {
//     const txt = await fs.readFile(productsFile, "utf8");
//     return JSON.parse(txt);
//   } catch {
//     return [];
//   }
// }

// // ---------- Detect language ----------
// function detectLang(msg) {
//   const t = msg.toLowerCase();
//   const hindi = ["kya", "kaise", "nahi", "krna", "mujhe", "sasti"];
//   const english = ["what", "price", "show", "cheapest", "kit"];

//   const h = hindi.filter(w => t.includes(w)).length;
//   const e = english.filter(w => t.includes(w)).length;

//   return h > e ? "hinglish" : "english";
// }

// // ---------- GROQ AI CALL ----------
// async function askGroq(systemPrompt, userPrompt, apiKey, model) {
//   const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Authorization": `Bearer ${apiKey}`,
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       model,
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userPrompt }
//       ],
//       temperature: 0.6
//     })
//   });

//   const json = await resp.json();
//   return json?.choices?.[0]?.message?.content || "";
// }

// // ---------- CHATBOT ----------
// app.post("/api/chat", async (req, res) => {
//   try {
//     const { message } = req.body;
//     if (!message) return res.json({ reply: "Please type something 😊" });

//     const lang = detectLang(message);
//     const txt = message.toLowerCase();
//     const products = await loadProducts();

//     const matched = products.find(p =>
//       txt.includes((p.name || "").toLowerCase())
//     );

//     const kits = products.filter(p => p.category === "kit");
//     let cheapest = null;
//     if (kits.length) {
//       kits.sort((a, b) => a.price - b.price);
//       cheapest = kits[0];
//     }

//     // ----------- AI MODE (Groq) -----------
//     const USE_AI = process.env.USE_AI === "true";
//     const AI_PROVIDER = process.env.AI_PROVIDER;
//     const GROQ_KEY = process.env.GROQ_API_KEY;

//     if (USE_AI && AI_PROVIDER === "groq" && GROQ_KEY) {
//       try {
//         const systemPrompt = `
// You are Tinkro Buddy — respond in the same language: ${lang}.
// If Hinglish → use Hinglish.
// If English → use English.
// Use product data below if relevant:

// Matched: ${matched ? JSON.stringify(matched) : "none"}
// Cheapest kit: ${cheapest ? JSON.stringify(cheapest) : "none"}

// Keep replies short, friendly, and helpful.
// `;

//         const aiReply = await askGroq(
//           systemPrompt,
//           message,
//           GROQ_KEY,
//           process.env.GROQ_MODEL || "llama3-70b-versatile"
//         );

//         if (aiReply?.length) {
//           return res.json({ reply: aiReply });
//         }
//       } catch (err) {
//         console.error("Groq failed, using fallback:", err);
//       }
//     }

//     // ----------- FALLBACK RULE-BASED -----------

//     if (txt.includes("hi") || txt.includes("hello")) {
//       return res.json({
//         reply:
//           lang === "hinglish"
//             ? "👋 Hi! Main Tinkro Buddy hoon — kaise help karu?"
//             : "👋 Hi! I'm Tinkro Buddy — how can I help you?"
//       });
//     }

//     if (cheapest && (txt.includes("sasti") || txt.includes("cheapest") || txt.includes("kit"))) {
//       const r =
//         lang === "hinglish"
//           ? `Sabse sasti kit: ${cheapest.name} — ₹${cheapest.price}`
//           : `Cheapest kit: ${cheapest.name} — ₹${cheapest.price}`;
//       return res.json({ reply: r });
//     }

//     if (matched) {
//       return res.json({
//         reply: `${matched.name}\nPrice: ₹${matched.price}\nLink: ${matched.url}`
//       });
//     }

//     return res.json({
//       reply:
//         lang === "hinglish"
//           ? "Sorry bhai, samajh nahi aaya. Product name try karo."
//           : "Sorry, I didn’t understand. Try a product name."
//     });

//   } catch (err) {
//     console.error("Chat error:", err);
//     res.json({ reply: "Server error, try again later." });
//   }
// });

// // ---------- UPLOAD ----------
// app.post("/api/upload", upload.single("file"), (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No file uploaded" });
//   const base = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
//   return res.json({ url: `${base}/uploads/${req.file.filename}` });
// });

// app.use("/uploads", express.static(uploadsDir));

// app.get("/", (req, res) => res.send("✅ Tinkro Backend Running with Groq AI"));

// const port = process.env.PORT || 10000;
// app.listen(port, () => console.log("✅ Server running on port", port));

// ✅ server.js — Tinkro Backend (Groq AI + Chatbot + Upload + Support)
// server.js
import express from "express";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch"; // optional if you use Groq; Node 18+ has global fetch too

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Public static (logo, images) ----------
app.use(express.static(path.join(process.cwd(), "public")));

// ---------- Ensure data & uploads directory exists (sync safe) ----------
const dataDir = path.join(process.cwd(), "data");
const uploadsDir = path.join(dataDir, "uploads");
try {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
} catch (err) {
  console.error("Error creating data directories:", err);
}

// ---------- Multer setup for file upload ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, safe);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

// ---------- Products file loader ----------
const productsFile = path.join(dataDir, "products.json");
async function loadProducts() {
  try {
    const txt = await fsp.readFile(productsFile, "utf8");
    return JSON.parse(txt);
  } catch (err) {
    // if missing or broken, return empty array
    console.warn("products.json not found or invalid. returning empty list.");
    return [];
  }
}

// ---------- Simple Hinglish <-> English detector ----------
function detectLang(msg) {
  const t = (msg || "").toLowerCase();
  const hindi = ["kya", "kaise", "nahi", "batao", "sasti", "krna", "mujhe", "kaun", "kitna"];
  const english = ["what", "price", "show", "help", "kit", "product", "cheapest", "how", "hello", "hi"];
  const h = hindi.filter(w => t.includes(w)).length;
  const e = english.filter(w => t.includes(w)).length;
  return h > e ? "hinglish" : "english";
}

// ---------- GROQ AI helper (optional) ----------
async function askGroq(systemPrompt, userPrompt) {
  const key = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama3-70b-versatile";
  if (!key) return null;

  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.6
      })
    });
    const json = await resp.json();
    return json?.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error("Groq API error:", err);
    return null;
  }
}

// ---------- MAIN CHAT ENDPOINT ----------
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.toString().trim()) {
      return res.json({ reply: "Please type something so I can help 😊" });
    }

    const txt = message.toString().trim();
    const lang = detectLang(txt);
    const products = await loadProducts();

    // try product matching
    const matched = products.find(p => txt.toLowerCase().includes((p.name || "").toLowerCase()));
    const kits = products.filter(p => p.category === "kit");
    const cheapest = kits.length ? kits.slice().sort((a,b)=> (a.price||0)-(b.price||0))[0] : null;

    // If AI is enabled, ask Groq first (best-effort)
    if (process.env.USE_AI === "true" && process.env.GROQ_API_KEY) {
      try {
        const systemPrompt = `
You are Tinkro Buddy chatbot. Reply in the same language as user (Hinglish or English).
If Hinglish -> reply in casual Hinglish (roman Hindi).
If English -> reply in English.
Use the product info when appropriate.
Matched: ${matched ? JSON.stringify(matched) : "none"}
Cheapest kit: ${cheapest ? JSON.stringify(cheapest) : "none"}
Keep responses short, helpful and friendly.
`;
        const ai = await askGroq(systemPrompt, txt);
        if (ai && ai.toString().trim()) {
          return res.json({ reply: ai });
        }
      } catch (err) {
        console.warn("Groq failed, continuing fallback:", err);
      }
    }

    // ---------- RULE-BASED FALLBACKS ----------

    // greeting (prefer english if message seems english)
    if (/\b(hi|hello|hey)\b/i.test(txt)) {
      return res.json({
        reply: lang === "hinglish"
          ? "👋 Hi! Main Tinkro Buddy hoon — kaise help karu aaj?"
          : "👋 Hi! I’m Tinkro Buddy — how can I help you today?"
      });
    }

    // support intent
    if (/(support|help|customer care|agent|human|talk to support)/i.test(txt)) {
      return res.json({
        reply: lang === "hinglish"
          ? "✅ Aap humare support team ko yahan contact kar sakte ho — https://tinkro.in/contact"
          : "✅ You can reach our support team here — https://tinkro.in/contact"
      });
    }

    // price / cheapest / kit intent
    if (cheapest && /(cheapest|sasti|cheap|kit)/i.test(txt)) {
      return res.json({
        reply: lang === "hinglish"
          ? `Sabse sasti kit: ${cheapest.name} — ₹${cheapest.price}. Link: ${cheapest.url || "N/A"}`
          : `Cheapest kit: ${cheapest.name} — ₹${cheapest.price}. Link: ${cheapest.url || "N/A"}`
      });
    }

    // product exact name matched
    if (matched) {
      return res.json({
        reply: `${matched.name}\nPrice: ₹${matched.price}\nStock: ${matched.stock ?? "N/A"}\nLink: ${matched.url || "N/A"}`
      });
    }

    // default fallback
    return res.json({
      reply: lang === "hinglish"
        ? "Sorry bhai, samajh nahi aaya. Product name ya 'cheapest kit' try karo."
        : "Sorry, I didn’t quite understand. Try a product name or 'cheapest kit'."
    });

  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ reply: "Server error — try again later." });
  }
});

// ---------- SUPPORT endpoint (Talk to support) ----------
app.post("/api/support", async (req, res) => {
  try {
    const { email, userMessage, time } = req.body || {};
    console.log("📩 SUPPORT REQUEST RECEIVED");
    console.log("Email:", email || "(no email provided)");
    console.log("Message:", userMessage);
    console.log("Time:", time || new Date().toISOString());

    // FUTURE: send email from server -> use nodemailer or transactional provider
    // For now we just acknowledge and log.
    return res.json({ ok: true, message: "Support request received. We'll contact you soon." });
  } catch (err) {
    console.error("Support error:", err);
    return res.status(500).json({ ok: false, error: "Failed to store support request" });
  }
});

// ---------- FILE UPLOAD ----------
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const base = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    return res.json({ url: `${base}/uploads/${req.file.filename}`, filename: req.file.filename });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
});
app.use("/uploads", express.static(uploadsDir));

// ---------- Health check ----------
app.get("/", (req, res) => res.send("✅ Tinkro Backend is running"));

// ---------- Start ----------
const port = process.env.PORT || 10000;
app.listen(port, () => console.log("✅ Server running on port", port));
