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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Default config for the offline queue.
 *
 * @param {String} stateName Redux store key for offline queue state.
 * @param {Array<String>} additionalTriggers An array of action types
 * that will trigger the offline queue to dispatch its actions if possible.
 */
var DEFAULT_CONFIG = {
    stateName: 'offline',
    additionalTriggers: [],
    enqueueTransform: undefined
};
/**
 * Returns a configuration options with passed config or default values.
 *
 * @param {Object} userConfig A config object that can be used to override default values.
 */
function getConfig(userConfig) {
    if (userConfig === void 0) { userConfig = {}; }
    return __assign({}, DEFAULT_CONFIG, userConfig);
}
exports.default = getConfig;
