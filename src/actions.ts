const ACTION_PREFIX = 'queue-for-redux/'

/**
 * External actions.
 * Should be called from the outside to property set the connection state.
 *
 * We're doing it this way to not couple tighly with react-native and make it possible
 * to use the queue in a different environment.
 */
export const SUSPEND_SAGA = `${ACTION_PREFIX}SUSPEND_SAGA`
export const RETRY_ALL = `${ACTION_PREFIX}RETRY_ALL`
export const RETRY = `${ACTION_PREFIX}RETRY`
export const REMOVE = `${ACTION_PREFIX}REMOVE`
export const CONSUME = `${ACTION_PREFIX}CONSUME`
export const RESET = `${ACTION_PREFIX}RESET`

/**
 * Internal actions.
 * These are fired to manage the internal offline queue state.
 */
export const QUEUE_ACTION = `${ACTION_PREFIX}QUEUE_ACTION`
