"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var redux_persist_1 = require("redux-persist");
var lodash_1 = __importDefault(require("lodash"));
var OMIT_KEYS = ['suspendSaga'];
/**
 * Custom redux-persist transformation
 * to omit persisting `autoEnqueue` key from offline queue.
 */
exports.default = redux_persist_1.createTransform(function (inboundState) { return lodash_1.default.omit(inboundState, OMIT_KEYS); }, function (outboundState) { return outboundState; }, { whitelist: ['offline'] });
