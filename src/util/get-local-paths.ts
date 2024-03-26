import path from "path";
import fs from "fs";

let filePaths: string[] = [];

interface IPath {
  dstPath: string;
  srcPath: string;
}

function throughDirectory(directory: string): void {
  fs.readdirSync(directory).forEach((file) => {
    const absolute = path.join(directory, file);
    if (fs.statSync(absolute).isDirectory()) {
      return throughDirectory(absolute);
    } else {
      return filePaths.push(absolute);
    }
  });
}

export function getLocalPaths(directory: string): IPath[] {
  throughDirectory(directory);
  return filePaths.map((filePath) => {
    return {
      dstPath: filePath.replace(directory, ""),
      srcPath: filePath,
    };
  });
}
