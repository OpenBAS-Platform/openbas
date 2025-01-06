import { expect } from '@playwright/test';

import fillLinuxAssetBase from '../../fixtures/assetFixtures';
import { test } from '../../fixtures/baseFixtures';
import AssetFormPage from '../../model/assets/asset-form.page';
import AssetsPage from '../../model/assets/assets.page';
import appUrl from '../../utils/url';

test('Delete an asset', async ({ page }) => {
  // -- PREPARE --
  await page.goto(`${appUrl()}/admin/assets`);

  // const leftMenuPage = new LeftMenuPage(page);
  // await leftMenuPage.goToAssets();

  const assetsPage = new AssetsPage(page);
  await assetsPage.getAddButton().click();

  // -- EXECUTE --
  const deleteMenuItem = await assetsPage.getDeleteMenuItem('My endpoint name to delete');
  await deleteMenuItem.click();
  await assetsPage.getDialogDeleteButton().click();

  await expect(page.getByText('My endpoint name to delete', { exact: true })).toBeHidden();
});
