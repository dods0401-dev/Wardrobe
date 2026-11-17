/**
 * End-to-end acceptance run against a running app (default http://localhost:3000).
 *   node e2e/acceptance.cjs [baseUrl] [screenshotDir]
 * Exercises every primary workflow and asserts on visible state + persisted storage.
 */
const { chromium, devices } = require("playwright");
const zlib = require("node:zlib");
const fs = require("node:fs");
const path = require("node:path");

const BASE = process.argv[2] || "http://localhost:3000";
const SHOTS = process.argv[3] || path.join(__dirname, "screenshots");
fs.mkdirSync(SHOTS, { recursive: true });

/** Minimal solid-colour PNG (so uploads have real pixels to sample). */
function png(w, h, [r, g, b]) {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const x of buf) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) raw.set([r, g, b], y * (w * 3 + 1) + 1 + x * 3);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

let passed = 0;
const failures = [];
const check = (name, cond, detail = "") => {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failures.push(`${name} ${detail}`);
    console.log(`  ✗ ${name} ${detail}`);
  }
};

const state = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("project-wardrobe:v1") || "null"));
const settle = (page, ms = 350) => page.waitForTimeout(ms);

async function desktop(browser) {
  console.log("\nDESKTOP");
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto(BASE + "/");
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await settle(page, 600);
  let s = await state(page);
  check("demo data seeded (47 items)", s && s.items.length === 47, `got ${s && s.items.length}`);
  check("home shows outfit of the day", await page.getByText(/Outfit of the day|Today's look/).isVisible());

  // ── Wardrobe search + filters
  await page.goto(BASE + "/wardrobe", { waitUntil: "networkidle" });
  await page.getByLabel("Search wardrobe").fill("flannel");
  await settle(page);
  check("search filters grid", (await page.locator("main ul li a[href^='/wardrobe/']").count()) === 2, `(${await page.locator("main ul li a[href^='/wardrobe/']").count()})`);
  await page.getByLabel("Search wardrobe").fill("");
  await page.getByRole("group", { name: "Category" }).getByRole("button", { name: /^Shoes/ }).click();
  await settle(page);
  check("category filter → 6 shoes", (await page.locator("main ul li a[href^='/wardrobe/']").count()) === 6);
  await page.getByRole("button", { name: /Filters/ }).click();
  await page.getByRole("button", { name: /^White/ }).first().click();
  await settle(page);
  check("colour filter narrows results (main or secondary white)", (await page.locator("main ul li a[href^='/wardrobe/']").count()) === 3, `(${await page.locator("main ul li a[href^='/wardrobe/']").count()})`);
  await page.getByRole("button", { name: "Clear all" }).click();
  await page.getByRole("group", { name: "Category" }).getByRole("button", { name: /^All/ }).click();
  await page.screenshot({ path: `${SHOTS}/d-wardrobe.png` });

  // ── Add item with photo (DEMO recognition)
  await page.getByRole("button", { name: "Add item" }).click();
  await page.setInputFiles("[data-testid=single-upload]", { name: "olive_cargo_pants.png", mimeType: "image/png", buffer: png(120, 160, [95, 100, 64]) });
  await page.getByText("Demo recognition").first().waitFor({ timeout: 8000 });
  check("recognition labelled as demo", await page.getByText(/No AI vision model runs/).isVisible());
  check("recognition guessed cargo from file name", (await page.locator("#add-shape").inputValue()) === "cargo");
  check("colour sampled from pixels (olive)", await page.getByText(/Main colour · Olive/).isVisible());
  await page.screenshot({ path: `${SHOTS}/d-add-item.png` });
  await page.locator("#add-name").fill("E2E Olive Cargos");
  await page.getByRole("button", { name: "Add to wardrobe" }).click();
  await page.waitForURL(/\/wardrobe\/itm_/);
  await settle(page);
  check("new item detail page opens", await page.getByRole("heading", { name: "E2E Olive Cargos" }).isVisible());
  const newId = page.url().split("/").pop();

  // ── Edit
  await page.getByRole("button", { name: "Edit" }).click();
  await page.locator("#edit-name").fill("E2E Olive Cargos v2");
  await page.getByRole("button", { name: "Save changes" }).click();
  await settle(page);
  check("edit persists in UI", await page.getByRole("heading", { name: "E2E Olive Cargos v2" }).isVisible());

  // ── Persistence after refresh
  await page.reload({ waitUntil: "networkidle" });
  await settle(page, 600);
  check("item survives refresh", await page.getByRole("heading", { name: "E2E Olive Cargos v2" }).isVisible());

  // ── Delete
  await page.getByRole("button", { name: "Delete piece" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  await page.waitForURL(/\/wardrobe$/);
  await settle(page, 500);
  s = await state(page);
  check("item deleted from storage", !s.items.some((i) => i.id === newId) && s.items.length === 47);

  // ── Bulk upload (simulated batch + real files)
  await page.getByRole("button", { name: "Bulk upload" }).click();
  await page.setInputFiles("[data-testid=bulk-upload]", [
    { name: "white_tee.png", mimeType: "image/png", buffer: png(80, 80, [247, 246, 242]) },
    { name: "navy_hoodie.png", mimeType: "image/png", buffer: png(80, 80, [31, 42, 68]) },
  ]);
  await page.getByRole("button", { name: "Simulate sample batch" }).click();
  await page.getByRole("button", { name: /Add 6 to wardrobe/ }).waitFor({ timeout: 15000 });
  await page.waitForFunction(() => !document.body.innerText.includes("processing…"), null, { timeout: 15000 });
  await page.screenshot({ path: `${SHOTS}/d-bulk.png` });
  await page.getByRole("button", { name: /Add 6 to wardrobe/ }).click();
  await settle(page, 500);
  s = await state(page);
  check("bulk upload adds 6 items", s.items.length === 53, `got ${s.items.length}`);

  // ── Stylist → results
  await page.goto(BASE + "/stylist", { waitUntil: "networkidle" });
  await page.getByRole("radio", { name: /Weekend/ }).click();
  await page.locator("#brief").fill("relaxed, no loafers");
  await page.getByRole("button", { name: /Generate 4 outfits/ }).click();
  await page.waitForURL(/\/stylist\/results/);
  await settle(page, 700);
  const cards = page.locator("article");
  check("4 outfit recommendations", (await cards.count()) === 4);
  s = await state(page);
  const ids = new Set(s.items.map((i) => i.id));
  const shownIds = await page.locator("[data-item-id]").evaluateAll((els) => els.map((e) => e.getAttribute("data-item-id")));
  check("every visualised piece exists in wardrobe", shownIds.length > 0 && shownIds.every((id) => ids.has(id)));
  const session = s.sessions[0];
  const loaferIds = s.items.filter((i) => i.shape === "loafer").map((i) => i.id);
  check("brief honoured (no loafers)", session.outfitIds.every((oid) => s.outfits[oid].pieces.every((p) => !loaferIds.includes(p.itemId))));
  check("parsed brief shown as demo", await page.getByText("Brief understood as").isVisible());
  await page.screenshot({ path: `${SHOTS}/d-results.png` });

  // swap
  const first = cards.first();
  const firstId = session.outfitIds[0];
  const before = JSON.stringify(s.outfits[firstId].pieces);
  await first.getByRole("button", { name: /^Replace / }).nth(2).click();
  await page.getByRole("dialog").locator("ul li button").first().click();
  await settle(page);
  s = await state(page);
  check("individual item replaced", JSON.stringify(s.outfits[firstId].pieces) !== before);
  check("item_replaced interaction tracked", s.interactions.some((i) => i.type === "item_replaced" && i.outfitId === firstId));

  // save + like
  await first.getByRole("button", { name: /^Save$/ }).click();
  await first.getByRole("button", { name: "Like" }).click();
  await settle(page);
  s = await state(page);
  check("saved + liked", s.outfits[firstId].saved && s.outfits[firstId].liked);
  check("learned preferences updated", Object.keys(s.profile.learned.item).length > 0);

  // wear
  const wearsBefore = s.wearLog.length;
  await first.getByRole("button", { name: "Wear it" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Wear it" }).click();
  await settle(page);
  s = await state(page);
  check("wear logged with date", s.wearLog.length === wearsBefore + 1 && /^\d{4}-\d{2}-\d{2}$/.test(s.wearLog[0].date));

  // reject + undo
  const secondId = session.outfitIds[1];
  await cards.nth(1).getByRole("button", { name: "Not for me" }).click();
  await settle(page);
  check("rejected card hidden", (await page.locator("article").count()) === 3);
  await page.getByRole("button", { name: "Undo" }).last().click();
  await settle(page);
  check("undo restores card", (await page.locator("article").count()) === 4);
  await page.locator("article").nth(1).getByRole("button", { name: "Not for me" }).click();
  await settle(page);

  // regenerate
  await page.getByRole("button", { name: "Regenerate" }).first().click();
  await settle(page, 900);
  s = await state(page);
  const next = s.sessions[0];
  check("regenerate returns new, non-repeating looks", next.iteration === 1 && next.outfitIds.every((id) => !session.outfitIds.includes(id)));

  // visual mode B
  await page.getByRole("radio", { name: /On model/ }).click();
  await settle(page);
  check("AI visualization labelled DEMO", (await page.getByText(/AI visualization · demo/i).count()) >= 1);
  await page.screenshot({ path: `${SHOTS}/d-results-ai.png` });
  await page.getByRole("radio", { name: /My pieces/ }).click();

  // outfit detail
  await page.goto(BASE + `/outfits/${firstId}`, { waitUntil: "networkidle" });
  await settle(page, 500);
  check("outfit detail renders", await page.getByRole("heading", { name: "The pieces" }).isVisible());
  s = await state(page);
  check("viewed interaction tracked", s.interactions.some((i) => i.type === "viewed" && i.outfitId === firstId));
  await page.screenshot({ path: `${SHOTS}/d-outfit.png`, fullPage: true });

  // lookbook + stats reflect it
  await page.goto(BASE + "/lookbook?tab=history", { waitUntil: "networkidle" });
  await settle(page);
  check("history shows new wear", await page.getByText(s.outfits[firstId].name).first().isVisible());
  await page.goto(BASE + "/stats", { waitUntil: "networkidle" });
  await settle(page);
  const wornText = await page.locator("text=Outfits worn").locator("..").innerText();
  check("stats reflect wears", wornText.includes(String(s.wearLog.length)), wornText.replace(/\n/g, " "));

  // profile
  await page.goto(BASE + "/profile", { waitUntil: "networkidle" });
  await page.locator("#p-name").fill("Sam");
  await page.getByRole("button", { name: "Slim" }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await settle(page);
  await page.reload({ waitUntil: "networkidle" });
  await settle(page, 600);
  s = await state(page);
  check("profile edits persist", s.profile.name === "Sam" && s.profile.preferredFits.includes("slim"));
  check("sidebar reflects profile name", await page.locator("aside").getByText("Sam", { exact: true }).isVisible());

  // reset demo
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await page.getByRole("button", { name: "Reset everything" }).click();
  await settle(page, 500);
  s = await state(page);
  check("reset demo restores seed", s.items.length === 47 && s.profile.name === "Noa");

  check("no console/page errors (desktop)", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

async function mobile(browser) {
  console.log("\nMOBILE (iPhone 13)");
  const ctx = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  for (const [route, name] of [
    ["/", "home"],
    ["/wardrobe", "wardrobe"],
    ["/wardrobe/itm_jkt_bomber", "item"],
    ["/stylist", "stylist"],
    ["/lookbook", "lookbook"],
    ["/lookbook?tab=calendar", "calendar"],
    ["/profile", "profile"],
    ["/stats", "stats"],
  ]) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await settle(page, 500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    check(`${route} has no horizontal overflow`, !overflow);
    await page.screenshot({ path: `${SHOTS}/m-${name}.png` });
  }
  // mobile filters sheet + generate flow
  await page.goto(BASE + "/wardrobe", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Filters/ }).click();
  check("mobile filter sheet opens", await page.getByRole("dialog", { name: "Filters" }).isVisible());
  await page.screenshot({ path: `${SHOTS}/m-filters.png` });
  await page.getByRole("dialog").getByRole("button", { name: /^Show/ }).click();
  await page.getByRole("link", { name: /Stylist/ }).click();
  await page.waitForURL(/\/stylist/);
  await page.getByRole("button", { name: /Generate/ }).tap();
  await page.waitForURL(/results/);
  await settle(page, 700);
  check("mobile generate works", (await page.locator("article").count()) >= 3);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check("results have no horizontal overflow", !overflow);
  await page.screenshot({ path: `${SHOTS}/m-results.png`, fullPage: false });
  await page.locator("article").first().getByRole("button", { name: "Wear it" }).tap();
  await page.getByRole("dialog").getByRole("button", { name: "Wear it" }).tap();
  await settle(page);
  check("mobile wear it works", (await state(page)).wearLog.length === 19);
  check("no page errors (mobile)", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  try {
    await desktop(browser);
    await mobile(browser);
  } catch (e) {
    failures.push(`CRASH: ${e.message.split("\n")[0]}`);
    console.error(e);
  } finally {
    await browser.close();
  }
  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length) {
    console.log(failures.map((f) => ` - ${f}`).join("\n"));
    process.exit(1);
  }
})();
