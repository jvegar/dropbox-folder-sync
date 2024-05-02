import dotenv from "dotenv";
import express from "express";
import { Dropbox } from "dropbox";

dotenv.config();

const dbx = new Dropbox({
  clientId: process.env.DBX_CLIENT_ID,
  clientSecret: process.env.DBX_CLIENT_SECRET,
  refreshToken: process.env.DBX_REFRESH_TOKEN,
});

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

app.post("/webhook", async (req, res) => {
  const accounts = req.body["list_folder"]["accounts"];

  for (const account of accounts) {
    // We need to respond quickly to the webhook request, so we do the
    // actual work in a separate thread. For more robustness, it's a
    // good idea to add the work to a reliable queue and process the queue
    // in a worker process.
    await processUser(account);
  }

  res.send("");
});

async function processUser(account: any) {
  // Process the user account here
  console.log(`Processing account: ${account}`);

  let hasMore = true;
  let cursor: any;
  let response;

  while (hasMore) {
    if (!cursor) {
      response = await dbx.filesListFolder({ path: "", include_deleted: true });
    } else {
      response = await dbx.filesListFolderContinue({ cursor });
    }

    const {
      result: { entries },
    } = response;

    for (const entry of entries) {
      console.log(entry);
    }

    cursor = response.result.cursor;
    hasMore = response.result.has_more;
  }
}

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
