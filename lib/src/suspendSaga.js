"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var config_1 = __importDefault(require("./config"));
var initialState_1 = __importDefault(require("./initialState"));
function suspendSaga(middleware, config) {
    if (config === void 0) { config = {}; }
    return function (store) { return function (next) {
        var delegate = middleware(store)(next);
        return function (action) {
            if (shouldSuspendSaga(store, action, config_1.default(config))) {
                return next(action);
            }
            else {
                return delegate(action);
            }
        };
    }; };
}
exports.default = suspendSaga;
function shouldSuspendSaga(store, action, config) {
    var stateName = config.stateName;
    var state = lodash_1.default.get(store.getState(), stateName, initialState_1.default);
    var suspendSaga = state.suspendSaga;
    var should = lodash_1.default.get(action, 'meta.queue.enqueue', false) === true &&
        suspendSaga;
    return should;
}
