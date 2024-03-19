import dotenv from "dotenv";
import { getLocalPaths } from "./util/get-local-paths";
import { uploadFile } from "./util/upload";
import { getRemoteFiles } from "./util/get-remote-files";
import { Dropbox, DropboxResponse, files } from "dropbox";
import {
  downloadFile,
  saveFileToLocal,
  validateFileIsSynched,
} from "./util/download";
dotenv.config();

const sourcePath = process.env.SOURCE_PATH || "";

const dbx = new Dropbox({
  clientId: process.env.DBX_CLIENT_ID,
  clientSecret: process.env.DBX_CLIENT_SECRET,
  refreshToken: process.env.DBX_REFRESH_TOKEN,
});

async function main() {
  //Getting remote files
  const files = await getRemoteFiles(dbx, "");

  //Downloading remote files
  for (const file of files) {
    if (file.is_downloadable) {
      const { result } = await downloadFile(dbx, file.path_display);
      // console.log(result);
      const fileIsSynched = await validateFileIsSynched(
        sourcePath + result.path_display,
        result
      );
      if (!fileIsSynched) {
        await saveFileToLocal(result, sourcePath + result.path_display);
        console.info(`File: ${result.path_display} was successfully synched`);
      } else {
        console.info(`File: ${result.path_display} is already synched`);
      }
    }
  }

  //Uploading local files
  for (const path of getLocalPaths(sourcePath)) {
    setTimeout(() => uploadFile(dbx, path.srcPath, path.dstPath), 2000);
  }
}

main();
