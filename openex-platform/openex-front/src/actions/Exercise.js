import * as schema from './Schema'
import {getReferential, putReferential, postReferential, delReferential, fileSave} from '../utils/Action'

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

export const exportExercise = (exerciseId, data) => (dispatch) => {
    let uri = '/api/exercises/' + exerciseId + '/export?export_exercise='
            +data['exercise']+'&export_audience='
            +data['audience']+'&export_objective='
            +data['objective']+'&export_scenarios='
            +data['scenarios']+'&export_injects='
            +data['injects']+'&export_incidents='
            +data['incidents']

    if (data['export_path'] !== undefined) {
        uri += '&export_path='+data['export_path']
        return getReferential(schema.exportExerciseResult, uri)(dispatch)
    } else {
        return fileSave(uri, 'export.xlsx')(dispatch)
    }

}

export const importExercise = (fileId, data) => (dispatch) => {
    let uri = '/api/exercises/import?file='+fileId+'&import_exercise='+data['exercise']
            +'&import_audience='+data['audience']
            +'&import_objective='+data['objective']
            +'&import_scenarios='+data['scenarios']
            +'&import_injects='+data['injects']
            +'&import_incidents='+data['incidents']

    return postReferential(schema.importExerciseResult, uri, data)(dispatch)
}

export const importExerciseFromPath = (data) => (dispatch) => {
    let uri = '/api/exercises/import?import_exercise='+data['exercise']
            +'&import_audience='+data['audience']
            +'&import_objective='+data['objective']
            +'&import_scenarios='+data['scenarios']
            +'&import_injects='+data['injects']
            +'&import_incidents='+data['incidents']
            +'&import_path='+data['import_path']

    return postReferential(schema.importExerciseResult, uri, data)(dispatch)
}

export const exportInjectEml = (exerciseId) => (dispatch) => {
    return fileSave('/api/exercises/' + exerciseId + '/export/inject/eml', 'openex_export_messages_eml.zip')(dispatch)
}

export const checkIfExerciseNameExist = (fileId) => (dispatch) => {
    return getReferential(schema.checkIfExerciseNameExistResult, '/api/exercises/import/check/exercise/'+fileId)(dispatch)
}

export const getStatisticsForExercise = (exerciseId, data) => (dispatch) => {
  return getReferential(schema.objectOfStatistics, '/api/exercises/' + exerciseId + '/statistics?interval='
    + data['value'])(dispatch)
}
