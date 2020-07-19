import * as common from "./common";
import * as nodeApi from "azure-devops-node-api";
require('isomorphic-fetch');
require('es6-promise').polyfill();

import * as GitApi from "azure-devops-node-api/GitApi";
import * as GitInterfaces from "azure-devops-node-api/interfaces/GitInterfaces";

export async function run() {
    let webApi: nodeApi.WebApi = await common.getWebApi();
    let gitApiObject: GitApi.IGitApi = await webApi.getGitApi();

    common.banner("Git Samples");
    let project = common.getProject();
    console.log("Project:", project);

    common.heading("Get Repositories");
    const repos: GitInterfaces.GitRepository[] = await gitApiObject.getRepositories(project);
    console.log(repos);

    common.heading("Get JSON File");

    console.log(await getJSONFile('63f766a7-921a-4a5d-b886-21445bb34554', '/package.json'));
}

export async function getJSONFile(repositoryId: string, path: string): Promise<any> {
    let webApi: nodeApi.WebApi = await common.getWebApi();
    let gitApiObject: GitApi.IGitApi = await webApi.getGitApi();

    const fileId = await (await gitApiObject.getItem(repositoryId, path)).objectId

    const stream = await gitApiObject.getBlobContent(repositoryId, fileId || '')
    const data = await new Promise<string>((resolve, reject) => {
        let data_ = "";
        stream.on("data", chunk => data_ += chunk);
        stream.on("end", () => resolve(data_));
        stream.on("error", error => reject(error));
    })

    return JSON.parse(data)
}

run()