# reset-prisma.ps1
Write-Host "Resetting Prisma client..." -ForegroundColor Green

# Remove Prisma directories
if (Test-Path "node_modules\.prisma") {
    Remove-Item -Recurse -Force node_modules\.prisma
    Write-Host "Removed node_modules\.prisma" -ForegroundColor Yellow
}

if (Test-Path "node_modules\@prisma\client") {
    Remove-Item -Recurse -Force node_modules\@prisma\client
    Write-Host "Removed node_modules\@prisma\client" -ForegroundColor Yellow
}

# Clear cache
npm cache clean --force
Write-Host "Cleared npm cache" -ForegroundColor Yellow

# Reinstall
npm install
Write-Host "Reinstalled dependencies" -ForegroundColor Green

# Generate Prisma client
npx prisma generate
Write-Host "Generated Prisma client" -ForegroundColor Green

# Push to database
npx prisma db push
Write-Host "Database schema updated" -ForegroundColor Green

Write-Host "Reset complete!" -ForegroundColor Green