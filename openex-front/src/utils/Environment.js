import { Subject, timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import * as R from 'ramda';
import React from 'react';
import Slide from '@mui/material/Slide';
import { useLocation } from 'react-router-dom';

// Service bus
const MESSENGER$ = new Subject().pipe(debounce(() => timer(500)));
export const MESSAGING$ = {
  messages: MESSENGER$,
  notifyError: (text) => MESSENGER$.next([{ type: 'error', text }]),
  notifySuccess: (text) => MESSENGER$.next([{ type: 'message', text }]),
  toggleNav: new Subject(),
  redirect: new Subject(),
};

// Default application exception.
export class ApplicationError extends Error {
  constructor(errors) {
    super();
    this.data = errors;
  }
}

export const useQueryParameter = (parameters) => {
  const { search } = useLocation();
  const query = React.useMemo(() => new URLSearchParams(search), [search]);
  return parameters.map((p) => query.get(p));
};

// Network
const isEmptyPath = R.isNil(window.BASE_PATH) || R.isEmpty(window.BASE_PATH);
const contextPath = isEmptyPath || window.BASE_PATH === '/' ? '' : window.BASE_PATH;
export const APP_BASE_PATH = isEmptyPath || contextPath.startsWith('/') ? contextPath : `/${contextPath}`;

// Transition
export const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

export const fileUri = (fileImport) => `${APP_BASE_PATH}${fileImport}`; // No slash here, will be replace by the builder

// Export
const escape = (value) => value?.toString().replaceAll('"', '""');
export const exportData = (
  type,
  keys,
  data,
  tagsMap,
  organizationsMap,
  exercisesMap,
) => {
  return data
    .map((d) => R.pick(keys, d))
    .map((d) => {
      let entry = d;
      if (entry[`${type}_tags`]) {
        entry = R.assoc(
          `${type}_tags`,
          entry[`${type}_tags`].map((t) => tagsMap[t]?.tag_name),
          entry,
        );
      }
      if (entry[`${type}_exercises`]) {
        entry = R.assoc(
          `${type}_exercises`,
          entry[`${type}_exercises`].map((e) => exercisesMap[e]?.exercise_name),
          entry,
        );
      }
      if (entry[`${type}_organization`]) {
        entry = R.assoc(
          `${type}_organization`,
          organizationsMap[entry[`${type}_organization`]]?.organization_name,
          entry,
        );
      }
      if (entry.inject_content) {
        entry = R.assoc(
          'inject_content',
          JSON.stringify(entry.inject_content),
          entry,
        );
      }
      return R.mapObjIndexed(escape, entry);
    });
};
