"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartstore = exports.oauth = exports.net = exports.mobilesync = exports.forceUtil = exports.forceTest = exports.forceLog = exports.forceClient = void 0;
const forceLog = __importStar(require("./react.force.log"));
exports.forceLog = forceLog;
const mobilesync = __importStar(require("./react.force.mobilesync"));
exports.mobilesync = mobilesync;
const net = __importStar(require("./react.force.net"));
exports.net = net;
const oauth = __importStar(require("./react.force.oauth"));
exports.oauth = oauth;
const smartstore = __importStar(require("./react.force.smartstore"));
exports.smartstore = smartstore;
const forceTest = __importStar(require("./react.force.test"));
exports.forceTest = forceTest;
const forceUtil = __importStar(require("./react.force.util"));
exports.forceUtil = forceUtil;
const forceClient = net;
exports.forceClient = forceClient;
//# sourceMappingURL=index.js.map