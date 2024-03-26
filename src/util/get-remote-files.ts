import { Dropbox } from "dropbox";

let files: any[] = [];
export async function getRemoteFilesMetadata(dbx: Dropbox, rootPath: string) {
  try {
    const {
      result: { entries },
    } = await dbx.filesListFolder({ path: rootPath });

    files = [...files, ...entries];
    for (let i = 0; i < entries.length; i++) {
      if (entries[i][".tag"] === "folder") {
        await getRemoteFilesMetadata(dbx, entries[i]["path_display"] || "");
      }
    }
    return files;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
