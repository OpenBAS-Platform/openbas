import { Page } from '@playwright/test';

class LeftMenuPage {
  constructor(private page: Page) {
  }

  goToAssets() {
    return this.page.getByLabel('Assets').click();
  }
}

export default LeftMenuPage;
