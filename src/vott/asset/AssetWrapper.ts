import { AssetState, IAssetMetadata, IRegion } from "../../types/vott";
import AssetHelper from "../helpers/AssetHelper";

export default class AssetWrapper {
  private meta: IAssetMetadata;

  public constructor(meta: IAssetMetadata) {
    this.meta = meta;
  }

  public getMeta() {
    return { ...this.meta };
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
    return AssetHelper.removeFilePrefix(this.getPath());
  }

  public getPrefixPath(): string {
    return AssetHelper.preparePrefix(this.getPath());
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
