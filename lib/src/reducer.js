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
var redux_persist_1 = require("redux-persist");
var lodash_1 = require("lodash");
var initialState_1 = __importDefault(require("./initialState"));
var actions_1 = require("./actions");
var enhanceAction_1 = require("./sharedAlgorithms/enhanceAction");
/**
 * Reducer for the offline queue.
 *
 * @param {Object} state Offline queue Redux store state.
 * @param {Object} action Action that was dispatched to the store.
 */
function reducer(state, action) {
    if (state === void 0) { state = initialState_1.default; }
    switch (action.type) {
        case actions_1.RESET:
            return __assign({}, initialState_1.default);
        case redux_persist_1.REHYDRATE: {
            // Handle rehydrating with custom shallow merge.
            if (action.payload && action.payload.offline) {
                return __assign({}, state, action.payload.offline);
            }
            return state;
        }
        case actions_1.SUSPEND_SAGA: {
            return __assign({}, state, { suspendSaga: action.payload.value });
        }
        case actions_1.QUEUE_ACTION:
            return __assign({}, state, { queue: state.queue.concat(enhanceAction_1.enhace(action.payload)) });
        case actions_1.REMOVE:
            return removeFromQueue(state, action);
        case actions_1.RETRY:
            return state;
        default:
            return state;
    }
}
exports.default = reducer;
function removeFromQueue(state, action) {
    var removeId = lodash_1.get(action, 'payload.meta.queue.id');
    return __assign({}, state, { queue: lodash_1.filter(state.queue, function (action) {
            var actionId = lodash_1.get(action, 'meta.queue.id');
            return removeId !== actionId;
        }) });
}
