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
var reduxsauce_1 = require("reduxsauce");
var lodash_1 = __importDefault(require("lodash"));
/**
 * Wraps reduxsauce's creator function to append offline metadata.
 *
 * @param {Function} creator Reduxsauce's creator function.
 */
var appendOfflineMeta = function (creator) {
    return function () {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        var creatorResult = creator.apply(void 0, rest);
        return __assign({}, creatorResult, { meta: {
                queueIfOffline: true,
            } });
    };
};
/**
 * Custom wrapper around reduxsauce's `createActions` that automatically appends
 * offline meta required by offline queue.
 *
 * Sample usage:
 * ```
 * const { Types: OfflineTypes, Creators: OfflineCreators } = createOfflineActions({
 *   updateUser: ['userId'],
 * })
 * ```
 *
 * @param {Object} config Reduxsauce configuration object with action definitions.
 */
function createOfflineActions(config) {
    var _a = reduxsauce_1.createActions(config), Types = _a.Types, Creators = _a.Creators;
    var OfflineCreators = lodash_1.default.mapValues(Creators, function (creator) {
        return appendOfflineMeta(creator);
    });
    return {
        Types: Types,
        Creators: OfflineCreators,
    };
}
exports.createOfflineActions = createOfflineActions;
/**
 * Provides an alternative way to mark an action as offline action.
 *
 * Modifies given action creators object
 * by appending offline meta to specified action names.
 *
 * This is useful as it does not require merging back Creators and OfflineCreators.
 *
 * @param {Object} creators Reduxsauce's action creators.
 * @param {Array} offlineActions An array of action names.
 */
function markActionsOffline(creators, offlineActions) {
    lodash_1.default.forEach(offlineActions, function (offlineAction) {
        if (lodash_1.default.has(creators, offlineAction)) {
            // eslint-disable-next-line no-param-reassign
            creators[offlineAction] = appendOfflineMeta(creators[offlineAction]);
        }
    });
}
exports.markActionsOffline = markActionsOffline;
