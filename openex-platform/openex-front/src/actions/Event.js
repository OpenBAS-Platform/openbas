import * as schema from './Schema';
import {
  getReferential,
  putReferential,
  postReferential,
  delReferential,
} from '../utils/Action';

export const fetchEvents = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/events`;
  return getReferential(schema.arrayOfEvents, uri)(dispatch);
};

export const updateEvent = (exerciseId, eventId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/events/${eventId}`;
  return putReferential(schema.event, uri, data)(dispatch);
};

export const addEvent = (exerciseId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/events`;
  return postReferential(schema.event, uri, data)(dispatch);
};

export const deleteEvent = (exerciseId, eventId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/events/${eventId}`;
  return delReferential(uri, 'events', eventId)(dispatch);
};

export const importEvent = (exerciseId, eventId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/events/${eventId}/import`;
  return postReferential(schema.event, uri, data)(dispatch);
};
