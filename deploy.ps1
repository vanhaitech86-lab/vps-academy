#!/usr/bin/env pwsh
# ============================================================
# VPS Academy – Deploy Script
# Sử dụng: Chạy script này để deploy lên GitHub + Vercel
# ============================================================

param(
  [string]$Message = "update: $(Get-Date -Format 'dd/MM/yyyy HH:mm')"
)

$ErrorActionPreference = "Stop"
$projectDir = $PSScriptRoot

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      VPS ACADEMY – AUTO DEPLOY SCRIPT        ║" -ForegroundColor Cyan
Write-Host "║         Haitech AI · VPS Group               ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Set-Location $projectDir

# ── Bước 1: Git commit & push ────────────────────────────────
Write-Host "📦 [1/3] Đang commit và push lên GitHub..." -ForegroundColor Yellow

git add -A
$hasChanges = git status --porcelain
if ($hasChanges) {
    git commit -m $Message
    Write-Host "   ✅ Committed: $Message" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Không có thay đổi mới, bỏ qua commit" -ForegroundColor Gray
}

git push origin master
Write-Host "   ✅ Đã push lên GitHub" -ForegroundColor Green
Write-Host "   🔗 GitHub: https://github.com/vanhaitech86-lab/vps-academy" -ForegroundColor Cyan

# ── Bước 2: Deploy lên Vercel ────────────────────────────────
Write-Host ""
Write-Host "🚀 [2/3] Đang deploy lên Vercel..." -ForegroundColor Yellow

npx vercel --prod --yes

Write-Host "   ✅ Đã deploy lên Vercel" -ForegroundColor Green

# ── Bước 3: Thông báo hoàn thành ─────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           ✅ DEPLOY THÀNH CÔNG!              ║" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  🌐 Web:    https://vps-academy.vercel.app   ║" -ForegroundColor Green
Write-Host "║  📦 GitHub: github.com/vanhaitech86-lab/     ║" -ForegroundColor Green
Write-Host "║             vps-academy                      ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
