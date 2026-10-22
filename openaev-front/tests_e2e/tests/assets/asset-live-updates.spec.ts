import { type Page } from '@playwright/test';

import EndpointApiHelpers, { type EndpointFields, randomMacAddress } from '../../api-helpers/EndpointApiHelpers';
import { expect, test } from '../../fixtures';
import { tenantUrl } from '../../utils/url';

/**
 * The asset pages refresh from the platform stream: every change below is made through the API,
 * outside the page, and must show up without reloading it. The fallback polling only runs while
 * the stream is down and every assertion waits less than its interval, so a pass proves the stream
 * path.
 */
const LIVE_TIMEOUT = 10_000;

// Set on the window once the page is loaded: still there at the end means no reload happened.
const markPage = (page: Page) => page.evaluate(() => {
  (window as unknown as { liveMarker: boolean }).liveMarker = true;
});
const expectNoReload = async (page: Page) => {
  expect(await page.evaluate(() => (window as unknown as { liveMarker?: boolean }).liveMarker)).toBe(true);
};

const newFields = (token: string): EndpointFields => ({
  name: `E2E live ${token}`,
  hostname: `e2e-live-${token}`,
  macAddress: randomMacAddress(),
});

test.describe('Asset live updates', () => {
  // Assets left by a failed test; deleting one already gone is a harmless 404.
  const createdAssetIds: string[] = [];

  test.afterEach(async ({ request }) => {
    const api = new EndpointApiHelpers(request);
    await Promise.all(createdAssetIds.splice(0).map(id => api.deleteAsset(id)));
  });

  test('given_theAssetList_should_showCreatedUpdatedAndDeletedAssetsWithoutReload', async ({ page, request }) => {
    // Arrange
    const api = new EndpointApiHelpers(request);
    const token = `${Date.now()}`;
    const fields = newFields(token);
    await page.goto(tenantUrl('/admin/assets'));
    const searched = page.waitForResponse(response => response.url().includes('/assets/search')
      && (response.request().postData() ?? '').includes(token));
    await page.getByPlaceholder('Search these results...').fill(token);
    await searched;
    await markPage(page);

    // Act + Assert: created elsewhere, the asset joins the filtered list
    const created = await api.createAgentlessEndpoint(fields);
    createdAssetIds.push(created.asset_id);
    await expect(page.getByText(fields.name, { exact: true })).toBeVisible({ timeout: LIVE_TIMEOUT });

    // Act + Assert: renamed elsewhere, the row follows
    const renamed = {
      ...fields,
      name: `${fields.name} renamed`,
    };
    await api.updateEndpoint(created.asset_id, renamed);
    await expect(page.getByText(renamed.name, { exact: true })).toBeVisible({ timeout: LIVE_TIMEOUT });

    // Act + Assert: deleted elsewhere, the row goes away
    await api.deleteAsset(created.asset_id);
    await expect(page.getByText(renamed.name, { exact: true })).toBeHidden({ timeout: LIVE_TIMEOUT });
    await expectNoReload(page);
  });

  test('given_theAssetDetail_should_showAgentUpdatesRenamesAndDeletionWithoutReload', async ({ page, request }) => {
    // Arrange: an endpoint registered by its agent
    const api = new EndpointApiHelpers(request);
    const token = `${Date.now()}`;
    const fields = newFields(token);
    const executedBy = `e2e-user-${token}`;
    const created = await api.registerAgent(fields, executedBy, '1.0.0');
    createdAssetIds.push(created.asset_id);
    await page.goto(tenantUrl(`/admin/assets/${created.asset_id}`));
    await expect(page.getByText(executedBy).first()).toBeVisible();
    await expect(page.getByText('1.0.0').first()).toBeVisible();
    await markPage(page);

    // Act + Assert: the agent reports a new version, the agent list follows (agent change routed to its asset)
    await api.registerAgent(fields, executedBy, '2.0.0');
    await expect(page.getByText('2.0.0').first()).toBeVisible({ timeout: LIVE_TIMEOUT });

    // Act + Assert: renamed elsewhere, the header follows
    const renamed = {
      ...fields,
      name: `${fields.name} renamed`,
    };
    await api.updateEndpoint(created.asset_id, renamed);
    await expect(page.getByText(renamed.name).first()).toBeVisible({ timeout: LIVE_TIMEOUT });

    // Act + Assert: deleted elsewhere, the page shows the deleted state
    await api.deleteAsset(created.asset_id);
    await expect(page.getByText('This asset does not exist or has been deleted.')).toBeVisible({ timeout: LIVE_TIMEOUT });
    await expect(page.getByRole('link', { name: 'Back to assets' })).toBeVisible();
    await expectNoReload(page);
  });
});
