# Deployment Configuration for florian-hunter.de
# Processor Design Tool - FTP Deployment Settings

## FTP Server Configuration
- **Host**: Your FTP server hostname
- **Target Directory**: `/public_html/processor-design-tool/`
- **Protocol**: FTP/SFTP
- **Port**: 21 (FTP) / 22 (SFTP)

## Required GitHub Secrets
To enable automatic deployment, add these secrets to your GitHub repository:

### FTP_HOST
Your FTP server hostname (e.g., `ftp.florian-hunter.de`)

### FTP_USERNAME  
Your FTP username

### FTP_PASSWORD
Your FTP password

### RENOVATE_TOKEN (Optional)
GitHub Personal Access Token for Renovate dependency updates

## Deployment Process
1. **Trigger**: Push to `main` branch
2. **Build**: Run `npm run build` to create production bundle
3. **Test**: All tests must pass before deployment
4. **Deploy**: Upload `dist/` folder contents to FTP server
5. **Verify**: Build info file created with deployment metadata

## Manual Deployment
For manual deployment, you can use:

```bash
# Build the project
npm run build

# Upload dist/ folder to your FTP server
# Target: /public_html/processor-design-tool/
```

## Directory Structure on Server
```
/public_html/processor-design-tool/
├── index.html
├── assets/
│   ├── index-[hash].css
│   └── index-[hash].js
├── vite.svg
└── build-info.txt
```

## Environment Variables
- **NODE_ENV**: `production` for optimized builds
- **BUILD_DATE**: Automatically set during CI/CD
- **COMMIT_HASH**: Current Git commit SHA
- **DEPLOY_URL**: `https://florian-hunter.de/processor-design-tool/`

## Monitoring & Logs
- GitHub Actions logs available in repository Actions tab
- FTP deployment logs stored in CI/CD workflow
- Build artifacts preserved for 30 days

## Rollback Procedure
1. Revert commit in main branch
2. Re-trigger deployment workflow
3. Or manually upload previous build from GitHub Actions artifacts

## Security Notes
- FTP credentials stored as GitHub Secrets
- No sensitive data in build artifacts
- HTTPS enforced on production domain
- Build info includes commit hash for traceability
