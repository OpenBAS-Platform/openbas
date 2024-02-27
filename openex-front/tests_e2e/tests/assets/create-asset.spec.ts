import { expect } from '@playwright/test';
import { test } from '../../fixtures/baseFixtures';
import appUrl from '../../utils/url';
import LeftMenuPage from '../../model/left-menu.page';
import AssetsPage from '../../model/assets/assets.page';
import AssetFormPage from '../../model/assets/asset-form.page';
import fillLinuxAssetBase from '../../fixtures/assetFixtures';

test('Create an asset', async ({ page }) => {
  // -- PREPARE --
  await page.goto(appUrl());

  const leftMenuPage = new LeftMenuPage(page);
  await leftMenuPage.goToAssets();

  // -- EXECUTE --
  const assetsPage = new AssetsPage(page);
  await assetsPage.getAddButton().click();

  const assetFormPage = new AssetFormPage(page);
  await fillLinuxAssetBase(page, 'My endpoint name to create', '192.168.255.255');
  await assetFormPage.getCreateButton().click();

  // -- ASSERT --
  await expect(page.getByText('My endpoint name to create', { exact: true })).toBeVisible();
});
