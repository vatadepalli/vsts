import * as cm from "./common";
import * as vm from "azure-devops-node-api";
import { Observable } from 'rxjs';

import * as ba from "azure-devops-node-api/BuildApi";

export const statusMap: Map<number, string> = new Map([
    [0, 'None'],
    [1, 'InProgress'],
    [2, 'Completed'],
    [4, 'Cancelling'],
    [8, 'Postponed'],
    [32, 'NotStarted'],
    [47, 'All']
])

export async function createBuild(type: string, variables: any[]) {
    try
    {
        let vsts: vm.WebApi = await cm.getWebApi();
        let vstsBuild: ba.IBuildApi = await vsts.getBuildApi();
        let project = cm.getProject();

        cm.banner("Getting Defenitions");
        const defs = await vstsBuild.getDefinitions(project);
        const testSSLDefn = defs.filter(el => el.name === 'TestSSL CI')[0];

        const params = {
            fileName: "eJourney_EAR-AA-1234_DEV_2020-07-09T14__36__17___468Z_testssl",
            targetUrl: "https://integriert.io/"
        }

        const queue = await vstsBuild.queueBuild({
            definition: testSSLDefn,
            parameters: JSON.stringify(params),
        }, project)
        console.log(queue);

        console.log((await vstsBuild.getBuild(project, 32)).status);
        
    }
    catch (err) {
        console.error(`Error: ${err.stack}`);
    }

}

export async function checkBuildStatus(releaseId: number): Promise<Observable<any>> {
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

run()