

// // server.js
// import express from "express";
// import fs from "fs/promises";
// import path from "path";
// import cors from "cors";
// import multer from "multer";

// const app = express();

// // Middlewares
// app.use(cors());
// app.use(express.json());

// // === IMPORTANT: STATIC FOLDER FOR LOGO ===
// app.use(express.static(path.join(process.cwd(), "public")));

// // === Create uploads directory ===
// const uploadsDir = path.join(process.cwd(), "data", "uploads");
// await fs.mkdir(uploadsDir, { recursive: true });

// // === Multer setup (for file uploads) ===
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadsDir),
//   filename: (req, file, cb) => {
//     const safe = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
//     cb(null, safe);
//   }
// });
// const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// // === Products JSON Path ===
// const productsFile = path.join(process.cwd(), "data", "products.json");

// async function loadProducts() {
//   try {
//     const text = await fs.readFile(productsFile, "utf8");
//     return JSON.parse(text);
//   } catch (err) {
//     console.error("Error reading products.json:", err);
//     return [];
//   }
// }

// // ✅ --- CHATBOT ENDPOINT ---
// app.post("/api/chat", async (req, res) => {
//   try {
//     const { message } = req.body;
//     if (!message) return res.json({ reply: "Please type something 😊" });

//     const txt = message.toLowerCase();
//     const products = await loadProducts();

//     // Language detection (simple)
//     const hindiWords = ["kya", "kaise", "nahi", "kitna", "dikhao", "batao", "bhai", "krna"];
//     const englishWords = ["what", "price", "show", "find", "kit", "product", "help", "hello", "hi"];

//     const hCount = hindiWords.filter(w => txt.includes(w)).length;
//     const eCount = englishWords.filter(w => txt.includes(w)).length;
//     const lang = hCount >= eCount ? "hinglish" : "english";

//     // ✅ GREETING
//     if (txt.includes("hi") || txt.includes("hello")) {
//       return res.json({
//         reply: lang === "hinglish"
//           ? "👋 Hi! Main Tinkro Buddy hoon — kaise madad karoon?"
//           : "👋 Hi! I’m Tinkro Buddy — how can I help you today?"
//       });
//     }

//     // ✅ PRICE / CHEAPEST KIT
//     if (txt.includes("price") || txt.includes("cheapest") || txt.includes("kit")) {
//       const kits = products.filter(p => p.category === "kit");
//       if (!kits.length) return res.json({ reply: "No kits found in product list." });

//       kits.sort((a, b) => (a.price || 0) - (b.price || 0));
//       const cheapest = kits[0];

//       return res.json({
//         reply:
//           lang === "hinglish"
//             ? `Sabse sasti kit: *${cheapest.name}* — ₹${cheapest.price}`
//             : `Cheapest kit: *${cheapest.name}* — ₹${cheapest.price}`
//       });
//     }

//     // ✅ PRODUCT NAME MATCH
//     const found = products.find(p => txt.includes((p.name || "").toLowerCase()));
//     if (found) {
//       return res.json({
//         reply: `*${found.name}*\nPrice: ₹${found.price}\nStock: ${found.stock || "N/A"}`
//       });
//     }

//     // ✅ DEFAULT MESSAGE
//     return res.json({
//       reply:
//         lang === "hinglish"
//           ? "Sorry, samajh nahi aaya. Product name ya 'cheapest kit' try karein."
//           : "Sorry, I didn’t understand. Try a product name or 'cheapest kit'."
//     });
//   } catch (err) {
//     console.error("Chat error:", err);
//     res.status(500).json({ reply: "Server error. Try again later." });
//   }
// });

// // ✅ --- FILE UPLOAD ENDPOINT ---
// app.post("/api/upload", upload.single("file"), (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//     const base = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
//     const fileUrl = `${base}/uploads/${req.file.filename}`;

//     return res.json({ url: fileUrl, filename: req.file.filename });
//   } catch (err) {
//     console.error("Upload error:", err);
//     res.status(500).json({ error: "Upload failed" });
//   }
// });

// // ✅ Serve uploaded files
// app.use("/uploads", express.static(uploadsDir));

// // ✅ Health check
// app.get("/", (req, res) => {
//   res.send("✅ Tinkro backend is running");
// });

// // ✅ --- PORT FOR RENDER ---
// const port = process.env.PORT || 4000;
// app.listen(port, () => console.log("✅ API running on port", port));



