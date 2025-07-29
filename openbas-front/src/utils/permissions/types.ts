export const ACTIONS = ['ACCESS', 'MANAGE', 'LAUNCH', 'DELETE'] as const;
export type Actions = typeof ACTIONS[number];

export const SUBJECTS = ['ATOMIC_TESTING', 'TEAMS_AND_PLAYERS', 'ASSETS', 'PAYLOADS', 'DASHBOARDS', 'FINDINGS', 'DOCUMENTS', 'CHANNELS', 'CHALLENGES', 'LESSONS_LEARNED', 'SECURITY_AND_PLATFORMS', 'PLATFORMS_SETTINGS'] as const;
export type Subjects = typeof SUBJECTS[number];
