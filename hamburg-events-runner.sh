#!/bin/sh

# Run the Node.js script
node screenshot.js
if [ $? -ne 0 ]; then
  echo "Error: screenshot.js did not run successfully."
  exit 1
fi

# Stage all changes for commit
git add .

# Commit changes:
# --amend will overwrite the previous commit
# If there's no previous commit yet, this will fail, so we fall back to a normal commit
git commit --amend -m "Latest screenshots $(date '+%Y-%m-%d %H:%M:%S')" || \
git commit -m "Latest screenshots $(date '+%Y-%m-%d %H:%M:%S')"

if [ $? -ne 0 ]; then
  echo "Error: git commit failed."
  exit 1
fi

# Force push to main (overwrite remote history)
git push -f origin main
if [ $? -ne 0 ]; then
  echo "Error: git push failed."
  exit 1
fi

echo "Success: Latest screenshots pushed (history overwritten)"
