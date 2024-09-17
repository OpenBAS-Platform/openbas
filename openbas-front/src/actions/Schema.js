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

export const injectorContract = new schema.Entity(
  'injector_contracts',
  {},
  { idAttribute: 'injector_contract_id' },
);
export const arrayOfInjectorContracts = new schema.Array(injectorContract);

export const injectStatus = new schema.Entity(
  'inject_statuses',
  {},
  { idAttribute: 'status_id' },
);
export const arrayOfInjectStatuses = new schema.Array(injectStatus);

export const platformParameters = new schema.Entity(
  'platformParameters',
  {},
  {
    idAttribute: () => 'parameters',
  },
);

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

export const team = new schema.Entity(
  'teams',
  {},
  { idAttribute: 'team_id' },
);
export const arrayOfTeams = new schema.Array(team);

export const inject = new schema.Entity(
  'injects',
  {},
  { idAttribute: 'inject_id' },
);
export const arrayOfInjects = new schema.Array(inject);

export const communication = new schema.Entity(
  'communications',
  {},
  { idAttribute: 'communication_id' },
);
export const arrayOfCommunications = new schema.Array(communication);

export const statistics = new schema.Entity(
  'statistics',
  {},
  { idAttribute: 'platform_id' },
);

export const log = new schema.Entity('logs', {}, { idAttribute: 'log_id' });
export const arrayOfLogs = new schema.Array(log);

export const channelReader = new schema.Entity(
  'channelreaders',
  {},
  { idAttribute: 'channel_id' },
);
export const challengesReader = new schema.Entity(
  'challengesreaders',
  {},
  { idAttribute: 'exercise_id' },
);
export const injectexpectation = new schema.Entity(
  'injectexpectations',
  {},
  { idAttribute: 'inject_expectation_id' },
);
export const arrayOfInjectexpectations = new schema.Array(injectexpectation);

export const lessonsTemplate = new schema.Entity(
  'lessonstemplates',
  {},
  { idAttribute: 'lessonstemplate_id' },
);
export const arrayOfLessonsTemplates = new schema.Array(lessonsTemplate);

export const lessonsTemplateCategory = new schema.Entity(
  'lessonstemplatecategorys',
  {},
  { idAttribute: 'lessonstemplatecategory_id' },
);
export const arrayOfLessonsTemplateCategories = new schema.Array(
  lessonsTemplateCategory,
);

export const lessonsTemplateQuestion = new schema.Entity(
  'lessonstemplatequestions',
  {},
  { idAttribute: 'lessonstemplatequestion_id' },
);
export const arrayOfLessonsTemplateQuestions = new schema.Array(
  lessonsTemplateQuestion,
);

export const lessonsCategory = new schema.Entity(
  'lessonscategorys',
  {},
  { idAttribute: 'lessonscategory_id' },
);
export const arrayOfLessonsCategories = new schema.Array(lessonsCategory);

export const lessonsQuestion = new schema.Entity(
  'lessonsquestions',
  {},
  { idAttribute: 'lessonsquestion_id' },
);
export const arrayOfLessonsQuestions = new schema.Array(lessonsQuestion);

export const lessonsAnswer = new schema.Entity(
  'lessonsanswers',
  {},
  { idAttribute: 'lessonsanswer_id' },
);
export const arrayOfLessonsAnswers = new schema.Array(lessonsAnswer);

export const report = new schema.Entity(
  'reports',
  {},
  { idAttribute: 'report_id' },
);
export const arrayOfReports = new schema.Array(report);

export const variable = new schema.Entity(
  'variables',
  {},
  { idAttribute: 'variable_id' },
);
export const arrayOfVariables = new schema.Array(variable);

export const killChainPhase = new schema.Entity(
  'killchainphases',
  {},
  { idAttribute: 'phase_id' },
);
export const arrayOfKillChainPhases = new schema.Array(killChainPhase);

export const attackPattern = new schema.Entity(
  'attackpatterns',
  {},
  { idAttribute: 'attack_pattern_id' },
);
export const arrayOfAttackPatterns = new schema.Array(attackPattern);

