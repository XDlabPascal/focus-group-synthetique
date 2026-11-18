// Chiffre src/index.html avec le mot de passe fourni dans PAGE_PASSWORD
// et produit dist/index.html (page de déverrouillage + contenu chiffré).
// AES-256-GCM, clé dérivée par PBKDF2-SHA256 (600 000 itérations).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { webcrypto, randomBytes } from "node:crypto";

const MIN_LENGTH = 12;
const ITERATIONS = 600000;

const password = process.env.PAGE_PASSWORD;
if (!password || password.length < MIN_LENGTH) {
  console.error(`PAGE_PASSWORD est absent ou trop court (${MIN_LENGTH} caractères minimum).`);
  process.exit(1);
}

const app = readFileSync("src/index.html");
const shell = readFileSync("src/unlock.html", "utf8");

const salt = randomBytes(16);
const iv = randomBytes(12);
const subtle = webcrypto.subtle;
const material = await subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
const key = await subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
  material,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt"]
);
const cipher = Buffer.from(await subtle.encrypt({ name: "AES-GCM", iv }, key, app));

const payload = JSON.stringify({
  s: salt.toString("base64"),
  i: iv.toString("base64"),
  c: cipher.toString("base64"),
  n: ITERATIONS,
});

mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", shell.replace("__PAYLOAD__", () => payload));
writeFileSync("dist/.nojekyll", "");
console.log(`dist/index.html généré (${Math.round(payload.length / 1024)} Ko chiffrés).`);
