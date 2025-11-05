import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Fuse from "fuse.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ Falta MONGO_URI en variables de entorno");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => { console.error("❌ MongoDB:", err); process.exit(1); });

const app = express();
const PORT = process.env.PORT || 5000;

// No hay CORS porque vamos a servir el frontend desde este mismo servidor
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);

const BASE_CASES_PATH = path.join(__dirname, "casos_basicos");
const loadedCases = {};

const STOPWORDS_ES = new Set(["el","la","los","las","un","una","unos","unas","de","del","al","a","ante","bajo","cabe","con","contra","desde","durante","en","entre","hacia","hasta","para","por","segun","sin","sobre","tras","y","o","u","e","que","qué","como","cómo","cual","cuales","cuál","cuáles","cuanto","cuánta","cuantos","cuántos","cuanta","cuánta","cuando","cuándo","donde","dónde","quien","quién","quienes","quiénes","yo","tu","tú","vos","usted","ustedes","mi","mis","su","sus","es","son","esta","está","estan","están","soy","eres","somos","ser","estar","hay","tener","tiene","tenes","tienes","tienen","hace","hacia"]);

const normalize = (t) =>
  String(t||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim();

const tokenize = (t) => normalize(t).split(" ").filter(Boolean).filter(w => !STOPWORDS_ES.has(w) && w.length>=3);

function buildIndexesForCase(caseData) {
  const variantMapExact = new Map();
  const variantIndex = [];
  const fuseList = [];
  const respuestas = caseData.respuestas || {};
  for (const [intent, obj] of Object.entries(respuestas)) {
    const variantes = Array.isArray(obj.variantes) ? obj.variantes : [];
    for (const v of variantes) {
      const norm = normalize(v);
      variantMapExact.set(norm, { intent, respuesta: obj.respuesta });
      variantIndex.push({ intent, variante: v, tokens: tokenize(v), respuesta: obj.respuesta });
    }
    fuseList.push({ intent, variantes, respuesta: obj.respuesta });
  }
  const fuse = new Fuse(fuseList, { keys: ["variantes"], includeScore: true, threshold: 0.34, ignoreLocation: true, minMatchCharLength: 3 });
  return { variantMapExact, variantIndex, fuse };
}

function loadCase(caseId, casePath) {
  if (loadedCases[caseId]) return loadedCases[caseId];
  const raw = fs.readFileSync(casePath, "utf-8");
  const data = JSON.parse(raw);
  const idx = buildIndexesForCase(data);
  const cached = { data, ...idx, casePath };
  loadedCases[caseId] = cached;
  console.log(`[CASE] cargado ${caseId}`);
  return cached;
}

function getAllCasesList() {
  const out = [];
  if (!fs.existsSync(BASE_CASES_PATH)) return out;
  const systems = fs.readdirSync(BASE_CASES_PATH, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  for (const sys of systems) {
    const sysPath = path.join(BASE_CASES_PATH, sys);
    const files = fs.readdirSync(sysPath).filter(f => f.endsWith(".json"));
    for (const f of files) out.push({ caseId: `${sys}/${f}`, casePath: path.join(sysPath, f) });
  }
  return out;
}

app.get("/", (_req, res) => res.send("✅ DxPro API viva"));

app.get("/api/caso", (req, res) => {
  try {
    const system = (req.query.system || "all").toString().toLowerCase();
    if (!fs.existsSync(BASE_CASES_PATH)) return res.status(500).json({ error: "No existe carpeta de casos." });

    let candidates = [];
    if (system === "all" || system === "todos") candidates = getAllCasesList();
    else {
      const sysPath = path.join(BASE_CASES_PATH, system);
      if (!fs.existsSync(sysPath)) return res.status(400).json({ error: "Sistema no encontrado." });
      candidates = fs.readdirSync(sysPath).filter(f => f.endsWith(".json")).map(f => ({ caseId: `${system}/${f}`, casePath: path.join(sysPath, f) }));
    }
    if (!candidates.length) return res.status(404).json({ error: "No hay casos disponibles." });

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    const c = loadCase(chosen.caseId, chosen.casePath);

    res.json({
      casoId: chosen.caseId,
      presentacion: c.data.presentacion,
      respuestas: c.data.respuestas,
      evaluacion: c.data.evaluacion,
      desconocido: c.data.desconocido || "No entendí tu pregunta."
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al cargar caso clínico." });
  }
});

app.post("/api/preguntar", (req, res) => {
  try {
    const { pregunta, caseId } = req.body;
    if (!pregunta || !caseId) return res.status(400).json({ error: "Faltan datos." });

    const c = loadedCases[caseId];
    if (!c) return res.status(404).json({ error: "Caso no encontrado." });

    const norm = normalize(pregunta);
    const tokens = tokenize(pregunta);

    // exacta
    const exact = c.variantMapExact.get(norm);
    if (exact) return res.json({ respuesta: exact.respuesta });

    // jaccard
    let best = { score: 0, resp: null };
    for (const v of c.variantIndex) {
      const A = new Set(tokens), B = new Set(v.tokens);
      let inter = 0; for (const t of A) if (B.has(t)) inter++;
      const uni = A.size + B.size - inter;
      const score = uni === 0 ? 0 : inter / uni;
      if (score > best.score) best = { score, resp: v.respuesta };
    }
    if (best.score >= 0.5) return res.json({ respuesta: best.resp });

    // fuzzy
    const found = c.fuse.search(pregunta);
    if (found.length && found[0].score < 0.4) return res.json({ respuesta: found[0].item.respuesta });

    res.json({ respuesta: c.data.desconocido || "No entendí tu pregunta." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al procesar la pregunta." });
  }
});

app.post("/api/evaluar", (req, res) => {
  try {
    const { caseId, diagnostico, tratamiento } = req.body;
    if (!caseId) return res.status(400).json({ error: "Falta caseId" });

    const c = loadedCases[caseId];
    if (!c) return res.status(404).json({ error: "Caso no encontrado" });

    const evalData = c.data.evaluacion || {};
    const diagEsperados = (evalData.diagnostico_presuntivo || []).map(normalize);
    const tratEsperados = (evalData.tratamiento_inicial_esperado || []).map(normalize);

    const diagOk = diagEsperados.includes(normalize(diagnostico));
    const userTrats = (tratamiento || "").split(",").map(normalize).filter(Boolean);
    const correctos = userTrats.filter(t => tratEsperados.includes(t));
    const faltantes = tratEsperados.filter(t => !userTrats.includes(t));

    res.json({ diagnosticoCorrecto: diagOk, correctos, faltantes });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al evaluar." });
  }
});

// --- Atlas semiológico ---
app.get("/api/atlas", (req, res) => {
  try {
    const system = (req.query.system || "").toLowerCase();
    if (!system) return res.status(400).json({ error: "Debe especificar sistema" });

    const base = path.join(__dirname, "atlas_semiologico");
    const dir = path.join(base, system);
    if (!fs.existsSync(dir)) return res.status(404).json({ error: "Sistema no encontrado" });

    const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
    const data = files.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")));
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al cargar atlas" });
  }
});

// archivos estáticos del atlas
app.use("/atlas_semiologico", express.static(path.join(__dirname, "atlas_semiologico")));

// --- Servir frontend build ---
const CLIENT_BUILD = path.join(__dirname, "client_build");
if (fs.existsSync(CLIENT_BUILD)) {
  app.use(express.static(CLIENT_BUILD));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/auth") || req.path.startsWith("/atlas_semiologico")) return next();
    res.sendFile(path.join(CLIENT_BUILD, "index.html"));
  });
} else {
  console.warn("⚠️ No se encontró client_build: el frontend no será servido por Express.");
}

app.listen(PORT, () => console.log(`✅ API viva en puerto ${PORT}`));
