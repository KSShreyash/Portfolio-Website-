/**
 * Serve the static export straight off disk and measure what a browser
 * actually downloads. Dev-only.
 *
 * This is the honest test of a static deployment: no Next server anywhere,
 * just the files Cloudflare Pages would host.
 */
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import puppeteer from "puppeteer-core";

const CHROME =
  process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const ROOT = "out";
const ORIGIN = "http://static.local";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".json": "application/json",
  ".pdf": "application/pdf",
};

async function resolve(pathname) {
  const clean = decodeURIComponent(pathname.split("?")[0]);
  const candidates = [
    join(ROOT, clean),
    join(ROOT, clean, "index.html"),
    join(ROOT, `${clean}.html`),
  ];
  for (const c of candidates) {
    try {
      const s = await stat(c);
      if (s.isFile()) return c;
    } catch {
      /* next */
    }
  }
  return null;
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "shell",
  protocolTimeout: 120_000,
  args: ["--no-sandbox", "--hide-scrollbars"],
});

for (const [label, width, height, dpr] of [
  ["phone  390x844 @2x", 390, 844, 2],
  ["laptop 1440x900 @1x", 1440, 900, 1],
]) {
  const page = await browser.newPage();
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "no-preference" },
  ]);
  await page.setViewport({ width, height, deviceScaleFactor: dpr });
  await page.setRequestInterception(true);

  const bytes = { image: 0, script: 0, font: 0, css: 0, other: 0 };
  const missing = [];
  const fetched = [];

  page.on("request", async (req) => {
    if (req.url().startsWith("data:")) return req.continue().catch(() => {});
    const url = new URL(req.url());
    const file = await resolve(url.pathname);
    if (!file) {
      missing.push(url.pathname);
      return req.respond({ status: 404, body: "not found" }).catch(() => {});
    }
    const body = await readFile(file);
    const type = TYPES[extname(file)] ?? "application/octet-stream";
    const kind = type.startsWith("image/")
      ? "image"
      : type.includes("javascript")
        ? "script"
        : type.startsWith("font/")
          ? "font"
          : type.startsWith("text/css")
            ? "css"
            : "other";
    bytes[kind] += body.byteLength;
    if (kind === "image") fetched.push([body.byteLength, url.pathname]);
    await req.respond({ status: 200, headers: { "content-type": type }, body }).catch(() => {});
  });

  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 80)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 80));
  });

  await page.goto(`${ORIGIN}/`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await new Promise((r) => setTimeout(r, 6500));

  if (process.env.SHOT) {
    await page.screenshot({ path: `shots/export-${width}.png` });
  }
  const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
  const total = Object.values(bytes).reduce((a, b) => a + b, 0);
  console.log(
    `${label}  images ${kb(bytes.image).padStart(8)} | js ${kb(bytes.script).padStart(8)} ` +
      `| fonts ${kb(bytes.font).padStart(7)} | css ${kb(bytes.css).padStart(7)} ` +
      `| TOTAL ${kb(total)}`,
  );
  if (missing.length) {
    console.log(`   MISSING: ${[...new Set(missing)].slice(0, 6).join(", ")}`);
  }
  console.log(`   console errors: ${errors.length ? errors.join(" | ") : "none"}`);
  fetched.sort((a,b)=>b[0]-a[0]);
  for (const [n,p2] of fetched.slice(0,8)) console.log(`      ${(n/1024).toFixed(0).padStart(5)} KB  ${p2}`);
  await page.close();
}

await browser.close();
