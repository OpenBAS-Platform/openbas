import { type Page } from '@playwright/test';

import AccessApiHelpers, { type TenantUser } from '../../api-helpers/AccessApiHelpers';
import ScenarioApiHelpers from '../../api-helpers/ScenarioApiHelpers';
import { expect, test } from '../../fixtures';
import login from '../../utils/login';
import { tenantUrl } from '../../utils/url';

// The backend under test runs with the preview features listed in this variable (CI passes the
// same list to the backend container), '*' turning on all of them.
const liveUpdatesEnabled = (process.env.ENABLED_DEV_FEATURES ?? '')
  .split(',')
  .map(feature => feature.trim().toUpperCase())
  .some(feature => feature === '*' || feature === 'STREAM_INVALIDATION');

const STREAM_SOCKET_PATH = /\/api\/tenants\/[^/]+\/ws$/;
const SCENARIOS_TOPIC = 'list:scenarios';
const SCENARIOS_LIST_URL = tenantUrl('/admin/scenarios');
const SCENARIOS_SEARCH_PATH = /\/api\/tenants\/[^/]+\/scenarios\/search$/;
// A change reaches the other browsers within this delay.
const LIVE_UPDATE_TIMEOUT = 2_000;

interface StreamWatch {
  socketUrls: string[];
  scenariosGranted: boolean;
}

// Records the invalidation sockets a page opens and whether one was granted the scenarios topic.
const watchStream = (page: Page): StreamWatch => {
  const watch: StreamWatch = {
    socketUrls: [],
    scenariosGranted: false,
  };
  page.on('websocket', (socket) => {
    if (!STREAM_SOCKET_PATH.test(new URL(socket.url()).pathname)) {
      return;
    }
    watch.socketUrls.push(socket.url());
    socket.on('framereceived', ({ payload }) => {
      try {
        const message = JSON.parse(payload.toString());
        if (message.type === 'subscribed' && Array.isArray(message.granted) && message.granted.includes(SCENARIOS_TOPIC)) {
          watch.scenariosGranted = true;
        }
      } catch {
        // not a JSON frame
      }
    });
  });
  return watch;
};

const openScenariosList = async (page: Page) => {
  const listLoaded = page.waitForResponse(response => SCENARIOS_SEARCH_PATH.test(new URL(response.url()).pathname) && response.ok());
  await page.goto(SCENARIOS_LIST_URL);
  await listLoaded;
};

test.describe('Scenarios list - live updates', () => {
  if (!liveUpdatesEnabled) {
    return;
  }

  let viewer: TenantUser | null = null;
  let scenarioId: string | null = null;

  test.beforeEach(async ({ request }) => {
    viewer = await new AccessApiHelpers(request).createUserWithCapabilities(['ACCESS_ASSESSMENT']);
  });

  test.afterEach(async ({ request }) => {
    if (scenarioId) {
      await new ScenarioApiHelpers(request).deleteScenario(scenarioId);
      scenarioId = null;
    }
    if (viewer) {
      await new AccessApiHelpers(request).deleteUser(viewer);
      viewer = null;
    }
  });

  test('a scenario created or deleted by one user reaches the list another user has open', async ({ browser, page, request }) => {
    // Arrange: the administrator and a user holding ACCESS_ASSESSMENT both watch the list.
    const adminWatch = watchStream(page);
    await openScenariosList(page);

    // An empty storage state: the project's stored admin session would otherwise apply here too.
    const viewerContext = await browser.newContext({
      viewport: page.viewportSize(),
      storageState: {
        cookies: [],
        origins: [],
      },
    });
    try {
      const viewerPage = await viewerContext.newPage();
      await login(viewerPage, viewer!.email, viewer!.password);
      const viewerWatch = watchStream(viewerPage);
      await openScenariosList(viewerPage);
      await expect.poll(() => adminWatch.scenariosGranted).toBe(true);
      await expect.poll(() => viewerWatch.scenariosGranted).toBe(true);

      const scenarioName = `Live update e2e ${Date.now()}`;
      const scenarioApiHelpers = new ScenarioApiHelpers(request);

      // Act: the administrator creates a scenario.
      const scenario = await scenarioApiHelpers.createScenario(scenarioName);
      scenarioId = scenario.scenario_id;

      // Assert: it appears in both lists without a reload.
      await expect(viewerPage.getByText(scenarioName, { exact: true })).toBeVisible({ timeout: LIVE_UPDATE_TIMEOUT });
      await expect(page.getByText(scenarioName, { exact: true })).toBeVisible({ timeout: LIVE_UPDATE_TIMEOUT });

      // Act: the administrator deletes it.
      await scenarioApiHelpers.deleteScenario(scenario.scenario_id);
      scenarioId = null;

      // Assert: it leaves the other user's list. The server sends at most one invalidation per
      // topic every 2 s, so this one may wait for the rest of that interval.
      await expect(viewerPage.getByText(scenarioName, { exact: true })).toHaveCount(0, { timeout: 2 * LIVE_UPDATE_TIMEOUT });
    } finally {
      await viewerContext.close();
    }
  });
});

test.describe('Scenarios list - live updates off', () => {
  if (liveUpdatesEnabled) {
    return;
  }

  test('opens no invalidation socket', async ({ page }) => {
    // Arrange
    const watch = watchStream(page);

    // Act
    await openScenariosList(page);

    // Assert
    expect(watch.socketUrls).toEqual([]);
  });
});
