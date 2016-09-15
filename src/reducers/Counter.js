import {INCREMENT_COUNTER, DECREMENT_COUNTER} from '../constants/ActionTypes';
import {Map} from 'immutable';

export const counter = (state = Map(), action) => {

  switch (action.type) {
    case INCREMENT_COUNTER:
      var incrementState = state.withMutations(function (state) {
        state.set('count', state.get('count') + 1)
        state.updateIn(['lines'], list => list.push('new line ' + state.get('count')));
      });
      console.log(incrementState);
      return incrementState;

    case DECREMENT_COUNTER:
      var decrementState = state.withMutations(function (state) {
        state.set('count', state.get('count') - 1)
        state.updateIn(['lines'], list => list.pop());
      });
      console.log(decrementState);
      return decrementState;

    default:
      return state;
  }
}

export default counter;