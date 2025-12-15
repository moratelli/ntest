import { expect, test } from "@playwright/test";

test.describe("Conway's Game of Life E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the application with default glider", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Conway's Game of Life");
    await expect(page.locator("canvas")).toBeVisible();

    const generationText = page.locator("text=/Generation:/");
    await expect(generationText).toContainText("Generation: 0");
  });

  test("should step through generations", async ({ page }) => {
    await page.getByRole("button", { name: /step/i }).click();

    const generationText = page.locator("text=/Generation:/");
    await expect(generationText).toContainText("Generation: 1");
  });

  test("should play and pause simulation", async ({ page }) => {
    const playButton = page.getByRole("button", { name: /play/i });
    await playButton.click();

    await page.waitForTimeout(500);

    const pauseButton = page.getByRole("button", { name: /pause/i });
    await pauseButton.click();

    const generationText = page.locator("text=/Generation:/");
    const text = await generationText.textContent();
    const generation = parseInt(text?.match(/\d+/)?.[0] || "0");

    expect(generation).toBeGreaterThan(0);
  });

  test("should jump multiple generations", async ({ page }) => {
    await page.locator('input[type="number"]').fill("10");
    await page.getByRole("button", { name: /jump/i }).click();

    await page.waitForTimeout(500);

    const generationText = page.locator("text=/Generation:/");
    await expect(generationText).toContainText("Generation: 10");
  });

  test("should upload JSON state", async ({ page }) => {
    await page.getByRole("button", { name: /import state/i }).click();

    const jsonInput = page.locator("textarea");
    await jsonInput.fill('{"alive": [[0,0], [1,1], [2,2]]}');

    await page.getByRole("button", { name: "Upload", exact: true }).click();

    const generationText = page.locator("text=/Generation:/");
    await expect(generationText).toContainText("Generation: 0");
  });

  test("should handle invalid JSON with error message", async ({ page }) => {
    await page.getByRole("button", { name: /import state/i }).click();

    const jsonInput = page.locator("textarea");
    await jsonInput.fill("invalid json");

    await page.getByRole("button", { name: "Upload", exact: true }).click();

    await expect(page.locator("text=/Invalid JSON format/i")).toBeVisible();
  });

  test("should export state", async ({ page }) => {
    const downloadPromise = page.waitForEvent("download");

    await page.getByRole("button", { name: /export state/i }).click();
    await page.getByRole("button", { name: /download json file/i }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/gol-state-\d+\.json/);
  });

  test("should reset simulation to glider", async ({ page }) => {
    await page.getByRole("button", { name: /step/i }).click();
    await page.getByRole("button", { name: /step/i }).click();

    await page.getByRole("button", { name: /reset state/i }).click();

    const generationText = page.locator("text=/Generation:/");
    await expect(generationText).toContainText("Generation: 0");
  });

  test("should persist state across page reloads", async ({ page }) => {
    await page.getByRole("button", { name: /step/i }).click();
    await page.getByRole("button", { name: /step/i }).click();

    await page.waitForTimeout(1000);

    await page.reload();

    const generationText = page.locator("text=/Generation:/");
    await expect(generationText).toContainText("Generation: 2");
  });

  test("should adjust speed slider", async ({ page }) => {
    const slider = page.locator('input[type="range"]');
    await slider.fill("500");

    await expect(page.locator("text=/Speed: 500ms/i")).toBeVisible();
  });
});