export const injector = new schema.Entity(
  'injectors',
  {},
  { idAttribute: 'injector_id' },
);
export const arrayOfInjectors = new schema.Array(injector);

export const collector = new schema.Entity(
  'collectors',
  {},
  { idAttribute: 'collector_id' },
);
export const arrayOfCollectors = new schema.Array(collector);

export const executor = new schema.Entity(
  'executors',
  {},
  { idAttribute: 'executor_id' },
);
export const arrayOfExecutors = new schema.Array(executor);

export const payload = new schema.Entity(
  'payloads',
  {},
  { idAttribute: 'payload_id' },
);
export const arrayOfPayloads = new schema.Array(payload);

export const mitigation = new schema.Entity(
  'mitigations',
  {},
  { idAttribute: 'mitigation_id' },
);
export const arrayOfMitigations = new schema.Array(mitigation);

token.define({ token_user: user });
user.define({ user_organization: organization });

const maps = (key, state) => state.referential.entities[key].asMutable({ deep: true });
const entities = (key, state) => Object.values(maps(key, state));
const entity = (id, key, state) => state.referential.entities[key][id]?.asMutable({ deep: true });
const me = (state) => state.referential.entities.users[R.path(['logged', 'user'], state.app)];

const getInjectWithParsedInjectorContractContent = (i) => {
  if (!i) {
    return i;
  }
  return ({
    ...i,
    inject_injector_contract: {
      ...i.inject_injector_contract,
      injector_contract_content_parsed: i.inject_injector_contract?.injector_contract_content
        ? JSON.parse(i.inject_injector_contract.injector_contract_content)
        : null,
    },
  });
};
const getInjectsWithParsedInjectorContractContent = (injects) => {
  if (R.isEmpty(injects)) {
    return injects;
  }
  return injects.map(getInjectWithParsedInjectorContractContent);
};

