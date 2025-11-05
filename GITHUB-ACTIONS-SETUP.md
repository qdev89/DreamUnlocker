# GitHub Actions Automated Deployment Setup

This guide will help you set up automated Firebase deployment using GitHub Actions. Once configured, pushing to the `main` or `master` branch will automatically deploy your application to Firebase.

## 🎯 Benefits

- ✅ **No manual CLI commands** - Just `git push` to deploy
- ✅ **Automatic builds** - GitHub builds your frontend on every push
- ✅ **Deploy on push** - Instant deployment to Firebase
- ✅ **No local Firebase CLI needed** - Everything runs in the cloud
- ✅ **Free for public repos** - GitHub Actions is free for open source

## 📋 Prerequisites

- GitHub repository with this code
- Firebase project (`dream-unlocker-mvp`)
- Admin access to both GitHub and Firebase

## 🔧 One-Time Setup (5 minutes)

### Step 1: Generate Firebase Service Account Key

1. Open [Firebase Console](https://console.firebase.google.com/project/dream-unlocker-mvp/settings/serviceaccounts/adminsdk)
2. Navigate to **Project Settings** > **Service Accounts**
3. Click **Generate New Private Key**
4. Click **Generate Key** (downloads a JSON file)
5. **IMPORTANT**: Keep this file secure - it grants full access to your Firebase project

### Step 2: Add Secret to GitHub

1. Open your GitHub repository: https://github.com/qdev89/DreamUnlocker
2. Go to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Set the details:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT_DREAM_UNLOCKER_MVP`
   - **Value**: Paste the **entire contents** of the JSON file you downloaded
5. Click **Add secret**

### Step 3: Verify Workflow File

The workflow file has been created at `.github/workflows/firebase-deploy.yml`. It will:
- Trigger on push to `main` or `master` branch
- Install dependencies
- Build the frontend
- Deploy to Firebase automatically

### Step 4: Push the Workflow

```bash
git add .github/workflows/firebase-deploy.yml GITHUB-ACTIONS-SETUP.md
git commit -m "🚀 Add GitHub Actions for automated Firebase deployment"
git push
```

### Step 5: Merge to Main Branch (if needed)

If you're working on a feature branch:

```bash
# Create a pull request to main branch
gh pr create --title "Setup automated deployment" --body "Add GitHub Actions workflow for Firebase deployment"

# Or merge directly if you have permissions
git checkout main
git merge claude/review-and-rework-011CULoiAG8vBQoHzRqUdd3C
git push
```

## 🚀 How to Deploy (After Setup)

Once setup is complete, deployment is automatic:

```bash
# Make your changes
git add .
git commit -m "Your commit message"
git push origin main
```

That's it! GitHub Actions will:
1. ✅ Checkout your code
2. ✅ Install dependencies
3. ✅ Build the frontend
4. ✅ Deploy to Firebase
5. ✅ Your app is live at https://dream-unlocker-mvp.web.app

## 📊 Monitor Deployments

### View Deployment Status

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. See the deployment progress in real-time
4. Click on any workflow run to see detailed logs

### Check Deployment Success

- ✅ **Green checkmark** = Deployment successful
- ❌ **Red X** = Deployment failed (click to see logs)
- 🟡 **Yellow circle** = Deployment in progress

## 🔍 Troubleshooting

### Deployment fails with "Firebase service account secret not found"

**Solution**: Double-check the secret name in GitHub matches exactly:
- Required name: `FIREBASE_SERVICE_ACCOUNT_DREAM_UNLOCKER_MVP`
- Check: Settings > Secrets and variables > Actions

### Deployment fails with "Permission denied"

**Solution**: Regenerate the Firebase service account key:
1. Go to Firebase Console > Service Accounts
2. Generate a new private key
3. Update the GitHub secret with the new key

### Build fails with "Module not found"

**Solution**: Ensure `frontend/package-lock.json` is committed:
```bash
git add frontend/package-lock.json
git commit -m "Add package-lock.json for consistent builds"
git push
```

### Deployment succeeds but site shows old version

**Solution**: Firebase CDN caching:
1. Wait 5-10 minutes for CDN to update
2. Or hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
3. Or clear browser cache

## 🔄 Manual Deployment Trigger

You can manually trigger a deployment without pushing code:

1. Go to **Actions** tab in GitHub
2. Click on **Deploy to Firebase** workflow
3. Click **Run workflow** dropdown
4. Select branch and click **Run workflow**

## 🎛️ Workflow Configuration

The workflow file is located at `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main        # Triggers on push to main
      - master      # Triggers on push to master
  workflow_dispatch:  # Allows manual trigger

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 20
      - Install dependencies (npm ci)
      - Build frontend (npm run build)
      - Deploy to Firebase
```

## 🔐 Security Best Practices

✅ **DO**:
- Keep service account JSON secure
- Use GitHub Secrets (never commit credentials)
- Rotate service account keys periodically
- Review deployment logs for sensitive data

❌ **DON'T**:
- Commit service account JSON to repository
- Share service account key publicly
- Use the same key across multiple projects
- Store secrets in code or configuration files

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [Firebase Hosting GitHub Action](https://github.com/FirebaseExtended/action-hosting-deploy)

## 🆘 Need Help?

If you encounter issues:

1. Check the Actions tab for detailed error logs
2. Review the [Troubleshooting](#-troubleshooting) section above
3. Verify Firebase project permissions
4. Check GitHub secret configuration

---

**🎉 Once setup is complete, you'll never need to run `firebase deploy` manually again!**

Just `git push` and GitHub Actions handles everything automatically.
