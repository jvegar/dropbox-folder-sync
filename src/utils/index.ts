import fs from 'fs';
import { files } from 'dropbox';
import fse from 'fs-extra';
import { FileMetadata, IRemoteFileMetadata } from '../types/IFileMetadata';
import { PrismaClient } from '@prisma/client';

interface LocalFileMedata {
  path: string;
  modified: Date;
  created: Date;
  size: number;
}

/**
 * Function for getting the local file paths recursively on a directory
 * @param directory
 * @param filePathsList
 * @returns
 */
export function getLocalFilePathsSync(directory: string, filePathsList: string[]): string[] {
  const files = fs.readdirSync(directory);
  filePathsList = filePathsList || [];
  files.forEach((file) => {
    const fileStats = fs.statSync(directory + file);
    if (fileStats.isDirectory()) {
      filePathsList = getLocalFilePathsSync(directory + file + '/', filePathsList);
    } else {
      if (fileStats.isFile()) filePathsList.push(directory + file);
    }
  });
  return filePathsList;
}

/**
 * Function to get local files stats for an array of local files paths
 * @param filePathsList
 * @returns
 */
export function getLocalFilesStats(filePathsList: string[]): LocalFileMedata[] {
  return filePathsList.map((filePath) => {
    const fileStats = fs.statSync(filePath);
    return {
      path: filePath,
      modified: fileStats.mtime,
      created: fileStats.ctime,
      size: fileStats.size,
      isDownloadable: !fileStats.isDirectory,
    };
  });
}

/**
 * Function to save remote file to local
 * @param remoteFile
 * @param localPath
 */
export async function saveFileToLocal(remoteFile: FileMetadata, localPath: string): Promise<void> {
  try {
    let binary = null;
    if (remoteFile.fileBinary) {
      binary = Buffer.from(remoteFile.fileBinary);
      await fse.outputFile(localPath, binary);
    } else {
      throw new Error('File binary is null or undefined');
    }
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

/**
 * Function to map dropbox files metadata to IRemoteFileMetadata
 * @param remoteFiles
 * @returns
 */
export function mapToFilesMetadata(remoteFiles: files.FileMetadata[]): IRemoteFileMetadata[] {
  return remoteFiles.map((remoteFile) => {
    return {
      id: remoteFile.id,
      name: remoteFile.name,
      pathLower: remoteFile.path_lower ?? '',
      pathDisplay: remoteFile.path_display ?? '',
      clientModified: new Date(remoteFile.client_modified),
      serverModified: new Date(remoteFile.server_modified),
      rev: remoteFile.rev,
      size: remoteFile.size,
      isDownloadable: Boolean(remoteFile.is_downloadable),
      contentHash: remoteFile.content_hash,
    };
  });
}

export function isEmpty(path: string) {
  return fs.readdirSync(path).length === 0;
}

export async function regenerateDatabase(prisma: PrismaClient) {
  prisma.file.deleteMany({});
}
