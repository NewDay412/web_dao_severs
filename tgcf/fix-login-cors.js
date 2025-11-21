#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const loginFile = path.join(__dirname, 'user-web/登录页面.html');

console.log('🔧 修复登录页面CORS问题...\n');

let content = fs.readFileSync(loginFile, 'utf-8');

// 修复1：添加响应类型检查
const oldFetch = `const response = await fetch("/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          });

          const result = await response.json();`;

const newFetch = `const response = await fetch("/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
          });

          // 检查响应是否为JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('响应不是JSON:', contentType);
            const text = await response.text();
            console.error('响应体:', text.substring(0, 200));
            showErrorModal('接口错误', '后端接口返回了错误页面，请检查服务器配置');
            return;
          }

          const result = await response.json();`;

if (content.includes(oldFetch)) {
  content = content.replace(oldFetch, newFetch);
  console.log('✅ 已添加响应类型检查');
}

// 修复2：改进错误处理
const oldError = `} catch (error) {
          console.error("登录请求失败:", error);
          showErrorModal("网络错误", "登录失败，请检查网络连接");
        }`;

const newError = `} catch (error) {
          console.error("登录请求失败:", error);
          if (error instanceof SyntaxError) {
            showErrorModal("JSON解析错误", "服务器返回了无效的JSON，请检查后端配置");
          } else {
            showErrorModal("网络错误", "登录失败，请检查网络连接");
          }
        }`;

if (content.includes(oldError)) {
  content = content.replace(oldError, newError);
  console.log('✅ 已改进错误处理');
}

fs.writeFileSync(loginFile, content, 'utf-8');

console.log('\n✨ 修复完成！');
console.log('\n📝 修改内容：');
console.log('  1. 添加响应类型检查');
console.log('  2. 改进错误处理');
console.log('  3. 添加credentials支持跨域认证');
console.log('\n🚀 后续步骤：');
console.log('  1. 清除浏览器缓存 (Ctrl+Shift+Delete)');
console.log('  2. 重新加载页面');
console.log('  3. 重新测试登录');
