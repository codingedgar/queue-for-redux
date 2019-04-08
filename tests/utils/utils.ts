import {
    lensPath,
    over,
    omit,
    map,
    view,
    all,
    lensIndex,
    filter,
    range,
    partition,
} from "ramda";
import { wholePipeline } from "./tearup";
import moment from 'moment'
import faker from 'faker'
import {v1 as uuid} from 'uuid'
import { Action } from "redux";

export function actionsLeft(queue: any[], actionToFind) {
    return filter(
        action => {
            return action.meta.queue.id !== actionToFind.payload.meta.queue.id
        },
        queue,
    )
}

export const metaPath = lensPath<Action, Action>(['meta', 'queue'])
export const metaIdPath = lensPath(['meta', 'queue', 'id'])

export
    const omitId = over(
        metaPath,
        omit(['id']),
    )


export const omitQueuedActionsIdsFromState = over(
    lensPath(['offline', 'queue']),
    map(
        omitId
    )
)

export const allHaveId = (state) => {

    const queue = view<any, any[]>(lensPath<any, any>(['offline', 'queue']), state)
    const isUUID = (x) => typeof view(metaIdPath, x) === 'string'

    // console.log('queue', JSON.stringify(queue))

    if (queue) {
        return all(isUUID, queue)
    } else {
        return false
    }

}


export function incrementMetaCounter(action) {
    return over<meta, Action>(
        metaPath,
        meta => ({
            ...meta,
            times: (meta.times || 0) + 1
        }),
        action
    )
}

export function decrementMetaCounter(action) {
    return over<meta, Action>(
        metaPath,
        meta => ({
            ...meta,
            times: (meta.times || 0) - 1
        }),
        action
    )
}

export const omitLastQueuedActionsIdFromState = state => over(
    lensPath(['offline', 'queue']),
    omitLastQueuedActionsId,
    state
)

export const omitLastQueuedActionsId = queue => over(
    lensIndex(queue.length - 1),
    omitId,
    queue
)

export function passThroughPipeline(preloadedState, action, config?) {

    const pipeline = wholePipeline(preloadedState, config)

    pipeline.store.dispatch(action)

    return pipeline

}


export function isThrottled(action) {
    const time = view(lensPath(['meta', 'queue', 'throttle']), action)
    return moment(time).isSameOrAfter()
}

export function isAlive(action) {
    const time = view(lensPath(['meta', 'queue', 'ttl']), action)
    return moment(time).isSameOrAfter()
}

export function splitThrottled(queue) {
    return partition<any, any[]>(
        isThrottled,
        queue
    )
}

export function splitAlive(queue) {
    return partition<any, any[]>(
        isAlive,
        queue
    )
}

export function generateAnyNotSuspendSagaState() {
    return {
        offline: {
            suspendSaga: false,
            queue: generateAnyQueue()
        }
    }
}

export function generateAnyQueue() {
    return map(
        x => generateRandomPossibleElementInQueue()
        ,
        range(0, faker.random.number(100))
    )
}

export function generateRandomPossibleElementInQueue() {
    return {
        type: faker.random.word(),
        meta: {
            queue: {
                enqueue: true,
                id: uuid(),
                times: 10,
                ttl: generateRandomTime(),
                throttle: generateRandomTime()
            }
        }
    }
}

export function generateRandomTime() {
    const now = moment()

    return faker.random.arrayElement([now.clone().subtract(1, 'day').toISOString(), now.clone().add(1, 'day').toISOString()])
}

export function generateAnySuspendSagaState() {
    return {
        offline: {
            suspendSaga: true,
            queue: generateAnyQueue()
        }
    }
}

export function fromLastElementInQueueToFirstTimeEnhaced(action) {
    return decrementMetaCounter(omitInActionMeta(action, ['throttle', 'ttl']))
}

export function omitInActionMeta(action, omits) {
    return over(
        lensPath(['meta', 'queue']),
        omit(omits),
        action
    )
}
