import {
  RETRY,
} from './actions'

import moment from 'moment'

export function fireQueuedActions(queue, dispatch) {

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