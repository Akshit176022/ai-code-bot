import fs from "fs";
import { App } from "@octokit/app";
import dotenv from "dotenv";

dotenv.config();

const privateKey = fs.readFileSync(
  process.env.GITHUB_PRIVATE_KEY_PATH,
  "utf8"
);

const app = new App({
  appId: process.env.GITHUB_APP_ID,
  privateKey,
});

async function main() {
  try {
    // Find our app installation
    const { data: installations } =
      await app.octokit.request("GET /app/installations");

    const installationId = installations[0].id;

    // Authenticate as the installed app
    const octokit =
      await app.getInstallationOctokit(installationId);

    // Get repository contents
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        path: "",
      }
    );

    console.log("\nFiles in repository:\n");

    for (const file of data) {
      console.log(`${file.type}: ${file.name}`);
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();