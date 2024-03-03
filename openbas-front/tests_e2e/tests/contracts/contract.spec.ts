import { expect, test } from '@playwright/test';
import appUrl from '../../utils/url';
import ContractPage from '../../model/contracts/contract.page';
import LeftMenuPage from '../../model/left-menu.page';
import ContractFormPage from '../../model/contracts/contract-form.page';
import ContractApiMock from '../../model/contracts/contract-api';

test.describe('Contracts', () => {
  let contractPage: ContractPage;
  let contractFormPage: ContractFormPage;
  let contractApiMock: ContractApiMock;
  test.beforeEach(async ({ page }) => {
    contractPage = new ContractPage(page);
    contractFormPage = new ContractFormPage(page);
    contractApiMock = new ContractApiMock(page);

    await contractApiMock.mockContracts();

    await page.goto(appUrl());

    const leftMenuPage = new LeftMenuPage(page);
    await leftMenuPage.goToContracts();

    test.setTimeout(7000);
  });
  test('get first page of contract of contracts with searchtext empty and sort by type,label asc', async () => {
    const contractTitles = contractFormPage.getContractTitles();
    await expect(contractTitles).toHaveCount(5);
  });
  test('get second page of contract with searchtext empty and sort by type,label asc', async () => {
    await contractPage.goToPage(2);

    const contractTitles = contractFormPage.getContractTitles();
    await expect(contractTitles).toHaveCount(5);

    await contractPage.goToPreviousPage();
  });
});
