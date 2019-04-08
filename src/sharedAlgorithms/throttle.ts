import { RESET_THROTTLE } from "../actions";
import { view, lensProp, over, pipe, concat, lensPath, reject, any } from "ramda";
import { enhanceResetThrottle } from "./enhanceAction";

export function isResetThrottle({ action }: MiddlewareContext) {
  return action.type === RESET_THROTTLE
}

export function resetThrottle(state, action: action) {

  return over(
    lensProp('queue'),
    pipe<any, any>(
      removeFromQueue(action),
      queue => ([...queue, enhanceResetThrottle(action.payload)])
    ),
    state
  )

}

function removeFromQueue(actionToRemove) {

  const removeId = view(lensPath(['payload', 'meta', 'queue', 'id']), actionToRemove)

  return reject(action => {
    const actionId = view(lensPath(['meta', 'queue', 'id']), action)
    return removeId === actionId
  })

}