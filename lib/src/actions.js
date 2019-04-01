"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ACTION_PREFIX = 'queue-for-redux/';
/**
 * External actions.
 * Should be called from the outside to property set the connection state.
 *
 * We're doing it this way to not couple tighly with react-native and make it possible
 * to use the queue in a different environment.
 */
exports.SUSPEND_SAGA = ACTION_PREFIX + "SUSPEND_SAGA";
exports.RETRY_ALL = ACTION_PREFIX + "RETRY_ALL";
exports.RETRY = ACTION_PREFIX + "RETRY";
exports.REMOVE = ACTION_PREFIX + "REMOVE";
exports.CONSUME = ACTION_PREFIX + "CONSUME";
exports.RESET = ACTION_PREFIX + "RESET";
/**
 * Internal actions.
 * These are fired to manage the internal offline queue state.
 */
exports.QUEUE_ACTION = ACTION_PREFIX + "QUEUE_ACTION";
