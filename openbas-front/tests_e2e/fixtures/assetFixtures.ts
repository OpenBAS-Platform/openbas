import { Page } from '@playwright/test';

import AssetFormPage from '../model/assets/asset-form.page';

const fillLinuxAssetBase = async (page: Page, name: string, ip: string) => {
  const assetFormPage = new AssetFormPage(page);

  await assetFormPage.fillName(name);
};

export default fillLinuxAssetBase;
