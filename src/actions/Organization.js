import * as Constants from '../constants/ActionTypes';
import {api} from '../App';
import * as schema from './Schema'
import {SubmissionError} from 'redux-form'

export const fetchOrganizations = () => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_ORGANIZATIONS_SUBMITTED});
  return api(schema.arrayOfOrganizations).get('/api/organizations').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_ORGANIZATIONS_SUCCESS,
      payload: response.data
    })
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_ORGANIZATIONS_ERROR,
      payload: response.data
    })
  })
}

export const fetchOrganization = (organizationId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_ORGANIZATION_SUBMITTED});
  return api().get('/api/organizations/' + organizationId).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_ORGANIZATION_SUCCESS,
      payload: response.data
    });
  }).catch(function (response) {
    console.error(response)
    dispatch({type: Constants.APPLICATION_FETCH_ORGANIZATION_ERROR});
  })
}

export const addOrganization = (data) => (dispatch) => {
  console.log('ORGANIZATION', data)
  dispatch({type: Constants.APPLICATION_ADD_ORGANIZATION_SUBMITTED});
  return api(schema.user).post('/api/organizations', data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_ADD_ORGANIZATION_SUCCESS,
      payload: response.data
    });
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_ADD_ORGANIZATION_ERROR});
    throw new SubmissionError({_error: 'Failed to add organization!'})
  })
}