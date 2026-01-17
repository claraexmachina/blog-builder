#!/bin/bash
set -x  # Debug mode

echo "Fetching Git LFS files..."

# Download and install git-lfs
curl -sL https://github.com/git-lfs/git-lfs/releases/download/v3.4.0/git-lfs-linux-amd64-v3.4.0.tar.gz | tar xz
./git-lfs-3.4.0/git-lfs install --force

# Configure git credentials if GHTOKEN is available
if [ -n "$GHTOKEN" ]; then
  echo "Configuring GitHub credentials..."
  git config --global credential.helper store
  echo "https://x-access-token:${GHTOKEN}@github.com" > ~/.git-credentials

  # Also set the remote URL with token
  git remote set-url origin "https://x-access-token:${GHTOKEN}@github.com/claraexmachina/blog-builder.git"
fi

# Show LFS tracked files
echo "=== LFS tracked files ==="
./git-lfs-3.4.0/git-lfs ls-files

# Show LFS pointer files
echo "=== Checking for LFS pointers ==="
cat public/fonts/.gitkeep 2>/dev/null || echo "No .gitkeep content"
ls -la public/fonts/
ls -la public/images/

# Pull LFS files with verbose output
echo "=== Pulling LFS files ==="
./git-lfs-3.4.0/git-lfs pull -v

echo "=== After LFS pull ==="
ls -la public/fonts/
ls -la public/images/
