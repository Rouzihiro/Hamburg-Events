#!/bin/sh

# Run the Node.js script
node screenshot.js

# Check if the Node.js script executed successfully
if [ $? -ne 0 ]; then
  echo "Error: screenshot.js did not run successfully."
  exit 1
fi

# Stage all changes for commit
git add .

# Get the current date and time for the commit message
commit_message="Automated commit on $(date "+%Y-%m-%d %H:%M:%S")"

# Commit the changes
git commit -m "$commit_message"

# Check if commit was successful
if [ $? -ne 0 ]; then
  echo "Error: git commit failed."
  exit 1
fi

# Push the changes to the main branch
git push -u origin main

# Check if push was successful
if [ $? -ne 0 ]; then
  echo "Error: git push failed."
  exit 1
fi

# If everything was successful
echo "Success: Changes have been committed and pushed."
