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
var initialState_1 = __importDefault(require("./initialState"));
var actions_1 = require("./actions");
var config_1 = __importDefault(require("./config"));
var ramda_1 = require("ramda");
var moment_1 = __importDefault(require("moment"));
var enhanceAction_1 = require("./sharedAlgorithms/enhanceAction");
var fireQueuedActions_1 = require("./fireQueuedActions");
function offlineMiddleware(userConfig) {
    if (userConfig === void 0) { userConfig = {}; }
    return function (_a) {
        var getState = _a.getState, dispatch = _a.dispatch;
        return function (next) { return function (action) {
            var config = config_1.default(userConfig);
            var context = {
                getState: getState,
                dispatch: dispatch,
                next: next,
                action: action,
                config: config
            };
            if (isRetry(context)) {
                return retry(context);
            }
            else if (isQueueable(context)) {
                return queue(context);
            }
            else if (isRetryAll(context)) {
                return retryAll(context);
            }
            else {
                return next(action);
            }
        }; };
    };
}
exports.default = offlineMiddleware;
function isRetryAll(_a) {
    var getState = _a.getState, dispatch = _a.dispatch, next = _a.next, action = _a.action, config = _a.config;
    var stateName = config.stateName;
    var state = lodash_1.default.get(getState(), stateName, initialState_1.default);
    var suspendSaga = state.suspendSaga;
    return !suspendSaga && action.type === actions_1.RETRY_ALL;
}
function retryAll(_a) {
    var getState = _a.getState, dispatch = _a.dispatch, next = _a.next, action = _a.action, config = _a.config;
    var stateName = config.stateName;
    var result = next(action);
    var queue = lodash_1.default.get(getState(), stateName).queue;
    fireQueuedActions_1.fireQueuedActions(queue, dispatch);
    return result;
}
function isRetry(_a) {
    var getState = _a.getState, dispatch = _a.dispatch, next = _a.next, action = _a.action;
    return action.type === actions_1.RETRY;
}
function retry(_a) {
    var getState = _a.getState, dispatch = _a.dispatch, next = _a.next, action = _a.action, config = _a.config;
    var stateName = config.stateName;
    var state = lodash_1.default.get(getState(), stateName, initialState_1.default);
    var queue = state.queue, suspendSaga = state.suspendSaga;
    var nextResult = next(action);
    if (!suspendSaga) {
        var actionToRetry = lodash_1.default.find(queue, function (actionInQueue) {
            var idOfActionInQueue = lodash_1.default.get(actionInQueue, 'meta.queue.id');
            var idOfActionToRetry = lodash_1.default.get(action, 'payload.meta.queue.id');
            return (idOfActionInQueue &&
                idOfActionToRetry &&
                (idOfActionInQueue === idOfActionToRetry));
        });
        if (actionToRetry) {
            var actionToRemove = {
                type: actions_1.REMOVE,
                payload: __assign({}, actionToRetry)
            };
            dispatch(actionToRemove);
            dispatch(actionToRetry);
        }
    }
    return nextResult;
}
function isQueueable(_a) {
    var action = _a.action;
    var isInScope = lodash_1.default.get(action, ['meta', 'queue', 'enqueue'], false);
    var ttl = ramda_1.view(ramda_1.lensPath(['meta', 'queue', 'ttl']), action);
    var isAlive = ttl ? moment_1.default(ttl).isSameOrAfter() : true;
    return isInScope && isAlive;
}
function queue(_a) {
    var getState = _a.getState, dispatch = _a.dispatch, next = _a.next, action = _a.action, config = _a.config;
    var enhacedAction = action;
    if (isFirstTime(action)) {
        enhacedAction = enhanceAction_1.enhaceInitial(action);
    }
    var nextResult = next(enhacedAction);
    var actionToQueue = {
        type: actions_1.QUEUE_ACTION,
        payload: __assign({}, enhacedAction)
    };
    dispatch(actionToQueue);
    return nextResult;
}
function isFirstTime(action) {
    return ramda_1.view(ramda_1.lensPath(['meta', 'queue', 'times']), action) === undefined;
}
