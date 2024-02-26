import { test } from '../../fixtures/baseFixtures';
import appUrl from '../../utils/url';
import LeftMenuPage from '../../model/left-menu.page';
import AssetsPage from '../../model/assets/assets.page';
import AssetFormPage from '../../model/assets/asset-form.page';
import { expect } from '@playwright/test';
import fillLinuxAssetBase from '../../fixtures/assetFixtures';

test('Update an asset', async ({ page }) => {
  // -- PREPARE --
  await page.goto(appUrl());

  let leftMenuPage = new LeftMenuPage(page);
  await leftMenuPage.goToAssets();

  let assetsPage = new AssetsPage(page);
  await assetsPage.getAddButton().click();

  let assetFormPage = new AssetFormPage(page);
  await fillLinuxAssetBase(page, 'My endpoint name to update', '192.168.255.255');
  await assetFormPage.getCreateButton().click();

  // -- EXECUTE --
  let updateMenuItem = await assetsPage.getUpdateMenuItem('My endpoint name to update');
  await updateMenuItem.click();

  await assetFormPage.fillName('My endpoint name updated');
  await assetFormPage.getUpdateButton().click();

  expect(!await assetFormPage.getCreateButton().isVisible());
  expect(await page.getByText('My endpoint name updated', { exact: true }).isVisible());
});
