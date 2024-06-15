import { Page } from '@playwright/test';

class AssetFormPage {
  constructor(private page: Page) {
  }

  async fillName(name: string) {
    const nameField = this.page.getByLabel('Name *');
    await nameField.click();
    await nameField.fill(name);
  }

  async fillIpAddresses(ip: string) {
    const ipField = this.page.getByLabel('Ip Addresses *');
    await ipField.click();
    await ipField.fill(ip);
  }

  async fillPlatformLinux() {
    const platformField = this.page.getByLabel('Platform *');
    await platformField.click();
    await this.page.getByRole('option', { name: 'Linux' }).click();
  }

  async fillArchx86() {
    const platformField = this.page.getByLabel('Architecture *');
    await platformField.click();
    await this.page.getByRole('option', { name: 'x86_64' }).click();
  }

  getCreateButton() {
    return this.page.getByRole('button', { name: 'Create' });
  }

  getUpdateButton() {
    return this.page.getByRole('button', { name: 'Update' });
  }
}

export default AssetFormPage;
