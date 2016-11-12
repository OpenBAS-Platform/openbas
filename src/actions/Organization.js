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
  return api(schema.organization).get('/api/organizations/' + organizationId).then(function (response) {
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
  dispatch({type: Constants.APPLICATION_ADD_ORGANIZATION_SUBMITTED});
  return api(schema.organization).post('/api/organizations', data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_ADD_ORGANIZATION_SUCCESS,
      payload: response.data
    });
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_ADD_ORGANIZATION_ERROR});
    throw new SubmissionError({_error: 'Failed to add organization!'})
  })
}

export const addOrganizationAndUser = (dataOrganization, dataUser) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_ADD_ORGANIZATION_SUBMITTED});
  api(schema.organization).post('/api/organizations', dataOrganization).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_ADD_ORGANIZATION_SUCCESS,
      payload: response.data
    })
    dataUser.user_organization = response.data.get('result')
    dispatch({type: Constants.APPLICATION_ADD_USER_SUBMITTED})
    return api(schema.user).post('/api/users', dataUser).then(function (response2) {
      dispatch({
        type: Constants.APPLICATION_ADD_USER_SUCCESS,
        payload: response2.data
      })
    }).catch(function () {
      dispatch({type: Constants.APPLICATION_ADD_USER_ERROR});
      throw new SubmissionError({_error: 'Failed to add user!'})
    })
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_ADD_ORGANIZATION_ERROR});
    throw new SubmissionError({_error: 'Failed to add organization!'})
  })
}

export const addOrganizationAndUpdateUser = (dataOrganization, userId, dataUser) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_ADD_ORGANIZATION_SUBMITTED});
  api(schema.organization).post('/api/organizations', dataOrganization).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_ADD_ORGANIZATION_SUCCESS,
      payload: response.data
    })
    dataUser.user_organization = response.data.get('result')
    dispatch({type: Constants.APPLICATION_UPDATE_USER_SUBMITTED});
    return api(schema.user).put('/api/users/' + userId, dataUser).then(function (response) {
      dispatch({
        type: Constants.APPLICATION_UPDATE_USER_SUCCESS,
        payload: response.data
      });
    }).catch(function () {
      dispatch({type: Constants.APPLICATION_UPDATE_USER_ERROR});
      throw new SubmissionError({_error: 'Failed to update user!'})
    })
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_ADD_ORGANIZATION_ERROR});
    throw new SubmissionError({_error: 'Failed to add organization!'})
  })
}