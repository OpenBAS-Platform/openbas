import { expect, test } from '@playwright/test';
import appUrl from '../../utils/url';
import ContractPage from '../../model/contracts/contract.page';
import LeftMenuPage from '../../model/left-menu.page';
import ContractFormPage from '../../model/contracts/contract-form.page';

test.describe('Contracts', () => {
  let contractPage: ContractPage;
  let contractFormPage: ContractFormPage;

  test.beforeEach(async ({ page }) => {
    contractPage = new ContractPage(page);
    contractFormPage = new ContractFormPage(page);

    await page.goto(appUrl());

    const leftMenuPage = new LeftMenuPage(page);
    await leftMenuPage.goToContracts();
    test.setTimeout(7000);
  });
  test('get first page of contract of 10 contracts with searchtext empty and sort by type,label asc', async ({
  }) => {
    const contractTitles = contractFormPage.getContractTitles();
    await expect(contractTitles).toHaveCount(10);
  });

  test('get second page of contract with searchtext empty and sort by type,label asc', async ({
    page,
  }) => {
    await contractPage.goToPage(2);

    const contractTitles = page.getByRole('heading');
    await expect(contractTitles).toHaveCount(1);

    await contractPage.goToPreviousPage();
  });
  test('get 1 page of 3 contract with searchtext : em and sort type,label asc', async ({}) => {
    await contractPage.goToSearch();
    await contractPage.fillSearchWith('em');
    const contractTitles = contractFormPage.getContractTitles();
    await expect(contractTitles).toHaveCount(3);
  });
  test('get 1 page of 3 contract with searchtext : EM and sort type,label asc', async ({}) => {
    await contractPage.goToSearch();
    await contractPage.fillSearchWith('EM');
    const contractTitles = contractFormPage.getContractTitles();
    await expect(contractTitles).toHaveCount(3);
  });
});
