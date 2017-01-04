import {createSelectorCreator, createStructuredSelector, defaultMemoize} from 'reselect'
import {debug} from './Messages'
import R from 'ramda'

const customComparator = (previousState, state) => {
    var equals = R.equals(previousState, state);
    if(!equals) debug("Reselect", "Redisplay the react component")
    return equals
}

export const equalsSelector = (s) => createStructuredSelector(s, createSelectorCreator(defaultMemoize, customComparator))
