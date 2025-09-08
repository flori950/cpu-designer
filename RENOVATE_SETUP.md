# Renovate Setup Guide

This project uses GitHub's Renovate app for automated dependency management.

## Setup Instructions

1. **Install the Renovate App**:
   - Go to [GitHub Marketplace - Renovate](https://github.com/marketplace/renovate)
   - Click "Install it for free"
   - Select your repository (`flori950/cpu-designer`)
   - Grant the necessary permissions

2. **Configuration**:
   - Renovate will automatically read the `.github/renovate.json` configuration file
   - No additional setup or tokens required
   - The app runs automatically based on the schedule defined in the config

3. **How it Works**:
   - Renovate scans your `package.json` for outdated dependencies
   - Creates pull requests for updates according to your configuration
   - Runs every Monday before 6 AM (Europe/Berlin timezone)
   - Can also be triggered manually via the dependency dashboard

## Configuration Features

- **Automatic merging**: Minor and patch updates are auto-merged
- **Manual review**: Major updates require manual approval
- **Grouped updates**: Related packages (build tools, linting tools, etc.) are grouped together
- **Vulnerability alerts**: Security updates are prioritized and auto-merged
- **Lock file maintenance**: Package lock files are kept up to date

## Monitoring

Once installed, you can monitor Renovate activity:
- Check the "Issues" tab for the Dependency Dashboard
- Review pull requests created by Renovate
- View the Actions tab for any workflow runs (though most activity happens via the app)

## Troubleshooting

If you're not seeing any Renovate activity:
1. Ensure the app is installed and has access to your repository
2. Check that your `package.json` contains dependencies to update
3. Verify the configuration in `.github/renovate.json` is valid
4. Look for any error messages in the repository's Issues tab
