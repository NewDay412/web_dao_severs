#!/bin/bash

# 应用nginx和MySQL重启策略配置脚本
# 需要管理员权限执行

echo "正在应用nginx和MySQL重启策略配置..."

# 检查是否以root权限运行
if [ "$EUID" -ne 0 ]; then
    echo "错误：此脚本需要以root权限运行"
    echo "请使用: sudo bash apply-restart-policy.sh"
    exit 1
fi

# 创建nginx服务配置目录
mkdir -p /etc/systemd/system/nginx.service.d

# 应用nginx重启策略
echo "应用nginx重启策略..."
cat > /etc/systemd/system/nginx.service.d/restart-policy.conf << 'EOF'
[Service]
# 重启策略：无论服务是正常退出（退出码 0）、异常退出（非 0 退出码）、被手动杀死，都会自动重启
Restart=always

# 重启延迟时间：服务退出后，等待 3 秒再重启
# 避免服务因自身 bug 频繁崩溃重启，减少系统资源消耗
RestartSec=3

# 最大重启次数限制，防止无限重启
StartLimitIntervalSec=300
StartLimitBurst=5
EOF

echo "nginx重启策略配置完成"

# 创建MySQL服务配置目录
mkdir -p /etc/systemd/system/mysqld.service.d

# 应用MySQL重启策略
echo "应用MySQL重启策略..."
cat > /etc/systemd/system/mysqld.service.d/restart-policy.conf << 'EOF'
[Service]
# 重启策略：无论服务是正常退出（退出码 0）、异常退出（非 0 退出码）、被手动杀死，都会自动重启
Restart=always

# 重启延迟时间：服务退出后，等待 3 秒再重启
# 避免服务因自身 bug 频繁崩溃重启，减少系统资源消耗
RestartSec=3

# 最大重启次数限制，防止无限重启
StartLimitIntervalSec=300
StartLimitBurst=5
EOF

echo "MySQL重启策略配置完成"

# 重新加载systemd配置
echo "重新加载systemd配置..."
systemctl daemon-reload

echo "重启策略配置已应用完成！"
echo ""
echo "配置详情："
echo "- Restart=always: 覆盖所有退出场景，确保服务尽可能保持运行状态"
echo "- RestartSec=3: 服务退出后等待3秒再重启，避免频繁崩溃重启"
echo "- WantedBy=multi-user.target: 服务随系统多用户模式自动启动"
echo ""
echo "验证配置："
echo "1. 检查nginx配置: systemctl cat nginx.service"
echo "2. 检查MySQL配置: systemctl cat mysqld.service"
echo "3. 重启服务测试: systemctl restart nginx mysqld"
echo "4. 检查服务状态: systemctl status nginx mysqld"