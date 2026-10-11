/**
 * Screenshot harness for visual verification.
 *
 * Drives the locally installed Chrome through puppeteer-core — no bundled
 * Chromium download. Dev-only; nothing here ships.
 *
 *   node scripts/shoot.mjs                      # all viewports, home page
 *   node scripts/shoot.mjs --w 1440 --h 900     # one viewport
 *   node scripts/shoot.mjs --path /projects/ai-workspace-assistant
 *   node scripts/shoot.mjs --full               # full-page capture
 *   node scripts/shoot.mjs --reduced            # emulate prefers-reduced-motion
 *   node scripts/shoot.mjs --scroll 1800        # scroll before shooting
 */
import { mkdirSync, existsSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME =
  process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";

const argv = process.argv.slice(2);
const flag = (name, fallback = undefined) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const has = (name) => argv.includes(`--${name}`);

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const OUT = flag("out", "shots");
const PATHNAME = flag("path", "/");
const FULL = has("full");
const REDUCED = has("reduced");
const SCROLL = Number(flag("scroll", 0));
const TO = flag("to", "");
const TAG = flag("tag", "");

const DEFAULT_VIEWPORTS = [
  { name: "ultrawide-2560x1080", width: 2560, height: 1080 },
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "laptop-1280x800", width: 1280, height: 800 },
  { name: "tablet-820x1180", width: 820, height: 1180 },
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "landscape-740x360", width: 740, height: 360 },
];

const viewports = flag("w")
  ? [
      {
        name: `custom-${flag("w")}x${flag("h", 900)}`,
        width: Number(flag("w")),
        height: Number(flag("h", 900)),
      },
    ]
  : DEFAULT_VIEWPORTS;

if (!existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME}. Set CHROME_PATH.`);
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "shell",
  protocolTimeout: 120_000,
  args: [
    "--hide-scrollbars",
    "--force-color-profile=srgb",
    "--font-render-hinting=none",
    "--no-sandbox",
    "--disable-gpu",
  ],
});

/**
 * Chrome's renderer has no outbound network in this environment, but Node
 * does. Intercept every request and fulfil it from Node's own fetch, so the
 * browser never needs a socket of its own. Everything this site loads is
 * same-origin, so anything pointing elsewhere is a bug and gets aborted.
 */
async function proxyThroughNode(page) {
  await page.setRequestInterception(true);
  page.on("request", async (req) => {
    const url = req.url();
    if (!url.startsWith(BASE)) {
      await req.abort().catch(() => {});
      return;
    }
    try {
      const res = await fetch(url, {
        method: req.method(),
        headers: req.headers(),
        body: req.postData(),
        redirect: "manual",
      });
      const body = Buffer.from(await res.arrayBuffer());
      const headers = {};
      // Hop-by-hop headers describe the Node fetch connection, not the one
      // puppeteer is about to fulfil; passing them through hangs the request.
      const SKIP = new Set([
        "content-encoding",
        "content-length",
        "transfer-encoding",
        "connection",
        "keep-alive",
      ]);
      res.headers.forEach((v, k) => {
        if (!SKIP.has(k.toLowerCase())) headers[k] = v;
      });
      await req.respond({ status: res.status, headers, body });
    } catch {
      await req.abort().catch(() => {});
    }
  });
}

const problems = [];

for (const vp of viewports) {
  const page = await browser.newPage();
  await proxyThroughNode(page);
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
  if (REDUCED) {
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
  }

  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") {
      errors.push(`${m.type()}: ${m.text()}`);
    }
  });

  // Neither `networkidle` nor `load` settles reliably here: the dev server
  // holds an HMR socket open, and a prefetched chunk can stay pending on the
  // production server. Wait for the DOM, then for fonts and images explicitly.
  await page.goto(`${BASE}${PATHNAME}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page
    .evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete)
          .map((img) => new Promise((res) => {
            img.addEventListener("load", res, { once: true });
            img.addEventListener("error", res, { once: true });
          })),
      );
    })
    .catch(() => {});
  if (TO) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
    }, TO);
    await new Promise((r) => setTimeout(r, 400));
  } else if (SCROLL) {
    await page.evaluate((y) => window.scrollTo(0, y), SCROLL);
    await new Promise((r) => setTimeout(r, 400));
  }
  // Let the entrance timeline finish before capturing.
  await new Promise((r) => setTimeout(r, REDUCED ? 600 : 3600));

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  if (overflow.scrollWidth > overflow.clientWidth + 1) {
    problems.push(
      `${vp.name}: HORIZONTAL OVERFLOW ${overflow.scrollWidth} > ${overflow.clientWidth}`,
    );
  }

  const suffix = [TAG, REDUCED ? "reduced" : "", FULL ? "full" : ""]
    .filter(Boolean)
    .join("-");
  const file = `${OUT}/${vp.name}${suffix ? `-${suffix}` : ""}.png`;
  await page.screenshot({ path: file, fullPage: FULL });
  console.log(
    `${file}  ${overflow.scrollWidth}w` +
      (errors.length ? `  [${errors.length} console issue(s)]` : ""),
  );
  for (const e of errors.slice(0, 6)) console.log(`    ${e}`);
  await page.close();
}

await browser.close();

if (problems.length) {
  console.log("\nPROBLEMS:");
  for (const p of problems) console.log(`  ${p}`);
  process.exitCode = 1;
}
