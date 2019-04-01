"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var config_1 = __importDefault(require("./config"));
var initialState_1 = __importDefault(require("./initialState"));
/**
 * Custom wrapper for the saga middleware that can skip firing the saga.
 *
 * In case of the offline action we do want it to be dispatched
 * so that the reducer updates the local state in a optimistic manner.
 *
 * However since we know for sure that the device is offline
 * the corresponding saga should not be fired.
 *
 * For the action to skip the saga it should have:
 * ```
 * suspendSaga: true
 * ```
 * property set.
 *
 * Note: One should wrap the existing saga middleware for this to work correctly,
 * for example:
 * ```
 * const sagaMiddleware = createSagaMiddleware()
 * const suspendSagaMiddleware = suspendSaga(sagaMiddleware)
 * ```
 *
 * @param {Function} middleware Saga middleware.
 */
function suspendSaga(middleware) {
    return function (store) { return function (next) {
        var delegate = middleware(store)(next);
        return function (action) {
            if (shouldSuspendSaga(store, action)) {
                return next(action);
            }
            else {
                return delegate(action);
            }
        };
    }; };
}
exports.default = suspendSaga;
function shouldSuspendSaga(store, action) {
    var stateName = config_1.default().stateName;
    var state = lodash_1.default.get(store.getState(), stateName, initialState_1.default);
    var suspendSaga = state.suspendSaga;
    var should = lodash_1.default.get(action, 'meta.queue.enqueue', false) === true &&
        suspendSaga;
    return should;
}
