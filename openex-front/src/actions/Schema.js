/* eslint-disable no-underscore-dangle,max-len */
import { schema } from 'normalizr';
import * as R from 'ramda';

export const document = new schema.Entity(
  'documents',
  {},
  { idAttribute: 'document_id' },
);
export const arrayOfDocuments = new schema.Array(document);

export const tag = new schema.Entity('tags', {}, { idAttribute: 'tag_id' });
export const arrayOfTags = new schema.Array(tag);

export const injectType = new schema.Entity(
  'inject_types',
  {},
  { idAttribute: 'type' },
);
export const arrayOfInjectTypes = new schema.Array(injectType);

export const injectStatus = new schema.Entity(
  'inject_statuses',
  {},
  { idAttribute: 'status_id' },
);
export const arrayOfInjectStatuses = new schema.Array(injectStatus);

export const parameters = new schema.Entity(
  'parameters',
  {},
  { idAttribute: 'setting_key' },
);

export const arrayOfParameters = new schema.Array(parameters);

export const token = new schema.Entity(
  'tokens',
  {},
  { idAttribute: 'token_id' },
);
export const arrayOfTokens = new schema.Array(token);

export const organization = new schema.Entity(
  'organizations',
  {},
  { idAttribute: 'organization_id' },
);
export const arrayOfOrganizations = new schema.Array(organization);

export const group = new schema.Entity(
  'groups',
  {},
  { idAttribute: 'group_id' },
);
export const arrayOfGroups = new schema.Array(group);

export const grant = new schema.Entity(
  'grants',
  {},
  { idAttribute: 'grant_id' },
);
export const arrayOfGrants = new schema.Array(grant);

export const user = new schema.Entity('users', {}, { idAttribute: 'user_id' });
export const arrayOfUsers = new schema.Array(user);

export const exercise = new schema.Entity(
  'exercises',
  {},
  { idAttribute: 'exercise_id' },
);
export const arrayOfExercises = new schema.Array(exercise);

export const objective = new schema.Entity(
  'objectives',
  {},
  { idAttribute: 'objective_id' },
);
export const arrayOfObjectives = new schema.Array(objective);

export const evaluation = new schema.Entity(
  'evaluations',
  {},
  { idAttribute: 'evaluation_id' },
);
export const arrayOfEvaluations = new schema.Array(evaluation);

export const poll = new schema.Entity('polls', {}, { idAttribute: 'poll_id' });
export const arrayOfPolls = new schema.Array(poll);

export const answer = new schema.Entity(
  'answers',
  {},
  { idAttribute: 'answer_id' },
);
export const arrayOfAnswers = new schema.Array(answer);

export const comcheck = new schema.Entity(
  'comchecks',
  {},
  { idAttribute: 'comcheck_id' },
);
export const arrayOfComchecks = new schema.Array(comcheck);

export const comcheckStatus = new schema.Entity(
  'comcheckstatuses',
  {},
  { idAttribute: 'comcheckstatus_id' },
);
export const arrayOfComcheckStatuses = new schema.Array(comcheckStatus);

export const dryrun = new schema.Entity(
  'dryruns',
  {},
  { idAttribute: 'dryrun_id' },
);
export const arrayOfDryruns = new schema.Array(dryrun);

export const dryinject = new schema.Entity(
  'dryinjects',
  {},
  { idAttribute: 'dryinject_id' },
);
export const arrayOfDryinjects = new schema.Array(dryinject);

export const audience = new schema.Entity(
  'audiences',
  {},
  { idAttribute: 'audience_id' },
);
export const arrayOfAudiences = new schema.Array(audience);

export const inject = new schema.Entity(
  'injects',
  {},
  { idAttribute: 'inject_id' },
);
export const arrayOfInjects = new schema.Array(inject);

export const statistics = new schema.Entity(
  'statistics',
  {},
  { idAttribute: 'platform_id' },
);

export const log = new schema.Entity('logs', {}, { idAttribute: 'log_id' });
export const arrayOfLogs = new schema.Array(log);

token.define({ token_user: user });
user.define({ user_organization: organization });

