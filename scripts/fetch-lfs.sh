#!/bin/bash
echo "Fetching Git LFS files..."
curl -sL https://github.com/git-lfs/git-lfs/releases/download/v3.4.0/git-lfs-linux-amd64-v3.4.0.tar.gz | tar xz
./git-lfs-3.4.0/git-lfs install --force
./git-lfs-3.4.0/git-lfs pull
echo "LFS files fetched!"
ls -la public/fonts/
ls -la public/images/
