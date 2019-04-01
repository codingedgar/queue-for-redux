import {
    times,
    last,
    over,
    lensPath,
    init,
    view,
    pipe,
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

import {
    passThroughPipeline,
    generateAnySuspendSagaState,
    decrementMetaCounter,
    fromLastElementInQueueToFirstTimeEnhaced
} from "../../utils/utils";
import moment from 'moment'

describe('from sixth state', () => {

    describe(ANY_QUEUEABLE_ACTION_NOT_IN_QUEUE, () => {

        it('should go to sixth state', () => {

            times(
                () => {
                    const state = generateAnySuspendSagaState()
                    const action = generateAction(ANY_QUEUEABLE_ACTION_NOT_IN_QUEUE, [])

                    const pipeline = passThroughPipeline(state, action)

                    const resultState = pipeline.store.getState()
                    const resultStateWithoutLastElementInQueue = over(
                        lensPath(['offline', 'queue']),
                        init,
                        resultState
                    )
                    const lastElementInResult = pipe(
                        view(lensPath(['offline', 'queue'])),
                        last
                    )(resultState)

                    expect(resultStateWithoutLastElementInQueue).toEqual(state)

                    expect(lastElementInResult).toMatchObject(action)
                    expect(lastElementInResult).toHaveProperty('meta.queue.id')
                    expect(lastElementInResult).toHaveProperty('meta.queue.times', 1)
                    expect(lastElementInResult).toHaveProperty('meta.queue.ttl')
                    expect(lastElementInResult).toHaveProperty('meta.queue.throttle')
                    expect(moment(lastElementInResult.meta.queue.ttl, moment.ISO_8601, true).isValid()).toBeTruthy()
                    expect(moment(lastElementInResult.meta.queue.throttle, moment.ISO_8601, true).isValid()).toBeTruthy()
                    expect(moment(lastElementInResult.meta.queue.throttle).diff(moment(), 'minutes', true)).toBeGreaterThan(0)
                    expect(moment(lastElementInResult.meta.queue.throttle).diff(moment(), 'minutes', true)).toBeLessThanOrEqual(1)

                },
                100
            )

        })

        it('action should reach reducer', () => {
            times(() => {

                const state = generateAnySuspendSagaState()
                const action = generateAction(ANY_QUEUEABLE_ACTION_NOT_IN_QUEUE, [])
                const pipeline = passThroughPipeline(state, action)
                const resultState = pipeline.store.getState()

                const lastElementInResult = pipe(
                    view(lensPath(['offline', 'queue'])),
                    last
                )(resultState)

                expect(pipeline.gotToReducerSpy).toHaveBeenCalledTimes(2)
                expect(pipeline.gotToReducerSpy.mock.calls).toEqual([
                    [fromLastElementInQueueToFirstTimeEnhaced(lastElementInResult)],
                    [generateAction(ENQUEUE_ACTION_IN_QUEUE, [fromLastElementInQueueToFirstTimeEnhaced(lastElementInResult)])],
                ])
            },
                100
            )

        })

        it('action should reach saga', () => {
            times(() => {
                const state = generateAnySuspendSagaState()
                const action = generateAction(ANY_QUEUEABLE_ACTION_NOT_IN_QUEUE, [])

                const pipeline = passThroughPipeline(state, action)

                const resultState = pipeline.store.getState()

                const lastElementInResult = pipe(
                    view(lensPath(['offline', 'queue'])),
                    last
                )(resultState)

                expect(pipeline.sagaMiddlewareSpy).toHaveBeenCalledTimes(1)
                expect(pipeline.sagaMiddlewareSpy.mock.calls).toEqual([
                    [generateAction(ENQUEUE_ACTION_IN_QUEUE, [fromLastElementInQueueToFirstTimeEnhaced(lastElementInResult)])],
                ])
            },
                100
            )

        })

    })

})
