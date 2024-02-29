import { expect } from '@playwright/test';
import { test } from './fixtures/baseFixtures';
import logout from './utils/logout';
import appUrl from './utils/url';
import LoginPage from './model/login.page';

test('Logout test', async ({ page }) => {
  await page.goto(appUrl());

  await logout(page);
  const loginPage = new LoginPage(page);
  await expect(loginPage.getLoginPage()).toBeVisible();
});
