/** Film the loading screen frame by frame. Dev-only. */
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME =
  process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const OUT = "shots/splash";
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "shell",
  protocolTimeout: 120_000,
  args: ["--no-sandbox", "--hide-scrollbars", "--force-color-profile=srgb"],
});

const attach = (page) => {
  page.setRequestInterception(true);
  page.on("request", async (req) => {
    const u = req.url();
    if (!u.startsWith(BASE)) return req.abort().catch(() => {});
    try {
      const r = await fetch(u, {
        method: req.method(),
        headers: req.headers(),
        body: req.postData(),
        redirect: "manual",
      });
      const body = Buffer.from(await r.arrayBuffer());
      const headers = {};
      const SKIP = new Set([
        "content-encoding", "content-length", "transfer-encoding",
        "connection", "keep-alive",
      ]);
      r.headers.forEach((v, k) => {
        if (!SKIP.has(k.toLowerCase())) headers[k] = v;
      });
      await req.respond({ status: r.status, headers, body });
    } catch {
      req.abort().catch(() => {});
    }
  });
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const page = await browser.newPage();
attach(page);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message.slice(0, 90)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text().slice(0, 90));
});

// Headless Chrome reports `prefers-reduced-motion: reduce` by default, which
// would film the 1.2s reduced path instead of the real one.
await page.emulateMediaFeatures([
  { name: "prefers-reduced-motion", value: "no-preference" },
]);
await page.setViewport({ width: 1440, height: 900 });
const t0 = Date.now();
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45_000 });

// Sample across the four seconds.
// Wait against real elapsed time: a screenshot of this page costs a few
// hundred milliseconds, and pacing off the previous *target* lets that
// latency accumulate until the labels are meaningless.
const marks = [400, 1000, 2000, 3000, 3400, 3700, 3950, 4400];
for (const at of marks) {
  await wait(Math.max(0, at - (Date.now() - t0)));
  const real = Date.now() - t0;
  await page.screenshot({ path: `${OUT}/t-${String(real).padStart(4, "0")}ms.png` });
}

const after = await page.evaluate(() => ({
  splashInDom: !!document.querySelector(".splash"),
  flag: document.documentElement.dataset.splash ?? null,
  bodyOverflow: document.body.style.overflow,
  heroTitleOpacity: getComputedStyle(
    document.querySelector("[data-hero-title-inner]"),
  ).opacity,
}));
console.log("after 4.3s:", JSON.stringify(after));

// A second load, to confirm it runs on every visit and the quote varies.
const seen = new Set();
for (let i = 0; i < 6; i++) {
  const p = await browser.newPage();
  attach(p);
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await wait(700);
  const q = await p.evaluate(
    () => {
      const all = Array.from(document.querySelectorAll(".splash-quote"));
      const shown = all.find((el) => getComputedStyle(el).visibility === "visible");
      return shown?.textContent?.trim().slice(0, 34) ?? null;
    },
  );
  seen.add(q);
  await p.close();
}
console.log(`quotes seen across 6 loads: ${seen.size}`);
for (const q of seen) console.log("   -", JSON.stringify(q));

await browser.close();
console.log(errors.length ? `\nCONSOLE: ${errors.join(" | ")}` : "\nno console errors");
