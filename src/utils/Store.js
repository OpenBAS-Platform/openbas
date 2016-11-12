import {Map} from 'immutable';

export const mergeStore = (state, action, path) => {
  const elements = state.getIn(path) || Map()
  return state.setIn(path, elements.merge(action.payload.getIn(path)))
}