document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const submitButton = document.getElementById('submitButton');
    let errorMessage = document.getElementById('error-message');
    
    if (!errorMessage) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.style.display = 'none';
        errorDiv.style.color = 'red';
        errorDiv.style.marginTop = '10px';
        errorDiv.style.fontSize = '14px';
        form.appendChild(errorDiv);
        errorMessage = errorDiv;
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            if (errorMessage && document.body.contains(errorMessage)) {
                errorMessage.style.display = 'none';
            }
        }, 3003);
    }
    
    function validateForm(usernameValue, passwordValue) {
        if (!usernameValue.trim()) {
            showError('请输入用户名');
            username.focus();
            return false;
        }
        if (!passwordValue.trim()) {
            showError('请输入密码');
            password.focus();
            return false;
        }
        return true;
    }
    
    function setLoading(isLoading) {
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 登录中...';
        } else {
            submitButton.disabled = false;
            submitButton.textContent = '登录';
        }
    }
    
    /**
     * 用户登录函数
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @returns {Promise<Object>} 登录结果
     */
    async function loginUser(username, password) {
        const cleanUsername = username.trim();
        const cleanPassword = password.trim();
        
        // 创建超时控制器
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
        
        // 先尝试管理员登录
        let response;
        let isAdminLogin = false;
        
        try {
            // 首先尝试管理员登录
            response = await fetch('http://localhost:3003/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    username: cleanUsername, 
                    password: cleanPassword 
                }),
                signal: controller.signal
            });
            
            if (response.ok) {
                isAdminLogin = true;
            } else {
                // 管理员登录失败，尝试普通用户登录
                response = await fetch('http://localhost:3003/api/user/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        username: cleanUsername, 
                        password: cleanPassword 
                    }),
                    signal: controller.signal
                });
            }
            
            clearTimeout(timeoutId);
            
            // 检查HTTP状态码
            if (!response.ok) {
                throw new Error('账号或密码错误');
            }
            
            // 验证响应内容类型
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('服务器返回了非JSON响应');
            }
            
            const data = await response.json();
            
            // 验证响应数据结构
            if (!data || typeof data !== 'object') {
                throw new Error('服务器响应格式错误');
            }
            
            if (data.success) {
                // 验证必要的数据字段
                if (!data.token) {
                    throw new Error('服务器返回数据不完整');
                }
                
                const userInfo = {
                    id: data.user?.id || '',
                    username: data.user?.username || cleanUsername,
                    role: data.user?.role || 'user',
                    isLoggedIn: true,
                    token: data.token
                };
                
                // 安全存储用户信息
                try {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userRole', userInfo.role);
                    localStorage.setItem('user', JSON.stringify(userInfo));
                } catch (storageError) {
                    console.error('本地存储错误:', storageError);
                    throw new Error('无法保存登录信息');
                }
                
                showSuccessNotification();
                
                setTimeout(() => {
                    if (userInfo.role === 'admin') {
                        window.location.href = '../admin-web/admin.html';
                    } else {
                        window.location.href = '天官赐福首页.html';
                    }
                }, 1500);
                
                return data;
            } else {
                throw new Error(data.message || '登录失败');
            }
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('请求超时，请检查网络连接');
            }
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('网络连接失败，请检查服务器状态');
            }
            
            throw error;
        }
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
        
        if (!validateForm(username.value, password.value)) {
            return;
        }
        
        try {
            setLoading(true);
            await loginUser(username.value, password.value);
        } catch (error) {
            console.error('登录错误:', error.message);
            showError(error.message || '登录失败，请检查用户名和密码');
        } finally {
            setLoading(false);
        }
    });
    
    function showSuccessNotification() {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = '登录成功，正在跳转...';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #28a745;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 9999;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            font-size: 16px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 1500);
    }
    
    username.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            password.focus();
        }
    });
    
    password.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            form.dispatchEvent(new Event('submit'));
        }
    });
    
    username.focus();
});