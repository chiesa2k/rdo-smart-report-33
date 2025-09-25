# RDO Supply Marine - Relatório Diário de Obra

[![Deploy to GitHub Pages](https://github.com/chiesa2k/rdo-smart-report-33/actions/workflows/deploy.yml/badge.svg)](https://github.com/chiesa2k/rdo-smart-report-33/actions/workflows/deploy.yml)

Aplicação para criação de Relatório Diário de Obra (RDO), com geração de PDF e armazenamento local de rascunhos. Deploy automático via GitHub Actions para GitHub Pages.

## Links rápidos

- Formulário (Index): https://chiesa2k.github.io/rdo-smart-report-33/
- Login: https://chiesa2k.github.io/rdo-smart-report-33/login
- Admin: https://chiesa2k.github.io/rdo-smart-report-33/admin

## Project info

**URL**: https://lovable.dev/projects/0893dbdf-52a1-4d7f-ae51-0a6fee0f40a7

## Como rodar localmente

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0893dbdf-52a1-4d7f-ae51-0a6fee0f40a7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

Requisitos: Node.js 20+ e npm.

```sh
git clone https://github.com/chiesa2k/rdo-smart-report-33.git
cd rdo-smart-report-33
npm install
npm run dev
```

O app estará em http://localhost:8080

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deploy manual (opcional)

O deploy automático via GitHub Actions já está configurado na branch `main`.

Para publicar manualmente usando gh-pages CLI:

```sh
npm run build
npx gh-pages -d dist
```

Certifique-se de que a origem do Pages está como “GitHub Actions” em Settings → Pages.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
