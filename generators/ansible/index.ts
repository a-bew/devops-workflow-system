// devops-platform/generators/ansible/index.ts

import fs from 'fs';
import path from 'path';
import Mustache from 'mustache';

export function generateAnsibleSetup({
  outputDir,
  ansibleUser = 'ubuntu',
}: {
  outputDir: string;
  ansibleUser?: string;
}) {
  const templatePath = path.join(__dirname, 'templates', 'docker-setup.mustache.yml');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const rendered = Mustache.render(template, { ansible_user: ansibleUser });

  const ansibleDir = path.join(outputDir, 'ansible');
  fs.mkdirSync(ansibleDir, { recursive: true });

  fs.writeFileSync(path.join(ansibleDir, 'playbook.yml'), rendered);
  console.log('✅ Ansible playbook generated in', ansibleDir);
}
