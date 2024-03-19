import { Dropbox } from "dropbox";
let files: any[] = [];
export async function getRemoteFiles(dbx: Dropbox, rootPath: string) {
  const {
    result: { entries },
  } = await dbx.filesListFolder({ path: rootPath });

  files = [...files, ...entries];
  for (var i = 0; i < entries.length; i++) {
    if (entries[i][".tag"] === "folder") {
      //   console.log(entries[i]["path_display"]);
      await getRemoteFiles(dbx, entries[i]["path_display"] || "");
    }
  }
  return files;
}
