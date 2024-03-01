import { expect } from '@playwright/test';
import { test } from '../../fixtures/baseFixtures';
import appUrl from '../../utils/url';
import LeftMenuPage from '../../model/left-menu.page';
import AssetsPage from '../../model/assets/assets.page';
import AssetFormPage from '../../model/assets/asset-form.page';
import fillLinuxAssetBase from '../../fixtures/assetFixtures';

test('Update an asset', async ({ page }) => {
  // -- PREPARE --
  await page.goto(appUrl());

  const leftMenuPage = new LeftMenuPage(page);
  await leftMenuPage.goToAssets();

  const assetsPage = new AssetsPage(page);
  await assetsPage.getAddButton().click();

  const assetFormPage = new AssetFormPage(page);
  await fillLinuxAssetBase(page, 'My endpoint name to update', '192.168.255.255');
  await assetFormPage.getCreateButton().click();

  // -- EXECUTE --
  const updateMenuItem = await assetsPage.getUpdateMenuItem('My endpoint name to update');
  await updateMenuItem.click();

  await assetFormPage.fillName('My endpoint name updated');
  await assetFormPage.getUpdateButton().click();

  await expect(page.getByText('My endpoint name updated', { exact: true })).toBeVisible();
});
