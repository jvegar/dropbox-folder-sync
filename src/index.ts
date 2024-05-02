import "dotenv/config";
import {
  getLocalFilePathsSync,
  getLocalFilesStats,
  isEmpty,
  regenerateDatabase,
} from "./utils";
import { saveFileToLocal } from "./utils/";
import { DropBoxClient } from "./classes/dropbox-client";
import fse from "fs-extra";
import chokidar from "chokidar";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const sourcePath = process.env.SOURCE_PATH || "";

async function initialize() {
  /**
   * Create an instance of Dropbox client
   */
  const client = new DropBoxClient(
    process.env.DBX_CLIENT_ID || "",
    process.env.DBX_CLIENT_SECRET || "",
    process.env.DBX_REFRESH_TOKEN || ""
  );

  const remoteFiles = await client.getRemoteFilesMetadataFromPath("");

  // If folder is empty
  if (isEmpty(sourcePath)) {
    // Iterate all remote files
    for (const remoteFile of remoteFiles) {
      const localFilePath = sourcePath + remoteFile.pathDisplay;

      // Download remote file and save it to local
      const remoteFileWithContent = await client.getRemoteFile(
        remoteFile.pathDisplay || ""
      );
      await saveFileToLocal(remoteFileWithContent, localFilePath);
    }
    // Regenerate database
    regenerateDatabase(prisma);
  } else {
    /**
     * Downloading [new/newer] files from remote storage (Dropbox) to local source path
     */
    for (const remoteFile of remoteFiles) {
      if (remoteFile.isDownloadable) {
        const localFilePath = sourcePath + remoteFile.pathDisplay;
        const remoteModifiedTime = new Date(remoteFile.serverModified);

        let localFileIsSynched: boolean | undefined = false;

        if (fse.existsSync(localFilePath)) {
          const localModifiedTime = (await fse.stat(localFilePath)).mtime;
          localFileIsSynched = localModifiedTime > remoteModifiedTime;
        }

        if (localFileIsSynched) {
          console.info(`Local file: ${localFilePath} is already synched`);
          await client.uploadLocalFile(remoteFile.pathDisplay, localFilePath);
        } else {
          await saveFileToLocal(
            await client.getRemoteFile(remoteFile.pathDisplay || ""),
            localFilePath
          );

          console.info(`Local file: ${localFilePath} was successfully synched`);
        }
      }
    }

    /**
     * Uploading newer local files from local source path to remote storage
     */
    const localFilePaths = getLocalFilePathsSync(sourcePath, []);
    const localFilesStats = getLocalFilesStats(localFilePaths);

    for (const fileStats of localFilesStats) {
      const remoteFile = remoteFiles.find(
        (remoteFile) =>
          remoteFile.pathDisplay === fileStats.path.replace(sourcePath, "/")
      );
      if (remoteFile) {
        const remoteFileIsSynched =
          remoteFile.serverModified > fileStats.modified;
        if (remoteFileIsSynched) {
          console.info(
            `Remote file: ${remoteFile.pathDisplay} is already synched`
          );
        } else {
          setTimeout(() => {
            //uploadFile(dbx, path.srcPath, path.dstPath)
            client.uploadLocalFile(remoteFile.pathDisplay, fileStats.path);
            console.log(
              `Remote file: ${remoteFile.pathDisplay} was successfully synched`
            );
          }, 2000);
        }
      }
    }
  }

  // Watching changes on source folder
  const watcher = chokidar.watch(sourcePath, {
    ignored: /^\./,
    persistent: true,
    usePolling: true,
    ignoreInitial: true,
  });

  watcher
    .on("add", async function (path) {
      const relativePath = path.replace(sourcePath, "");
      await client.uploadLocalFile(relativePath, path);
      // console.log(`added file: ${relativePath}`);
    })
    .on("change", async function (path) {
      const relativePath = path.replace(sourcePath, "");
      await client.uploadLocalFile(relativePath, path);
      // setTimeout(() => client.uploadLocalFile(relativePath, path), 2000);
      // console.log(`changed file: ${relativePath}`);
    })
    .on("unlink", async function (path) {
      const relativePath = path.replace(sourcePath, "");
      await client.deleteRemoteFile(relativePath);
      // setTimeout(() => client.deleteRemoteFile(relativePath), 2000);
      // console.log(`unlink file: ${relativePath}`);
    })
    .on("error", function (error) {
      console.error("Error happened", error);
    });
}

initialize();
