#!/bin/bash
# LFS 파일 설정 스크립트
# 이 스크립트를 로컬에서 실행하세요

set -e

echo "=== Git LFS 초기화 ==="
git lfs install

echo "=== .gitattributes 확인 ==="
cat .gitattributes

echo ""
echo "=== 현재 public/images 내용 ==="
ls -la public/images/

echo ""
echo "============================================"
echo "다음 단계를 수동으로 진행하세요:"
echo "============================================"
echo ""
echo "1. 이미지 파일을 public/images/ 폴더에 복사하세요:"
echo "   - pixel-room.png (필요시)"
echo ""
echo "2. 파일 복사 후 다음 명령어를 실행하세요:"
echo ""
echo "   git add .gitattributes"
echo "   git add public/images/*.png"
echo "   git commit -m 'feat: Add images via LFS'"
echo "   git push"
echo ""
echo "3. 푸시 후 git lfs ls-files 로 확인하세요"
echo ""
