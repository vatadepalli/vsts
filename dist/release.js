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
exports.run_ = exports.run = exports.checkReleaseStatus = exports.createRelease = void 0;
const common = __importStar(require("./common"));
const rxjs_1 = require("rxjs");
const releaseMap = new Map([
    ['testssl', 1],
    ['virustotal', 2],
    ['zapweb', 3],
    ['zapapi', 4]
]); // Is the Release Pipeline Number. Lowest one is 1
const statusMap = new Map([
    [0, 'Undefined'],
    [1, 'NotDeployed'],
    [2, 'InProgress'],
    [4, 'Succeeded'],
    [8, 'PartiallySucceeded'],
    [16, 'Failed'],
    [31, 'All']
]);
function createRelease(type, variables) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectId = common.getProject();
        const webApi = yield common.getWebApi();
        const releaseApiObject = yield webApi.getReleaseApi();
        common.banner('Create Release');
        const release = yield releaseApiObject.createRelease({
            definitionId: releaseMap.get(type),
            description: "Creating Sample release",
            variables: variables.reduce((acc, cv) => {
                acc[cv.key] = {
                    allowOverride: true,
                    value: cv.value
                };
                return acc;
            }, {})
        }, projectId);
        common.banner('Printing Release ID');
        console.log(release.id);
        return release;
    });
}
exports.createRelease = createRelease;
function checkReleaseStatus(releaseId) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectId = common.getProject();
        const webApi = yield common.getWebApi();
        const releaseApiObject = yield webApi.getReleaseApi();
        common.banner('Get Release Status');
        return rxjs_1.Observable.create((status) => {
            const statusChecker = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                let status_ = (yield releaseApiObject.getDeployments(projectId)).filter(el => (el.release || { id: -1 }).id === releaseId)[0].deploymentStatus;
                status.next(status_);
                if (status === 4) {
                    clearTimeout(statusChecker);
                    status.complete();
                    console.log((yield releaseApiObject.getLogs(projectId, releaseId)));
                }
            }), 1000);
        });
    });
}
exports.checkReleaseStatus = checkReleaseStatus;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const release = yield createRelease('testssl', [
            { key: 'targetUrl', value: 'https://integriert.io/' },
            { key: 'fileName', value: 'eJourney_EAR-AA-1234_DEV_2020-07-09T14__36__17___468Z_testssl' }
        ]);
        (yield checkReleaseStatus(release.id || -1)).subscribe(res => {
            console.log(res);
        });
    });
}
exports.run = run;
run();
function run_(type) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectId = common.getProject();
        const webApi = yield common.getWebApi();
        const releaseApiObject = yield webApi.getReleaseApi();
        common.banner('Create Release');
        const release = yield releaseApiObject.createRelease({
            definitionId: 2,
            description: "Creating Sample release",
            variables: {
                targetUrl: {
                    allowOverride: true,
                    value: 'https://integriert.io'
                }
            }
        }, projectId);
        const releaseId = release.id || -1;
        console.log(releaseId);
        const releaseLogs = yield releaseApiObject.getLogs(projectId, releaseId);
        releaseLogs.on('data', chunk => {
            console.log(chunk);
        });
        console.log((yield releaseApiObject.getRelease(projectId, releaseId)));
        const statusMap = {
            Undefined: 0,
            NotDeployed: 1,
            InProgress: 2,
            Succeeded: 4,
            PartiallySucceeded: 8,
            Failed: 16,
            All: 31
        };
        const statusChecker = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            let status = (yield releaseApiObject.getDeployments(projectId)).filter(el => (el.release || { id: -1 }).id === releaseId)[0].deploymentStatus;
            console.log(status);
            if (status === 4) {
                clearTimeout(statusChecker);
                console.log((yield releaseApiObject.getLogs(projectId, releaseId)));
            }
        }), 1000);
    });
}
exports.run_ = run_;
