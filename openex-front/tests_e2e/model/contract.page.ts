import { Page } from '@playwright/test';

class ContractPage {
  constructor(private page: Page) {}

  getContractPage() {
    return this.page.getByLabel('Integrations');
  }

  goToPage() {
    return this.page.getByLabel('Go to page');
  }

  goToPreviousPage() {
    return this.page.getByLabel('Go to previous page');
  }

  goToNextPage() {
    return this.page.getByLabel('Go to next page');
  }

  goToSearch() {
    return this.page.getByPlaceholder('Search these results...');
  }
}

export default ContractPage;
