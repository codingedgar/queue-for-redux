import {
  times,
  over,
  lensPath,
  view,
  omit,
  set,
} from "ramda";

import {
  generateAction,
  RESET_THROTTLE
} from "../../utils/actions";

import {
  actionsLeft,
  passThroughPipeline,
  generateAnySuspendSagaState
} from "../../utils/utils";

import moment from 'moment'

describe('from sixth state', () => {

  describe(RESET_THROTTLE, () => {

    it('should go to sixth state', () => {
      const omitThrottleInAction = over(
        lensPath(['meta', 'queue']),
        omit(['throttle'])
      )
      times(
        () => {
          const state = generateAnySuspendSagaState()
          const queue = view<Array<any>, any>(lensPath(['offline', 'queue']), state)
          if (queue.length > 0) {
            const action = generateAction(RESET_THROTTLE, queue)
            const pipeline = passThroughPipeline(state, action)
            const resultState = pipeline.store.getState()

            const resultStateWithoutThrottle = over(
              lensPath(['offline', 'queue', queue.length - 1]),
              omitThrottleInAction,
              resultState
            )

            const actionLefts = actionsLeft(queue, action)

            const stateWithoutAction = set(
              lensPath(['offline', 'queue']),
              [...actionLefts, omitThrottleInAction(action.payload)],
              state
            )

            const actionThrottleFromResultState = view<any, any>(lensPath(['offline', 'queue', queue.length - 1, 'meta', 'queue', 'throttle']), resultState)

            expect(resultStateWithoutThrottle).toEqual(stateWithoutAction)

            expect(moment().diff(actionThrottleFromResultState, 'minutes', true)).toBeGreaterThanOrEqual(0)
            expect(moment().diff(actionThrottleFromResultState, 'minutes', true)).toBeLessThanOrEqual(1)
          } else {
            // impossible state
          }

        },
        100
      )

    })

    it('action should reach reducer', () => {
      times(() => {

        const state = generateAnySuspendSagaState()
        const queue = view<Array<any>, any>(lensPath(['offline', 'queue']), state)

        if (queue.length > 0) {

          const action = generateAction(RESET_THROTTLE, queue)
          const pipeline = passThroughPipeline(state, action)

          expect(pipeline.gotToReducerSpy).toHaveBeenCalledTimes(1)
          expect(pipeline.gotToReducerSpy.mock.calls).toEqual([
            [action],
          ])

        } else {
          // impossible state
        }
      },
        100
      )

    })

    it('action should reach saga', () => {
      times(() => {

        const state = generateAnySuspendSagaState()
        const queue = view<Array<any>, any>(lensPath(['offline', 'queue']), state)

        if (queue.length > 0) {

          const action = generateAction(RESET_THROTTLE, queue)
          const pipeline = passThroughPipeline(state, action)

          expect(pipeline.sagaMiddlewareSpy).toHaveBeenCalledTimes(1)
          expect(pipeline.sagaMiddlewareSpy.mock.calls).toEqual([
            [action],
          ])

        } else {
          // impossible state
        }
      },
        100
      )

    })

  })

})
