import {
    times,
    map,
    last,
    over,
    lensPath,
    init,
    view,
    pipe,
    omit,
    set,
    into,
    compose,
    chain,
    ifElse,
    identity
} from "ramda";

import {
    ANY_NON_QUEUEABLE_ACTION,
    ANY_QUEUEABLE_ACTION_NOT_IN_QUEUE,
    ANY_QUEUEABLE_ACTION_IN_QUEUE,
    SUSPEND_SAGA_TRUE,
    SUSPEND_SAGA_FALSE,
    RETRY_ALL,
    ENQUEUE_ACTION_NOT_IN_QUEUE,
    ENQUEUE_ACTION_IN_QUEUE,
    RETRY_ACTION_NOT_IN_QUEUE,
    RETRY_ACTION_IN_QUEUE,
    REMOVE_ACTION_NOT_IN_QUEUE,
    REMOVE_ACTION_IN_QUEUE,
    ACTION_IN_QUEUE,
    generateAction,
    CONSUME_FIRST_FROM_QUEUE,
} from "../../utils/actions";

import { actionsLeft, incrementMetaCounter, passThroughPipeline, splitAlive, splitThrottled, isAlive, isThrottled, generateAnyNotSuspendSagaState } from "../../utils/utils";

import moment from 'moment'

describe('from sixth state', () => {

    describe(SUSPEND_SAGA_TRUE, () => {

        it('should go to fift state', () => {

            times(
                () => {
                    const state = generateAnyNotSuspendSagaState()

                    const action = generateAction(SUSPEND_SAGA_TRUE,[])
                    const pipeline = passThroughPipeline(state, action)
                    const resultState = pipeline.store.getState()

                    const stateWithSagaSuspended = set(
                        lensPath(['offline', 'suspendSaga']),
                        true,
                        state
                    )

                    expect(resultState).toEqual(stateWithSagaSuspended)

                },
                100
            )

        })

        it('action should reach reducer', () => {
            times(() => {

                const state = generateAnyNotSuspendSagaState()

                const action = generateAction(SUSPEND_SAGA_TRUE,[])
                const pipeline = passThroughPipeline(state, action)

                expect(pipeline.gotToReducerSpy).toHaveBeenCalledTimes(1)
                expect(pipeline.gotToReducerSpy.mock.calls).toEqual([
                    [action]
                ])
            },
                100
            )

        })

        it('action should reach saga', () => {
            times(() => {

                const state = generateAnyNotSuspendSagaState()

                const action = generateAction(SUSPEND_SAGA_TRUE,[])
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
