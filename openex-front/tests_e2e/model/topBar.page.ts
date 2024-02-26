import { Page } from '@playwright/test';

// eslint-disable-next-line import/prefer-default-export
export class TopBarPage {
  constructor(private page: Page) {
  }

  getAccountMenu() {
    return this.page.getByLabel('account-menu');
  }

  getLogoutEntryMenu() {
    return this.page.getByLabel('logout-item');
  }
}
