import { Dropbox, DropboxResponse, files } from "dropbox";
import fse from "fs-extra";
import { IFileMetadata } from "../types/IFileMetadata";

// export async function downloadRemoteFile(
//   dbx: Dropbox,
//   remoteFilePath: string
// ): Promise<DropboxResponse<files.FileMetadata>> {
//   try {
//     const file = await dbx.filesDownload({ path: remoteFilePath });
//     return file;
//   } catch (error) {
//     throw new Error((error as Error).message);
//   }
// }

// export async function validateLocalFileIsSynched(
//   localPath: string,
//   remoteFile: files.FileMetadata
// ): Promise<boolean> {
//   try {
//     // Validate if file already exists on local
//     if (fse.existsSync(localPath)) {
//       // Get local file stats
//       const stats = await fse.stat(localPath);

//       // Get remote and local modified times
//       const localModifiedTime = stats.mtime;
//       const remoteModifiedTime = new Date(remoteFile.server_modified);
//       return localModifiedTime > remoteModifiedTime;
//     }
//     return false;
//   } catch (error) {
//     throw new Error((error as Error).message);
//   }
// }

export function validateFileIsSynched(
  remoteModifiedTime: Date,
  localModifiedTime: Date
) {
  try {
    // const { result: fileMetadata }: { result: any } =
    //   await dbx.filesGetMetadata({
    //     path: remotePath,
    //   });
    // const stats = await fse.stat(localPath);
    // const remoteModifiedTime = new Date(fileMetadata.server_modified);
    // const localModifiedTime = stats.mtime;
    return localModifiedTime > remoteModifiedTime;
  } catch (error) {
    console.error(error);
  }
}

export async function saveFileToLocal(
  remoteFile: any,
  localPath: string
): Promise<void> {
  try {
    const binary = Buffer.from(remoteFile.fileBinary);
    await fse.outputFile(localPath, binary);
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export function mapToFilesMetadata(
  remoteFiles: files.FileMetadata[]
): IFileMetadata[] {
  return remoteFiles.map((remoteFile) => {
    return {
      id: remoteFile.id,
      name: remoteFile.name,
      pathLower: remoteFile.path_lower,
      pathDisplay: remoteFile.path_display,
      clientModified: new Date(remoteFile.client_modified),
      serverModified: new Date(remoteFile.server_modified),
      rev: remoteFile.rev,
      size: remoteFile.size,
      isDownloadable: Boolean(remoteFile.is_downloadable),
      contentHash: remoteFile.content_hash,
    };
  });
}
