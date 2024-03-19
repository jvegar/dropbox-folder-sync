// const path = require("path");
import path from "path";

// const fs = require("fs");
import fs from "fs";

let files: string[] = [];

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
      return files.push(absolute);
    }
  });
}

export function getLocalPaths(directory: string): IPath[] {
  throughDirectory(directory);
  return files.map((file) => {
    return {
      dstPath: file.replace(directory, ""),
      srcPath: file,
    };
  });
}
