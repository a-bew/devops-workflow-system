# DevOps Platform - CI/CD Workflow Injector

This platform automates detection of tech stacks and injects matching CI/CD workflow templates into repositories. It supports deployment to Render and Vercel, working seamlessly with monorepos or standalone apps.

---

## ✅ Features

- 🔍 Auto-detect tech stack (`flask`, `django`, `react-vite`, `nextjs`, `angular`)
- 📦 Inject GitHub Actions workflows using Mustache templates
- 🚀 Supports Render and Vercel deployments
- 🧠 Tech stack detection based on presence of `package.json`, `requirements.txt`, `manage.py`, etc.
- 🏗️ Smart folder structure handling
- 🔁 Automatic repo pull/update for latest changes
- 🧪 Includes test steps in Python workflows
- 💨 One-command setup: clone, detect, inject, commit, and push

---

## 🏁 Usage

### Inject Workflow for a Remote Repo

```bash
npx ts-node workflow-injector.ts <repo-url>
```

> Example:
```bash
npx ts-node workflow-injector.ts https://github.com/a-bew/DebateForum
```

This will:
1. Clone repo (or pull latest if already cloned)
2. Detect the tech stack (e.g. Flask)
3. Inject the correct template from `pipelines/templates`
4. Push to GitHub with `.github/workflows/<detected>.yml`

---

## 📁 Project Structure

```bash
generator/
├── workflow/
│   ├── templates/
│   │   ├── flask-render.mustache.yml
│   │   ├── django-render.mustache.yml
│   │   ├── react-vite-vercel.mustache.yml
│   │   ├── nextjs-vercel.mustache.yml
│   │   └── angular-render.mustache.yml
│   ├── inject.ts            # Workflow injection logic
└── workflow-injector.ts  # CLI entry point
```

---

## ⚙️ Supported Templates

| Stack         | Deployment | Template Filename               |
|---------------|------------|---------------------------------|
| Flask         | Render     | `flask-render.mustache.yml`     |
| Django        | Render     | `django-render.mustache.yml`    |
| React + Vite  | Vercel     | `react-vite-vercel.mustache.yml`|
| Next.js       | Vercel     | `nextjs-vercel.mustache.yml`    |
| Angular       | Render     | `angular-render.mustache.yml`   |

More stacks can easily be added by creating templates and updating the detection logic.

---

## 🧠 Tech Stack Detection Logic (Simplified)

```ts
if (package.json exists) {
  if ("next" in dependencies) return "nextjs";
  if ("vite" in dependencies) return "react-vite";
  if ("@angular/core" in dependencies) return "angular";
}

if (requirements.txt exists) {
  if ("django" in content or manage.py exists) return "django";
  if ("flask" in content) return "flask";
}

return "unknown";
```

---

## 🔐 Secrets Needed

> Add these to your GitHub repo's settings > Secrets

| Template | Required Secret            |
|----------|----------------------------|
| Render   | `RENDER_DEPLOY_HOOK_URL`   |
| Vercel   | `VERCEL_TOKEN`             |

---

## ✍️ Customization

You can modify the `.mustache.yml` files to adjust:
- Node/Python version
- Branch name (default: `main`)
- Additional build or test steps

Use Mustache syntax like `{{ projectName }}` or `{{ deployHookUrl }}` for dynamic injection.

---

## 🧪 Future Improvements

- [ ] Add Express + Railway template
- [ ] Monorepo awareness with subdirectory workflow injection
- [ ] Terraform + Ansible deployment support
- [ ] Improved logging/metrics on deployment step
- [ ] Multi-env (staging/production) workflows

---

## 🧼 Cleanup

Temporary clones live in `platform-projects/`. You can clean them manually or script their removal.

```bash
rm -rf platform-projects/
```

---

## 🤝 Contributing

Feel free to add more templates and enhance detection logic in `inject.ts`.

Happy shipping 🚀
# deployfast# devops-workflow-system
