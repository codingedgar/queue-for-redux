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
var actions_1 = require("./actions");
var moment_1 = __importDefault(require("moment"));
function fireQueuedActions(queue, dispatch) {
    function shouldRetryQueuedAction(action) {
        var time = moment_1.default(action.meta.queue.throttle);
        return time.isBefore(moment_1.default());
    }
    queue.forEach(function (actionInQueue) {
        if (shouldRetryQueuedAction(actionInQueue)) {
            var actionToRemove = {
                type: actions_1.RETRY,
                payload: __assign({}, actionInQueue)
            };
            dispatch(actionToRemove);
        }
    });
}
exports.fireQueuedActions = fireQueuedActions;
