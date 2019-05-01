import { AssetState, IAssetMetadata, IRegion } from "../../types/vott";

export default class AssetWrapper {
  private meta: IAssetMetadata;

  public constructor(meta: IAssetMetadata) {
    this.meta = meta;
  }

  public getId() {
    return this.meta.asset.id;
  }

  public setId(id: string) {
    this.meta.asset.id = id;
  }

  public getPath(): string {
    return this.meta.asset.path;
  }

  public getNoPrefixPath(): string {
    return this.getPath().replace(/^file:/, "");
  }

  public getState(): AssetState {
    return this.meta.asset.state;
  }

  public getRegions(): IRegion[] {
    return this.meta.regions;
  }

  public isNotVisited() {
    return Boolean(this.getState() === AssetState.NotVisited);
  }

  public isVisited() {
    return Boolean(this.getState() === AssetState.Visited);
  }

  public isTagged() {
    return Boolean(this.getState() === AssetState.Tagged);
  }
}
