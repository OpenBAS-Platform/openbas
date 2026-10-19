# ADR-011: Live updates through WebSocket invalidation and TanStack Query

|  |  |
| --- | --- |
| Status | Draft |
| Related | https://github.com/OpenAEV-Platform/openaev/issues/XXX |

## 1. Context

Screens that show shared data, such as the scenarios list, must reflect changes made by other users
without a reload. Today the backend pushes entity changes over an SSE stream (`StreamApi`, fed by
`BaseEvent`), and the front end merges them into Redux through `useDataLoader.js`. The stream carries
entity data, so every consumer must decide what a user may see from each event, and every list must
merge events into its own state, filters, sort and pagination.

A proof of concept, gated by the `STREAM_INVALIDATION` preview feature, tested a different path on one
screen, the scenarios list: the server sends a message that names a changed list and carries no data,
and the browser refetches that list through its usual search endpoint. This ADR records the choice that
the POC makes, so that the findings can confirm or reject it.

## 2. Decision drivers

1. Security and tenant isolation: a live channel must never reveal data, or the existence of changes,
   that the user's rights would hide.
2. Correctness of what is shown: filters, sort, pagination and rights must stay those of the search
   endpoint.
3. Operational simplicity: no new infrastructure, one node first, a path to several nodes.
4. Maintainability: one generic mechanism for every list, instead of per-list merge code.
5. Load: refetches must stay bounded under bursts of writes.

## 3. Considered options

### Option A: Keep the SSE data stream

Extend today's stream and `useDataLoader.js` to every screen.

**Pros**: already in place; no new dependency.
**Cons**: each event carries data, so visibility must be decided per event and per user; each list
must merge events into paginated, filtered and sorted state, which it cannot do correctly for rows
entering or leaving a page.

### Option B: Data-free invalidation over a WebSocket, refetch through TanStack Query

The server sends `invalidate` for a topic such as `list:scenarios`, paced to at most one message per
topic and tenant every 2 s. The client maps topics to TanStack Query keys and refetches the queries on
screen through the unchanged search endpoints.

**Pros**: messages carry no data; rights, filters, sort and pagination stay in the search endpoint; one
mechanism for every list; bursts collapse into one refetch per list and interval; TanStack Query brings
caching, retries, focus refetch and stale handling as a maintained library.
**Cons**: two new front-end dependencies and one backend starter; every invalidation costs one search
per viewer; topic authorization must be coarse (a capability that sees the whole list), so users who
see a list only through grants are not live.

### Option C: Data-free invalidation over SSE

Same as B, carried by an SSE stream.

**Pros**: no WebSocket support needed in proxies.
**Cons**: subscriptions must go through separate HTTP calls tied to the stream; no close codes to end
the channel on logout or lost membership. Dropped for B, which keeps subscription and revocation on one
channel.

### Option D: STOMP over WebSocket with a message broker

**Pros**: standard subscription semantics.
**Cons**: a broker or relay to run and secure, for messages that only name a topic. Dropped as heavier
than the need.

### Option E: Polling only

**Pros**: no live channel at all.
**Cons**: latency equal to the interval, and constant load from idle screens. Kept only as the
fallback inside B (a 60 s refetch interval).

## 4. Decision

We chose **Option B** because it keeps every rule about what a user sees in the search endpoints,
which serves the first two drivers, and gives one mechanism for every list.

Concretely, for the POC:

- A plain WebSocket at `/api/tenants/<id>/ws`, opened only by an existing browser session from an
  allowed origin, by a member of the tenant.
- The client subscribes to the topics of the queries it has on screen. A list topic
  (`list:scenarios`, `list:atomic-testings`, `list:simulations`) is granted only to users with the
  capability to see the whole list. An entity topic (`atomic-testing:<uuid>`, one atomic testing's
  screen; `scenario:<uuid>` and `simulation:<uuid>`, one scenario's or simulation's screen with all
  its tabs) names a row the user can already open, so it is granted with the check of the endpoint
  that reads it (`GET /api/atomic-testings/{id}`, `GET /api/scenarios/{id}`,
  `GET /api/exercises/{id}`), grants included, and only for a row of the socket's tenant; at most 16
  entity topics per socket.
