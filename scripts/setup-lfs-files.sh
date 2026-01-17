#!/bin/bash
# LFS 파일 설정 스크립트
# 이 스크립트를 로컬에서 실행하세요

set -e

echo "=== Git LFS 초기화 ==="
git lfs install

echo "=== .gitattributes 확인 ==="
cat .gitattributes

echo ""
echo "=== 현재 public/fonts 내용 ==="
ls -la public/fonts/

echo ""
echo "=== 현재 public/images 내용 ==="
ls -la public/images/

echo ""
echo "============================================"
echo "다음 단계를 수동으로 진행하세요:"
echo "============================================"
echo ""
echo "1. 폰트 파일들을 public/fonts/ 폴더에 복사하세요:"
echo "   - Limgul13.ttf"
echo "   - Limgul14.ttf"
echo "   - Limgul16.ttf"
echo "   - Limgul20.ttf"
echo ""
echo "2. 픽셀룸 이미지를 public/images/ 폴더에 복사하세요:"
echo "   - pixel-room.png"
echo ""
echo "3. 파일 복사 후 다음 명령어를 실행하세요:"
echo ""
echo "   git add .gitattributes"
echo "   git add public/fonts/*.ttf"
echo "   git add public/images/*.png"
echo "   git commit -m 'feat: Add Limgul fonts and pixel room image via LFS'"
echo "   git push -u origin claude/personal-blog-setup-xgxEA"
echo ""
echo "4. 푸시 후 git lfs ls-files 로 확인하세요"
echo ""
