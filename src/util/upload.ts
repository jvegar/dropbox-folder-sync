import fs from "fs/promises";
import { Dropbox } from "dropbox";

export async function uploadFile(
  dbx: Dropbox,
  srcPath: string,
  dstPath: string
) {
  try {
    const contents = await fs.readFile(srcPath, {});
    const res = await dbx.filesUpload({
      path: dstPath,
      contents,
      mode: { ".tag": "overwrite" },
    });
    console.log(`File: ${dstPath} was successfully uploaded.`);
  } catch (error) {
    console.error(error);
  }
}
