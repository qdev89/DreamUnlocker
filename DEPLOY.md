# Dream Unlocker - Deployment Guide

**Version:** 1.0.0-alpha.1
**Last Updated:** January 5, 2025

---

## 🚀 Automated Deploy (Recommended)

**✨ NEW: GitHub Actions Automated Deployment**

The easiest way to deploy - just push your code:

```bash
git push origin main
```

That's it! GitHub Actions will automatically:
- ✅ Build the frontend
- ✅ Deploy to Firebase
- ✅ Update https://dream-unlocker-mvp.web.app

**Setup Required:** Follow [GITHUB-ACTIONS-SETUP.md](./GITHUB-ACTIONS-SETUP.md) (one-time, 5 minutes)

**Benefits:**
- No Firebase CLI needed
- No manual build commands
- Automatic on every push to main
- View deployment status in GitHub Actions tab

---

## 🔧 Manual Deploy (Alternative)

For immediate manual deployment:

```bash
# 1. Navigate to project root
cd /home/user/DreamUnlocker

# 2. Install dependencies (if needed)
cd frontend && npm install && cd ..

# 3. Build for production
cd frontend && npm run build && cd ..

# 4. Deploy to Firebase
firebase deploy

# 5. Verify deployment
# Visit: https://dream-unlocker-mvp.web.app
```

**Expected Time:** 2-3 minutes

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All code changes committed
- [ ] Production build successful (`npm run build`)
- [ ] Tests passing (if applicable)
- [ ] Firebase logged in (`firebase login`)
- [ ] Correct Firebase project selected (`firebase use dream-unlocker-mvp`)
- [ ] Environment variables set (if any)

---

## 🔧 Detailed Deployment Steps

### Step 1: Prepare Environment

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Select correct project
firebase use dream-unlocker-mvp

# Verify project
firebase projects:list
```

### Step 2: Build Application

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if needed)
npm install

# Run production build
npm run build

# Verify build output
ls -lh dist/
```

**Expected Output:**
```
dist/
├── index.html          (0.49 kB)
├── assets/
│   ├── index-*.css    (~50 kB)
│   └── index-*.js     (~886 kB)
```

### Step 3: Deploy to Firebase

```bash
# From project root
cd ..

# Deploy hosting only
firebase deploy --only hosting

# Or deploy everything (hosting + rules)
firebase deploy
```

**Expected Output:**
```
=== Deploying to 'dream-unlocker-mvp'...

✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/dream-unlocker-mvp/overview
Hosting URL: https://dream-unlocker-mvp.web.app
```

### Step 4: Verify Deployment

```bash
# Check deployment status
firebase hosting:channel:list

# View recent deploys
firebase hosting:clone dream-unlocker-mvp:latest

# Test the live site
curl -I https://dream-unlocker-mvp.web.app
```

Visit: https://dream-unlocker-mvp.web.app

---

## 🔄 Deploy Specific Components

### Deploy Hosting Only
```bash
firebase deploy --only hosting
```

### Deploy Firestore Rules Only
```bash
firebase deploy --only firestore:rules
```

### Deploy Everything
```bash
firebase deploy
```

---

## 🧪 Preview Deployment (Optional)

Test deployment before going to production:

```bash
# Create preview channel
firebase hosting:channel:deploy preview

# View preview URL
# Output will show: https://dream-unlocker-mvp--preview-xyz.web.app
```

---

## 🔙 Rollback Deployment

If you need to rollback to a previous version:

```bash
# List previous versions
firebase hosting:clone dream-unlocker-mvp --list

# Rollback to specific version
firebase hosting:clone dream-unlocker-mvp:PREVIOUS_VERSION dream-unlocker-mvp:current
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules dist .vite
npm install
npm run build
```

### Deploy Fails: "No Project Active"
```bash
# Set active project
firebase use dream-unlocker-mvp

# Or set default
firebase use --add
```

### Deploy Fails: "Permission Denied"
```bash
# Re-authenticate
firebase logout
firebase login

# Verify permissions in Firebase Console
# IAM & Admin → Permissions
```

### Wrong Project Deployed
```bash
# List projects
firebase projects:list

# Switch project
firebase use <project-id>

# Deploy again
firebase deploy
```

