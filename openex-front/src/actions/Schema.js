/* eslint-disable no-underscore-dangle */
import { schema } from 'normalizr';
import * as R from 'ramda';

export const file = new schema.Entity('files', {}, { idAttribute: 'file_id' });
export const arrayOfFiles = new schema.Array(file);

export const document = new schema.Entity('document', {}, { idAttribute: 'document_id' });
export const arrayOfDocument = new schema.Array(document);

export const fileSheet = new schema.Array();
export const listOfUserPlanificateur = new schema.Array();

export const checkIfExerciseNameExistResult = new schema.Object('check_if_exercise_name_exist');

export const objectOfStatistics = new schema.Object('object_of_statistics');

export const importExerciseResult = new schema.Object('import_exercise_result');
export const exportExerciseResult = new schema.Object('export_exercise_result');
export const testsDeleteUsers = new schema.Object('delete_users_result');
export const simulateChangeDuration = new schema.Array();
export const changeDuration = new schema.Object('change_duration');

export const tag = new schema.Entity('tags', {}, { idAttribute: 'tag_id' });
export const arrayOfTags = new schema.Array(tag);

export const injectType = new schema.Entity('inject_types', {}, { idAttribute: 'type' });
export const arrayOfInjectTypes = new schema.Array(injectType);

export const injectTypeExerciseSimple = new schema.Array();

export const injectStatus = new schema.Entity('inject_statuses', {}, { idAttribute: 'status_id' });
export const arrayOfInjectStatuses = new schema.Array(injectStatus);

export const parameters = new schema.Entity('parameters', {}, { idAttribute: 'parameters_id' });

export const token = new schema.Entity('tokens', {}, { idAttribute: 'token_id' });
export const arrayOfTokens = new schema.Array(token);

export const organization = new schema.Entity('organizations', {}, { idAttribute: 'organization_id' });
export const arrayOfOrganizations = new schema.Array(organization);

export const group = new schema.Entity('groups', {}, { idAttribute: 'group_id' });
export const arrayOfGroups = new schema.Array(group);

export const grant = new schema.Entity('grants', {}, { idAttribute: 'grant_id' });
export const arrayOfGrants = new schema.Array(grant);

export const user = new schema.Entity('users', {}, { idAttribute: 'user_id' });
export const arrayOfUsers = new schema.Array(user);

export const exercise = new schema.Entity('exercises', {}, { idAttribute: 'exercise_id' });
export const arrayOfExercises = new schema.Array(exercise);

export const objective = new schema.Entity('objectives', {}, { idAttribute: 'objective_id' });
export const arrayOfObjectives = new schema.Array(objective);

export const comcheck = new schema.Entity('comchecks', {}, { idAttribute: 'comcheck_id' });
export const arrayOfComchecks = new schema.Array(comcheck);

export const comcheckStatus = new schema.Entity('comchecks_statuses', {}, { idAttribute: 'status_id' });
export const arrayOfComcheckStatuses = new schema.Array(comcheckStatus);

export const dryrun = new schema.Entity('dryruns', {}, { idAttribute: 'dryrun_id' });
export const arrayOfDryruns = new schema.Array(dryrun);

export const dryinject = new schema.Entity('dryinjects', {}, { idAttribute: 'dryinject_id' });
export const arrayOfDryinjects = new schema.Array(dryinject);

export const audience = new schema.Entity('audiences', {}, { idAttribute: 'audience_id' });
export const arrayOfAudiences = new schema.Array(audience);

export const event = new schema.Entity('events', {}, { idAttribute: 'event_id' });
export const arrayOfEvents = new schema.Array(event);

export const inject = new schema.Entity('injects', {}, { idAttribute: 'inject_id' });
export const arrayOfInjects = new schema.Array(inject);

export const statistics = new schema.Entity('statistics', {}, { idAttribute: 'platform_id' });

export const log = new schema.Entity('logs', {}, { idAttribute: 'log_id' });
export const arrayOfLogs = new schema.Array(log);

token.define({ token_user: user });
user.define({ user_organization: organization });

export const storeBrowser = (state) => ({
  _buildUser(usr) {
    return {
      ...usr,
      isAdmin() {
        return usr.user_admin === true;
      },
      getOrganizations() {
        const all = R.values(state.referential.entities.organizations);
        return R.filter((n) => n.organization_id === usr.user_organization, all);
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
      getUsers: () => {
        const all = R.values(state.referential.entities.users);
        return R.filter((n) => aud.audience_users.includes(n.user_id), all)
          .map((u) => browser._buildUser(u));
      },
    };
  },
  _buildOrganization(org) {
    return {
      ...org,
      getTags: () => org.organization_tags
        .map((id) => state.referential.entities.tags[id])
        .filter((t) => t !== undefined),
    };
  },
  _buildExercise(id, ex) {
    const browser = this;
    return {
      ...ex,
      exercise_id: id,
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
        const audiences = R.filter((n) => n.audience_exercise === id, all)
          .map((a) => browser._buildAudience(a));
        return R.sortWith([R.ascend(R.prop(sortBy))])(audiences);
      },
      getUsers() {
        return this.getAudiences().map((a) => a.getUsers()).flat();
      },
    };
  },
  getOrganizations() {
    return R.values(state.referential.entities.organizations)
      .map((org) => this._buildOrganization(org));
  },
  getExercises() {
    return R.values(state.referential.entities.exercises);
  },
  getTags() {
    return R.values(state.referential.entities.tags);
  },
  getExercise(id) {
    const ex = state.referential.entities.exercises[id];
    return this._buildExercise(id, ex);
  },
  getStatistics() {
    return state.referential.entities.statistics?.openex;
  },
  getMe() {
    const userId = R.path(['logged', 'user'], state.app);
    return this._buildUser(state.referential.entities.users[userId]);
  },
});
