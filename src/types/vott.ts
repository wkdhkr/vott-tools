/* eslint-disable @typescript-eslint/interface-name-prefix */

/**
 * original file: https://github.com/Microsoft/VoTT/blob/master/src/models/applicationState.ts
 */

/**
 * @name - Asset
 * @description - Defines an asset within a VoTT project
 * @member id - Unique identifier for asset
 * @member type - Type of asset (Image, Video, etc)
 * @member name - Generated name for asset
 * @member path - Relative path to asset within the underlying data source
 * @member size - Size / dimensions of asset
 * @member format - The asset format (jpg, png, mp4, etc)
 */
export interface IAsset {
  id: string;
  type: AssetType;
  state: AssetState;
  name: string;
  path: string;
  size: ISize;
  format?: string;
  timestamp?: number;
  parent?: IAsset;
  predicted?: boolean;
}

/**
 * @name - Asset Metadata
 * @description - Format to store asset metadata for each asset within a project
 * @member asset - References an asset within the project
 * @member regions - The list of regions drawn on the asset
 */
export interface IAssetMetadata {
  asset: IAsset;
  regions: IRegion[];
  version: string;
}

/**
 * @name - Size
 * @description - Defines the size and/or diminsion for an asset
 * @member width - The actual width of an asset
 * @member height - The actual height of an asset
 */
export interface ISize {
  width: number;
  height: number;
}

/**
 * @name - Region
 * @description - Defines a region within an asset
 * @member id - Unique identifier for this region
 * @member type - Defines the type of region
 * @member tags - Defines a list of tags applied to a region
 * @member points - Defines a list of points that define a region
 */
export interface IRegion {
  id: string;
  type: RegionType;
  tags: string[];
  points?: IPoint[];
  boundingBox?: IBoundingBox;
}

/**
 * @name - Bounding Box
 * @description - Defines the tag usage within a bounding box region
 * @member left - Defines the left x boundary for the start of the bounding box
 * @member top - Defines the top y boundary for the start of the boudning box
 * @member width - Defines the width of the bounding box
 * @member height - Defines the height of the bounding box
 */
export interface IBoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * @name - Point
 * @description - Defines a point / coordinate within a region
 * @member x - The x value relative to the asset
 * @member y - The y value relative to the asset
 */
export interface IPoint {
  x: number;
  y: number;
}

/**
 * @name - Asset Type
 * @description - Defines the type of asset within a project
 * @member Image - Specifies an asset as an image
 * @member Video - Specifies an asset as a video
 */
export enum AssetType {
  Unknown = 0,
  Image = 1,
  Video = 2,
  VideoFrame = 3,
  TFRecord = 4
}

/**
 * @name - Asset State
 * @description - Defines the state of the asset with regard to the tagging process
 * @member NotVisited - Specifies as asset that has not yet been visited or tagged
 * @member Visited - Specifies an asset has been visited, but not yet tagged
 * @member Tagged - Specifies an asset has been visited and tagged
 */
export enum AssetState {
  NotVisited = 0,
  Visited = 1,
  Tagged = 2
}

/**
 * @name - Region Type
 * @description - Defines the region type within the asset metadata
 * @member Square - Specifies a region as a square
 * @member Rectangle - Specifies a region as a rectangle
 * @member Polygon - Specifies a region as a multi-point polygon
 */
export enum RegionType {
  Polyline = "POLYLINE",
  Point = "POINT",
  Rectangle = "RECTANGLE",
  Polygon = "POLYGON",
  Square = "SQUARE"
}

export enum EditorMode {
  Rectangle = "RECT",
  Polygon = "POLYGON",
  Polyline = "POLYLINE",
  Point = "POINT",
  Select = "SELECT",
  CopyRect = "COPYRECT",
  None = "NONE"
}

export interface ISecureString {
  encrypted: string;
}

export interface ISecurityToken {
  name: string;
  key: string;
}

export interface ITFRecordMetadata {
  width: number;
  height: number;
  xminArray: number[];
  yminArray: number[];
  xmaxArray: number[];
  ymaxArray: number[];
  textArray: string[];
}