// import express from "express";
// import cors from "cors";

// const app = express();

// app.use(cors());
// app.use(express.json());

// // ✅ Chat endpoint
// app.post("/api/chat", (req, res) => {
//   const { message } = req.body;

//   if (!message) {
//     return res.json({ reply: "Please type a message 😊" });
//   }

//   const txt = message.toLowerCase();

//   if (txt.includes("hi") || txt.includes("hello")) {
//     return res.json({ reply: "👋 Hi! I’m Tinkro Buddy — how can I help you today?" });
//   }

//   return res.json({
//     reply: "I received your message: " + message
//   });
// });

// // ✅ Root
// app.get("/", (req, res) => {
//   res.send("✅ Backend is running.");
// });

// // ✅ Render port
// const PORT = process.env.PORT || 10000;
// app.listen(PORT, () => console.log("✅ API running on port", PORT));


// server.js
import express from "express";
import fs from "fs/promises";
import path from "path";
import cors from "cors";
import multer from "multer";

const app = express();

// ===== MIDDLEWARES =====
app.use(cors());
app.use(express.json());

// Public folder (for logo etc.)
app.use(express.static(path.join(process.cwd(), "public")));


// ===== CREATE UPLOADS DIRECTORY =====
const uploadsDir = path.join(process.cwd(), "data", "uploads");
await fs.mkdir(uploadsDir, { recursive: true });


// ===== MULTER (UPLOAD SETTINGS) =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, safe);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});


// ===== PRODUCTS JSON PATH =====
const productsFile = path.join(process.cwd(), "data", "products.json");

async function loadProducts() {
  try {
    const text = await fs.readFile(productsFile, "utf8");
    return JSON.parse(text);
  } catch (err) {
    console.error("products.json missing or invalid");
    return [];
  }
}



// ✅ ✅ ✅ ===== CHATBOT ENDPOINT =====
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.json({ reply: "Please type something 😊" });

    const txt = message.toLowerCase();
    const products = await loadProducts();

    // Simple word detection
    const hindiWords = ["kya", "kaise", "nahi", "kitna", "dikhao", "batao"];
    const englishWords = ["what", "price", "show", "find", "product", "help"];

    const hCount = hindiWords.filter(w => txt.includes(w)).length;
    const eCount = englishWords.filter(w => txt.includes(w)).length;
    const lang = hCount >= eCount ? "hinglish" : "english";

    // GREETING
    if (txt.includes("hi") || txt.includes("hello")) {
      return res.json({
        reply:
          lang === "hinglish"
            ? "👋 Hi! Main Tinkro Buddy hoon — kaise help karu?"
            : "👋 Hi! I’m Tinkro Buddy — how can I help you today?"
      });
    }

    // Cheapest kit
    if (txt.includes("sasti") || txt.includes("cheap") || txt.includes("cheapest") || txt.includes("kit")) {
      const kits = products.filter(p => p.category === "kit");
      if (!kits.length)
        return res.json({ reply: "No kits found in products.json." });

      kits.sort((a, b) => (a.price || 0) - (b.price || 0));
      const cheapest = kits[0];

      return res.json({
        reply:
          lang === "hinglish"
            ? `Sabse sasti kit: *${cheapest.name}* — ₹${cheapest.price}`
            : `Cheapest kit: *${cheapest.name}* — ₹${cheapest.price}`
      });
    }

    // Product name match
    const found = products.find(p =>
      txt.includes((p.name || "").toLowerCase())
    );

    if (found) {
      return res.json({
        reply: `*${found.name}*\nPrice: ₹${found.price}\nStock: ${found.stock || "Available"}`
      });
    }

    // DEFAULT
    return res.json({
      reply:
        lang === "hinglish"
          ? "Sorry bhai, samajh nahi aaya. Product name ya 'cheapest kit' try karo."
          : "Sorry, I didn’t understand. Try a product name or 'cheapest kit'."
    });

  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ reply: "Server error. Try again later." });
  }
});



// ✅ ✅ ✅ ===== FILE UPLOAD ENDPOINT =====
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No file uploaded" });

    const base = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${base}/uploads/${req.file.filename}`;

    res.json({ url: fileUrl, filename: req.file.filename });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.use("/uploads", express.static(uploadsDir));



// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.send("✅ Tinkro Backend is running");
});


// ===== PORT FOR RENDER =====
const port = process.env.PORT || 10000;
app.listen(port, () => console.log("✅ API running on port", port));
