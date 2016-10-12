import {Schema, arrayOf} from 'normalizr'

export const file = new Schema('files', {idAttribute: 'file_id'})
export const arrayOfFiles = arrayOf(file)

export const exerciseStatus = new Schema('exercise_statuses', {idAttribute: 'status_id'})
export const arrayOfExercisesStatuses = arrayOf(exerciseStatus)

export const injectStatus = new Schema('inject_statuses', {idAttribute: 'status_id'})
export const arrayOfInjectStatuses = arrayOf(injectStatus)

export const injectState = new Schema('inject_states', {idAttribute: 'state_id'})
export const arrayOfInjectStates = arrayOf(injectState)

export const token = new Schema('tokens', {idAttribute: 'token_id'})
export const arrayOfTokens = arrayOf(token)

export const user = new Schema('users', {idAttribute: 'user_id'})
export const arrayOfUsers = arrayOf(user)

export const exercise = new Schema('exercises', {idAttribute: 'exercise_id'})
export const arrayOfExercises = arrayOf(exercise)

token.define({
  token_user: user
})