#!/bin/bash
# ./scripts/run-local.sh

set -e

echo "🧠 Injecting workflow..."
npx ts-node stacks-detector/inject-workflow.ts ./repos/test-app

echo "🚀 Applying infrastructure..."
cd platform-projects/project-123/terraform
terraform init
terraform apply -auto-approve

echo "🔧 Running Ansible provisioner..."
cd ../ansible
ansible-playbook -i inventory playbook.yml

echo "📦 Deploying app..."
curl -X POST http://localhost:3000/deploy -H "Content-Type: application/json" -d '{"projectId":"project-123"}'

echo "✅ Done."
