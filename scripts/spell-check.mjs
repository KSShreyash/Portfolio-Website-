/**
 * Drive the spell UI and capture each state.
 *
 * Dev-only. Needs the production server running (scripts/preview.sh).
 */
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME =
  process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const OUT = "shots";
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "shell",
  protocolTimeout: 120_000,
  args: [
    "--no-sandbox",
    "--hide-scrollbars",
    "--force-color-profile=srgb",
    // WebGL2 in headless needs a software rasteriser.
    "--enable-unsafe-swiftshader",
    "--use-gl=angle",
    "--use-angle=swiftshader",
  ],
});

const page = await browser.newPage();
await page.setRequestInterception(true);
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

const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message.slice(0, 90)}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 90)}`);
});

await page.setViewport({ width: 1440, height: 900 });
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45_000 });
await page.evaluate(async () => {
  await document.fonts.ready;
}).catch(() => {});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(3800);

const webgl = await page.evaluate(() => {
  const c = document.createElement("canvas");
  return !!c.getContext("webgl2");
});
console.log("webgl2 available:", webgl);

await page.screenshot({ path: `${OUT}/spell-1-hero.png` });
console.log("1. hero (scroll cue)");

// Open the wand.
const trigger = await page.$('button[aria-label="Open spells"]');
if (!trigger) throw new Error("spells trigger not found");
await trigger.click();
await wait(700);
await page.screenshot({ path: `${OUT}/spell-2-open.png` });
console.log("2. spell list open");

const clickSpell = async (name) => {
  const handle = await page.evaluateHandle((n) => {
    const buttons = Array.from(document.querySelectorAll("button"));
    return buttons.find((b) => b.textContent?.trim().startsWith(n)) ?? null;
  }, name);
  const el = handle.asElement();
  if (!el) throw new Error(`spell button not found: ${name}`);
  await el.click();
};

// Cast Revelio on the hero, then sweep the cursor to uncover the scroll.
await clickSpell("Revelio");
await wait(900);
for (let i = 0; i <= 26; i++) {
  await page.mouse.move(180 + i * 34, 430 + Math.sin(i / 3) * 110);
  await wait(28);
}
await wait(400);
await page.screenshot({ path: `${OUT}/spell-3-revelio.png` });
console.log("3. revelio revealing");

// Stop moving and wait: how much of the trail is still there?
await wait(2600);
await page.screenshot({ path: `${OUT}/spell-3b-revelio-linger.png` });
console.log("3b. revelio 2.6s after the cursor stopped");

// Now scroll to Projects and try Revelio there: it should fizzle.
await page.evaluate(() => {
  // Instant, not smooth: a smooth scroll can still be in flight when the
  // next click lands, and the section would not have changed yet.
  document.querySelector("#projects")?.scrollIntoView({ behavior: "instant", block: "start" });
});
await wait(2200);
await clickSpell("Revelio");
await wait(600);
await page.screenshot({ path: `${OUT}/spell-4-fizzle.png` });
console.log("4. revelio on projects (should fizzle)");

const toast = await page.evaluate(() => {
  // The contact form also has a status region, so pick the one in the wand.
  const regions = Array.from(document.querySelectorAll('[role="status"]'));
  for (const r of regions) {
    const p = r.querySelector("p");
    if (p?.textContent?.trim()) return p.textContent.trim();
  }
  return null;
});
console.log("   toast text:", JSON.stringify(toast));

// Lumos works everywhere.
await clickSpell("Lumos");
await wait(900);
const lumosOn = await page.evaluate(() =>
  document.documentElement.classList.contains("spell-lumos"),
);
await page.screenshot({ path: `${OUT}/spell-5-lumos.png` });
console.log("5. lumos cast — root class applied:", lumosOn);

await browser.close();
console.log(errors.length ? `\nCONSOLE ISSUES:\n  ${errors.join("\n  ")}` : "\nno console errors");
