import dotenv from "dotenv";
// import { getLocalPaths } from "./util/get-local-paths";
// import { uploadFile } from "./util/upload";
// import { getRemoteFilesMetadata } from "./util/get-remote-files";
// import { Dropbox } from "dropbox";
import { saveFileToLocal, validateFileIsSynched } from "./util/download";
import { PrismaClient } from "@prisma/client";
import { DropBoxClient } from "./classes/dropbox-client";
import fse from "fs-extra";
import chokidar from "chokidar";
import cron from "node-cron";
import express from "express";

dotenv.config();

const prisma = new PrismaClient();
const sourcePath = process.env.SOURCE_PATH || "";

// async function main() {
//   // Getting remote files metadata
//   const client = new DropBoxClient(
//     process.env.DBX_CLIENT_ID || "",
//     process.env.DBX_CLIENT_SECRET || "",
//     process.env.DBX_REFRESH_TOKEN || ""
//   );

//   // Downloading remote files
//   cron.schedule("*/5 * * * *", async () => {
//     const remoteFiles = await client.getRemoteFilesMetadata("");
//     for (const remoteFile of remoteFiles) {
//       if (remoteFile.isDownloadable) {
//         const { result: remoteFileResult } = await client.downloadRemoteFile(
//           remoteFile.pathDisplay ?? ""
//         );

//         // Validate if local file is synched
//         const localFilePath = sourcePath + remoteFileResult.path_display;
//         const remoteModifiedTime = new Date(remoteFile.serverModified);
//         let localFileIsSynched: boolean | undefined = false;

//         if (fse.existsSync(localFilePath)) {
//           const localModifiedTime = (await fse.stat(localFilePath)).mtime;
//           console.log("remoteModifiedTime", remoteModifiedTime);
//           console.log("localModifiedTime", localModifiedTime);
//           localFileIsSynched = validateFileIsSynched(
//             remoteModifiedTime,
//             localModifiedTime
//           );
//         }

//         if (localFileIsSynched) {
//           console.info(`File: ${localFilePath} is already synched`);
//         } else {
//           await saveFileToLocal(remoteFileResult, localFilePath);
//           // await prisma.file.create({
//           //   data: {
//           //     id: remoteFileResult.id,
//           //     name: remoteFile.name,
//           //     tag: remoteFile.tag ?? "",
//           //     pathLower: remoteFile.pathLower ?? "",
//           //     pathDisplay: remoteFile.pathDisplay ?? "",
//           //     clientModified: remoteFile.clientModified,
//           //     serverModified: remoteFile.serverModified,
//           //     rev: remoteFile.rev,
//           //     size: remoteFile.size,
//           //     isDownloadable: remoteFile.isDownloadable,
//           //     contentHash: remoteFile.contentHash ?? "",
//           //   },
//           // });
//           console.info(`File: ${localFilePath} was successfully synched`);
//         }
//       }
//     }
//   });

//   // Watching changes on source folder
//   const watcher = chokidar.watch(sourcePath, {
//     ignored: /^\./,
//     persistent: true,
//     usePolling: true,
//   });

//   watcher
//     .on("add", async function (path) {
//       const relativePath = path.replace(sourcePath, "");
//       await client.uploadLocalFile(relativePath, path);
//     })
//     .on("change", async function (path) {
//       const relativePath = path.replace(sourcePath, "");
//       setTimeout(() => client.uploadLocalFile(relativePath, path), 2000);
//     })
//     .on("unlink", function (path) {
//       const relativePath = path.replace(sourcePath, "");
//       setTimeout(() => client.uploadLocalFile(relativePath, path), 2000);
//     })
//     .on("error", function (error) {
//       console.error("Error happened", error);
//     });

//   //Uploading local files
//   // const localPaths = getLocalPaths(sourcePath);
//   // for (const path of localPaths) {
//   //   const remoteFileIsSynched = await validateRemoteFileIsSynched(
//   //     dbx,
//   //     path.dstPath,
//   //     path.srcPath
//   //   );
//   //   console.log(remoteFileIsSynched);
//   //   // setTimeout(() => uploadFile(dbx, path.srcPath, path.dstPath), 2000);
//   // }

//   // await prisma.user.create({
//   //   data: {
//   //     name: "Rich",
//   //     email: "hello@prisma.com",
//   //     posts: {
//   //       create: {
//   //         title: "My first post",
//   //         body: "Lots of really interesting stuff",
//   //         slug: "my-first-post",
//   //       },
//   //     },
//   //   },
//   // });

//   // const allUsers = await prisma.user.findMany({
//   //   include: {
//   //     posts: true,
//   //   },
//   // });
//   // console.dir(allUsers, { depth: null });
// }

// main();

const app = express();

app.use(express.json());

app.get("/webhook", (req, res) => {
  // Respond to the webhook verification (GET request) by echoing back the challenge parameter.

  const challenge = req.query.challenge;
  const response = challenge;

  res.set({
    "Content-Type": "text/plain",
    "X-Content-Type-Options": "nosniff",
  });

  res.send(response);
});

app.post("/webhook", (req, res) => {
  // console.log(req.body);
  const accounts = req.body["list_folder"]["accounts"];

  for (const account of accounts) {
    // We need to respond quickly to the webhook request, so we do the
    // actual work in a separate thread. For more robustness, it's a
    // good idea to add the work to a reliable queue and process the queue
    // in a worker process.
    processUser(account);
  }

  res.send("");
});

function processUser(account: any) {
  // Process the user account here
  console.log(`Processing account: ${account}`);
  // Add your desired functionality here
}

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
