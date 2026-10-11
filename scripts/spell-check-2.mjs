/** Drive the oath, the wandlight and Accio. Dev-only. */
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

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await page.setViewport({ width: 1440, height: 1000 });
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45_000 });
await page.evaluate(async () => { await document.fonts.ready; }).catch(() => {});
await wait(3500);

/** Visible (aria-hidden) text of the first timeline summary. */
const summaryText = () =>
  page.evaluate(() => {
    const card = document.querySelector("#experience ol li article");
    const spans = card?.querySelectorAll('[aria-hidden="true"]') ?? [];
    return spans[0]?.textContent?.slice(0, 58) ?? null;
  });

await page.evaluate(() => {
  document.querySelector("#experience")?.scrollIntoView({ behavior: "instant", block: "start" });
});
await wait(1800);

console.log("encrypted :", JSON.stringify(await summaryText()));
await page.screenshot({ path: `${OUT}/oath-1-encrypted.png` });

// Swear the oath.
const oath = await page.evaluateHandle(() =>
  Array.from(document.querySelectorAll("button")).find((b) =>
    b.textContent?.includes("I solemnly swear"),
  ) ?? null,
);
const oathEl = oath.asElement();
if (!oathEl) throw new Error("oath button not found");
await oathEl.click();
await wait(2600);
console.log("decrypted :", JSON.stringify(await summaryText()));
await page.screenshot({ path: `${OUT}/oath-2-decrypted.png` });

const label = await page.evaluate(() =>
  Array.from(document.querySelectorAll("button"))
    .find((b) => b.textContent?.includes("Mischief managed"))
    ?.textContent?.trim()
    .slice(0, 40) ?? null,
);
console.log("button now:", JSON.stringify(label));

// And seal it again.
const sealHandle = await page.evaluateHandle(() =>
  Array.from(document.querySelectorAll("button")).find((b) =>
    b.textContent?.includes("Mischief managed"),
  ) ?? null,
);
await sealHandle.asElement()?.click();
await wait(2600);
console.log("resealed  :", JSON.stringify(await summaryText()));
await page.screenshot({ path: `${OUT}/oath-3-resealed.png` });

// Lumos: cast, move the cursor, check the light follows it.
const openWand = async () => {
  const t = await page.$('button[aria-label="Open spells"]');
  if (t) await t.click();
  await wait(600);
};
const clickSpell = async (name) => {
  const h = await page.evaluateHandle(
    (n) => Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.trim().startsWith(n)) ?? null,
    name,
  );
  const el = h.asElement();
  if (!el) throw new Error(`spell not found: ${name}`);
  await el.click();
};

await openWand();
await clickSpell("Lumos");
await wait(600);
await page.mouse.move(520, 470);
await wait(500);
const glow = await page.evaluate(() => {
  const el = document.querySelector(".lumos-glow");
  if (!el) return null;
  return {
    x: el.style.getPropertyValue("--lumos-x"),
    y: el.style.getPropertyValue("--lumos-y"),
    blend: getComputedStyle(el).mixBlendMode,
  };
});
console.log("lumos glow:", JSON.stringify(glow));
await page.screenshot({ path: `${OUT}/lumos-glow.png` });

// Accio from the experience section should land on contact.
await clickSpell("Accio");
await wait(2000);
const landed = await page.evaluate(() => {
  const rect = document.querySelector("#contact")?.getBoundingClientRect();
  return rect ? Math.round(rect.top) : null;
});
console.log("accio -> #contact top offset:", landed, "px");
await page.screenshot({ path: `${OUT}/accio-landed.png` });

await browser.close();
console.log(errors.length ? `\nCONSOLE ISSUES:\n  ${errors.join("\n  ")}` : "\nno console errors");
