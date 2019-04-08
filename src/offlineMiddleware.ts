import _ from 'lodash'

import INITIAL_STATE from './initialState'
import {
  QUEUE_ACTION,
  RETRY_ALL,
  RETRY,
  REMOVE,
} from './actions'
import getConfig from './config'
import { view, lensPath } from 'ramda';
import moment from 'moment'
import { enhaceInitial } from './sharedAlgorithms/enhanceAction';
import { fireQueuedActions } from "./fireQueuedActions";

export default function offlineMiddleware(userConfig: UserConfig = {}) {
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

function isRetryAll({ getState, dispatch, next, action, config }: MiddlewareContext) {

  const { stateName } = config

  const state = _.get(getState(), stateName, INITIAL_STATE)

  const { suspendSaga } = state

  return !suspendSaga && action.type === RETRY_ALL
}

function retryAll({ getState, dispatch, next, action, config }: MiddlewareContext) {

  const { stateName } = config

  const result = next(action)
  const { queue } = _.get(getState(), stateName)

  fireQueuedActions(queue, dispatch)

  return result

}

function isRetry({ getState, dispatch, next, action }: MiddlewareContext) {
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

function isQueueable({ action }: MiddlewareContext) {

  const isInScope = _.get(action, ['meta', 'queue', 'enqueue'], false);
  const ttl = view(lensPath(['meta', 'queue', 'ttl']), action)

  const isAlive = ttl ? moment(ttl).isSameOrAfter() : true

  return isInScope && isAlive;
}

function queue({ getState, dispatch, next, action, config }: MiddlewareContext) {

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