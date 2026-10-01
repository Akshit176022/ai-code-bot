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
    // Get the GitHub App installation
    const { data: installations } =
      await app.octokit.request("GET /app/installations");

    const installationId = installations[0].id;

    // Authenticate as the installed GitHub App
    const octokit =
      await app.getInstallationOctokit(installationId);

    // Read src/index.js from GitHub
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        path: "src/index.js",
      }
    );

    // GitHub sends file content as Base64
    const content = Buffer.from(
      data.content,
      "base64"
    ).toString("utf8");

    console.log("\n===== src/index.js FROM GITHUB =====\n");
    console.log(content);

  } catch (error) {
    console.error("GitHub API error:");
    console.error(error.message);
  }
}

main();