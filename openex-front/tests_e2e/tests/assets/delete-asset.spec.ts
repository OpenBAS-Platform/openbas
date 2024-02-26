import { test } from '../../fixtures/baseFixtures';
import appUrl from '../../utils/url';
import LeftMenuPage from '../../model/left-menu.page';
import AssetsPage from '../../model/assets/assets.page';
import AssetFormPage from '../../model/assets/asset-form.page';
import { expect } from '@playwright/test';
import fillLinuxAssetBase from '../../fixtures/assetFixtures';

test('Delete an asset', async ({ page }) => {
  // -- PREPARE --
  await page.goto(appUrl());

  let leftMenuPage = new LeftMenuPage(page);
  await leftMenuPage.goToAssets();

  let assetsPage = new AssetsPage(page);
  await assetsPage.getAddButton().click();

  let assetFormPage = new AssetFormPage(page);
  await fillLinuxAssetBase(page, 'My endpoint name to delete', '192.168.255.255');
  await assetFormPage.getCreateButton().click();

  // -- EXECUTE --
  let deleteMenuItem = await assetsPage.getDeleteMenuItem('My endpoint name to delete');
  await deleteMenuItem.click();
  await assetsPage.getDialogDeleteButton().click();

  expect(!await page.getByText('My endpoint name to delete', { exact: true }).isVisible());
});
