import { test, expect } from "@playwright/test";

test.describe("FXWise Baseline Smoke Tests", () => {
  test("Homepage loads with branding and workbench", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/FXWise/);
    await expect(page.locator("header")).toContainText("FXWise");
    await expect(page.locator("header")).toContainText("Hidden Fee Detector");
  });

  test("Navigation links are present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Student" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Freelancer" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Travel" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
  });
});
