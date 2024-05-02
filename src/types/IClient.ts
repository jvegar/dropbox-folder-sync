import { files } from 'dropbox';
import { IRemoteFileMetadata } from './IFileMetadata';

export interface IClient {
  getRemoteFilesMetadataFromPath: (remoteFile: string) => Promise<IRemoteFileMetadata[]>;
  getRemoteFile: (remoteFilePath: string) => Promise<files.FileMetadata>;
  uploadLocalFile: (remoteFilePath: string, localFilePath: string) => Promise<void>;
  deleteRemoteFile: (remoteFilePath: string) => Promise<void>;
}
