import {
    generateNonQueueableAction,
    generateQueueableAction,
    generateQueueableActionNotInQueue,
    selectQueueableActionInQueue,
    generateAutoEnqueueActionTrue,
    generateAutoEnqueueActionFalse,
    generateRetryAllAction,
    generateEnqueueActionActionNotInQueue,
    generateEnqueueActionActionInQueue,
    generateRetryActionActionNotInQueue,
    generateRetryActionActionInQueue,
    generateRemoveActionActionNotInQueue,
    generateRemoveActionActionInQueue,
    generateActionInQueue,
    generateConsumeAction
} from "./actionGenerators";

export const ANY_NON_QUEUEABLE_ACTION = 'ANY_NON_QUEUEABLE_ACTION';
export const ANY_QUEUEABLE_ACTION_NOT_IN_QUEUE = 'ANY_QUEUEABLE_ACTION_NOT_IN_QUEUE'
export const ANY_QUEUEABLE_ACTION_IN_QUEUE = 'ANY_QUEUEABLE_ACTION_IN_QUEUE'
export const SUSPEND_SAGA_TRUE = 'SUSPEND_SAGA_TRUE'
export const SUSPEND_SAGA_FALSE = 'SUSPEND_SAGA_FALSE'
export const RETRY_ALL = 'RETRY_ALL'
export const ENQUEUE_ACTION_NOT_IN_QUEUE = 'ENQUEUE_ACTION_NOT_IN_QUEUE'
export const ENQUEUE_ACTION_IN_QUEUE = 'ENQUEUE_ACTION_IN_QUEUE'
export const RETRY_ACTION_NOT_IN_QUEUE = 'RETRY_ACTION_NOT_IN_QUEUE'
export const RETRY_ACTION_IN_QUEUE = 'RETRY_ACTION_IN_QUEUE'
export const REMOVE_ACTION_NOT_IN_QUEUE = 'REMOVE_ACTION_NOT_IN_QUEUE'
export const REMOVE_ACTION_IN_QUEUE = 'REMOVE_ACTION_IN_QUEUE'
export const ACTION_IN_QUEUE = 'ACTION_IN_QUEUE'
export const CONSUME_FIRST_FROM_QUEUE = 'CONSUME'

export const actions = [
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
]

export function generateAction(type, queue) {
    switch (type) {

        case ANY_NON_QUEUEABLE_ACTION:
            return generateNonQueueableAction(queue);
        case ANY_QUEUEABLE_ACTION_NOT_IN_QUEUE:
            return generateQueueableActionNotInQueue(queue);
        case ANY_QUEUEABLE_ACTION_IN_QUEUE:
            return selectQueueableActionInQueue(queue);
        case SUSPEND_SAGA_TRUE:
            return generateAutoEnqueueActionTrue(queue);
        case SUSPEND_SAGA_FALSE:
            return generateAutoEnqueueActionFalse(queue);
        case RETRY_ALL:
            return generateRetryAllAction(queue);
        case ENQUEUE_ACTION_NOT_IN_QUEUE:
            return generateEnqueueActionActionNotInQueue(queue)
        case ENQUEUE_ACTION_IN_QUEUE:
            return generateEnqueueActionActionInQueue(queue)
        case RETRY_ACTION_NOT_IN_QUEUE:
            return generateRetryActionActionNotInQueue(queue)
        case RETRY_ACTION_IN_QUEUE:
            return generateRetryActionActionInQueue(queue)
        case REMOVE_ACTION_NOT_IN_QUEUE:
            return generateRemoveActionActionNotInQueue(queue)
        case REMOVE_ACTION_IN_QUEUE:
            return generateRemoveActionActionInQueue(queue)
        case ACTION_IN_QUEUE:
            return generateActionInQueue(queue)
        case CONSUME_FIRST_FROM_QUEUE:
            return generateConsumeAction(queue)
    }
}