export const storeHelper = (state) => ({
  logged: () => state.app.logged,
  getMe: () => me(state),
  getMeTokens: () => entities('tokens', state).filter(
    (t) => t.token_user === me(state)?.user_id,
  ),
  getStatistics: () => state.referential.entities.statistics?.openbas,
  // exercises
  getExercises: () => entities('exercises', state),
  getExercisesMap: () => maps('exercises', state),
  getExercise: (id) => entity(id, 'exercises', state),
  getExerciseDryruns: (id) => entities('dryruns', state).filter((i) => i.dryrun_exercise === id),
  getExerciseComchecks: (id) => entities('comchecks', state).filter((i) => i.comcheck_exercise === id),
  getExerciseTeams: (id) => entities('teams', state).filter((i) => i.team_exercises?.includes(id)),
  getExerciseVariables: (id) => entities('variables', state).filter((i) => i.variable_exercise === id),
  getExerciseArticles: (id) => entities('articles', state).filter((i) => i.article_exercise === id),
  getExerciseInjects: (id) => getInjectsWithParsedInjectorContractContent(entities('injects', state).filter((i) => i.inject_exercise === id)),
  getExerciseCommunications: (id) => entities('communications', state).filter(
    (i) => i.communication_exercise === id,
  ),
  getExerciseObjectives: (id) => entities('objectives', state).filter((o) => o.objective_exercise === id),
  getExerciseLogs: (id) => entities('logs', state).filter((l) => l.log_exercise === id),
  getExerciseLessonsCategories: (id) => entities('lessonscategorys', state).filter(
    (l) => l.lessons_category_exercise === id,
  ),
  getExerciseLessonsQuestions: (id) => entities('lessonsquestions', state).filter(
    (l) => l.lessons_question_exercise === id,
  ),
  getExerciseLessonsAnswers: (exerciseId) => entities('lessonsanswers', state).filter(
    (l) => l.lessons_answer_exercise === exerciseId,
  ),
  getExerciseUserLessonsAnswers: (exerciseId, userId) => entities('lessonsanswers', state).filter(
    (l) => l.lessons_answer_exercise === exerciseId
            && l.lessons_answer_user === userId,
  ),
  getExerciseReports: (exerciseId) => entities('reports', state).filter((l) => l.report_exercise === exerciseId),
  // report
  getReport: (id) => entity(id, 'reports', state),
  // dryrun
  getDryrun: (id) => entity(id, 'dryruns', state),
  getDryrunInjects: (id) => entities('dryinjects', state).filter((i) => i.dryinject_dryrun === id),
  getDryrunUsers: (id) => entities('users', state).filter((i) => (entity(id, 'dryruns', state) || {}).dryrun_users?.includes(i.user_id)),
  // comcheck
  getComcheck: (id) => entity(id, 'comchecks', state),
  getComcheckStatus: (id) => entity(id, 'comcheckstatuses', state),
  getComcheckStatuses: (id) => entities('comcheckstatuses', state).filter(
    (i) => i.comcheckstatus_comcheck === id,
  ),
  getChannelReader: (id) => entity(id, 'channelreaders', state),
  getChallengesReader: (id) => entity(id, 'challengesreaders', state),
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
  getInject: (id) => getInjectWithParsedInjectorContractContent(entity(id, 'injects', state)),
  getAtomicTesting: (id) => entity(id, 'atomics', state),
  getAtomicTestingDetail: (id) => entity(id, 'atomicdetails', state),
  getAtomicTestings: () => entities('atomics', state),
  getTargetResults: (id, injectId) => entities('targetresults', state).filter((r) => (r.target_id === id) && (r.target_inject_id === injectId)),
  getInjectsMap: () => getInjectsWithParsedInjectorContractContent(entities('injects', state)).reduce((map, i) => {
    // eslint-disable-next-line no-param-reassign
    map[i.inject_id] = i;
    return map;
  }, {}),
  getNextInjects: () => {
    const sortFn = (a, b) => new Date(a.inject_date).getTime() - new Date(b.inject_date).getTime();
    const injects = entities('injects', state).filter(
      (i) => i.inject_date !== null && i.inject_status === null,
    );
    return R.take(6, R.sort(sortFn, injects));
  },
  getInjectCommunications: (id) => entities('communications', state).filter(
    (i) => i.communication_inject === id,
  ),
  // injectexpectation
  getInjectExpectations: () => entities('injectexpectations', state),
  getExerciseInjectExpectations: (id) => entities('injectexpectations', state).filter(
    (i) => i.inject_expectation_exercise === id,
  ),
  getInjectExpectationsMap: () => maps('injectexpectations', state),
  // documents
  getDocuments: () => entities('documents', state),
  getDocumentsMap: () => maps('documents', state),
  // teams
  getTeam: (id) => entity(id, 'teams', state),
  getTeamUsers: (id) => entities('users', state).filter((u) => (entity(id, 'teams', state) || {}).team_users?.includes(
    u.user_id,
  )),
  getTeamExerciseInjects: (id) => entities('injects', state).filter((i) => (entity(id, 'teams', state) || {}).team_exercise_injects?.includes(
    i.inject_id,
  )),
  getTeams: () => entities('teams', state),
  getTeamsMap: () => maps('teams', state),
  getPlatformSettings: () => {
    return state.referential.entities.platformParameters.parameters || {};
  },
  // kill chain phases
  getKillChainPhase: (id) => entity(id, 'killchainphases', state),
  getKillChainPhases: () => entities('killchainphases', state),
  getKillChainPhasesMap: () => maps('killchainphases', state),
  // attack patterns
  getAttackPattern: (id) => entity(id, 'attackpatterns', state),
  getAttackPatterns: () => entities('attackpatterns', state),
  getAttackPatternsMap: () => maps('attackpatterns', state),
  // mitigations
  getMitigation: (id) => entity(id, 'mitigations', state),
  getMitigations: () => entities('mitigations', state),
  getMitigationsMap: () => maps('mitigations', state),
  // injectors
  getInjector: (id) => entity(id, 'injectors', state),
  getInjectors: () => entities('injectors', state),
  getInjectorsMap: () => maps('injectors', state),
  // injector contracts
  getInjectorContract: (id) => {
    const i = entity(id, 'injector_contracts', state);
    if (!i) {
      return i;
    }
    return ({
      ...i,
      ...JSON.parse(i.injector_contract_content),
    });
  },
  getInjectorContracts: () => entities('injector_contracts', state),
  // collectors
  getCollector: (id) => entity(id, 'collectors', state),
  getCollectors: () => entities('collectors', state),
  getCollectorsMap: () => maps('collectors', state),
  // executors
  getExecutor: (id) => entity(id, 'executors', state),
  getExecutors: () => entities('executors', state),
  getExecutorsMap: () => maps('executors', state),
  // channels
  getChannels: () => entities('channels', state),
  getChannel: (id) => entity(id, 'channels', state),
  getChannelsMap: () => maps('channels', state),
  // payloads
  getPayloads: () => entities('payloads', state),
  getPayload: (id) => entity(id, 'payloads', state),
  getPayloadsMap: () => maps('payloads', state),
  // articles
  getArticles: () => entities('articles', state),
  getArticle: (id) => entity(id, 'articles', state),
  getArticlesMap: () => maps('articles', state),
  // challenges
  getChallenges: () => entities('challenges', state),
  getExerciseChallenges: (id) => entities('challenges', state).filter((c) => c.challenge_exercises.includes(id)),
  getChallengesMap: () => maps('challenges', state),
  // lessons templates
  getLessonsTemplate: (id) => entity(id, 'lessonstemplates', state),
  getLessonsTemplates: () => entities('lessonstemplates', state),
  getLessonsTemplatesMap: () => maps('lessonstemplates', state),
  getLessonsTemplateCategories: (id) => entities('lessonstemplatecategorys', state).filter(
    (c) => c.lessons_template_category_template === id,
  ),
  getLessonsTemplateQuestions: () => entities('lessonstemplatequestions', state),
  getLessonsTemplateQuestionsMap: () => maps('lessonstemplatequestions', state),
  getLessonsTemplateCategoryQuestions: (id) => entities('lessonstemplatequestions', state).filter(
    (c) => c.lessons_template_question_category === id,
  ),
  // assets
  getEndpoints: () => entities('endpoints', state),
  getEndpointsMap: () => maps('endpoints', state),
  // asset groups
  getAssetGroups: () => entities('asset_groups', state),
  getAssetGroupMaps: () => maps('asset_groups', state),
  getAssetGroup: (id) => entity(id, 'asset_groups', state),
  // security platforms
  getSecurityPlatforms: () => entities('securityplatforms', state),
  getSecurityPlatformsMap: () => maps('securityplatforms', state),
  getSecurityPlatform: (id) => entity(id, 'securityplatforms', state),
  // scenarios
  getScenarios: () => entities('scenarios', state),
  getScenariosMap: () => maps('scenarios', state),
  getScenario: (id) => entity(id, 'scenarios', state),
  getScenarioTeams: (id) => entities('teams', state).filter((i) => i.team_scenarios.includes(id)),
  getScenarioVariables: (id) => entities('variables', state).filter((i) => i.variable_scenario === id),
  getScenarioArticles: (id) => entities('articles', state).filter((i) => i.article_scenario === id),
  getScenarioChallenges: (id) => entities('challenges', state).filter((c) => c.challenge_scenarios.includes(id)),
  getScenarioInjects: (id) => getInjectsWithParsedInjectorContractContent(entities('injects', state).filter((i) => i.inject_scenario === id)),
  getTeamScenarioInjects: (id) => entities('injects', state).filter((i) => (entity(id, 'teams', state) || {}).team_scenario_injects?.includes(
    i.inject_id,
  )),
  getScenarioObjectives: (id) => entities('objectives', state).filter((o) => o.objective_scenario === id),
  getScenarioLessonsCategories: (id) => entities('lessonscategorys', state).filter(
    (l) => l.lessons_category_scenario === id,
  ),
  getScenarioLessonsQuestions: (id) => entities('lessonsquestions', state).filter(
    (l) => l.lessons_question_scenario === id,
  ),
});
