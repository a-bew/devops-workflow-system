// File: workflow-injector.ts
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { injectWorkflowTemplate } from "../generators/workflow/inject";
import { detectTechStack, getEnvContext, getPlatformConfig } from "../utils";

function commitAndPush(repoPath: string, branch = "platform-pipeline") {
  execSync(`git checkout -b ${branch}`, { cwd: repoPath, stdio: "inherit" });
  execSync("git add .github/workflows/deploy.yml", { cwd: repoPath, stdio: "inherit" });
  execSync(`git commit -m 'Add CI/CD pipeline'`, { cwd: repoPath, stdio: "inherit" });
  execSync(`git push origin ${branch}`, { cwd: repoPath, stdio: "inherit" });
  console.log(`🚀 Changes pushed to ${branch}`);
}

async function main(repoUrl: string) {
  const repoName = repoUrl.split("/").pop()?.replace(/\.git$/, "") || "app";
  const tmpDir = path.join(__dirname, "..", "platform-projects", repoName);


  const isCloned = fs.existsSync(tmpDir);
  if (!isCloned) {
    console.log("🧱 Cloning repo...");

    const tmpBase = path.join(__dirname, '..', "platform-projects");
    if (!fs.existsSync(tmpBase)) {
      fs.mkdirSync(tmpBase, { recursive: true });
    }
    execSync(`git clone ${repoUrl} ${tmpDir}`);
  } else {
    console.log("🔄 Repo already exists. Pulling latest changes...");
    try {
      execSync(`git reset --hard`, { cwd: tmpDir });
      execSync(`git checkout main`, { cwd: tmpDir });
      execSync(`git pull`, { cwd: tmpDir });
    } catch (err) {
      console.error("⚠️ Error updating repo:", err);
      return;
    }
  }

  const techStack = await detectTechStack(tmpDir);
  if (!techStack) throw new Error(`❌ Could not detect tech stack in ${tmpDir}`);
  console.log(`📦 Detected tech stack: ${techStack}`);

  // Load optional .platformrc.json override
  const config = getPlatformConfig(tmpDir);

  const envContext = await getEnvContext(techStack, {
    repoName,
    vercelToken: process.env.VERCEL_TOKEN || '',
    renderToken: process.env.RENDER_TOKEN || '',
    configOverride: config?.env || {},
    dir: tmpDir,
  });

  await injectWorkflowTemplate({
    projectName: repoName,
    stack: techStack,
    outDir: tmpDir,
    env: envContext,
  });

  // Uncomment to commit and push
  // commitAndPush(tmpDir);
  console.log("✅ Workflow injection and push complete.");
}

const repo = process.argv[2];
if (!repo) {
  console.error("Usage: npx ts-node workflow-injector.ts <git-repo-url>");
  process.exit(1);
}

main(repo).catch((err) => {
  console.error("💥 Error:", err);
  process.exit(1);
});
