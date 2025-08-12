export const ACTIONS = {
  ACCESS: 'ACCESS',
  MANAGE: 'MANAGE',
  LAUNCH: 'LAUNCH',
  DELETE: 'DELETE',
  SEARCH: 'SEARCH',
} as const;

export type Actions = typeof ACTIONS[keyof typeof ACTIONS];

export const SUBJECTS = {
  ATOMIC_TESTING: 'ATOMIC_TESTING',
  TEAMS_AND_PLAYERS: 'TEAMS_AND_PLAYERS',
  ASSETS: 'ASSETS',
  PAYLOADS: 'PAYLOADS',
  DASHBOARDS: 'DASHBOARDS',
  FINDINGS: 'FINDINGS',
  DOCUMENTS: 'DOCUMENTS',
  CHANNELS: 'CHANNELS',
  CHALLENGES: 'CHALLENGES',
  LESSONS_LEARNED: 'LESSONS_LEARNED',
  SECURITY_PLATFORMS: 'SECURITY_PLATFORMS',
  PLATFORM_SETTINGS: 'PLATFORM_SETTINGS',
  RESOURCE: 'RESOURCE',
} as const;

type ResourceSubject = { scenario_id: string };

export type Subjects = typeof SUBJECTS[keyof typeof SUBJECTS];

export type SubjectsType = Subjects | ResourceSubject;
