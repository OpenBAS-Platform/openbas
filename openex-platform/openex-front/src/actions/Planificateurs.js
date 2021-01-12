import * as schema from './Schema';
import { getReferential, postReferential } from '../utils/Action';

// Liste des users planificateurs de l'audience
export const getPlanificateurUserForAudience = (exerciseId, audienceId) => (
  dispatch,
) => {
  const uri = `/api/exercises/${exerciseId}/planificateurs/audiences/${audienceId}`;
  return getReferential(schema.listOfUserPlanificateur, uri)(dispatch);
};

export const updatePlanificateurUserForAudience = (
  exerciseId,
  audienceId,
  data,
) => (dispatch) => {
  const dataArray = { planificateurs: data };
  const uri = `/api/exercises/${exerciseId}/planificateurs/audiences/${audienceId}`;
  return postReferential(
    schema.listOfUserPlanificateur,
    uri,
    dataArray,
  )(dispatch);
};

export const getPlanificateurUserForEvent = (exerciseId, eventId) => (
  dispatch,
) => {
  const uri = `/api/exercises/${exerciseId}/planificateurs/events/${eventId}`;
  return getReferential(schema.listOfUserPlanificateur, uri)(dispatch);
};

export const updatePlanificateurUserForEvent = (exerciseId, eventId, data) => (
  dispatch,
) => {
  const dataArray = { planificateurs: data };
  const uri = `/api/exercises/${exerciseId}/planificateurs/events/${eventId}`;
  return postReferential(
    schema.listOfUserPlanificateur,
    uri,
    dataArray,
  )(dispatch);
};

// Liste des user planificateurs
export const fetchPlanificateurs = () => (dispatch) => getReferential(schema.arrayOfUsers, '/api/planificateurs')(dispatch);
