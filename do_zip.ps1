Add-Type -AssemblyName System.IO.Compression.FileSystem

$src = "e:\WEB CHUYÊN VỀ ĐÀO TẠO"
$dest = "e:\VPS_Academy_v2.2.zip"

if (Test-Path $dest) { Remove-Item $dest -Force }

[System.IO.Compression.ZipFile]::CreateFromDirectory($src, $dest, [System.IO.Compression.CompressionLevel]::Optimal, $false)

$size = [math]::Round((Get-Item $dest).Length / 1KB, 1)
Write-Host "✅ DONE: $dest ($size KB)"
