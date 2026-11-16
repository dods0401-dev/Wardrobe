// Usage: node e2e/shot.cjs <path> <out.png> [mobile] [fullPage]
const { chromium, devices } = require("playwright");
(async () => {
  const [, , path = "/", out = "shot.png", mobile, full] = process.argv;
  const browser = await chromium.launch();
  const ctx = mobile === "mobile" ? await browser.newContext({ ...devices["iPhone 13"] }) : await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: out, fullPage: full === "full" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log(JSON.stringify({ errors, overflow }));
  await browser.close();
})();
