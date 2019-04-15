import { REHYDRATE } from 'redux-persist'
import { get, filter } from "lodash";

import INITIAL_STATE from './initialState'
import {
    QUEUE_ACTION,
    SUSPEND_SAGA,
    REMOVE,
    RETRY,
    RESET,
    RESET_THROTTLE
} from './actions'
import { enhace } from './sharedAlgorithms/enhanceAction';
import { resetThrottle } from './sharedAlgorithms/throttle';
import getConfig from './config';

export default function reducer(userConfig?: UserConfig) {
    const config = getConfig(userConfig)
    return (state: Store = INITIAL_STATE, action: action) => {
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
                return { ...state, queue: state.queue.concat(enhace(config, action.payload)) }
            case REMOVE:
                return removeFromQueue(state, action)
            case RESET_THROTTLE:
                return resetThrottle(state, action)
            case RETRY:
            default:
                return state
        }
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