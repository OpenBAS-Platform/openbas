import { expect, Page } from '@playwright/test';
import { TopBarPage } from '../model/topBar.page';
import { LoginPage } from '../model/login.page';

const logout = async (page: Page) => {
  const topBarPage = new TopBarPage(page);

  await topBarPage.getAccountMenu().click();
  await topBarPage.getLogoutEntryMenu().click();
};

export default logout;
