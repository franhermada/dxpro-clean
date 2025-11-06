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
  .catch((err) => {
    console.error("❌ Error MongoDB:", err);
    process.exit(1);
  });

const app = express();
const PORT = process.env.PORT || 5000;

// --- Configuración CORS ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Autenticación ---
app.use("/auth", authRoutes);

// --- Casos clínicos ---
const BASE_CASES_PATH = path.join(__dirname, "casos_basicos");
const loadedCases = {};
const STOPWORDS_ES = new Set([
  "el","la","los","las","un","una","unos","unas","de","del","al","a","ante","bajo","cabe","con","contra","desde","durante","en","entre","hacia","hasta",
  "para","por","segun","sin","sobre","tras","y","o","u","e","que","qué","como","cómo","cual","cuales","cuál","cuáles","cuanto","cuánta","cuantos",
  "cuántos","cuanta","cuánta","cuando","cuándo","donde","dónde","quien","quién","quienes","quiénes","yo","tu","tú","vos","usted","ustedes","mi",
  "mis","su","sus","es","son","esta","está","estan","están","soy","eres","somos","ser","estar","hay","tener","tiene","tenes","tienes","tienen",
  "hace","hacia"
]);

const normalize = (t) =>
  String(t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (t) =>
  normalize(t)
    .split(" ")
    .filter(Boolean)
    .filter((w) => !STOPWORDS_ES.has(w) && w.length >= 3);

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
  const fuse = new Fuse(fuseList, {
    keys: ["variantes"],
    includeScore: true,
    threshold: 0.34,
    ignoreLocation: true,
    minMatchCharLength: 3
  });
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
  const systems = fs
    .readdirSync(BASE_CASES_PATH, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  for (const sys of systems) {
    const sysPath = path.join(BASE_CASES_PATH, sys);
    const files = fs.readdirSync(sysPath).filter((f) => f.endsWith(".json"));
    for (const f of files)
      out.push({ caseId: `${sys}/${f}`, casePath: path.join(sysPath, f) });
  }
  return out;
}

// --- Endpoints ---
app.get("/", (_req, res) => res.send("✅ DxPro API activa"));

app.get("/api/caso", (req, res) => {
  try {
    const system = (req.query.system || "all").toString().toLowerCase();
    if (!fs.existsSync(BASE_CASES_PATH))
      return res.status(500).json({ error: "No existe carpeta de casos." });

    let candidates = [];
    if (system === "all" || system === "todos") candidates = getAllCasesList();
    else {
      const sysPath = path.join(BASE_CASES_PATH, system);
      if (!fs.existsSync(sysPath))
        return res.status(400).json({ error: "Sistema no encontrado." });
      candidates = fs
        .readdirSync(sysPath)
        .filter((f) => f.endsWith(".json"))
        .map((f) => ({
          caseId: `${system}/${f}`,
          casePath: path.join(sysPath, f)
        }));
    }
    if (!candidates.length)
      return res.status(404).json({ error: "No hay casos disponibles." });

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

// --- Iniciar servidor ---
app.listen(PORT, () => {
  console.log(`✅ API viva en puerto ${PORT}`);
});
