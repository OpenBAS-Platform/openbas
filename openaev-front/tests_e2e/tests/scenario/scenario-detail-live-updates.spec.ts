import ScenarioApiHelpers from '../../api-helpers/ScenarioApiHelpers';
import { expect, test } from '../../fixtures';
import { blockDataStream, LIVE_UPDATE_TIMEOUT, liveUpdatesEnabled, watchStream } from '../../utils/liveUpdates';
import { tenantUrl } from '../../utils/url';

test.describe('Scenario screen - live updates', () => {
  if (!liveUpdatesEnabled) {
    return;
  }

  let scenarioId: string | null = null;

  test.beforeEach(async ({ page }) => {
    await blockDataStream(page);
  });

  test.afterEach(async ({ request }) => {
    if (scenarioId) {
      await new ScenarioApiHelpers(request).deleteScenario(scenarioId);
      scenarioId = null;
    }
  });

  test('a rename made by another client reaches the open scenario header', async ({ page, request }) => {
    // Arrange: a scenario on screen, its topic granted.
    const scenarioApiHelpers = new ScenarioApiHelpers(request);
    const scenarioName = `Live scenario e2e ${Date.now()}`;
    const scenario = await scenarioApiHelpers.createScenario(scenarioName);
    scenarioId = scenario.scenario_id;
    const topic = `scenario:${scenario.scenario_id}`;
    const watch = watchStream(page);
    await page.goto(tenantUrl(`/admin/scenarios/${scenario.scenario_id}`));
    await expect(page.getByRole('heading', {
      level: 1,
      name: scenarioName,
      exact: true,
    })).toBeVisible();
    await expect.poll(() => watch.granted).toContain(topic);

    // Act
    const renamed = `${scenarioName} renamed`;
    await scenarioApiHelpers.renameScenario(scenario.scenario_id, renamed);

    // Assert: the server announces the change, and the header follows without a reload.
    await expect.poll(() => watch.invalidated, { timeout: LIVE_UPDATE_TIMEOUT }).toContain(topic);
    await expect(page.getByRole('heading', {
      level: 1,
      name: renamed,
      exact: true,
    })).toBeVisible({ timeout: LIVE_UPDATE_TIMEOUT });
  });

  test('an inject added by another client reaches the open injects tab', async ({ page, request }) => {
    // Arrange: the injects tab of an empty scenario on screen, its topic granted.
    const scenarioApiHelpers = new ScenarioApiHelpers(request);
    const scenario = await scenarioApiHelpers.createScenario(`Live scenario e2e ${Date.now()}`);
    scenarioId = scenario.scenario_id;
    const topic = `scenario:${scenario.scenario_id}`;
    const watch = watchStream(page);
    await page.goto(tenantUrl(`/admin/scenarios/${scenario.scenario_id}/injects`));
    await expect.poll(() => watch.granted).toContain(topic);
    const injectTitle = `Live inject e2e ${Date.now()}`;
    await expect(page.getByText(injectTitle, { exact: true })).toHaveCount(0);

    // Act
    await scenarioApiHelpers.createManualInject(scenario.scenario_id, injectTitle);

    // Assert
    await expect.poll(() => watch.invalidated, { timeout: LIVE_UPDATE_TIMEOUT }).toContain(topic);
    await expect(page.getByText(injectTitle, { exact: true })).toBeVisible({ timeout: LIVE_UPDATE_TIMEOUT });
  });
});