- After commit, a listener turns a `Scenario` change into `list:scenarios` of its tenant, and an
  atomic testing change (the inject, its status, its expectations, its findings) into
  `list:atomic-testings` and `atomic-testing:<id>`. `scenario:<id>` is invalidated by the scenario
  itself, its injects, its simulations (and their injects and findings), its articles, variables,
  objectives, lessons categories and questions, and the teams and documents linked to it. A
  simulation change invalidates `list:simulations` of its tenant and `simulation:<id>`; its injects
  (and their statuses) and expectations invalidate both, since the list shows targets and the global
  score; its findings, articles, variables, objectives and evaluations, lessons categories,
  questions and answers, logs, comchecks and their statuses, mails (communications), and the teams
  and documents linked to it invalidate `simulation:<id>`. It never
  loads a lazy association: ids come from proxies, and when the tenant is unknown, an entity topic
  goes to the tenants watching it. A buffer drained every 250 ms
  sends at most one `invalidate` per topic and tenant every 2 s.
- Assets, asset groups and findings follow the same rules. `list:assets` (endpoints, inventory,
  agentless assets, AI targets), `list:asset-groups` and `list:findings` require the search
  capability of their endpoints (`ASSET`, `ASSET_GROUP`, `FINDING` + `SEARCH`); `asset:<uuid>`,
  `asset-group:<uuid>` and `finding:<uuid>` require a row of the socket's tenant and the READ check
  of `GET /api/assets/{id}`, `GET /api/asset_groups/{id}` and `GET /api/findings/{id}` (capability
  only: these resources have no grants). An asset change (security platforms excluded: own
  inventory and rights) invalidates `list:assets`, `list:asset-groups` (dynamic members) and
  `asset:<id>`; an agent change (registration, heartbeat, inactivity job) `list:assets` and its
  endpoint's `asset:<id>`; an asset group change `list:asset-groups`, `asset-group:<id>` and its
  loaded members' `asset:<id>`; a finding change `list:findings`, `finding:<id>` and its loaded
  assets' `asset:<id>`; an inject its loaded target assets and groups; a technical expectation its
  asset's and group's screens (ids from the proxies). Native deletes also invalidate these screens
  and lists, like the others.
- Integrations share one topic, `list:integrations` (injectors and their contracts, collectors,
  executors, connector instances with their configurations and logs, the catalog, secrets
  providers, and their detail pages). It requires `ACCESS_TENANT_SETTINGS`, the capability of the
  integrations route and of the collector, catalog, connector-instance and secrets-provider read
  endpoints. Connectors are tenant rows and invalidate their tenant's list; the catalog is
  platform-level and invalidates the list in every tenant watching it, each socket having passed
  the check in its own tenant.
- Teams, persons and organizations are open resources (`PermissionService.RESOURCES_OPEN`): their
  search and read endpoints admit every tenant member, so `list:teams`, `list:persons` and
  `list:organizations` are granted to every member, and `team:<uuid>`, `person:<uuid>`,
  `organization:<uuid>` to every member for a row of the socket's tenant. Users are platform-level:
  a person belongs to the tenant through `users_tenants` (checked through the membership cache),
  the membership the players search filters on. A team change invalidates `list:teams`,
  `team:<id>`, its loaded members' `person:<id>` and its organization's screen; a user change
  invalidates `list:persons` of its loaded tenants and of the committing thread's tenant (never the
  other tenants), `person:<id>`, its loaded teams' and its organization's screens; an organization
  change `list:organizations` and `organization:<id>` (the persons list resolves organization names
  from the organizations store, so it is not invalidated).
- The threat arsenal has `list:payloads` (the arsenal list and its facet counts), granted with
  `ACCESS_THREAT_ARSENALS` (users who see entries only through grants are denied, as for scenarios),
  and `payload:<uuid>`, named by the injector contract id the arsenal shows as `action_id` and granted
  with the check of `GET /api/threat_arsenals/{id}` (READ, grants included) for a contract of the
  socket's tenant. An injector contract change invalidates `list:payloads` and its own screen in its
  own tenant (built-in contract ids repeat across tenants); a payload or detection remediation change
  invalidates `list:payloads` only, a payload not referencing its contract (its save also saves the
  contract, which reaches the screen). Credentials have `list:credentials` and `credential:<uuid>`
  (`ACCESS_CREDENTIALS`, SEARCH or READ, no grants); secret references are not listened (kept off
  the SSE stream) but are streamed here, an invalidation carrying no data.
