import { Page } from '@playwright/test';

class AssetFormPage {
  constructor(private page: Page) {
  }

  async fillName(name: string) {
    const nameField = this.page.getByLabel('Name *');
    await nameField.click();
    await nameField.fill(name);
  }

  getUpdateButton() {
    return this.page.getByRole('button', { name: 'Update' });
  }
}

export default AssetFormPage;
