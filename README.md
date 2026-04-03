<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Project Development Setup

This repository contains the source code for the frontend application.

## Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Set up your environment variables
   ```bash
   cp .env.example .env.local
   ```
   *Note: update the `.env.local` to match your local setup.*

3. Run the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev`: Starts the local Vite development server
- `npm run build`: Bundles the application into the `dist` directory for production
- `npm run preview`: Previews the production build locally
- `npm run lint`: Runs type checking via TypeScript

## Deployment

A GitHub Actions workflow is included at `.github/workflows/deploy.yml`. 
By default, it will automatically build and deploy the React application to **GitHub Pages** whenever modifications are pushed to the `main` branch. 

To enable this:
1. Ensure your repository settings allow GitHub Actions to build and deploy to Pages.
2. Go to `Settings -> Pages`, change the `Source` to `GitHub Actions`.