---

## 📊 Post-Deployment Verification

### 1. Check Application Loads
```bash
curl -I https://dream-unlocker-mvp.web.app
# Should return: HTTP/2 200
```

### 2. Verify Firebase Console
- Visit: https://console.firebase.google.com/project/dream-unlocker-mvp
- Check Hosting → Domains
- Check Firestore → Data
- Check Authentication → Users

### 3. Test Core Features
- [ ] Load homepage
- [ ] Register new account
- [ ] Login with account
- [ ] Create a dream
- [ ] View dream list
- [ ] View analytics

### 4. Monitor for Errors
```bash
# View Firebase logs
firebase functions:log

# Or check in console
# Firebase Console → Functions → Logs
```

---

## 🔐 Security Checks

### Verify Security Rules
```bash
# View current rules
firebase firestore:rules:get

# Test rules (if you have test suite)
firebase emulators:start
npm run test:firestore-rules
```

### Verify Authentication
- [ ] Registration works
- [ ] Login works
- [ ] Protected routes are protected
- [ ] User data is isolated

---

## 📈 Performance Monitoring

### Check Lighthouse Scores
```bash
# Install lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://dream-unlocker-mvp.web.app --view
```

**Target Scores:**
- Performance: > 85
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### Monitor in Firebase
- Firebase Console → Performance
- Firebase Console → Analytics
- Firebase Console → Crashlytics

---

## 🔄 Continuous Deployment

**✅ GitHub Actions workflow already configured!**

The workflow file is located at `.github/workflows/firebase-deploy.yml` and will automatically deploy on push to `main` or `master` branch.

**Setup Instructions:** See [GITHUB-ACTIONS-SETUP.md](./GITHUB-ACTIONS-SETUP.md) for complete setup guide.

**How it works:**
1. Push code to main branch
2. GitHub Actions triggers automatically
3. Builds frontend (`npm run build`)
4. Deploys to Firebase
5. App is live at https://dream-unlocker-mvp.web.app

**Monitor Deployments:**
- GitHub → Actions tab
- View real-time deployment progress
- Check logs for any issues

---

## 📝 Deployment Log Template

Keep a deployment log for tracking:

```
=== Deployment Log ===
Date: [YYYY-MM-DD]
Time: [HH:MM]
Version: 1.0.0-alpha.1
Deployed By: [Name]
Branch: claude/review-and-rework-011CULoiAG8vBQoHzRqUdd3C
Commit: [commit hash]
Build Time: [seconds]
Deploy Time: [seconds]
Status: [Success/Failed]
Issues: [None/List issues]
Rollback Required: [Yes/No]
Notes: [Additional notes]
```

---

## 🆘 Emergency Contacts

If deployment issues occur:

1. **Check Firebase Status**: https://status.firebase.google.com
2. **Review Firebase Docs**: https://firebase.google.com/docs/hosting
3. **Check Recent Changes**: `git log -5`
4. **Rollback if Needed**: See rollback section above

---

## ✅ Deployment Completion Checklist

After successful deployment:

- [ ] Application loads at https://dream-unlocker-mvp.web.app
- [ ] All core features tested
- [ ] No console errors
- [ ] Firebase Console shows active deployment
- [ ] Security rules deployed
- [ ] Analytics tracking (if enabled)
- [ ] Performance acceptable
- [ ] Mobile responsive verified
- [ ] Documentation updated
- [ ] Team notified of deployment

---

## 🎯 Next Steps After Deployment

1. **Monitor for 24-48 hours**
   - Check Firebase Console daily
   - Monitor error rates
   - Track user registrations

2. **Gather Feedback**
   - Create feedback form
   - Monitor user behavior
   - Track feature usage

3. **Plan Next Release**
   - Review Alpha 1.0 performance
   - Prioritize Phase 2 features
   - Set Beta timeline

---

**🚀 Ready to Deploy Alpha 1.0!**

**Command to Deploy:**
```bash
cd /home/user/DreamUnlocker && firebase deploy
```

**Live URL:** https://dream-unlocker-mvp.web.app

---

*Last Updated: January 5, 2025*
*Version: 1.0.0-alpha.1*
