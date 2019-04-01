import { REHYDRATE } from 'redux-persist'
import { get, filter } from "lodash";

import INITIAL_STATE from './initialState'
import {
    QUEUE_ACTION,
    SUSPEND_SAGA,
    REMOVE,
    RETRY,
    RESET
} from './actions'
import { enhace } from './sharedAlgorithms/enhanceAction';

/**
 * Reducer for the offline queue.
 *
 * @param {Object} state Offline queue Redux store state.
 * @param {Object} action Action that was dispatched to the store.
 */
export default function reducer(state = INITIAL_STATE, action:action) {
    switch (action.type) {
        case RESET:
            return { ...INITIAL_STATE }
        case REHYDRATE: {
            // Handle rehydrating with custom shallow merge.

            if (action.payload && action.payload.offline) {
                return { ...state, ...action.payload.offline };
            }

            return state
        }
        case SUSPEND_SAGA: {
            return { ...state, suspendSaga: action.payload.value }
        }
        case QUEUE_ACTION:
            return { ...state, queue: state.queue.concat(enhace(action.payload)) }
        case REMOVE:
            return removeFromQueue(state, action)
        case RETRY:
            return state
        default:
            return state
    }
}

function removeFromQueue(state, action) {
    const removeId = get(action, 'payload.meta.queue.id')
    return {
        ...state,
        queue: filter(state.queue, action => {
            const actionId = get(action, 'meta.queue.id')
            return removeId !== actionId
        })
    }
}