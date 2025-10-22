import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should redirect to sign-in when not authenticated", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/.*signin/);
  });

  test("should display sign-in form", async ({ page }) => {
    await page.goto("/auth/signin");
    await expect(page.locator("h1")).toContainText("Welcome back");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await page.goto("/auth/signin");
    await page.click('button[type="submit"]');
    // Form validation should prevent submission
    await expect(page).toHaveURL(/.*signin/);
  });
});
