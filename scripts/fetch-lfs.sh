#!/bin/bash
echo "Fetching Git LFS files..."

# Download and install git-lfs
curl -sL https://github.com/git-lfs/git-lfs/releases/download/v3.4.0/git-lfs-linux-amd64-v3.4.0.tar.gz | tar xz
./git-lfs-3.4.0/git-lfs install --force

# Configure git credentials if GH_TOKEN is available
if [ -n "$GHTOKEN" ]; then
  echo "Configuring GitHub credentials..."
  git config --global credential.helper store
  echo "https://x-access-token:${GHTOKEN}@github.com" > ~/.git-credentials
fi

# Pull LFS files
./git-lfs-3.4.0/git-lfs pull

echo "LFS files fetched!"
echo "=== Fonts ==="
ls -la public/fonts/
echo "=== Images ==="
ls -la public/images/
