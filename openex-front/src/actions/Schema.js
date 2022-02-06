/* eslint-disable no-underscore-dangle */
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
const _resolveMe = (state) => _buildUser(
  state,
  state.referential.entities.users[R.path(['logged', 'user'], state.app)],
);
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
const _buildComcheckStatus = (state, sta) => {
  if (sta === undefined) return sta;
  return {
    ...sta,
    user: _buildUser(
      state,
      state.referential.entities.users[sta.comcheckstatus_user],
    ),
  };
};
const _buildComcheck = (state, com) => {
  if (com === undefined) return com;
  return {
    ...com,
    status: com.comcheck_statuses
      .asMutable()
      .map((statusId) => state.referential.entities.comcheckstatuses[statusId])
      .filter((s) => s !== undefined)
      .map((s) => _buildComcheckStatus(state, s)),
  };
};
const _buildDryrun = (state, id, dry) => {
  if (dry === undefined) return dry;
  const getDryinjects = () => R.values(state.referential.entities.dryinjects).filter(
    (n) => n.dryinject_dryrun === id,
  );
  return {
    ...dry,
    dryinjects: getDryinjects(),
    users: R.values(state.referential.entities.users)
      .filter((n) => dry.dryrun_users.includes(n.user_id))
      .map((u) => _buildUser(state, u)),
  };
};
const _buildLog = (state, lo) => {
  if (lo === undefined) return lo;
  return {
    ...lo,
    tags: lo.log_tags
      .asMutable()
      .map((tagId) => state.referential.entities.tags[tagId])
      .filter((t) => t !== undefined),
    user: _buildUser(state, state.referential.entities.users[lo.log_user]),
  };
};
const _buildEvaluation = (state, eva) => {
  if (eva === undefined) return eva;
  return {
    ...eva,
    user: _buildUser(
      state,
      state.referential.entities.users[eva.evaluation_user],
    ),
  };
};
const _buildObjective = (state, id, obj) => {
  if (obj === undefined) return obj;
  const getEvaluations = () => R.filter(
    (n) => n.evaluation_objective === id,
    R.values(state.referential.entities.evaluations),
  ).map((e) => _buildEvaluation(state, e));
  return {
    ...obj,
    evaluations: getEvaluations(),
  };
};
const _buildAnswer = (state, ans) => {
  if (ans === undefined) return ans;
  return {
    ...ans,
    user: _buildUser(
      state,
      state.referential.entities.users[ans.evaluation_user],
    ),
  };
};
const _buildPoll = (state, id, pol) => {
  if (pol === undefined) return pol;
  const getAnswers = () => R.filter(
    (n) => n.answer_poll === id,
    R.values(state.referential.entities.answers),
  ).map((e) => _buildAnswer(state, e));
  return {
    ...pol,
    answers: getAnswers(),
  };
};
const _buildExercise = (state, id, ex) => {
  if (ex === undefined) return ex;
  const getObjectives = () => R.filter(
    (n) => n.objective_exercise === id,
    R.values(state.referential.entities.objectives),
  ).map((o) => _buildObjective(state, o.objective_id, o));
  const getPolls = () => R.filter(
    (n) => n.poll_exercise === id,
    R.values(state.referential.entities.polls),
  ).map((p) => _buildPoll(state, p.poll_id, p));
  const getLogs = () => R.filter(
    (n) => n.log_exercise === id,
    R.values(state.referential.entities.logs),
  ).map((l) => _buildLog(state, l));
  const getAudiences = () => R.filter(
    (n) => n.audience_exercise === id,
    R.values(state.referential.entities.audiences),
  ).map((a) => _buildAudience(state, a));
  const getInjects = () => R.filter(
    (n) => n.inject_exercise === id,
    R.values(state.referential.entities.injects),
  ).map((a) => _buildInject(state, a));
  const getDryruns = () => R.filter(
    (n) => n.dryrun_exercise === id,
    R.values(state.referential.entities.dryruns),
  ).map((d) => _buildDryrun(state, d.dryrun_id, d));
  const getComchecks = () => R.filter(
    (n) => n.comcheck_exercise === id,
    R.values(state.referential.entities.comchecks),
  ).map((c) => _buildComcheck(state, c));
  const me = _resolveMe(state);
  return {
    ...ex,
    exercise_id: id,
    user_can_update:
      me?.admin || (ex.exercise_planners || []).includes(me?.user_id),
    user_can_delete: me?.admin,
    tags: ex.exercise_tags
      .asMutable()
      .map((tagId) => state.referential.entities.tags[tagId])
      .filter((t) => t !== undefined),
    logs: getLogs(),
    objectives: getObjectives(),
    polls: getPolls(),
    injects: getInjects(),
    audiences: getAudiences(),
    comchecks: getComchecks(),
    dryruns: getDryruns(),
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
    exercises: doc.document_exercises
      .asMutable()
      .map((exId) => state.referential.entities.exercises[exId])
      .filter((t) => t !== undefined)
      .map((ex) => _buildExercise(state, ex.exercise_id, ex)),
  };
};
export const storeBrowser = (state) => ({
  logged: state.app.logged,
  users: R.values(state.referential.entities.users).map((usr) => _buildUser(state, usr)),
  tags: R.values(state.referential.entities.tags),
  groups: R.values(state.referential.entities.groups),
  next_injects: R.take(
    6,
    R.sort(
      (a, b) => new Date(a.inject_date).getTime() - new Date(b.inject_date).getTime(),
      R.values(state.referential.entities.injects)
        .filter((i) => i.inject_date !== null && i.inject_status === null)
        .map((i) => _buildInject(state, i)),
    ),
  ),
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
  getObjective(id) {
    return _buildObjective(
      state,
      id,
      state.referential.entities.objectives[id],
    );
  },
  getComcheck(id) {
    return _buildComcheck(state, state.referential.entities.comchecks[id]);
  },
  getDryrun(id) {
    return _buildDryrun(state, id, state.referential.entities.dryruns[id]);
  },
  getComcheckStatus(id) {
    return state.referential.entities.comcheckstatuses[id];
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
