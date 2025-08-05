PROJECT_DIR=platform-projects/project-123

init:
	@echo "🔧 Initializing local platform setup..."

inject:
	npx ts-node scripts/inject-workflow.ts ./repos/test-app

infra-init:
	cd $(PROJECT_DIR)/terraform && terraform init

infra-plan:
	cd $(PROJECT_DIR)/terraform && terraform plan

infra-up:
	cd $(PROJECT_DIR)/terraform && terraform apply -auto-approve

infra-down:
	cd $(PROJECT_DIR)/terraform && terraform destroy -auto-approve

provision:
	cd $(PROJECT_DIR)/ansible && ansible-playbook -i inventory playbook.yml

deploy:
	curl -X POST http://localhost:3000/deploy -d '{"projectId":"project-123"}' -H "Content-Type: application/json"

monitor-setup:
	@echo "📊 Setting up Prometheus monitoring"
	@docker-compose -f docker/prometheus-compose.yml up -d

test-all: inject infra-up provision deploy monitor-setup
