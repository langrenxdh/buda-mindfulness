# Buda · 禅房 - Publishing Guide

## 📦 Step 1: Create GitHub Repository

**Option A: Using GitHub CLI (if installed)**
```bash
cd ~/projects/buda
gh repo create buda-mindfulness --public --description="🧘 Beautiful mindfulness reminder app"
git push -u origin master
```

**Option B: Manual Setup**
1. Go to: https://github.com/new
2. Repository name: `buda-mindfulness`
3. Description: `🧘 Beautiful mindfulness reminder app with AI-powered prompts`
4. Public ✓
5. **Don't** initialize with README (we already have one)
6. Click "Create repository"
7. Run these commands:
```bash
cd ~/projects/buda
git remote add origin https://github.com/YOUR_USERNAME/buda-mindfulness.git
git push -u origin master
```

## 🌐 Step 2: Enable GitHub Pages

1. Go to repo settings: `https://github.com/YOUR_USERNAME/buda-mindfulness/settings/pages`
2. Source: Deploy from a branch
3. Branch: `master` / `(root)`
4. Click "Save"
5. Wait 1-2 minutes
6. Site will be live at: `https://YOUR_USERNAME.github.io/buda-mindfulness/`

## 🔒 Step 3: Get Custom Domain (buda.js.org)

**Prerequisites:**
- GitHub Pages enabled ✓
- Site working at github.io URL ✓

**Steps:**
1. Fork: https://github.com/js-org/dns.js.org
2. Edit `cnames_active.csv`
3. Add new line:
   ```
   buda,yourusername.github.io/buda-mindfulness
   ```
   (Replace `yourusername` with your actual GitHub username)
4. Commit changes
5. Create Pull Request
6. Title: "Add buda.js.org subdomain"
7. Description:
   ```
   # Buda · 禅房

   Mindfulness reminder app with AI-powered prompts.

   Live demo: https://yourusername.github.io/buda-mindfulness/
   Source: https://github.com/yourusername/buda-mindfulness
   ```
8. Submit PR
9. Wait 1-2 days for approval
10. Once merged: https://buda.js.org will be live!

**HTTPS:**
- Automatically enabled via Let's Encrypt
- No configuration needed
- Auto-renews every 90 days

## ✅ Current Status

**Completed:**
- ✅ Prompt enrichment system created
- ✅ 35 prompts in data/prompts.json
- ✅ Generation script ready
- ✅ index.html loads from JSON
- ✅ Local git commit created

**Ready to:**
- 🔄 Create GitHub repository
- 🔄 Enable GitHub Pages
- 🔄 Submit to JS.org

## 🚀 Quick Commands

**Generate more prompts (optional):**
```bash
cd ~/projects/buda
npm run generate-prompts -- --count 200 --provider anthropic
git add data/prompts.json
git commit -m "Enrich prompts to 200"
git push
```

**Test locally:**
```bash
python3 -m http.server 3000
# Open: http://localhost:3000
```

**Deploy updates:**
```bash
git add .
git commit -m "Update"
git push
```

## 📝 Notes

- **Free hosting:** GitHub Pages (100% free)
- **Free HTTPS:** Let's Encrypt via JS.org
- **Free domain:** buda.js.org
- **Total cost:** $0
