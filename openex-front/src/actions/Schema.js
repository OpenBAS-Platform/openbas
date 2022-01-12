/* eslint-disable no-underscore-dangle */
import { schema } from 'normalizr';
import * as R from 'ramda';

export const document = new schema.Entity(
  'documents',
  {},
  { idAttribute: 'document_id' },
);
export const arrayOfDocuments = new schema.Array(document);

export const fileSheet = new schema.Array();

export const checkIfExerciseNameExistResult = new schema.Object(
  'check_if_exercise_name_exist',
);

export const objectOfStatistics = new schema.Object('object_of_statistics');

export const importExerciseResult = new schema.Object('import_exercise_result');
export const exportExerciseResult = new schema.Object('export_exercise_result');
export const testsDeleteUsers = new schema.Object('delete_users_result');
export const changeDuration = new schema.Object('change_duration');

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

export const comcheck = new schema.Entity(
  'comchecks',
  {},
  { idAttribute: 'comcheck_id' },
);
export const arrayOfComchecks = new schema.Array(comcheck);

export const comcheckStatus = new schema.Entity(
  'comchecks_statuses',
  {},
  { idAttribute: 'status_id' },
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

export const event = new schema.Entity(
  'events',
  {},
  { idAttribute: 'event_id' },
);
export const arrayOfEvents = new schema.Array(event);

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

const _buildUser = (state, usr) => {
  if (usr === undefined) return usr;
  return {
    ...usr,
    admin: usr.user_admin === true,
    tags: usr.user_tags
      .asMutable()
      .map((tagId) => state.referential.entities.tags[tagId])
      .filter((t) => t !== undefined),
    organization:
      state.referential.entities.organizations[usr.user_organization],
    tokens: R.filter(
      (n) => n.token_user === usr.user_id,
      R.values(state.referential.entities.tokens),
    ),
  };
};
const _resolveMe = (state) => _buildUser(state, state.referential.entities.users[R.path(['logged', 'user'], state.app)]);
const _buildOrganization = (state, org) => {
  if (org === undefined) return org;
  return {
    ...org,
    tags: org.organization_tags
      .asMutable()
      .map((tagId) => state.referential.entities.tags[tagId])
      .filter((t) => t !== undefined),
  };
};
const _buildAudience = (state, aud) => {
  if (aud === undefined) return aud;
  return {
    ...aud,
    // eslint-disable-next-line max-len
    injects: R.values(state.referential.entities.injects).filter((n) => aud.audience_injects.includes(n.inject_id)),
    tags: aud.audience_tags
      .asMutable()
      .map((tagId) => state.referential.entities.tags[tagId])
      .filter((t) => t !== undefined),
    users: R.values(state.referential.entities.users)
      .filter((n) => aud.audience_users.includes(n.user_id))
      .map((u) => _buildUser(state, u)),
  };
};
const _buildInject = (state, inj) => {
  if (inj === undefined) return inj;
  return {
    ...inj,
    tags: inj.inject_tags
      .asMutable()
      .map((tagId) => state.referential.entities.tags[tagId])
      .filter((t) => t !== undefined),
    audiences: R.values(state.referential.entities.audiences)
      .filter((n) => inj.inject_audiences.includes(n.audience_id))
      .map((a) => _buildAudience(state, a)),
  };
};
const _buildExercise = (state, id, ex) => {
  if (ex === undefined) return ex;
  const getAudiences = () => R.filter(
    (n) => n.audience_exercise === id,
    R.values(state.referential.entities.audiences),
  ).map((a) => _buildAudience(state, a));
  const getInjects = () => R.filter(
    (n) => n.inject_exercise === id,
    R.values(state.referential.entities.injects),
  ).map((a) => _buildInject(state, a));
  const me = _resolveMe(state);
  return {
    ...ex,
    exercise_id: id,
    user_can_update: me?.admin || (ex.exercise_planners || []).includes(me?.user_id),
    user_can_delete: me?.admin,
    tags: ex.exercise_tags
      .asMutable()
      .map((tagId) => state.referential.entities.tags[tagId])
      .filter((t) => t !== undefined),
    objectives: R.filter(
      (n) => n.objective_exercise === id,
      R.values(state.referential.entities.objectives),
    ),
    injects: getInjects(),
    audiences: getAudiences(),
    users: getAudiences()
      .map((a) => a.users)
      .flat(),
  };
};
const _buildDocument = (state, id, doc) => {
  if (doc === undefined) return doc;
  return {
    ...doc,
    document_id: id,
    tags: doc.document_tags
      .asMutable()
      .map((tagId) => state.referential.entities.tags[tagId])
      .filter((t) => t !== undefined),
  };
};
export const storeBrowser = (state) => ({
  logged: state.app.logged,
  users: R.values(state.referential.entities.users).map((usr) => _buildUser(state, usr)),
  tags: R.values(state.referential.entities.tags),
  groups: R.values(state.referential.entities.groups),
  next_injects: R.take(10, R.sort(
    (a, b) => new Date(a.inject_date).getTime() - new Date(b.inject_date).getTime(),
    R.values(state.referential.entities.injects)
      .filter((i) => i.inject_date !== null)
      .map((i) => _buildInject(state, i)),
  )),
  inject_types: R.values(state.referential.entities.inject_types),
  // eslint-disable-next-line max-len
  organizations: R.values(state.referential.entities.organizations).map((org) => _buildOrganization(state, org)),
  // eslint-disable-next-line max-len
  documents: R.values(state.referential.entities.documents).map((doc) => _buildDocument(state, doc.document_id, doc)),
  // eslint-disable-next-line max-len
  exercises: R.values(state.referential.entities.exercises).map((ex) => _buildExercise(state, ex.exercise_id, ex)),
  settings: R.mergeAll(
    Object.entries(state.referential.entities.parameters ?? {}).map(
      ([k, v]) => ({ [k]: v.setting_value }),
    ),
  ),
  me: _resolveMe(state),
  statistics: state.referential.entities.statistics?.openex,
  getUser(id) {
    return _buildUser(state, state.referential.entities.users[id]);
  },
  getExercise(id) {
    return _buildExercise(state, id, state.referential.entities.exercises[id]);
  },
  getAudience(id) {
    return _buildAudience(state, state.referential.entities.audiences[id]);
  },
  getInject(id) {
    return _buildInject(state, state.referential.entities.injects[id]);
  },
  getDocument(id) {
    return _buildDocument(state, id, state.referential.entities.documents[id]);
  },
});
