/**
 * 密码切换功能通用JavaScript库
 * 支持单个密码框切换和批量初始化
 */

// 密码切换功能
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const eyeIcon = document.getElementById(inputId + '-eye');
  
  if (!input || !eyeIcon) {
    console.warn(`密码切换失败: 找不到元素 ${inputId} 或 ${inputId}-eye`);
    return;
  }
  
  if (input.type === 'password') {
    input.type = 'text';
    eyeIcon.className = 'bi bi-eye-slash';
    eyeIcon.setAttribute('aria-label', '隐藏密码');
  } else {
    input.type = 'password';
    eyeIcon.className = 'bi bi-eye';
    eyeIcon.setAttribute('aria-label', '显示密码');
  }
}

// 批量初始化密码切换功能
function initPasswordToggles() {
  // 查找所有密码输入框
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  
  passwordInputs.forEach(input => {
    // 检查是否已经有切换按钮
    const wrapper = input.closest('.password-input-wrapper');
    if (wrapper && wrapper.querySelector('.password-toggle')) {
      return; // 已经初始化过了
    }
    
    // 创建包装器
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'password-input-wrapper';
    
    // 将输入框包装起来
    input.parentNode.insertBefore(inputWrapper, input);
    inputWrapper.appendChild(input);
    
    // 创建切换按钮
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'password-toggle';
    toggleButton.setAttribute('aria-label', '显示密码');
    toggleButton.onclick = () => togglePassword(input.id);
    
    // 创建图标
    const eyeIcon = document.createElement('i');
    eyeIcon.className = 'bi bi-eye';
    eyeIcon.id = input.id + '-eye';
    
    toggleButton.appendChild(eyeIcon);
    inputWrapper.appendChild(toggleButton);
    
    // 调整输入框样式
    input.style.paddingRight = '50px';
  });
}

// 自动初始化（当DOM加载完成时）
document.addEventListener('DOMContentLoaded', function() {
  // 检查是否有Bootstrap Icons
  const hasBootstrapIcons = document.querySelector('link[href*="bootstrap-icons"]') || 
                           document.querySelector('link[href*="bi.css"]');
  
  if (!hasBootstrapIcons) {
    console.warn('密码切换功能需要Bootstrap Icons支持');
  }
  
  // 初始化现有的密码框
  initPasswordToggles();
  
  // 监听动态添加的密码框
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) { // 元素节点
          const passwordInputs = node.querySelectorAll ? 
            node.querySelectorAll('input[type="password"]') : [];
          
          if (passwordInputs.length > 0) {
            initPasswordToggles();
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

// 手动初始化特定密码框
function addPasswordToggle(inputId, options = {}) {
  const input = document.getElementById(inputId);
  if (!input) {
    console.error(`找不到ID为 ${inputId} 的输入框`);
    return;
  }
  
  // 检查是否已经有切换按钮
  const existingWrapper = input.closest('.password-input-wrapper');
  if (existingWrapper && existingWrapper.querySelector('.password-toggle')) {
    console.warn(`输入框 ${inputId} 已经有密码切换功能`);
    return;
  }
  
  // 创建包装器
  const wrapper = document.createElement('div');
  wrapper.className = 'password-input-wrapper';
  
  // 应用自定义样式类
  if (options.wrapperClass) {
    wrapper.className += ' ' + options.wrapperClass;
  }
  
  // 包装输入框
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);
  
  // 创建切换按钮
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'password-toggle';
  button.setAttribute('aria-label', '显示密码');
  
  // 应用自定义按钮样式
  if (options.buttonClass) {
    button.className += ' ' + options.buttonClass;
  }
  
  button.onclick = () => togglePassword(inputId);
  
  // 创建图标
  const icon = document.createElement('i');
  icon.className = options.iconClass || 'bi bi-eye';
  icon.id = inputId + '-eye';
  
  button.appendChild(icon);
  wrapper.appendChild(button);
  
  // 调整输入框样式
  input.style.paddingRight = options.paddingRight || '50px';
  
  return wrapper;
}

// 移除密码切换功能
function removePasswordToggle(inputId) {
  const input = document.getElementById(inputId);
  if (!input) {
    console.error(`找不到ID为 ${inputId} 的输入框`);
    return;
  }
  
  const wrapper = input.closest('.password-input-wrapper');
  if (!wrapper) {
    console.warn(`输入框 ${inputId} 没有密码切换功能`);
    return;
  }
  
  // 恢复输入框样式
  input.style.paddingRight = '';
  
  // 将输入框移出包装器
  wrapper.parentNode.insertBefore(input, wrapper);
  
  // 删除包装器
  wrapper.remove();
}

// 批量切换所有密码框的可见性
function toggleAllPasswords(show = null) {
  const passwordInputs = document.querySelectorAll('input[type="password"], input[type="text"]');
  
  passwordInputs.forEach(input => {
    const wrapper = input.closest('.password-input-wrapper');
    if (!wrapper) return;
    
    const eyeIcon = wrapper.querySelector('.password-toggle i');
    if (!eyeIcon) return;
    
    if (show === null) {
      // 自动切换
      togglePassword(input.id);
    } else if (show && input.type === 'password') {
      // 显示密码
      input.type = 'text';
      eyeIcon.className = 'bi bi-eye-slash';
    } else if (!show && input.type === 'text') {
      // 隐藏密码
      input.type = 'password';
      eyeIcon.className = 'bi bi-eye';
    }
  });
}

// 导出函数供全局使用
window.togglePassword = togglePassword;
window.initPasswordToggles = initPasswordToggles;
window.addPasswordToggle = addPasswordToggle;
window.removePasswordToggle = removePasswordToggle;
window.toggleAllPasswords = toggleAllPasswords;