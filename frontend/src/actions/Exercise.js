import * as schema from './Schema'
import {getReferential, putReferential, postReferential, delReferential} from '../utils/Action'

export const fetchExercises = () => (dispatch) => {
    return getReferential(schema.arrayOfExercises, '/api/exercises')(dispatch)
}

export const fetchExercise = (exerciseId) => (dispatch) => {
    return getReferential(schema.exercise, '/api/exercises/' + exerciseId)(dispatch)
}

export const addExercise = (data) => (dispatch) => {
    return postReferential(schema.exercise, '/api/exercises', data)(dispatch)
}

export const updateExercise = (exerciseId, data) => (dispatch) => {
    return putReferential(schema.exercise, '/api/exercises/' + exerciseId, data)(dispatch)
}

export const deleteExercise = (exerciseId) => (dispatch) => {
    return delReferential('/api/exercises/' + exerciseId, 'exercises', exerciseId)(dispatch)
}