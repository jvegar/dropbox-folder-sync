export interface IFileMetadata {
  id: string;
  name: string;
  tag?: string;
  pathLower?: string;
  pathDisplay?: string;
  clientModified: Date;
  serverModified: Date;
  rev: string;
  size: number;
  isDownloadable: boolean;
  contentHash?: string;
}
