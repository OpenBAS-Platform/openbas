import { expect } from '@playwright/test';

import { test } from '../../fixtures/baseFixtures';
import AssetFormPage from '../../model/assets/asset-form.page';
import AssetsPage from '../../model/assets/assets.page';
import appUrl from '../../utils/url';

test('Update an asset', async ({ page }) => {
  // -- PREPARE --
  await page.goto(`${appUrl()}/admin/assets/endpoint`);

  // const leftMenuPage = new LeftMenuPage(page);
  // await leftMenuPage.goToAssets();

  const assetsPage = new AssetsPage(page);

  const assetFormPage = new AssetFormPage(page);

  // -- EXECUTE --
  const updateMenuItem = await assetsPage.getUpdateMenuItem('My endpoint name to update');
  await updateMenuItem.click();

  await assetFormPage.fillName('My endpoint name updated');
  await assetFormPage.getUpdateButton().click();

  await expect(page.getByText('My endpoint name updated', { exact: true })).toBeVisible();
});