- The components screens (documents, channels, challenges and their flags, phishing landing pages
  and email templates, lessons templates with their categories and questions, and their detail
  pages) share `list:components`. Each type has its own capability and none implies the others, so
  the topic requires all of them (`ACCESS_DOCUMENTS`, `ACCESS_CHANNELS`, `ACCESS_CHALLENGES`,
  `ACCESS_PHISHING`, `ACCESS_LESSONS_LEARNED`); a user holding only some keeps refreshing the usual
  way. A child without a tenant goes to its loaded parent's tenant, else the committing thread's.
- Custom dashboards have `list:dashboards` (`ACCESS_DASHBOARDS`, SEARCH) and `dashboard:<uuid>`, one
  dashboard's definition (widgets, layout, parameters), granted with the READ check of
  `GET /api/custom-dashboards/{id}` for a dashboard of the socket's tenant (no grants). A dashboard,
  widget or parameter change invalidates both (the dashboard id read from the child's proxy).
  Reportings have `list:reports` (the list, generations and schedules) and `report:<uuid>` (one
  reporting's page). The reportings search hides reportings whose subject the user cannot read, so
  `list:reports` requires `ACCESS_REPORTINGS` and every subject type readable without grants
  (`ACCESS_ASSESSMENT`, `ACCESS_ASSETS`; players and teams are open); `report:<uuid>` mirrors
  `GET /api/reportings/{id}`: READ on reports, a reporting of the tenant, READ on its subject,
  grants included. A reporting, generation or schedule change invalidates both; generation statuses
  written by the rendering job and the schedule's last-run marker are JPA saves, so they stream.
- `list:analytics` is fired when the search engine indexed documents of the tenant (or removed some
  from the index), so that every widget data query refetches (custom dashboards, home dashboard,
  simulation statistics). The engine services publish an `AnalyticsIndexedEvent` after each bulk
  index call with at least one successful item, naming the tenants read from the indexed documents
  (every tenant when one has no tenant), and after an index delete that removed documents (the
  deleting thread's tenant, or every tenant from a background job); a plain listener maps it to the
  topic. It is granted with READ on dashboards or on tenant settings (`ACCESS_DASHBOARDS` or
  `ACCESS_TENANT_SETTINGS`), the capabilities of the widget data endpoints that can query any
  indexed data of the tenant. It reveals only that indexed data changed in the user's tenant.
- A heartbeat every 25 s re-checks session, membership and rights, closing with 4401 or 4403, or
  revoking a topic.
- The SSE stream and `useDataLoader.js` run unchanged beside it.

## 5. Consequences

### Positive

- Live lists cannot leak rows: a message names a list, never a row, an id or an author. An entity
  topic carries only the id the subscriber sent, for a row it may read.
- A row entering or leaving a filtered page is handled by the refetch, with no merge code.
- Adding a live list means adding a topic and passing a query key.

### Negative / trade-offs

- Each invalidation makes every viewer of the list run one search; the 2 s pacing bounds it, and the
  measurements size it.
- Users who see a list only through grants get no live updates for it.
- Revocation waits up to one heartbeat (25 s).
- One node only until a cross-node relay (for example PostgreSQL `LISTEN/NOTIFY`) exists.
- Writes that bypass JPA send nothing; their rows catch up at the next refetch. For atomic testings:
  execution traces (saved through JDBC, only the final status is published), expectation traces
  (native upsert), bulk deletes (native; a watched screen still learns it through the index event,
  the list does not) and imports (unlistened injects).
- `scenario:<id>` misses what has no readable link to the scenario without a load: inject tests
  (`InjectTestStatus`, not listened), players enabled per team (`ScenarioTeamUser`, not listened),
  expectations of its simulations (the expectation's simulation is a lazy proxy), a team or document
  whose scenario collection is not loaded, a lessons question whose category is not loaded, an inject
  whose simulation is a proxy, a simulation unlinked from the scenario (the old link is gone), native
  deletes of its injects (the index event names only the inject) and the native team unlink. Those
  screens catch up at the next refetch (focus or the 60 s fallback). During a run, every inject status
  change of a simulation refetches the scenario screen, at most once every 2 s.
- `simulation:<id>` misses, for the same reasons: inject tests (`InjectTestStatus`), players enabled
  per team (`ExerciseTeamUser`) and pauses (`Pause`), none of them listened, though a pause also
  saves the simulation; channels and challenges (no link to the simulation); the logic map and
  scope (workflows, steps, conditions, scope rules); expectation traces (native upsert); a finding,
  communication, evaluation, lessons answer or comcheck status whose parent is not loaded; a team or
  document whose simulation collection is not loaded; native deletes of its injects. The list
  misses native deletes of expectations and injects. During a run, every inject status or
  expectation change refetches the simulations list and screen, at most once every 2 s each.
- Assets and findings: the findings written during an execution are a native upsert
  (`FindingWriter`), so `list:findings`, `finding:<id>` and the asset screens do not learn them;
  native agent deletes (`AgentRepository.deleteByAgentId`, delete by executor) send nothing; an
  asset change does not reach the screens of the groups whose dynamic filter it enters or leaves
  (only the list); expectation traces stay native. Agent heartbeats are JPA, so every heartbeat
  that updates `last_seen` invalidates `list:assets` and the endpoint's screen, bounded by the 2 s
  pacing per tenant; an agent that silently goes stale shows as inactive only once the inactivity
  job saves its status (the 60 s fallback covers what the job has not yet written). Every JPA
  delete also publishes an index event, so any delete on a request thread refetches every live list
  of that tenant.
- Integrations: deleting a collector, injector or executor row, and an injector's obsolete
  contracts, goes through JPQL bulk deletes, and the trimming of connector instance logs is native,
  so these send nothing (removing a connector instance, a JPA delete, still does); the
  in-memory state of built-in integrations and secrets providers (the `Manager` components) is not
  streamed, only their connector instance rows. Collectors save their row on every run
  (`last_execution`), and connector logs are saved one row per line: both are bounded by the 2 s
  pacing per tenant. A catalog ingestion refetches the integrations screens of every tenant.
- Teams and persons: joining or leaving a tenant (`users_tenants`) is native; only the user save
  that grants or revokes the tenant's groups, when it changes them, reaches the persons list. The
  screen of a member removed by a team save is not reached (it is no longer in the collection).
  A user edited in one tenant reaches the persons list of its other tenants only when its tenants
  are loaded. An SSO login saves the user, which invalidates `list:persons` only when the login
  changes it (names, admin flag, mapped groups).
- Threat arsenal, credentials and components: a payload change reaches the entry's screen only
  through its contract's save; the collector deprecation of payloads (`setPayloadStatusByExternalIds`)
  and the injector's obsolete contract deletes are native and send nothing, and the contract to
  injector links are a native insert; a native delete of a built-in contract id reaches that id's
  screen in every tenant watching it. Secrets held by the internal provider (`Secret` rows) are not
  linked to their credential without a query: a credential update also saves the reference, which
  reaches its screen. Channel articles stay on the scenario and simulation screens.
- Dashboards and reports: a user who sees reportings only through subject grants gets no live
  reports list; the home dashboard's definition, read with `ACCESS_TENANT_SETTINGS`, is live through
  `dashboard:<id>` only for users who also hold `ACCESS_DASHBOARDS`, and choosing another home
  dashboard (a tenant setting) is not streamed.
- Analytics: the indexer runs every 15 s per model, and keeps re-indexing rows changed during the
  last 60 s (the grace window) on every round, so one change refetches the widgets of its tenant up
  to about five times, and a busy tenant (a running simulation) can refetch them every 2 s, the
  pacing bound. A refetch can run before the engine's refresh makes the documents searchable; the
  grace window's next round invalidates again. Users who read statistics only through a simulation
  (READ on it) are not granted the topic. Deleting tenants (`deleteByTenants`) sends nothing.
- Reverse proxies must forward WebSocket upgrades.

### Neutral

- No change to REST contracts or the SSE stream.
- With the preview feature off, no endpoint, bean or socket exists, and the front end behaves as before.
