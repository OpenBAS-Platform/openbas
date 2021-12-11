import { schema } from 'normalizr';

export const file = new schema.Entity('files', {}, { idAttribute: 'file_id' });
export const arrayOfFiles = new schema.Array(file);

export const document = new schema.Entity(
  'document',
  {},
  { idAttribute: 'document_id' },
);
export const arrayOfDocument = new schema.Array(document);

export const fileSheet = new schema.Array();
export const listOfUserPlanificateur = new schema.Array();

export const checkIfExerciseNameExistResult = new schema.Object(
  'check_if_exercise_name_exist',
);
export const testsCreateExercise = new schema.Object(
  'tests_create_exercise_result',
);

export const objectOfStatistics = new schema.Object('object_of_statistics');

export const importExerciseResult = new schema.Object('import_exercise_result');
export const exportExerciseResult = new schema.Object('export_exercise_result');
export const testsDeleteUsers = new schema.Object('delete_users_result');
export const simulateChangeDuration = new schema.Array();
export const changeDuration = new schema.Object('change_duration');

export const tag = new schema.Entity('tag', {}, { idAttribute: 'tag_id' });
export const arrayOfTags = new schema.Array(tag);

export const incidentType = new schema.Entity(
  'incident_types',
  {},
  { idAttribute: 'type_id' },
);
export const arrayOfIncidentTypes = new schema.Array(incidentType);

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
  {
    idAttribute: 'parameters_id',
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

export const subobjective = new schema.Entity(
  'subobjectives',
  {},
  { idAttribute: 'subobjective_id' },
);
export const arrayOfSubobjectives = new schema.Array(subobjective);

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

export const subaudience = new schema.Entity(
  'subaudiences',
  {},
  { idAttribute: 'subaudience_id' },
);
export const arrayOfSubaudiences = new schema.Array(subaudience);

export const event = new schema.Entity(
  'events',
  {},
  { idAttribute: 'event_id' },
);
export const arrayOfEvents = new schema.Array(event);

export const incident = new schema.Entity(
  'incidents',
  {},
  { idAttribute: 'incident_id' },
);
export const arrayOfIncidents = new schema.Array(incident);

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

export const outcome = new schema.Entity(
  'outcomes',
  {},
  { idAttribute: 'outcome_id' },
);
export const arrayOfOutcomes = new schema.Array(outcome);

token.define({
  token_user: user,
});

user.define({
  user_organization: organization,
});

incident.define({
  incident_type: incidentType,
});
