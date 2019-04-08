import _ from "lodash";
import getConfig from './config'
import INITIAL_STATE from './initialState'

export default function suspendSaga(middleware, config: UserConfig = {}) {
  return store => (next) => {
    const delegate = middleware(store)(next)

    return (action) => {
      if (
        shouldSuspendSaga(store, action, getConfig(config))
      ) {
        return next(action)
      } else {
        return delegate(action)
      }
    }
  }
}

function shouldSuspendSaga(store, action, config: Config) {

  const { stateName } = config

  const state = _.get(store.getState(), stateName, INITIAL_STATE)

  const { suspendSaga } = state;
  const should = _.get(action, 'meta.queue.enqueue', false) === true &&
    suspendSaga

  return should
}