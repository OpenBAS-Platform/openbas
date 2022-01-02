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
export const simulateChangeDuration = new schema.Array();
export const changeDuration = new schema.Object('change_duration');

export const tag = new schema.Entity('tags', {}, { idAttribute: 'tag_id' });
export const arrayOfTags = new schema.Array(tag);

export const injectType = new schema.Entity(
  'inject_types',
  {},
  { idAttribute: 'type' },
);
export const arrayOfInjectTypes = new schema.Array(injectType);

export const injectTypeExerciseSimple = new schema.Array();

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

const sort = (data, sortBy, orderAsc = true) => R.sortWith(
  orderAsc ? [R.ascend(R.prop(sortBy))] : [R.descend(R.prop(sortBy))],
  data,
);

export const storeBrowser = (state) => ({
  _buildUser(usr) {
    return {
      ...usr,
      isAdmin() {
        return usr.user_admin === true;
      },
      getTags() {
        return usr.user_tags
          .map((id) => state.referential.entities.tags[id])
          .filter((t) => t !== undefined);
      },
      getOrganization() {
        return state.referential.entities.organizations[usr.user_organization];
      },
      getTokens() {
        const all = R.values(state.referential.entities.tokens);
        return R.filter((n) => n.token_user === usr.user_id, all);
      },
    };
  },
  _buildAudience(aud) {
    const browser = this;
    return {
      ...aud,
      getUsers() {
        const all = R.values(state.referential.entities.users);
        return R.filter((n) => aud.audience_users.includes(n.user_id), all).map(
          (u) => browser._buildUser(u),
        );
      },
    };
  },
  _buildOrganization(org) {
    return {
      ...org,
      getTags() {
        return org.organization_tags
          .map((id) => state.referential.entities.tags[id])
          .filter((t) => t !== undefined);
      },
    };
  },
  _buildExercise(id, ex) {
    const browser = this;
    return {
      ...ex,
      exercise_id: id,
      getTags() {
        return (
          ex.exercise_tags
          || []
            .map((tagId) => state.referential.entities.tags[tagId])
            .filter((t) => t !== undefined)
        );
      },
      getInjects(sortBy = 'inject_date') {
        const all = R.values(state.referential.entities.injects);
        const injects = R.filter((n) => n.inject_exercise === id, all);
        return R.sortWith([R.ascend(R.prop(sortBy))])(injects);
      },
      getObjectives(sortBy = 'objective_priority') {
        const all = R.values(state.referential.entities.objectives);
        const objectives = R.filter((n) => n.objective_exercise === id, all);
        return R.sortWith([R.ascend(R.prop(sortBy))])(objectives);
      },
      getAudiences(sortBy = 'audience_name') {
        const all = R.values(state.referential.entities.audiences);
        const audiences = R.filter((n) => n.audience_exercise === id, all).map(
          (a) => browser._buildAudience(a),
        );
        return R.sortWith([R.ascend(R.prop(sortBy))])(audiences);
      },
      getUsers() {
        return this.getAudiences()
          .map((a) => a.getUsers())
          .flat();
      },
    };
  },
  _buildDocument(id, doc) {
    return {
      ...doc,
      document_id: id,
      getTags() {
        return (
          doc.document_tags
          || []
            .map((tagId) => state.referential.entities.tags[tagId])
            .filter((t) => t !== undefined)
        );
      },
    };
  },
  getUsers() {
    return R.values(state.referential.entities.users).map((usr) => this._buildUser(usr));
  },
  getUser(id) {
    const usr = state.referential.entities.users[id];
    return this._buildUser(usr);
  },
  getGroups() {
    return R.values(state.referential.entities.groups);
  },
  getOrganizations(sortBy = 'organization_name', orderAsc = true) {
    return sort(
      R.values(state.referential.entities.organizations),
      sortBy,
      orderAsc,
    ).map((org) => this._buildOrganization(org));
  },
  getDocuments(sortBy = 'document_name', orderAsc = true) {
    return sort(
      R.values(state.referential.entities.documents),
      sortBy,
      orderAsc,
    ).map((doc) => this._buildDocument(doc.document_id, doc));
  },
  getExercises(sortBy = 'exercise_start_date', orderAsc = false) {
    return sort(
      R.values(state.referential.entities.exercises),
      sortBy,
      orderAsc,
    ).map((ex) => this._buildExercise(ex.exercise_id, ex));
  },
  getExercise(id) {
    const ex = state.referential.entities.exercises[id];
    return this._buildExercise(id, ex);
  },
  getTags(sortBy = 'tag_name', orderAsc = true) {
    return sort(R.values(state.referential.entities.tags), sortBy, orderAsc);
  },
  getTag(id) {
    return state.referential.entities.tags[id];
  },
  getStatistics() {
    return state.referential.entities.statistics?.openex;
  },
  getSettings() {
    const params = Object.entries(state.referential.entities.parameters ?? {});
    return R.mergeAll(params.map(([k, v]) => ({ [k]: v.setting_value })));
  },
  getMe() {
    const userId = R.path(['logged', 'user'], state.app);
    return this._buildUser(state.referential.entities.users[userId]);
  },
});
