export const logger = store => next => action => {
  console.log('dispatching', action)
  try {
    let result = next(action)
    console.log('next state', store.getState())
    return result
  } catch (err) {
    console.error('Caught an exception!', err)
    throw err
  }
}