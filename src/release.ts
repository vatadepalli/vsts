import * as common from './common';
import * as nodeApi from 'azure-devops-node-api';

import * as ReleaseApi from 'azure-devops-node-api/ReleaseApi';
import { Observable } from 'rxjs';

const releaseMap: Map<string, number> = new Map([
    ['testssl',  1],
    ['virustotal', 2],
    ['zapweb', 3],
    ['zapapi', 4]
]) // Is the Release Pipeline Number. Lowest one is 1

const statusMap: Map<number, string> = new Map([
    [0, 'Undefined'],
    [1, 'NotDeployed'],
    [2, 'InProgress'],
    [4, 'Succeeded'],
    [8, 'PartiallySucceeded'],
    [16, 'Failed'],
    [31, 'All']
])

interface Variable {
    key: string,
    value: string
}

export async function createRelease(type: string, variables: Variable[]) {
    const projectId: string = common.getProject();
    const webApi: nodeApi.WebApi = await common.getWebApi();
    const releaseApiObject: ReleaseApi.IReleaseApi = await webApi.getReleaseApi();
    
    common.banner('Create Release');

    const release = await releaseApiObject.createRelease({
        definitionId : releaseMap.get(type), 
        description : "Creating Sample release",
        variables : variables.reduce((acc: any, cv) => {
            acc[cv.key] = {
                allowOverride: true,
                value: cv.value
            }
            return acc
        }, {})
    }, projectId);
    
    common.banner('Printing Release ID');
    console.log(release.id)

    return release;
}

export async function checkReleaseStatus(releaseId: number): Promise<Observable<any>> {
    const projectId: string = common.getProject();
    const webApi: nodeApi.WebApi = await common.getWebApi();
    const releaseApiObject: ReleaseApi.IReleaseApi = await webApi.getReleaseApi();
    
    common.banner('Get Release Status');

    return Observable.create((status: any) => {
        const statusChecker = setInterval(async() => {
            let status_ = (await releaseApiObject.getDeployments(projectId)).filter(el => (el.release || { id: -1 }).id === releaseId)[0].deploymentStatus
            status.next(status_)
            if (status === 4) {
                clearTimeout(statusChecker)
                status.complete();
                console.log((await releaseApiObject.getLogs(projectId, releaseId)));
            }
        }, 1000);
    })
}


export async function run() {
    const release = await createRelease('testssl', [
        { key: 'targetUrl', value: 'https://integriert.io/' }, 
        { key: 'fileName', value: 'eJourney_EAR-AA-1234_DEV_2020-07-09T14__36__17___468Z_testssl' }
    ]);

    (await checkReleaseStatus(release.id || -1)).subscribe(res => {
        console.log(res);
    })
}

run()


export async function run_(type: string) {
    const projectId: string = common.getProject();
    const webApi: nodeApi.WebApi = await common.getWebApi();
    const releaseApiObject: ReleaseApi.IReleaseApi = await webApi.getReleaseApi();
    
    common.banner('Create Release');

    const release = await releaseApiObject.createRelease({
        definitionId : 2, // Is the Release Pipeline Number. Lowest one is 1
        description : "Creating Sample release",
        variables : {
            targetUrl: {
                allowOverride: true,
                value: 'https://integriert.io'
            }
        }
    }, projectId);
    
    const releaseId = release.id || -1;

    console.log(releaseId)

    const releaseLogs = await releaseApiObject.getLogs(projectId, releaseId)
    releaseLogs.on('data', chunk => {
        console.log(chunk);
    })

    console.log((await releaseApiObject.getRelease(projectId, releaseId)));

    const statusMap = {
        Undefined : 0,
        NotDeployed : 1,
        InProgress : 2,
        Succeeded : 4,
        PartiallySucceeded : 8,
        Failed : 16,
        All : 31
    }

    const statusChecker = setInterval(async() => {
        let status = (await releaseApiObject.getDeployments(projectId)).filter(el => (el.release || { id: -1 }).id === releaseId)[0].deploymentStatus
        console.log(status);
        if (status === 4) {
            clearTimeout(statusChecker)
            console.log((await releaseApiObject.getLogs(projectId, releaseId)));
        }
    }, 1000);
}