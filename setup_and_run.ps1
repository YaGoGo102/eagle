Write-Host "=== 🛠️ C++ Minecraft Web-NPC 自動環境構築を開始します ===" -ForegroundColor Cyan

# 1. ライブラリファイルのダウンロード
if (-not (Test-Path "crow_all.h")) {
    Write-Host "[1/3] Crow フレームワークをダウンロード中..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://github.com/CrowCpp/Crow/releases/download/v1.2.0/crow_all.h" -OutFile "crow_all.h"
}
if (-not (Test-Path "asio.hpp")) {
    Write-Host "[2/3] Asio ネットワークライブラリをダウンロード中..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/chriskohlhoff/asio/main/asio/include/asio.hpp" -OutFile "asio.hpp"
    New-Item -ItemType Directory -Force -Path "asio" | Out-Null
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/chriskohlhoff/asio/main/asio/include/asio/src.hpp" -OutFile "asio/src.hpp"
}

# 2. CMakeの構成とビルド
Write-Host "[3/3] コンパイル環境のビルドファイルを生成中..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "build" | Out-Null
cd build
Remove-Item -Recurse -Force * -ErrorAction SilentlyContinue

cmake -S .. -B .
if ($LASTEXITCODE -ne 0) { Write-Host "❌ CMakeの構成に失敗しました。Visual Studioの設定を確認してください。" -ForegroundColor Red; exit }

Write-Host "🔥 C++ ネイティブコンパイルを実行しています。これには数十秒かかります..." -ForegroundColor Cyan
cmake --build . --config Release
if ($LASTEXITCODE -ne 0) { Write-Host "❌ コンパイルに失敗しました。" -ForegroundColor Red; exit }

# 3. 起動
Write-Host "`n✨ 全てのビルドが正常に完了しました！サーバーを起動します。`n" -ForegroundColor Green
.\Release\mc_npc_server.exe
