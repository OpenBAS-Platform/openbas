import {createSelectorCreator, defaultMemoize} from 'reselect'
import {is, Iterable} from 'immutable'
import diff from 'immutablediff'
import R from 'ramda'

const customComparator = (previousState, state) => {
    if (Iterable.isIterable(previousState) && Iterable.isIterable(state)) {
        var isStateUnchanged = is(previousState, state);
        if (process.env.NODE_ENV === 'development' && !isStateUnchanged) {
            console.warn("Component will re-render because of", diff(state, previousState))
        }
        return isStateUnchanged
    } else {
        console.error("You should use Immutable structure in your redux select")
        return R.equals(previousState, state)
    }
}
export default createSelectorCreator(defaultMemoize, customComparator)