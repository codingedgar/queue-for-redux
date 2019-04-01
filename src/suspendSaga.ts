import _ from "lodash";
import getConfig from './config'
import INITIAL_STATE from './initialState'

/**
 * Custom wrapper for the saga middleware that can skip firing the saga.
 *
 * In case of the offline action we do want it to be dispatched
 * so that the reducer updates the local state in a optimistic manner.
 *
 * However since we know for sure that the device is offline
 * the corresponding saga should not be fired.
 *
 * For the action to skip the saga it should have:
 * ```
 * suspendSaga: true
 * ```
 * property set.
 *
 * Note: One should wrap the existing saga middleware for this to work correctly,
 * for example:
 * ```
 * const sagaMiddleware = createSagaMiddleware()
 * const suspendSagaMiddleware = suspendSaga(sagaMiddleware)
 * ```
 *
 * @param {Function} middleware Saga middleware.
 */
export default function suspendSaga(middleware) {
  return store => (next) => {
    const delegate = middleware(store)(next)

    return (action) => {
      if (
        shouldSuspendSaga(store, action)
      ) {
        return next(action)
      } else {
        return delegate(action)
      }
    }
  }
}

function shouldSuspendSaga(store, action) {

  const { stateName } = getConfig()

  const state = _.get(store.getState(), stateName, INITIAL_STATE)

  const { suspendSaga } = state;
  const should = _.get(action, 'meta.queue.enqueue', false) === true &&
    suspendSaga

  return should
}