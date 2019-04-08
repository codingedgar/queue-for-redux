"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var actions_1 = require("../actions");
var ramda_1 = require("ramda");
var enhanceAction_1 = require("./enhanceAction");
function isResetThrottle(_a) {
    var action = _a.action;
    return action.type === actions_1.RESET_THROTTLE;
}
exports.isResetThrottle = isResetThrottle;
function resetThrottle(state, action) {
    return ramda_1.over(ramda_1.lensProp('queue'), ramda_1.pipe(removeFromQueue(action), function (queue) { return (queue.concat([enhanceAction_1.enhanceResetThrottle(action.payload)])); }), state);
}
exports.resetThrottle = resetThrottle;
function removeFromQueue(actionToRemove) {
    var removeId = ramda_1.view(ramda_1.lensPath(['payload', 'meta', 'queue', 'id']), actionToRemove);
    return ramda_1.reject(function (action) {
        var actionId = ramda_1.view(ramda_1.lensPath(['meta', 'queue', 'id']), action);
        return removeId === actionId;
    });
}
