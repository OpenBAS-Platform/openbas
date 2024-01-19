import { expect, Page } from '@playwright/test';
import { TopBarPage } from '../model/topBar.page';
import { LoginPage } from '../model/login.page';

const logout = async (page: Page) => {
  const topBarPage = new TopBarPage(page);

  await topBarPage.getAccountMenu().click();
  await topBarPage.getLogoutEntryMenu().click();

  const loginPage = new LoginPage(page);
  await expect(loginPage.getLoginPage()).toBeVisible();
};

export default logout;
