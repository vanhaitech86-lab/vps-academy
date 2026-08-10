$ErrorActionPreference = "Stop"
$ProjectDir = "e:\WEB CHUYÊN VỀ ĐÀO TẠO"
$OutputDir = "e:\VPS_Academy_Package"
$ZipName = "VPS_Academy_v2.1_$(Get-Date -Format 'yyyyMMdd').zip"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VPS Academy - Dong goi san pham" -ForegroundColor Cyan  
Write-Host "  Version 2.1 | Haitech AI - VPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create output dir
if (Test-Path $OutputDir) { Remove-Item $OutputDir -Recurse -Force }
New-Item -ItemType Directory -Path $OutputDir | Out-Null
Write-Host "[1/5] Tao thu muc dong goi..." -ForegroundColor Green

# Copy project files
$FilesToCopy = @(
  "index.html", "courses.html", "course-detail.html",
  "lesson.html", "quiz.html", "auth.html", "admin.html",
  "vercel.json", "package.json", ".gitignore"
)
foreach ($f in $FilesToCopy) {
  $src = Join-Path $ProjectDir $f
  if (Test-Path $src) {
    Copy-Item $src $OutputDir
    Write-Host "  Copied: $f" -ForegroundColor Gray
  }
}
Write-Host "[2/5] Sao chep file HTML..." -ForegroundColor Green

# Copy css and js folders
Copy-Item (Join-Path $ProjectDir "css") (Join-Path $OutputDir "css") -Recurse
Copy-Item (Join-Path $ProjectDir "js") (Join-Path $OutputDir "js") -Recurse
Write-Host "[3/5] Sao chep CSS & JS..." -ForegroundColor Green

# Create deployment guide copy
$GuideContent = @"
VPS ACADEMY - HUONG DAN NHANH
==============================

URL PRODUCTION: https://vps-academy.vercel.app

DANG NHAP ADMIN:
  Email: admin@vps.vn
  Mat khau: admin123
  !! DOI MAT KHAU NGAY SAU KHI TRIEN KHAI !!

DEPLOY LEN VERCEL:
  npx vercel --prod --yes

CHAY LOCAL:
  npx serve . -p 3000
  Truy cap: http://localhost:3000

CAI DAT XA HOI (Facebook/YouTube/Zalo):
  Admin Panel > Cai dat website > Nhap link > Luu

HO TRO:
  Hotline: 0988 739 896
  Email: contact@vpsgroup.vn
  
(c) 2026 Haitech AI - VPS
"@
$GuideContent | Out-File (Join-Path $OutputDir "README.txt") -Encoding UTF8
Write-Host "[4/5] Tao file README..." -ForegroundColor Green

# Create zip
$ZipPath = Join-Path "e:\" $ZipName
if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
Compress-Archive -Path "$OutputDir\*" -DestinationPath $ZipPath -Force
Write-Host "[5/5] Tao file ZIP thanh cong!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HOAN THANH!" -ForegroundColor Cyan
Write-Host "  File: $ZipName" -ForegroundColor Yellow
Write-Host "  Vi tri: e:\$ZipName" -ForegroundColor Yellow
Write-Host "  Thu muc: $OutputDir" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
