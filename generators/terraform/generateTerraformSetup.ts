import fs from 'fs';
import path from 'path';
import mustache from 'mustache';

export interface TerraformSetupOptions {
  projectId: string;
  templateName: string; // e.g., 'aws-ec2.mustache.tf'
  outputFileName?: string; // optional override, defaults to 'main.tf'
  variables: Record<string, string>;
}

export function generateTerraformSetup({
  projectId,
  templateName,
  outputFileName = 'main.tf',
  variables,
}: TerraformSetupOptions) {
  const templatePath = path.join(__dirname, templateName);
  const outputDir = path.join(process.cwd(), 'platform-projects', projectId, 'terraform', 'templates');

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Terraform template not found: ${templatePath}`);
  }

  const template = fs.readFileSync(templatePath, 'utf-8');
  const rendered = mustache.render(template, variables);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, outputFileName);
  fs.writeFileSync(outputPath, rendered);

  console.log(`✅ Terraform setup generated at: ${outputPath}`);
}
