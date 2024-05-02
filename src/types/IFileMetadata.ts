import { files } from 'dropbox';

export interface IRemoteFileMetadata {
  id: string;
  name: string;
  tag?: string;
  pathLower: string;
  pathDisplay: string;
  clientModified: Date;
  serverModified: Date;
  rev: string;
  size: number;
  isDownloadable: boolean;
  contentHash?: string;
}

export type FileMetadata = files.FileMetadata & { fileBinary?: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer> };
