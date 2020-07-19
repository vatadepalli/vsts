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
exports.getJSONFile = exports.run = void 0;
const common = __importStar(require("./common"));
require('isomorphic-fetch');
require('es6-promise').polyfill();
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let webApi = yield common.getWebApi();
        let gitApiObject = yield webApi.getGitApi();
        common.banner("Git Samples");
        let project = common.getProject();
        console.log("Project:", project);
        common.heading("Get Repositories");
        const repos = yield gitApiObject.getRepositories(project);
        console.log(repos);
        common.heading("Get JSON File");
        console.log(yield getJSONFile('63f766a7-921a-4a5d-b886-21445bb34554', '/package.json'));
    });
}
exports.run = run;
function getJSONFile(repositoryId, path) {
    return __awaiter(this, void 0, void 0, function* () {
        let webApi = yield common.getWebApi();
        let gitApiObject = yield webApi.getGitApi();
        const fileId = yield (yield gitApiObject.getItem(repositoryId, path)).objectId;
        const stream = yield gitApiObject.getBlobContent(repositoryId, fileId || '');
        const data = yield new Promise((resolve, reject) => {
            let data_ = "";
            stream.on("data", chunk => data_ += chunk);
            stream.on("end", () => resolve(data_));
            stream.on("error", error => reject(error));
        });
        return JSON.parse(data);
    });
}
exports.getJSONFile = getJSONFile;
run();
