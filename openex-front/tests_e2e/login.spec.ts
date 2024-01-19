import { test } from './fixtures/baseFixtures';
import logout from './utils/logout';
import appUrl from './utils/url';

test('Logout test', async ({ page }) => {
  await page.goto(appUrl());

  await logout(page);
});
