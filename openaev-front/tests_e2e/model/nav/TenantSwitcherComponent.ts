import { expect, type Locator, type Page } from '@playwright/test';

import { TIMEOUT } from '../../utils/constants';

/**
 * Wraps the LeftBarTenantSwitcher component interactions.
 * The switcher is a MenuItem in the left navigation bar that opens a Popover
 * listing all accessible tenants.
 */
class TenantSwitcherComponent {
  constructor(private page: Page) {}

  get switcher() {
    return this.page.getByTestId('tenant-switcher');
  }

  get popoverMenu(): Locator {
    return this.page.getByRole('menu').last();
  }

  /**
   * Opens the tenant-switcher popover by clicking the icon-based menu item.
   * Works regardless of whether the left bar is expanded or collapsed.
   */
  async openSwitcher(_currentTenantName?: string): Promise<void> {
    const switcher = this.switcher;

    await expect(switcher).toBeVisible({ timeout: TIMEOUT });
    await expect(switcher).toBeEnabled({ timeout: TIMEOUT });
    await switcher.click({ timeout: TIMEOUT });
    await expect(this.popoverMenu).toBeVisible({ timeout: TIMEOUT });
  }

  /**
   * All tenant menu items inside the currently open switcher popover.
   * Call {@link openSwitcher} first to open the popover.
   */
  get popoverTenantItems() {
    return this.popoverMenu.getByRole('menuitem');
  }

  /**
   * Clicks a specific tenant by name from the open switcher popover.
   */
  async selectTenantByName(tenantName: string): Promise<void> {
    await expect(this.popoverMenu).toBeVisible({ timeout: TIMEOUT });
    await this.popoverMenu.getByRole('menuitem').filter({ hasText: tenantName }).click({ timeout: TIMEOUT });
  }
}
export default TenantSwitcherComponent;
