import { type Page } from '@playwright/test';

import SimulationApiHelpers from '../../api-helpers/SimulationApiHelpers';
import { expect, test } from '../../fixtures';
import { blockDataStream, LIVE_UPDATE_TIMEOUT, liveUpdatesEnabled, watchStream } from '../../utils/liveUpdates';
import { tenantUrl } from '../../utils/url';

const SIMULATIONS_TOPIC = 'list:simulations';
const SIMULATIONS_SEARCH_PATH = /\/api\/tenants\/[^/]+\/exercises\/search$/;

const openSimulationsList = async (page: Page) => {
  const listLoaded = page.waitForResponse(response => SIMULATIONS_SEARCH_PATH.test(new URL(response.url()).pathname) && response.ok());
  await page.goto(tenantUrl('/admin/simulations'));
  await listLoaded;
};

test.describe('Simulations - live updates', () => {
  if (!liveUpdatesEnabled) {
    return;
  }

  let simulationId: string | null = null;

  test.beforeEach(async ({ page }) => {
    await blockDataStream(page);
  });

  test.afterEach(async ({ request }) => {
    if (simulationId) {
      await new SimulationApiHelpers(request).deleteSimulation(simulationId);
      simulationId = null;
    }
  });

  test('a simulation created or deleted by another client reaches the open list', async ({ page, request }) => {
    // Arrange: the list on screen, its topic granted.
    const watch = watchStream(page);
    await openSimulationsList(page);
    await expect.poll(() => watch.granted).toContain(SIMULATIONS_TOPIC);
    const simulationApiHelpers = new SimulationApiHelpers(request);
    const simulationName = `Live simulation e2e ${Date.now()}`;

    // Act: create.
    const simulation = await simulationApiHelpers.createSimulation(simulationName);
    simulationId = simulation.exercise_id;

    // Assert: it appears without a reload.
    await expect.poll(() => watch.invalidated, { timeout: LIVE_UPDATE_TIMEOUT }).toContain(SIMULATIONS_TOPIC);
    await expect(page.getByText(simulationName, { exact: true })).toBeVisible({ timeout: LIVE_UPDATE_TIMEOUT });

    // Act: delete.
    const invalidationsBeforeDelete = watch.invalidated.length;
    await simulationApiHelpers.deleteSimulation(simulation.exercise_id);
    simulationId = null;

    // Assert: it leaves the list. The server sends at most one invalidation per topic every 2 s,
    // so this one may wait for the rest of that interval.
    await expect.poll(() => watch.invalidated.slice(invalidationsBeforeDelete), { timeout: LIVE_UPDATE_TIMEOUT }).toContain(SIMULATIONS_TOPIC);
    await expect(page.getByText(simulationName, { exact: true })).toHaveCount(0, { timeout: LIVE_UPDATE_TIMEOUT });
  });

  test('a rename made by another client reaches the open simulation header', async ({ page, request }) => {
    // Arrange: a simulation on screen, its topic granted.
    const simulationApiHelpers = new SimulationApiHelpers(request);
    const simulationName = `Live simulation e2e ${Date.now()}`;
    const simulation = await simulationApiHelpers.createSimulation(simulationName);
    simulationId = simulation.exercise_id;
    const topic = `simulation:${simulation.exercise_id}`;
    const watch = watchStream(page);
    await page.goto(tenantUrl(`/admin/simulations/${simulation.exercise_id}`));
    await expect(page.getByRole('heading', {
      level: 1,
      name: simulationName,
      exact: true,
    })).toBeVisible();
    await expect.poll(() => watch.granted).toContain(topic);

    // Act
    const renamed = `${simulationName} renamed`;
    await simulationApiHelpers.renameSimulation(simulation.exercise_id, renamed);

    // Assert
    await expect.poll(() => watch.invalidated, { timeout: LIVE_UPDATE_TIMEOUT }).toContain(topic);
    await expect(page.getByRole('heading', {
      level: 1,
      name: renamed,
      exact: true,
    })).toBeVisible({ timeout: LIVE_UPDATE_TIMEOUT });
  });
});
