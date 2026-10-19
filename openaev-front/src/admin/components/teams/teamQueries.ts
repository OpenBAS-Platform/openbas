import { organizationKey, ORGANIZATIONS_LIST_KEY, personKey, PERSONS_LIST_KEY, teamKey, TEAMS_LIST_KEY } from '../../../utils/query/keys';
import queryClient from '../../../utils/query/queryClient';

// Sub-resource keys of one team, person or organization detail screen. They all start with
// teamKey(id) / personKey(id) / organizationKey(id), so the topic 'team:<id>', 'person:<id>' or
// 'organization:<id>' refetches every query of the screen at once.
const teamSubKey = (teamId: string, segment: string) => [...teamKey(teamId), segment] as const;
const personSubKey = (userId: string, segment: string) => [...personKey(userId), segment] as const;
const organizationSubKey = (organizationId: string, segment: string) => [...organizationKey(organizationId), segment] as const;

// The team and its players, kept in the store (read by the popover and the players drawer).
export const teamEntityKey = (teamId: string) => teamSubKey(teamId, 'team');
export const teamPersonsKey = (teamId: string) => teamSubKey(teamId, 'persons');
export const teamFindingsKey = (teamId: string) => teamSubKey(teamId, 'findings');
export const teamInjectsKey = (teamId: string) => teamSubKey(teamId, 'injects');

// The players, teams and organizations of the store the person screen reads.
export const personEntityKey = (userId: string) => personSubKey(userId, 'person');
export const personFindingsKey = (userId: string) => personSubKey(userId, 'findings');
export const personInjectsKey = (userId: string) => personSubKey(userId, 'injects');
// No data: see useQueryVersion.
export const personVersionKey = (userId: string) => personSubKey(userId, 'version');

export const organizationEntityKey = (organizationId: string) => organizationSubKey(organizationId, 'organization');
// The players and teams of the store the organization screen counts and scopes its findings with.
export const organizationDirectoryKey = (organizationId: string) => organizationSubKey(organizationId, 'directory');
export const organizationMembersKey = (organizationId: string) => organizationSubKey(organizationId, 'members');
export const organizationFindingsKey = (organizationId: string) => organizationSubKey(organizationId, 'findings');
export const organizationInjectsKey = (organizationId: string) => organizationSubKey(organizationId, 'injects');
export const organizationVersionKey = (organizationId: string) => organizationSubKey(organizationId, 'version');

export const invalidateTeamsList = () => queryClient.invalidateQueries({ queryKey: TEAMS_LIST_KEY });
export const invalidatePersonsList = () => queryClient.invalidateQueries({ queryKey: PERSONS_LIST_KEY });
export const invalidateOrganizationsList = () => queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_LIST_KEY });
export const invalidateTeam = (teamId: string) => queryClient.invalidateQueries({ queryKey: teamKey(teamId) });
export const invalidatePerson = (userId: string) => queryClient.invalidateQueries({ queryKey: personKey(userId) });
export const invalidateOrganization = (organizationId: string) => queryClient.invalidateQueries({ queryKey: organizationKey(organizationId) });
