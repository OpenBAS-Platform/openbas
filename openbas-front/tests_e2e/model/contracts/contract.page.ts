import { Page } from '@playwright/test';

class ContractPage {
  constructor(private page: Page) {}

  async goToPreviousPage() {
    await this.page.getByLabel('Go to previous page').click();
  }

  async goToNextPage() {
    await this.page.getByLabel('Go to next page').click();
  }

  async goToPage(page: number) {
    await this.page.getByLabel(`page ${page}`).click();
  }
}

export default ContractPage;
