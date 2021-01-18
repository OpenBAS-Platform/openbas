// Axios API
import * as R from 'ramda';
import axios from 'axios';
import { normalize } from 'normalizr';
import Immutable from 'seamless-immutable';
import { debug } from './utils/Messages';
import { store } from './Store';
import * as Constants from './constants/ActionTypes';

// eslint-disable-next-line import/prefer-default-export
export const api = (schema) => {
  const token = R.path(['logged', 'auth'], store.getState().app);
  const instance = axios.create({
    withCredentials: true,
    headers: { 'X-Authorization-Token': token, responseType: 'json' },
  });
  // Intercept to apply schema and test unauthorized users
  instance.interceptors.response.use(
    (response) => {
      const toImmutable = response.config.responseType === undefined; //= == json
      const dataNormalize = schema
        ? normalize(response.data, schema)
        : response.data;
      debug('api', {
        from: response.request.responseURL,
        data: { raw: response.data, normalize: dataNormalize },
      });
      response.data = toImmutable ? Immutable(dataNormalize) : dataNormalize;
      return response;
    },
    (err) => {
      const res = err.response;
      // eslint-disable-next-line no-console
      console.error('api', res);
      if (res.status === 401) {
        // User is not logged anymore
        store.dispatch({ type: Constants.IDENTITY_LOGOUT_SUCCESS });
        return Promise.reject(res.data);
      }
      // eslint-disable-next-line no-underscore-dangle
      if (res.status === 503 && err.config && !err.config.__isRetryRequest) {
        // eslint-disable-next-line no-param-reassign,no-underscore-dangle
        err.config.__isRetryRequest = true;
        return axios(err.config);
      }
      return Promise.reject(res.data);
    },
  );
  return instance;
};
