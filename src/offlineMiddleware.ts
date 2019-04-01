import _ from 'lodash'

import INITIAL_STATE from './initialState'
import {
  QUEUE_ACTION,
  RETRY_ALL,
  RETRY,
  REMOVE
} from './actions'
import getConfig from './config'
import { view, lensPath } from 'ramda';
import moment from 'moment'
import { enhaceInitial } from './sharedAlgorithms/enhanceAction';

/**
 * Helper method to dispatch the queued action again when the connection is available.
 *
 * It will modify the original action by adding:
 * ```
 * consume: true
 * ```
 * to skip firing the reducer
 * and:
 * ```
 * meta: {
 *   queueIfOffline: false
 * }
 * ```
 * to avoid putting it back to the queue.
 *
 * @param {Array} queue An array of queued Redux actions.
 * @param {Function} dispatch Redux's dispatch function.
 */
function fireQueuedActions(queue, dispatch) {

  function shouldRetryQueuedAction(action) {
    const time = moment(action.meta.queue.throttle)
    return time.isBefore(moment())
  }

  queue.forEach((actionInQueue) => {

    if (shouldRetryQueuedAction(actionInQueue)) {

      const actionToRemove = {
        type: RETRY,
        payload: { ...actionInQueue }
      }

      dispatch(actionToRemove)
    }

  })
}

/**
 * Custom Redux middleware for providing an offline queue functionality.
 *
 * Every action that should be queued if the device is offline should have:
 * ```
 * meta: {
 *   queueIfOffline: true
 * }
 * ```
 * property set.
 *
 * When the device is online this just passes the action to the next middleware as is.
 *
 * When the device is offline this action will be placed in an offline queue.
 * Those actions are later dispatched again when the device comes online.
 * Note that this action is still dispatched to make the optimistic updates possible.
 * However it wil have `suspendSaga: true` property set
 * for the `suspendSaga` wrapper to skip the corresponding saga.
 *
 * Note that this queue is not persisted by itself.
 * One should provide a persistence config by using e.g.
 * `redux-persist` to keep the offline queue persisted.
 *
 * @param {Object} userConfig See: config.js for the configuration options.
 */
export default function offlineMiddleware(userConfig = {}) {
  return ({ getState, dispatch }) => next => (action) => {

    const config = getConfig(userConfig)

    const context = {
      getState,
      dispatch,
      next,
      action,
      config
    }

    if (isRetry(context)) {
      return retry(context)
    } else if (isQueueable(context)) {
      return queue(context)
    } else if (isRetryAll(context)) {
      return retryAll(context)
    } else {
      return next(action)
    }

  }
}

function isRetryAll({ getState, dispatch, next, action, config }) {

  const { stateName, additionalTriggers } = config

  const state = _.get(getState(), stateName, INITIAL_STATE)

  const { suspendSaga } = state

  return !suspendSaga && action.type === RETRY_ALL || _.includes(additionalTriggers, action.type)
}

function retryAll({ getState, dispatch, next, action, config }) {

  const { stateName } = config

  const result = next(action)
  const { queue } = _.get(getState(), stateName)

  fireQueuedActions(queue, dispatch)

  return result

}

function isRetry({ getState, dispatch, next, action }) {
  return action.type === RETRY
}

function retry({ getState, dispatch, next, action, config }) {

  const { stateName } = config

  const state = _.get(getState(), stateName, INITIAL_STATE)

  const { queue, suspendSaga } = state
  const nextResult = next(action)

  if (!suspendSaga) {

    const actionToRetry = _.find(
      queue,
      actionInQueue => {
        const idOfActionInQueue = _.get(actionInQueue, 'meta.queue.id')
        const idOfActionToRetry = _.get(action, 'payload.meta.queue.id')

        return (
          idOfActionInQueue &&
          idOfActionToRetry &&
          (idOfActionInQueue === idOfActionToRetry)
        )
      }
    )

    if (actionToRetry) {

      const actionToRemove = {
        type: REMOVE,
        payload: { ...actionToRetry }
      }
      dispatch(actionToRemove)
      dispatch(actionToRetry)
    }

  }

  return nextResult;
}

function isQueueable({ action }) {

  const isInScope = _.get(action, ['meta', 'queue', 'enqueue'], false);
  const ttl = view(lensPath(['meta', 'queue', 'ttl']), action)

  const isAlive = ttl ? moment(ttl).isSameOrAfter() : true

  return isInScope && isAlive;
}

function queue({ getState, dispatch, next, action, config }) {

  let enhacedAction = action

  if (isFirstTime(action)) {
    enhacedAction = enhaceInitial(action)
  }

  const nextResult = next(enhacedAction)

  const actionToQueue = {
    type: QUEUE_ACTION,
    payload: { ...enhacedAction }
  }

  dispatch(actionToQueue)

  return nextResult;

}

function isFirstTime(action) {
  return view(lensPath(['meta', 'queue', 'times']), action) === undefined
}