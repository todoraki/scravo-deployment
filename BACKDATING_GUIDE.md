# 📅 Git Backdating Guide

## ⚠️ Important Warning
Backdating commits rewrites Git history. Only do this on new/private repositories.

## Step 1: Backup Current Work
```bash
# Create a backup branch
git branch backup-before-backdate
```

## Step 2: Reset to Start Fresh (Optional)
```bash
# Remove all commits but keep files
git reset --soft $(git rev-list --max-parents=0 HEAD)

# OR start completely fresh
rm -rf .git
git init
```

## Step 3: Run Your Backdating Script
```bash
# Make your script executable
chmod +x your-backdate-script.sh

# Run it
./your-backdate-script.sh
```

## Step 4: Push to Both Repositories
```bash
# Force push to origin (SEM_PROJECT)
git push origin main --force

# Force push to sem
git push sem main --force
```

## Date Format Examples
```bash
# Format: YYYY-MM-DD HH:MM:SS

GIT_AUTHOR_DATE="2024-11-01 10:00:00" \
GIT_COMMITTER_DATE="2024-11-01 10:00:00" \
git commit -m "Your message" --author="bitsian25 <vigneshavi1@gmail.com>"
```

## Useful Commands
```bash
# View commit history with dates
git log --pretty=format:"%h %ad | %s%d [%an]" --date=short

# View detailed log
git log --pretty=fuller

# Amend last commit date
git commit --amend --no-edit --date="2024-11-01 10:00:00"
```

## Troubleshooting
- If push is rejected: Use `--force` flag
- To restore backup: `git checkout backup-before-backdate`
- To undo force push: Contact GitHub support (within 24 hours)
