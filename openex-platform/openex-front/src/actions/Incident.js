import * as Constants from '../constants/ActionTypes';
import * as schema from './Schema';
import {
  getReferential,
  putReferential,
  postReferential,
  delReferential,
} from '../utils/Action';

export const fetchIncidents = (exerciseId, noloading) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/incidents`;
  return getReferential(schema.arrayOfIncidents, uri, noloading)(dispatch);
};

export const fetchIncident = (exerciseId, eventId, incidentId) => (
  dispatch,
) => {
  const uri = `/api/exercises/${
    exerciseId
  }/events/${
    eventId
  }/incidents/${
    incidentId}`;
  return getReferential(schema.incident, uri)(dispatch);
};

export const updateIncident = (exerciseId, eventId, incidentId, data) => (
  dispatch,
) => {
  const uri = `/api/exercises/${
    exerciseId
  }/events/${
    eventId
  }/incidents/${
    incidentId}`;
  return putReferential(schema.incident, uri, data)(dispatch);
};

export const addIncident = (exerciseId, eventId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/events/${eventId}/incidents`;
  return postReferential(schema.incident, uri, data)(dispatch);
};

export const deleteIncident = (exerciseId, eventId, incidentId) => (
  dispatch,
) => {
  const uri = `/api/exercises/${
    exerciseId
  }/events/${
    eventId
  }/incidents/${
    incidentId}`;
  return delReferential(uri, 'incidents', incidentId)(dispatch);
};

export const selectIncident = (exercieId, eventId, incidentId) => (
  dispatch,
) => {
  dispatch({
    type: Constants.APPLICATION_SELECT_INCIDENT,
    payload: { exercieId, eventId, incidentId },
  });
};

export const fetchIncidentTypes = () => (dispatch) => getReferential(
  schema.arrayOfIncidentTypes,
  '/api/incident_types',
)(dispatch);
