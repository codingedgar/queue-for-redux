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

    describe(RETRY_ACTION_IN_QUEUE, () => {

        it('should go to sixth state', () => {
            const omitThrottleInAction = over(
                lensPath(['meta', 'queue']),
                omit(['throttle'])
            )
            times(
                () => {
                    const state = generateAnyNotSuspendSagaState()
                    const queue = view<Array<any>, any>(lensPath(['offline', 'queue']), state)
                    if (queue.length > 0) {
                        const action = generateAction(RETRY_ACTION_IN_QUEUE, queue)
                        const pipeline = passThroughPipeline(state, action)
                        const resultState = pipeline.store.getState()

                        if (isAlive(action.payload)) {

                            const resultStateWithoutThrottle = over(
                                lensPath(['offline', 'queue', queue.length - 1]),
                                omitThrottleInAction,
                                resultState
                            )

                            const actionLefts = actionsLeft(queue, action)

                            const stateWithoutAction = set(
                                lensPath(['offline', 'queue']),
                                [...actionLefts, incrementMetaCounter(omitThrottleInAction(action.payload))],
                                state
                            )

                            expect(resultStateWithoutThrottle).toEqual(stateWithoutAction)

                        } else {

                            const actionLefts = actionsLeft(queue, action)
                            const stateWithoutAction = set(
                                lensPath(['offline', 'queue']),
                                actionLefts,
                                state
                            )

                            expect(resultState).toEqual(stateWithoutAction)

                        }
                    } else {
                        // impossible state
                    }

                },
                100
            )

        })

        it('action should reach reducer', () => {
            times(() => {

                const state = generateAnyNotSuspendSagaState()
                const queue = view<Array<any>, any>(lensPath(['offline', 'queue']), state)

                if (queue.length > 0) {

                    const action = generateAction(RETRY_ACTION_IN_QUEUE, queue)
                    const pipeline = passThroughPipeline(state, action)

                    if (isAlive(action.payload)) {

                        expect(pipeline.gotToReducerSpy).toHaveBeenCalledTimes(4)
                        expect(pipeline.gotToReducerSpy.mock.calls).toEqual([
                            [action],
                            [generateAction(REMOVE_ACTION_IN_QUEUE, [action.payload])],
                            [generateAction(CONSUME_FIRST_FROM_QUEUE, [action.payload])],
                            [generateAction(ENQUEUE_ACTION_IN_QUEUE, [action.payload])],
                        ])

                    } else {

                        expect(pipeline.gotToReducerSpy).toHaveBeenCalledTimes(3)
                        expect(pipeline.gotToReducerSpy.mock.calls).toEqual([
                            [action],
                            [generateAction(REMOVE_ACTION_IN_QUEUE, [action.payload])],
                            [generateAction(CONSUME_FIRST_FROM_QUEUE, [action.payload])],
                        ])

                    }

                } else {
                    // impossible state
                }
            },
                100
            )

        })

        it('action should reach saga', () => {
            times(() => {

                const state = generateAnyNotSuspendSagaState()
                const queue = view<Array<any>, any>(lensPath(['offline', 'queue']), state)

                if (queue.length > 0) {

                    const action = generateAction(RETRY_ACTION_IN_QUEUE, queue)
                    const pipeline = passThroughPipeline(state, action)

                    if (isAlive(action.payload)) {

                        expect(pipeline.sagaMiddlewareSpy).toHaveBeenCalledTimes(4)
                        expect(pipeline.sagaMiddlewareSpy.mock.calls).toEqual([
                            [action],
                            [generateAction(REMOVE_ACTION_IN_QUEUE, [action.payload])],
                            [action.payload],
                            [generateAction(ENQUEUE_ACTION_IN_QUEUE, [action.payload])],
                        ])

                    } else {

                        expect(pipeline.sagaMiddlewareSpy).toHaveBeenCalledTimes(3)
                        expect(pipeline.sagaMiddlewareSpy.mock.calls).toEqual([
                            [action],
                            [generateAction(REMOVE_ACTION_IN_QUEUE, [action.payload])],
                            [action.payload],
                        ])

                    }

                } else {
                    // impossible state
                }
            },
                100
            )

        })

    })

})
