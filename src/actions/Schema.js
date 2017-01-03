import {Schema, arrayOf} from 'normalizr'

export const file = new Schema('files', {idAttribute: 'file_id'})
export const arrayOfFiles = arrayOf(file)

export const incidentType = new Schema('incident_types', {idAttribute: 'type_id'})
export const arrayOfIncidentTypes = arrayOf(incidentType)

export const injectType = new Schema('inject_types', {idAttribute: 'type'})
export const arrayOfInjectTypes = arrayOf(injectType)

export const injectStatus = new Schema('inject_statuses', {idAttribute: 'status_id'})
export const arrayOfInjectStatuses = arrayOf(injectStatus)

export const token = new Schema('tokens', {idAttribute: 'token_id'})
export const arrayOfTokens = arrayOf(token)

export const organization = new Schema('organizations', {idAttribute: 'organization_id'})
export const arrayOfOrganizations = arrayOf(organization)

export const group = new Schema('groups', {idAttribute: 'group_id'})
export const arrayOfGroups = arrayOf(group)

export const grant = new Schema('grants', {idAttribute: 'grant_id'})
export const arrayOfGrants = arrayOf(grant)

export const user = new Schema('users', {idAttribute: 'user_id'})
export const arrayOfUsers = arrayOf(user)

export const exercise = new Schema('exercises', {idAttribute: 'exercise_id'})
export const arrayOfExercises = arrayOf(exercise)

export const objective = new Schema('objectives', {idAttribute: 'objective_id'})
export const arrayOfObjectives = arrayOf(objective)

export const subobjective = new Schema('subobjectives', {idAttribute: 'subobjective_id'})
export const arrayOfSubobjectives = arrayOf(subobjective)

export const comcheck = new Schema('comchecks', {idAttribute: 'comcheck_id'})
export const arrayOfComchecks = arrayOf(comcheck)

export const comcheckStatus = new Schema('comchecks_statuses', {idAttribute: 'status_id'})
export const arrayOfComcheckStatuses = arrayOf(comcheckStatus)

export const dryrun = new Schema('dryruns', {idAttribute: 'dryrun_id'})
export const arrayOfDryruns = arrayOf(dryrun)

export const dryinject = new Schema('dryinjects', {idAttribute: 'dryinject_id'})
export const arrayOfDryinjects = arrayOf(dryinject)

export const audience = new Schema('audiences', {idAttribute: 'audience_id'})
export const arrayOfAudiences = arrayOf(audience)

export const event = new Schema('events', {idAttribute: 'event_id'})
export const arrayOfEvents = arrayOf(event)

export const incident = new Schema('incidents', {idAttribute: 'incident_id'})
export const arrayOfIncidents = arrayOf(incident)

export const inject = new Schema('injects', {idAttribute: 'inject_id'})
export const arrayOfInjects = arrayOf(inject)

export const log = new Schema('logs', {idAttribute: 'log_id'})
export const arrayOfLogs = arrayOf(log)

export const outcome = new Schema('outcomes', {idAttribute: 'outcome_id'})
export const arrayOfOutcomes = arrayOf(outcome)

token.define({
  token_user: user
})

user.define({
  user_organization: organization
})

incident.define({
  incident_type: incidentType
})