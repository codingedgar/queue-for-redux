"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var actions_1 = require("./actions");
/**
 * Custom middleware that can consume the action before it can reach the reducer.
 *
 * This is useful when we want to optimistically update the local state,
 * but the same action will be dispatched again when it is fired from the offline queue.
 * To avoid updating the state again we change its type to one no reducer reacts to.
 *
 * For the action to be consumed it should have:
 * ```
 * consume: true
 * ```
 * property set.
 *
 * Note: For this to work correctly it should be placed as the last middleware in the chain.
 * For example, we do want the saga or logger to react to this action.
 */
function consumeActionMiddleware() {
    return function (store) { return function (next) { return function (action) {
        var shouldConsumeAction = lodash_1.default.get(action, 'meta.queue.times', 0) > 0;
        if (shouldConsumeAction) {
            return next({ type: actions_1.CONSUME, payload: __assign({}, action) });
        }
        return next(action);
    }; }; };
}
exports.default = consumeActionMiddleware;
