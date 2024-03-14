import dotenv from "dotenv";
import { getPaths } from "./util/get-directory";
import { uploadFile } from "./util/upload";
dotenv.config();

const sourcePath = process.env.SOURCE_PATH || "";

//Downloading files

//Uploading files
for (const path of getPaths(sourcePath)) {
  setTimeout(() => uploadFile(path.srcPath, path.dstPath), 2000);
}
