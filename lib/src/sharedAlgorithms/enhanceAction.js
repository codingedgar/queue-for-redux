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
var uuid_1 = require("uuid");
var ramda_1 = require("ramda");
var moment_1 = __importDefault(require("moment"));
function enhace(action) {
    return ramda_1.over(ramda_1.lensPath(['meta', 'queue']), function (meta) { return (__assign({}, meta, { id: meta.id || uuid_1.v1(), times: (meta.times || 0) + 1, ttl: meta.ttl || moment_1.default().add(1, 'day').toISOString(), throttle: moment_1.default().add(1, 'minute').toISOString() })); }, action);
}
exports.enhace = enhace;
function enhaceInitial(action) {
    return ramda_1.over(ramda_1.lensPath(['meta', 'queue']), function (meta) { return (__assign({}, meta, { id: meta.id || uuid_1.v1(), times: meta.times || 0 })); }, action);
}
exports.enhaceInitial = enhaceInitial;
