import { expect, type Page } from '@playwright/test';

import LoginPage from '../model/login.page';
import TopBarPage from '../model/topBar.page';
import appUrl from './url';

const login = async (page: Page, email = 'admin@openaev.io', password = 'admin') => {
  await page.goto(appUrl());

  const loginPage = new LoginPage(page);
  await expect(loginPage.getLoginPage()).toBeVisible();

  await loginPage.getLoginInput().fill(email);
  await loginPage.getPasswordInput().fill(password);
  await loginPage.getSignInButton().click();

  const topBarPage = new TopBarPage(page);
  await expect(topBarPage.getAccountMenu()).toBeVisible();
};

export default login;
