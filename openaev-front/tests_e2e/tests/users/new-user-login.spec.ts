import { expect, type Page } from '@playwright/test';

import UserApiHelpers from '../../api-helpers/UserApiHelpers';
import { test } from '../../fixtures';
import LoginPage from '../../model/login.page';
import login from '../../utils/login';
import logout from '../../utils/logout';
import appUrl, { DEFAULT_TENANT_UUID } from '../../utils/url';

const PASSWORD = 'E2e-NewUser-Pa55!';

const loginAs = async (page: Page, email: string) => {
  const loginPage = new LoginPage(page);
  await expect(loginPage.getLoginPage()).toBeVisible();
  await loginPage.getLoginInput().fill(email);
  await loginPage.getPasswordInput().fill(PASSWORD);
  await loginPage.getSignInButton().click();
};

/**
 * A new user lands in the default tenant, on the admin or the player area depending
 * on its groups. Both top bars carry the same Profile button.
 */
const expectLandedInDefaultTenant = async (page: Page) => {
  await expect(page.getByRole('button', {
    name: 'Profile',
    exact: true,
  })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/${DEFAULT_TENANT_UUID}/(admin|private)`));
  await expect(page.getByText('Tenant access denied')).toBeHidden();
  await expect(page.getByText('No tenant assigned')).toBeHidden();
};

// Runs with and without an Enterprise Edition licence: a user created from the
// default tenant must be able to log in to it in both cases.
test.describe('New user login', () => {
  test.use({
    storageState: {
      cookies: [],
      origins: [],
    },
  });

  let userId: string | null = null;
  let email: string;

  test.beforeEach(async ({ request }) => {
    email = `e2e-new-user-${Date.now()}@openaev.io`;
    const user = await new UserApiHelpers(request).createUser(email, PASSWORD);
    userId = user.user_id;
  });

  test.afterEach(async ({ request }) => {
    if (userId) {
      await new UserApiHelpers(request).detachUser(userId);
      userId = null;
    }
  });

  // Asserts through expectLandedInDefaultTenant.
  // eslint-disable-next-line playwright/expect-expect
  test('a new user logs in to the default tenant', async ({ page }) => {
    await page.goto(appUrl());
    await loginAs(page, email);

    await expectLandedInDefaultTenant(page);
  });

  // Asserts through expectLandedInDefaultTenant.
  // eslint-disable-next-line playwright/expect-expect
  test('a new user logs in right after the admin logged out in the same browser', async ({ page }) => {
    await login(page);
    await logout(page);
    await loginAs(page, email);

    await expectLandedInDefaultTenant(page);
  });
});
