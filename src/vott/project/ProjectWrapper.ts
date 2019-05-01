import { IProject, IAsset } from "../../types/vott";

export default class ProjectWrapper {
  private project: IProject;

  public constructor(project: IProject) {
    this.project = project;
  }

  public getProject() {
    return {
      ...this.project
    };
  }

  public getName() {
    return this.project.name;
  }

  public getAssets() {
    return this.project.assets || {};
  }

  public setAssets(assets: { [index: string]: IAsset }) {
    this.project.assets = assets;
  }
}
