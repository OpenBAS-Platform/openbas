import { Page } from '@playwright/test';

export class TopBarPage {

  constructor(private page: Page) {}

  getAccountMenu() {
    return this.page.getByLabel('account-menu');
  }

  getLogoutEntryMenu() {
    return this.page.getByLabel('logout-item');
  }

}
