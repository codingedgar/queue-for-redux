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

    describe(RETRY_ALL, () => {

        it('should go to fift state', () => {

            times(() => {
                const state = generateAnyNotSuspendSagaState()

                const action = generateAction(RETRY_ALL,[])
                const queue = view<Array<any>,any>(lensPath(['offline', 'queue']), state)

                if (queue.length > 0) {
                    const pipeline = passThroughPipeline(state, action)
                    const resultState = pipeline.store.getState()

                    const [throttled, retried] = splitThrottled(queue)
                    const [alive, dead] = splitAlive(retried)

                    const stateWithAliveElementsOnly = set(
                        lensPath(['offline', 'queue']),
                        [...throttled, ...alive],
                        state
                    )

                    const stateWithIncrementedActionsInQueue = over(
                        lensPath(['offline', 'queue']),
                        into(
                            [],
                            compose(
                                map(ifElse(isThrottled, identity, incrementMetaCounter)),
                                map(over(lensPath(['meta', 'queue']), omit(['throttle'])))
                            )
                        ),
                        stateWithAliveElementsOnly
                    )

                    const resultQueue = view<Array<any>,any>(
                        lensPath(['offline', 'queue']),
                        resultState
                    )

                    const resultStateWithoutThrottle = over(
                        lensPath(['offline', 'queue']),
                        map(over(lensPath(['meta', 'queue']), omit(['throttle']))),
                        resultState
                    )

                    expect(resultStateWithoutThrottle).toEqual(stateWithIncrementedActionsInQueue)

                    resultQueue.forEach(element => {
                        expect(element).toHaveProperty('meta.queue.id')

                        expect(element).toHaveProperty('meta.queue.ttl')
                        expect(element).toHaveProperty('meta.queue.throttle')
                        expect(moment(element.meta.queue.ttl, moment.ISO_8601, true).isValid()).toBeTruthy()
                        expect(moment(element.meta.queue.throttle, moment.ISO_8601, true).isValid()).toBeTruthy()

                        if (element.meta.queue.times > 10) {
                            expect(moment(element.meta.queue.throttle).diff(moment(), 'minutes', true)).toBeGreaterThan(0)
                            expect(moment(element.meta.queue.throttle).diff(moment(), 'minutes', true)).toBeLessThanOrEqual(1)
                        } else {
                            expect(moment(element.meta.queue.throttle).diff(moment(), 'minutes', true)).toBeGreaterThan(1)
                        }
                    });

                } else {

                }
            },
                100
            )

        })

        it('action should reach reducer', () => {
            times(() => {

                const state = generateAnyNotSuspendSagaState()

                const action = generateAction(RETRY_ALL,[])
                const queue = view<Array<any>,any>(lensPath(['offline', 'queue']), state)

                if (queue.length > 0) {
                    const pipeline = passThroughPipeline(state, action)

                    const [throttled, retried] = splitThrottled(queue)
                    const [alive, dead] = splitAlive(retried)

                    expect(pipeline.gotToReducerSpy).toHaveBeenCalledTimes(1 + (retried.length * 3) + (alive.length))
                    expect(pipeline.gotToReducerSpy.mock.calls).toEqual([
                        [action],
                        ...chain(
                            x => {

                                const events = [
                                    [generateAction(RETRY_ACTION_IN_QUEUE, [x])],
                                    [generateAction(REMOVE_ACTION_IN_QUEUE, [x])],
                                    [generateAction(CONSUME_FIRST_FROM_QUEUE, [x])],
                                ]
                                if (isAlive(x)) {
                                    events.push([generateAction(ENQUEUE_ACTION_IN_QUEUE, [x])])
                                }

                                return events
                            }
                            ,
                            retried
                        )
                    ])

                } else {

                }
            },
                100
            )

        })

        it('action should reach saga', () => {
            times(() => {

                const state = generateAnyNotSuspendSagaState()

                const action = generateAction(RETRY_ALL,[])
                const queue = view<Array<any>,any>(lensPath(['offline', 'queue']), state)

                if (queue.length > 0) {
                    const pipeline = passThroughPipeline(state, action)

                    const [throttled, retried] = splitThrottled(queue)
                    const [alive, dead] = splitAlive(retried)

                    expect(pipeline.sagaMiddlewareSpy).toHaveBeenCalledTimes(1 + (retried.length * 3) + (alive.length))
                    expect(pipeline.sagaMiddlewareSpy.mock.calls).toEqual([
                        [action],
                        ...chain(
                            x => {

                                const events = [
                                    [generateAction(RETRY_ACTION_IN_QUEUE, [x])],
                                    [generateAction(REMOVE_ACTION_IN_QUEUE, [x])],
                                    [x],
                                ]
                                if (isAlive(x)) {
                                    events.push([generateAction(ENQUEUE_ACTION_IN_QUEUE, [x])])
                                }

                                return events
                            }
                            ,
                            retried
                        )
                    ])

                } else {

                }
            },
                100
            )

        })

    })

})
