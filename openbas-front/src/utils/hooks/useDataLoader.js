import { normalize, schema } from 'normalizr';
import { useEffect } from 'react';
import { DATA_DELETE_SUCCESS } from '../../constants/ActionTypes';
import { store } from '../../store';
import { buildUri } from '../Action';

const EVENT_TRY_DELAY = 1500;
const EVENT_PING_MAX_TIME = 5000;

let sseClient;
let lastPingDate = new Date().getTime();
const listeners = new Map();
const useDataLoader = (loader = () => {}) => {
  const sseConnect = () => {
    sseClient = new EventSource(buildUri('/api/stream'), { withCredentials: true });
    const autoReConnect = setInterval(() => {
      const current = new Date().getTime();
      if (current - lastPingDate > EVENT_PING_MAX_TIME) {
        clearInterval(autoReConnect);
        sseClient.close();
        sseConnect();
      }
    }, EVENT_TRY_DELAY);
    sseClient.addEventListener('open', () => [...listeners.keys()].forEach((load) => load()));
    sseClient.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.event_type === DATA_DELETE_SUCCESS) {
        const payload = {
          id: data.instance[data.attribute_id],
          type: data.attribute_schema,
        };
        const deleteEvent = { type: DATA_DELETE_SUCCESS, payload };
        store.dispatch(deleteEvent);
      } else {
        const schemaInfo = { idAttribute: data.attribute_id };
        const schemas = new schema.Entity(
          data.attribute_schema,
          {},
          schemaInfo,
        );
        const dataNormalize = normalize(data.instance, schemas);
        const storeEvent = { type: data.event_type, payload: dataNormalize };
        store.dispatch(storeEvent);
      }
    });
    sseClient.addEventListener('ping', (event) => {
      lastPingDate = event.data * 1000;
    });
    sseClient.onerror = () => {
      clearInterval(autoReConnect);
      sseClient.close();
      sseConnect();
    };
    return sseClient;
  };
  useEffect(() => {
    listeners.set(loader, '');
    if (EventSource !== undefined && sseClient === undefined) {
      sseClient = sseConnect();
    } else {
      const load = async () => {
        await loader();
      };
      load();
    }
    return () => {
      // Remove the listener
      listeners.delete(loader);
      // If its the last one, disconnect the stream
      if (listeners.size === 0) {
        sseClient.close();
        sseClient = undefined;
      }
    };
  }, []);
};

export default useDataLoader;
