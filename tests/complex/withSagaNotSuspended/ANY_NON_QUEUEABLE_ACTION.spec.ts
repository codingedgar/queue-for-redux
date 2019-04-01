import { times } from "ramda";

import {
    ANY_NON_QUEUEABLE_ACTION,
    generateAction,
} from "../../utils/actions";

import { passThroughPipeline, generateAnyNotSuspendSagaState } from "../../utils/utils";

describe('from sixth state', () => {

    describe(ANY_NON_QUEUEABLE_ACTION, () => {

        it('should go to sixth state', () => {

            times(
                () => {
                    const state = generateAnyNotSuspendSagaState()
                    const action = generateAction(ANY_NON_QUEUEABLE_ACTION, [])

                    const pipeline = passThroughPipeline(state, action)

                    expect(pipeline.store.getState()).toEqual(state)

                },
                100
            )

        })

        it('action should reach reducer', () => {
            times(() => {

                const state = generateAnyNotSuspendSagaState()
                const action = generateAction(ANY_NON_QUEUEABLE_ACTION,[])
                const pipeline = passThroughPipeline(state, action)

                expect(pipeline.gotToReducerSpy).toHaveBeenCalledTimes(1)
                expect(pipeline.gotToReducerSpy.mock.calls).toEqual([
                    [action],
                ])
            },
                100
            )

        })

        it('action should reach saga', () => {
            times(() => {

                const state = generateAnyNotSuspendSagaState()
                const action = generateAction(ANY_NON_QUEUEABLE_ACTION,[])
                const pipeline = passThroughPipeline(state, action)

                expect(pipeline.sagaMiddlewareSpy).toHaveBeenCalledTimes(1)
                expect(pipeline.sagaMiddlewareSpy.mock.calls).toEqual([
                    [action],
                ])

            },
                100
            )

        })

    })

})
