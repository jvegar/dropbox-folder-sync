import fs from "fs/promises";
import dotenv from "dotenv";
// import path from "path";
import { Dropbox } from "dropbox";
dotenv.config();

const dbx = new Dropbox({
  clientId: process.env.DBX_CLIENT_ID,
  clientSecret: process.env.DBX_CLIENT_SECRET,
  refreshToken: process.env.DBX_REFRESH_TOKEN,
});

export async function uploadFile(srcPath: string, dstPath: string) {
  try {
    const contents = await fs.readFile(srcPath, {});
    const res = await dbx.filesUpload({
      path: dstPath,
      contents,
      mode: { ".tag": "overwrite" },
    });
    console.log(res.status);
    console.log(res.headers);
  } catch (error) {
    console.error(error);
  }
}

// export async function uploadFile(srcPath: string, dstPath: string) {
//    const data = await fs.readFile(srcPath || "", {
//     encoding: "utf-8",
//   });
//   const res = await axios.request({
//     url: process.env.DROPBOX_UPLOAD_API,
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${TOKEN}`,
//       "Dropbox-API-Arg": JSON.stringify({
//         path: dstPath,
//         mode: "overwrite",
//         autorename: true,
//         mute: false,
//         strict_conflict: false,
//       }),
//       "Content-Type": "application/octet-stream",
//     },
//     data: data,
//   });
//   console.log(res.status);
//   console.log(res.headers);
// }
