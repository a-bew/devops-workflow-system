import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';


export function detectTechStack(repoPath: string): string {
  const pkgPath = path.join(repoPath, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    if (pkg.dependencies?.["next"]) return "nextjs";
    if (pkg.devDependencies?.["vite"] || pkg.dependencies?.["vite"]) return "react-vite";
    if (pkg.dependencies?.["@angular/core"]) return "angular";
    return "node"; // fallback if package.json exists but not specific stack
  }

  const requirementsPath = path.join(repoPath, "requirements.txt");
  const managePy = path.join(repoPath, "manage.py");
  const appPy = path.join(repoPath, "app.py");
  if (fs.existsSync(requirementsPath)) {
    const content = fs.readFileSync(requirementsPath, "utf8").toLowerCase();
    if (content.includes("django") || fs.existsSync(managePy)) return "django";
    if (content.includes("flask") || fs.existsSync(appPy)) return "flask";
  }

  const goMain = path.join(repoPath, "main.go");
  if (fs.existsSync(goMain)) return "go";

  return "unknown";
}

export function getPlatformConfig(dir: string): { env?: Record<string, string> } {
  const configPath = path.join(dir, '.platformrc.json');
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      console.warn(`⚠️ Failed to parse .platformrc.json: ${e}`);
    }
  }
  return {};
}

export async function getEnvContext(
  tech: string,
  {
    repoName,
    vercelToken,
    renderToken,
    dir,
    configOverride = {},
  }: {
    repoName: string;
    vercelToken: string;
    renderToken: string;
    dir: string;
    configOverride?: Record<string, string>;
  }
): Promise<Record<string, string>> {
  const envContext: Record<string, string> = {};

  // 1. Base values from stack
  switch (tech) {
    case 'react-vite':
    case 'nextjs-vercel':
      envContext.projectName = repoName;
      envContext.VERCEL_TOKEN = vercelToken;
      break;
    case 'django':
    case 'flask':
      envContext.serviceName = repoName;
      envContext.RENDER_TOKEN = renderToken;
      break;
    case 'node-aws':
      envContext.projectName = repoName;
      envContext.AWS_REGION = 'us-east-1';
      break;
    default:
      break;
  }

  // 2. Load from .env.sample
  const samplePath = path.join(dir, '.env.sample');
  if (fs.existsSync(samplePath)) {
    const sample = dotenv.parse(fs.readFileSync(samplePath));
    Object.assign(envContext, sample);
  }

  // 3. Load overrides from .platformrc.json
  const platformOverrides = getPlatformConfig(dir);
  Object.assign(envContext, platformOverrides.env || {});

  // 4. Apply direct configOverride (highest priority)
  Object.assign(envContext, configOverride);

  return envContext;
}

