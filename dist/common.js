"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.heading = exports.banner = exports.getProject = exports.getApi = exports.getWebApi = void 0;
require('dotenv').config();
const vm = __importStar(require("azure-devops-node-api"));
function getEnv(name) {
    let val = process.env[name] || '';
    if (!val) {
        console.error(`${name} env var not set`);
        process.exit(1);
    }
    return val;
}
function getWebApi(serverUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        serverUrl = serverUrl || getEnv("API_URL");
        return yield getApi(serverUrl);
    });
}
exports.getWebApi = getWebApi;
function getApi(serverUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                let token = getEnv("API_TOKEN");
                let authHandler = vm.getPersonalAccessTokenHandler(token);
                let option = undefined;
                let vsts = new vm.WebApi(serverUrl, authHandler, option);
                let connData = yield vsts.connect();
                console.log(`Hello ${(connData.authenticatedUser || { providerDisplayName: null }).providerDisplayName}`);
                resolve(vsts);
            }
            catch (err) {
                reject(err);
            }
        }));
    });
}
exports.getApi = getApi;
function getProject() {
    return getEnv("API_PROJECT");
}
exports.getProject = getProject;
function banner(title) {
    console.log("=======================================");
    console.log(`\t${title}`);
    console.log("=======================================");
}
exports.banner = banner;
function heading(title) {
    console.log();
    console.log(`> ${title}`);
}
exports.heading = heading;
