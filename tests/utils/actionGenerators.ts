import {
    SUSPEND_SAGA,
    RETRY_ALL,
    RETRY,
    QUEUE_ACTION,
    REMOVE,
    CONSUME,
    RESET_THROTTLE
} from "../../src/actions";
import faker from 'faker';
import {v1 as uuid} from 'uuid'
import { splitThrottled, splitAlive } from "./utils";

export function generateQueueableAction() {
    return {
        type: faker.random.word(),
        payload: {
        },
        meta: {
            queue: {
                enqueue: true
            }
        }
    }
}


export function generateNonQueueableAction(queue) {
    return {
        type: faker.random.word(),
        payload: faker.random.word(),
    }
}


export function selectQueueableActionInQueue(queue) {
    const [throttled, retry] = splitThrottled(queue)
    const [alive, dead] = splitAlive(retry)

    return faker.random.arrayElement(alive)

}
export function selectActionInQueue(queue) {

    return faker.random.arrayElement(queue)

}

export function generateQueueableActionNotInQueue(queue) {
    return {
        type: faker.random.word(),
        meta: {
            queue: {
                enqueue: true
            }
        }
    }
}

export function generateAutoEnqueueActionTrue(queue) {
    return {
        type: SUSPEND_SAGA,
        payload: {
            value: true
        }
    }
}

export function generateAutoEnqueueActionFalse(queue) {
    return {
        type: SUSPEND_SAGA,
        payload: {
            value: false
        }
    }
}

export function generateRetryAllAction(queue) {
    return {
        type: RETRY_ALL
    }
}

export function generateEnqueueActionActionNotInQueue(queue) {
    return {
        type: QUEUE_ACTION,
        payload: {
            ...generateQueueableActionNotInQueue(queue)
        }
    }
}

export function generateEnqueueActionActionInQueue(queue) {
    return {
        type: QUEUE_ACTION,
        payload: selectActionInQueue(queue)
    }
}

export function generateRetryActionActionNotInQueue(queue) {
    return {
        type: RETRY,
        payload: generateQueueableActionNotInQueue(queue)
    }
}

export function generateRetryActionActionInQueue(queue) {

    return {
        type: RETRY,
        payload: selectActionInQueue(queue)
    }

}

export function generateRemoveActionActionNotInQueue(queue) {

    return {
        type: REMOVE,
        payload: generateQueueableActionNotInQueue(queue)
    }

}

export function generateRemoveActionActionInQueue(queue) {

    return {
        type: REMOVE,
        payload: selectActionInQueue(queue)
    }

}

export function generateActionInQueue(queue) {

    return {
        type: faker.random.word(),
        payload: {
        },
        meta: {
            queue: {
                enqueue: true,
                id: uuid(),
                times: 10
            }
        }
    }

}

export function generateConsumeAction(queue) {

    return {
        type: CONSUME,
        payload: {
            ...queue[0]
        },
    }

}

export function generateResetThrottleAction(queue) {

    return {
        type: RESET_THROTTLE,
        payload: {
            ...queue[0]
        },
    }

}

