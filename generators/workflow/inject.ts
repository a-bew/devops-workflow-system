// File: my-platform/pipelines/inject.ts

import * as fs from 'fs';
import * as path from 'path';
import Mustache from 'mustache';

interface VercelProject {
  id: string;
  name: string;
}

interface RenderService {
  service: {
    id: string;
    name: string;
  };
}

export const TEMPLATE_MAP: Record<string, string> = {
  "react-vite": "vite-react.mustache.yml",
  "nextjs-vercel": "vercel-nextjs.mustache.yml",
  "django": "django-render.mustache.yml",
  "flask": "flask-render.mustache.yml",
  "node-aws": "aws-node.mustache.yml"
};

export async function getVercelProjectId(projectName: string, token: string, teamId?: string): Promise<string | null> {
  const url = new URL('https://api.vercel.com/v9/projects');
  if (teamId) url.searchParams.append('teamId', teamId);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = (await res.json()) as { projects: VercelProject[] };
  const project = data.projects.find((p: VercelProject) => p.name === projectName);
  return project?.id || null;
}

export async function getRenderServiceId(serviceName: string, token: string): Promise<string | null> {
  const res = await fetch('https://api.render.com/v1/services', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json()) as RenderService[];

  const service = data.find((s: RenderService) => s.service.name === serviceName);
  return service?.service.id || null;
}

const transformers: Record<string, (env: Record<string, string>) => Promise<Record<string, string>>> = {
  'react-vite': async (env) => {
    const vercelProjectId = await getVercelProjectId(env.projectName, env.VERCEL_TOKEN);
    return {
      ...env,
      VERCEL_PROJECT_ID: vercelProjectId || '',
    };
  },
  'django': async (env) => {
    const renderServiceId = await getRenderServiceId(env.serviceName, env.RENDER_TOKEN);
    return {
      ...env,
      RENDER_SERVICE_ID: renderServiceId || '',
    };
  },
};

export async function injectWorkflowTemplate({
  stack,
  projectName,
  env,
  outDir,
  customSteps,
}: {
  stack: string;
  projectName: string;
  env: Record<string, string>;
  outDir: string;
  customSteps?: string[];
}) {
  const templateFile = TEMPLATE_MAP[stack];
  if (!templateFile) {
    throw new Error(`❌ No workflow template available for stack: ${stack}`);
  }
  const templatePath = path.join(__dirname, 'templates', templateFile);
  const template = fs.readFileSync(templatePath, 'utf-8');

  const transformer = transformers[stack];
  const finalEnv = transformer ? await transformer(env) : env;

  const output = Mustache.render(template, {
    projectName,
    env: finalEnv,
    customSteps,
  });

  const dest = path.join(outDir, '.github', 'workflows');
  fs.mkdirSync(dest, { recursive: true });
  fs.writeFileSync(path.join(dest, `${stack}.yml`), output);

  console.log(`✅ Injected ${stack}.yml into ${dest}`);
}