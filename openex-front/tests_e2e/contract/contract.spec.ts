import { expect, test } from '@playwright/test';
import ContractPage from '../model/contract.page';
import appUrl from '../utils/url';

test.describe('Contracts', () => {
  let contractPage: ContractPage;

  test.beforeEach(async ({ page }) => {
    await page.goto(appUrl());
    contractPage = new ContractPage(page);
    await contractPage.getContractPage().click();
  });
  test('get first page of contract of 10 contracts with searchtext empty and sort by type,label asc', async ({
    page,
  }) => {
    const contractTitles = page.getByRole('heading');
    await expect(contractTitles).toHaveCount(10);
  });

  test('get second page of contract with searchtext empty and sort by type,label asc', async ({
    page,
  }) => {
    await contractPage.goToNextPage().click();
    await page.getByLabel('page 2').click();

    const contractTitles = page.getByRole('heading');
    await expect(contractTitles).toHaveCount(1);
    await contractPage.goToPreviousPage().click();
  });
  test('get 1 page of 3 contract with searchtext : em and sort type,label asc', async ({
    page,
  }) => {
    await contractPage.goToSearch().click();
    await contractPage.goToSearch().fill('em');
    const contractTitles = page.getByRole('heading');
    await expect(contractTitles).toHaveCount(3);
  });
  test('get 1 page of 3 contract with searchtext : EM and sort type,label asc', async ({
    page,
  }) => {
    await contractPage.goToSearch().click();
    await contractPage.goToSearch().fill('EM');
    const contractTitles = page.getByRole('heading');
    await expect(contractTitles).toHaveCount(3);
  });
});
