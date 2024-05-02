import { Dropbox } from 'dropbox';
import fs from 'fs/promises';
import { IClient } from '../types/IClient';
import { mapToFilesMetadata } from '../utils';
import { FileMetadata, IRemoteFileMetadata } from '../types/IFileMetadata';

export class DropBoxClient implements IClient {
  private dbx: Dropbox;
  public files: IRemoteFileMetadata[] = [];

  constructor(clientId: string, clientSecret: string, refreshToken: string) {
    this.dbx = new Dropbox({ clientId, clientSecret, refreshToken });
  }

  public async getRemoteFilesMetadataFromPath(rootPath: string): Promise<IRemoteFileMetadata[]> {
    try {
      const {
        result: { entries: fileEntries },
      } = await this.dbx.filesListFolder({ path: rootPath, recursive: true });

      const filesMetadata = mapToFilesMetadata(fileEntries as FileMetadata[]);

      this.files = [...this.files, ...filesMetadata];

      for (const fileMetadata of filesMetadata) {
        if (fileMetadata.tag === 'folder') {
          await this.getRemoteFilesMetadataFromPath(fileMetadata.pathDisplay || '');
        }
      }

      return this.files;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public async getRemoteFile(remoteFilePath: string): Promise<FileMetadata> {
    try {
      const { result: file } = await this.dbx.filesDownload({
        path: remoteFilePath,
      });
      return file;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public async uploadLocalFile(remoteFilePath: string, localFilePath: string): Promise<void> {
    try {
      const fileContents = await fs.readFile(localFilePath, {});
      await this.dbx.filesUpload({
        path: remoteFilePath,
        contents: fileContents,
        mode: { '.tag': 'overwrite' },
      });
      console.log(`File: ${remoteFilePath} was successfully uploaded.`);
    } catch (error) {
      console.error(error);
    }
  }

  public async deleteRemoteFile(remoteFilePath: string) {
    try {
      await this.dbx.filesDeleteV2({ path: remoteFilePath });
      console.log(`File: ${remoteFilePath} was successfully deleted.`);
    } catch (error) {
      console.error(error);
    }
  }
}
