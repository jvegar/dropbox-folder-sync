import { Dropbox, DropboxResponse, files } from "dropbox";
import fs from "fs/promises";
import { IClient } from "../types/IClient";
import { mapToFilesMetadata } from "../util/download";
import { IFileMetadata } from "../types/IFileMetadata";

export class DropBoxClient implements IClient {
  private dbx: Dropbox;
  public files: any[] = [];

  constructor(clientId: string, clientSecret: string, refreshToken: string) {
    this.dbx = new Dropbox({ clientId, clientSecret, refreshToken });
  }

  public async getRemoteFilesMetadata(
    rootPath: string
  ): Promise<IFileMetadata[]> {
    try {
      const {
        result: { entries },
      } = await this.dbx.filesListFolder({ path: rootPath });
      const filesMetadata = mapToFilesMetadata(entries as files.FileMetadata[]);

      this.files = [...this.files, ...filesMetadata];
      for (let i = 0; i < entries.length; i++) {
        if (entries[i][".tag"] === "folder") {
          await this.getRemoteFilesMetadata(entries[i]["path_display"] || "");
        }
      }
      return this.files;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public async downloadRemoteFile(
    remoteFilePath: string
  ): Promise<DropboxResponse<files.FileMetadata>> {
    try {
      const file = await this.dbx.filesDownload({ path: remoteFilePath });
      return file;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public async uploadLocalFile(
    remoteFilePath: any,
    localFilePath: string
  ): Promise<void> {
    try {
      const contents = await fs.readFile(localFilePath, {});
      await this.dbx.filesUpload({
        path: remoteFilePath,
        contents,
        mode: { ".tag": "overwrite" },
      });
      console.log(`File: ${remoteFilePath} was successfully uploaded.`);
    } catch (error) {
      console.error(error);
    }
  }

  public async deleteRemoteFile(remotePath: string) {
    await this.dbx.filesDeleteV2({ path: remotePath });
  }
}
