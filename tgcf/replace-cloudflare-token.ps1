# Cloudflare Web Analytics Token 批量替换脚本
# 使用方法：将 YOUR_ACTUAL_TOKEN 替换为实际的Cloudflare token后运行此脚本

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Cloudflare Token 批量替换工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查token格式
if ($Token -eq "YOUR_CLOUDFLARE_TOKEN_HERE" -or $Token -eq "") {
    Write-Host "错误：请提供有效的Cloudflare token" -ForegroundColor Red
    Write-Host "使用方法：.\replace-cloudflare-token.ps1 -Token '您的实际token'" -ForegroundColor Yellow
    exit 1
}

Write-Host "开始替换Cloudflare token..." -ForegroundColor Yellow
Write-Host "新Token: $Token" -ForegroundColor Green
Write-Host ""

# 定义要处理的HTML文件列表
$htmlFiles = @(
    "user-web/天官赐福首页.html",
    "user-web/注册.html", 
    "user-web/登录页面.html",
    "user-web/角色介绍.html",
    "user-web/留言板.html",
    "user-web/聊天.html",
    "user-web/test_upload.html",
    "user-web/review-form.html"
)

$successCount = 0
$errorCount = 0

foreach ($file in $htmlFiles) {
    if (Test-Path $file) {
        try {
            # 读取文件内容
            $content = Get-Content $file -Raw
            
            # 替换占位token
            $oldPattern = 'data-cf-beacon=''{"token": "YOUR_CLOUDFLARE_TOKEN_HERE"}'''
            $newPattern = "data-cf-beacon='{`"token`": `"$Token`"}'"
            
            $newContent = $content -replace $oldPattern, $newPattern
            
            # 写入新内容
            Set-Content -Path $file -Value $newContent -Encoding UTF8
            
            Write-Host "✓ 已更新: $file" -ForegroundColor Green
            $successCount++
        }
        catch {
            Write-Host "✗ 更新失败: $file - $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
    }
    else {
        Write-Host "✗ 文件不存在: $file" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "替换完成！" -ForegroundColor Cyan
Write-Host "成功: $successCount 个文件" -ForegroundColor Green
Write-Host "失败: $errorCount 个文件" -ForegroundColor Red

if ($successCount -gt 0) {
    Write-Host ""
    Write-Host "下一步操作：" -ForegroundColor Yellow
    Write-Host "1. 重启服务器以应用更改" -ForegroundColor White
    Write-Host "2. 访问网站验证Cloudflare Analytics是否正常工作" -ForegroundColor White
    Write-Host "3. 在Cloudflare控制台查看分析数据" -ForegroundColor White
}