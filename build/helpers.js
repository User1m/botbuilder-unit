"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LOG_LEVELS;
(function (LOG_LEVELS) {
    LOG_LEVELS[LOG_LEVELS["none"] = 0] = "none";
    LOG_LEVELS[LOG_LEVELS["info"] = 1] = "info";
    LOG_LEVELS[LOG_LEVELS["verbose"] = 2] = "verbose";
})(LOG_LEVELS = exports.LOG_LEVELS || (exports.LOG_LEVELS = {}));
var TRIGGER_STATE;
(function (TRIGGER_STATE) {
    TRIGGER_STATE["before"] = "before";
    TRIGGER_STATE["after"] = "after";
})(TRIGGER_STATE = exports.TRIGGER_STATE || (exports.TRIGGER_STATE = {}));
var ACTORS;
(function (ACTORS) {
    ACTORS["user"] = "user";
    ACTORS["bot"] = "bot";
})(ACTORS = exports.ACTORS || (exports.ACTORS = {}));
//# sourceMappingURL=helpers.js.map