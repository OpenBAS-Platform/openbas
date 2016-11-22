import {Map} from 'immutable';

export const mergeStore = (state, action, path) => {
  const elements = state.getIn(path) || Map()
  return state.setIn(path, elements.merge(action.payload.getIn(path)))
}

export const mergeStoreDeep = (state, action, path) => {
  const elements = state.getIn(path) || Map()
  return state.setIn(path, elements.mergeDeep(action.payload.getIn(path)))
}