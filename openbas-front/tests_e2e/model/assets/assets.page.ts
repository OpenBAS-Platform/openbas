import { Page } from '@playwright/test';

class AssetsPage {
  constructor(private page: Page) {
  }

  getAddButton() {
    return this.page.getByLabel('Add');
  }

  async getUpdateMenuItem(assetName: string) {
    await this.getMenuItem(assetName).click();
    return this.page.getByRole('menuitem', { name: 'Update' });
  }

  async getDeleteMenuItem(assetName: string) {
    await this.getMenuItem(assetName).click();
    return this.page.getByRole('menuitem', { name: 'Delete' });
  }

  getDialogDeleteButton() {
    return this.page.getByRole('button', { name: 'Delete' });
  }

  private getMenuItem(assetName: string) {
    return this.page.getByLabel(`endpoint menu for ${assetName}`, { exact: true });
  }
}

export default AssetsPage;
