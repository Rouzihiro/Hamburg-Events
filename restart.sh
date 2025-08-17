#!/bin/bash
set -e

REPO_URL="git@github.com:Rouzihiro/Hamburg-Events.git"
REPO_NAME="Hamburg-Events"

echo "Do you want to clone a fresh copy? (y/n)"
read -r clone_choice

if [[ "$clone_choice" == "y" || "$clone_choice" == "Y" ]]; then
    echo "Cloning fresh repo..."
    rm -rf "$REPO_NAME"   # remove old folder if it exists
    git clone "$REPO_URL"
    cd "$REPO_NAME" || exit 1
else
    echo "Skipping clone, using current directory..."
fi

# Remove old git history
echo "Removing .git folder..."
rm -rf .git

# Re-initialize repo
echo "Re-initializing git..."
git init
git branch -M main

# Add and commit
echo "Adding files and committing..."
git add .
git commit -m "Initial commit - fresh start"

# Re-add remote
echo "Setting remote origin..."
git remote add origin "$REPO_URL"

# Force push
echo "Force pushing to GitHub..."
git push -u --force origin main

echo "✅ Repo has been reset with a fresh initial commit."

