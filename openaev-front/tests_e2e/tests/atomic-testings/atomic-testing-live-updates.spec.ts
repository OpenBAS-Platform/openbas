import { type Page } from '@playwright/test';

import AtomicTestingApiHelpers from '../../api-helpers/AtomicTestingApiHelpers';
import { expect, test } from '../../fixtures';
import { blockDataStream, LIVE_UPDATE_TIMEOUT, liveUpdatesEnabled, watchStream } from '../../utils/liveUpdates';
import { tenantUrl } from '../../utils/url';

const ATOMIC_TESTINGS_TOPIC = 'list:atomic-testings';
const ATOMIC_TESTINGS_SEARCH_PATH = /\/api\/tenants\/[^/]+\/atomic-testings\/search$/;

const openAtomicTestingsList = async (page: Page) => {
  const listLoaded = page.waitForResponse(response => ATOMIC_TESTINGS_SEARCH_PATH.test(new URL(response.url()).pathname) && response.ok());
  await page.goto(tenantUrl('/admin/atomic_testings'));
  await listLoaded;
};

test.describe('Atomic testings - live updates', () => {
  if (!liveUpdatesEnabled) {
    return;
  }

  let atomicTestingId: string | null = null;

  test.beforeEach(async ({ page }) => {
    await blockDataStream(page);
  });

  test.afterEach(async ({ request }) => {
    if (atomicTestingId) {
      await new AtomicTestingApiHelpers(request).deleteAtomicTesting(atomicTestingId);
      atomicTestingId = null;
    }
  });

  test('an atomic testing created or deleted by another client reaches the open list', async ({ page, request }) => {
    // Arrange: the list on screen, its topic granted.
    const watch = watchStream(page);
    await openAtomicTestingsList(page);
    await expect.poll(() => watch.granted).toContain(ATOMIC_TESTINGS_TOPIC);
    const atomicTestingApiHelpers = new AtomicTestingApiHelpers(request);
    const title = `Live atomic testing e2e ${Date.now()}`;

    // Act: create.
    const atomicTesting = await atomicTestingApiHelpers.createAtomicTesting(title);
    atomicTestingId = atomicTesting.inject_id;

    // Assert: it appears without a reload.
    await expect.poll(() => watch.invalidated, { timeout: LIVE_UPDATE_TIMEOUT }).toContain(ATOMIC_TESTINGS_TOPIC);
    await expect(page.getByText(title, { exact: true })).toBeVisible({ timeout: LIVE_UPDATE_TIMEOUT });

    // Act: delete.
    const invalidationsBeforeDelete = watch.invalidated.length;
    await atomicTestingApiHelpers.deleteAtomicTesting(atomicTesting.inject_id);
    atomicTestingId = null;

    // Assert: it leaves the list, after the rest of the 2 s pacing interval at most.
    await expect.poll(() => watch.invalidated.slice(invalidationsBeforeDelete), { timeout: LIVE_UPDATE_TIMEOUT }).toContain(ATOMIC_TESTINGS_TOPIC);
    await expect(page.getByText(title, { exact: true })).toHaveCount(0, { timeout: LIVE_UPDATE_TIMEOUT });
  });

  test('a rename made by another client reaches the open atomic testing header', async ({ page, request }) => {
    // Arrange: an atomic testing on screen, its topic granted.
    const atomicTestingApiHelpers = new AtomicTestingApiHelpers(request);
    const title = `Live atomic testing e2e ${Date.now()}`;
    const atomicTesting = await atomicTestingApiHelpers.createAtomicTesting(title);
    atomicTestingId = atomicTesting.inject_id;
    const topic = `atomic-testing:${atomicTesting.inject_id}`;
    const watch = watchStream(page);
    await page.goto(tenantUrl(`/admin/atomic_testings/${atomicTesting.inject_id}`));
    await expect(page.getByRole('heading', {
      level: 1,
      name: title,
      exact: true,
    })).toBeVisible();
    await expect.poll(() => watch.granted).toContain(topic);

    // Act
    const renamed = `${title} renamed`;
    await atomicTestingApiHelpers.renameAtomicTesting(atomicTesting.inject_id, renamed);

    // Assert
    await expect.poll(() => watch.invalidated, { timeout: LIVE_UPDATE_TIMEOUT }).toContain(topic);
    await expect(page.getByRole('heading', {
      level: 1,
      name: renamed,
      exact: true,
    })).toBeVisible({ timeout: LIVE_UPDATE_TIMEOUT });
  });
});