const maps = (key, state) => state.referential.entities[key].asMutable({ deep: true });
const entities = (key, state) => Object.values(maps(key, state));
const entity = (id, key, state) => state.referential.entities[key][id]?.asMutable({ deep: true });
const me = (state) => state.referential.entities.users[R.path(['logged', 'user'], state.app)];

export const storeHelper = (state) => ({
  logged: () => state.app.logged,
  getMe: () => me(state),
  getMeTokens: () => entities('tokens', state).filter((t) => t.token_user === me(state)?.user_id),
  getStatistics: () => state.referential.entities.statistics?.openex,
  // exercises
  getExercises: () => entities('exercises', state),
  getExercisesMap: () => maps('exercises', state),
  getExercise: (id) => entity(id, 'exercises', state),
  getExerciseDryruns: (id) => entities('dryruns', state).filter((i) => i.dryrun_exercise === id),
  getExerciseComchecks: (id) => entities('comchecks', state).filter((i) => i.comcheck_exercise === id),
  getExerciseAudiences: (id) => entities('audiences', state).filter((i) => i.audience_exercise === id),
  getExerciseInjects: (id) => entities('injects', state).filter((i) => i.inject_exercise === id),
  getExerciseObjectives: (id) => entities('objectives', state).filter((o) => o.objective_exercise === id),
  getExerciseLogs: (id) => entities('logs', state).filter((l) => l.log_exercise === id),
  getExercisePolls: (id) => entities('polls', state).filter((o) => o.poll_exercise === id),
  // dryrun
  getDryrun: (id) => entity(id, 'dryruns', state),
  getDryrunInjects: (id) => entities('dryinjects', state).filter((i) => i.dryinject_dryrun === id),
  getDryrunUsers: (id) => entities('users', state).filter((i) => entity(id, 'dryruns', state).dryrun_users.includes(i)),
  // comcheck
  getComcheck: (id) => entity(id, 'comchecks', state),
  getComcheckStatus: (id) => entity(id, 'comcheckstatuses', state),
  getComcheckStatuses: (id) => entities('comcheckstatuses', state).filter((i) => entity(id, 'comchecks', state).comcheck_statuses.includes(i)),
  // users
  getUsers: () => entities('users', state),
  getGroups: () => entities('groups', state),
  getUsersMap: () => maps('users', state),
  getOrganizations: () => entities('organizations', state),
  getOrganizationsMap: () => maps('organizations', state),
  // objectives
  getObjective: (id) => entity(id, 'objectives', state),
  getObjectiveEvaluations: (id) => entities('evaluations', state).filter((e) => e.evaluation_objective === id),
  // tags
  getTag: (id) => entity(id, 'tags', state),
  getTags: () => entities('tags', state),
  getTagsMap: () => maps('tags', state),
  // injects
  getInject: (id) => entity(id, 'injects', state),
  getInjectTypes: () => entities('inject_types', state),
  getNextInjects: () => {
    const sortFn = (a, b) => new Date(a.inject_date).getTime() - new Date(b.inject_date).getTime();
    const injects = entities('injects', state).filter((i) => i.inject_date !== null && i.inject_status === null);
    return R.take(6, R.sort(sortFn, injects));
  },
  // documents
  getDocuments: () => entities('documents', state),
  getDocumentsMap: () => maps('documents', state),
  // audiences
  getAudience: (id) => entity(id, 'audiences', state),
  getAudienceUsers: (id) => entities('users', state)
    .filter((u) => entity(id, 'audiences', state).audience_users.includes(u.user_id)),
  getAudienceInjects: (id) => entities('injects', state)
    .filter((i) => entity(id, 'audiences', state).audience_injects.includes(i.inject_id)),
  getAudiences: () => entities('audiences', state),
  getAudiencesMap: () => maps('audiences', state),
  getSettings: () => {
    return R.mergeAll(
      Object.entries(state.referential.entities.parameters ?? {}).map(
        ([k, v]) => ({ [k]: v.setting_value }),
      ),
    );
  },
});

export const tagsConverter = (tag_ids, tagsMap) => (tag_ids ?? [])
  .map((tagId) => tagsMap[tagId])
  .filter((tagItem) => tagItem !== undefined)
  .map((tagItem) => ({
    id: tagItem.tag_id,
    label: tagItem.tag_name,
    color: tagItem.tag_color,
  }));
