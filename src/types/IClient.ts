import { IFileMetadata } from "./IFileMetadata";

export interface IClient {
  getRemoteFilesMetadata: (remoteFile: string) => Promise<IFileMetadata[]>;
  downloadRemoteFile: (remoteFilePath: string) => Promise<any>;
  uploadLocalFile: (
    remoteFilePath: string,
    localFilePath: string
  ) => Promise<void>;
  deleteRemoteFile: (remoteFilePath: string) => Promise<void>;
}
