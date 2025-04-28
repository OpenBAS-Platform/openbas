import { type Dispatch } from 'redux';

import { getReferential, simpleCall, simplePostCall } from '../../utils/Action';
import { type Exercise, type InjectBulkProcessingInput, type InjectExportFromSearchRequestInput, type InjectExportRequestInput, type InjectImportInput, type Scenario, type SearchPaginationInput } from '../../utils/api-types';
import { MESSAGING$ } from '../../utils/Environment';
import * as schema from '../Schema';

const INJECT_URI = '/api/injects';

export const testInject = (injectId: string) => {
  const uri = `/api/injects/${injectId}/test`;
  return simpleCall(uri);
};

export const bulkTestInjects = (data: InjectBulkProcessingInput) => {
  const uri = '/api/injects/test';
  return simplePostCall(uri, data, undefined, false).catch((error) => {
    MESSAGING$.notifyError('Can\'t be tested');
    throw error;
  });
};

export const exportInjectSearch = (data: InjectExportFromSearchRequestInput) => {
  const uri = '/api/injects/search/export';
  return simplePostCall(uri, data, { responseType: 'arraybuffer' }).catch((error) => {
    MESSAGING$.notifyError('Could not request export of injects');
    throw error;
  });
};

export const exportInjects = (data: InjectExportRequestInput) => {
  const uri = '/api/injects/export';
  return simplePostCall(uri, data, { responseType: 'arraybuffer' }).catch((error) => {
    MESSAGING$.notifyError('Could not request export of injects');
    throw error;
  });
};

export const importInjects = (file: File, input: InjectImportInput) => {
  const uri = '/api/injects/import';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('input', new Blob([JSON.stringify(input)], { type: 'application/json' }));
  return simplePostCall(uri, formData).catch((error) => {
    MESSAGING$.notifyError('Could not import injects');
    throw error;
  });
};

// -- EXERCISES --

export const fetchExerciseInjectsSimple = (exerciseId: Exercise['exercise_id']) => (dispatch: Dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects/simple`;
  return getReferential(schema.arrayOfInjects, uri)(dispatch);
};

export const searchExerciseInjectsSimple = (exerciseId: Exercise['exercise_id'], input: SearchPaginationInput) => {
  const uri = `/api/exercises/${exerciseId}/injects/simple`;
  return simplePostCall(uri, input);
};

// -- SCENARIOS --

export const fetchScenarioInjectsSimple = (scenarioId: Scenario['scenario_id']) => (dispatch: Dispatch) => {
  const uri = `/api/scenarios/${scenarioId}/injects/simple`;
  return getReferential(schema.arrayOfInjects, uri)(dispatch);
};

export const searchScenarioInjectsSimple = (scenarioId: Scenario['scenario_id'], input: SearchPaginationInput) => {
  const uri = `/api/scenarios/${scenarioId}/injects/simple`;
  return simplePostCall(uri, input);
};

// -- TARGETS --

export const searchTargets = (injectId: string, targetType: string, searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `/api/injects/${injectId}/targets/${targetType}/search`;
  return simplePostCall(uri, data);
};

export const searchTargetOptions = (injectId: string, targetType: string)=> {
  const uri = `/api/injects/${injectId}/targets/${targetType}/options`;
  return simpleCall(uri);
};

export const searchTargetOptionsById = (targetType: string, ids: string[])=> {
  const data = ids;
  const uri = `/api/injects/targets/${targetType}/options`;
  return simplePostCall(uri, data);
};

// -- OPTION --

export const searchInjectLinkedToFindingsAsOption = (searchText: string = '', simulationOrScenarioId: string = '') => {
  const params = {
    searchText,
    simulationOrScenarioId,
  };
  return simpleCall(`${INJECT_URI}/findings/options`, { params });
};

export const searchInjectByIdAsOption = (ids: string[]) => {
  return simplePostCall(`${INJECT_URI}/options`, ids);
};
