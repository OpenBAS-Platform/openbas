import { test } from '../../fixtures/baseFixtures';
import appUrl from '../../utils/url';
import LeftMenuPage from '../../model/left-menu.page';
import AssetsPage from '../../model/assets/assets.page';
import AssetFormPage from '../../model/assets/asset-form.page';
import { expect } from '@playwright/test';
import fillLinuxAssetBase from '../../fixtures/assetFixtures';

test('Create an asset', async ({ page }) => {
  // -- PREPARE --
  await page.goto(appUrl());

  let leftMenuPage = new LeftMenuPage(page);
  await leftMenuPage.goToAssets();

  // -- EXECUTE --
  let assetsPage = new AssetsPage(page);
  await assetsPage.getAddButton().click();

  let assetFormPage = new AssetFormPage(page);
  await fillLinuxAssetBase(page, 'My endpoint name', '192.168.255.255');
  await assetFormPage.getCreateButton().click();

  // -- ASSERT --
  expect(!await assetFormPage.getCreateButton().isVisible());
  expect(await page.getByText('My endpoint name', { exact: true }).isVisible());
});
