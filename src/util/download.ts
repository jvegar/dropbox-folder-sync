import { Dropbox, DropboxResponse, files } from "dropbox";
import fse from "fs-extra";

export async function downloadFile(
  dbx: Dropbox,
  remoteFilePath: string
): Promise<DropboxResponse<files.FileMetadata>> {
  const file = await dbx.filesDownload({ path: remoteFilePath });
  return file;
}

export async function validateFileIsSynched(
  localPath: string,
  remoteFile: files.FileMetadata
) {
  try {
    if (fse.existsSync(localPath)) {
      const stats = await fse.stat(localPath);
      const localModifiedTime = stats.mtime;
      const remoteModifiedTime = new Date(remoteFile.server_modified);
      return localModifiedTime > remoteModifiedTime;
    }
    return false;
  } catch (error) {
    console.error(error);
  }
}

export async function saveFileToLocal(remoteFile: any, localPath: string) {
  try {
    const binary = Buffer.from(remoteFile.fileBinary);
    await fse.outputFile(localPath, binary);
  } catch (error) {
    console.error(error);
  }
}
