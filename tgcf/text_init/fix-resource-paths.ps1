# 修复HTML文件资源路径脚本
# 将相对路径改为绝对路径，解决域名访问时的资源加载问题

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   HTML资源路径修复工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
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
            $content = Get-Content $file -Raw -Encoding UTF8
            
            # 替换资源路径
            $content = $content -replace 'href="\.\./css/', 'href="/css/'
            $content = $content -replace 'href="\.\./icons-1.11.1/', 'href="/icons-1.11.1/'
            $content = $content -replace 'src="\.\./bootstrap-5.3.2/', 'src="/bootstrap-5.3.2/'
            $content = $content -replace 'src="\.\./js/', 'src="/js/'
            $content = $content -replace 'src="\.\./img/', 'src="/img/'
            
            # 写入新内容
            Set-Content -Path $file -Value $content -Encoding UTF8
            
            Write-Host "✓ 已修复: $file" -ForegroundColor Green
            $successCount++
        }
        catch {
            Write-Host "✗ 修复失败: $file - $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
    }
    else {
        Write-Host "✗ 文件不存在: $file" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "修复完成！" -ForegroundColor Cyan
Write-Host "成功: $successCount 个文件" -ForegroundColor Green
Write-Host "失败: $errorCount 个文件" -ForegroundColor Red

if ($successCount -gt 0) {
    Write-Host ""
    Write-Host "下一步操作：" -ForegroundColor Yellow
    Write-Host "1. 重启服务器以应用更改" -ForegroundColor White
    Write-Host "2. 通过域名访问测试资源加载" -ForegroundColor White
    Write-Host "3. 检查浏览器控制台确认无错误" -ForegroundColor White
}