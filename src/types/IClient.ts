import { IRemoteFileMetadata } from "./IFileMetadata";

export interface IClient {
  getRemoteFilesMetadataFromPath: (
    remoteFile: string
  ) => Promise<IRemoteFileMetadata[]>;
  getRemoteFile: (remoteFilePath: string) => Promise<any>;
  uploadLocalFile: (
    remoteFilePath: string,
    localFilePath: string
  ) => Promise<void>;
  deleteRemoteFile: (remoteFilePath: string) => Promise<void>;
}
