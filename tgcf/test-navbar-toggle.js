/**
 * 导航栏切换功能测试脚本
 * 用于验证导航栏点击切换功能是否正常工作
 */

// 测试函数
function testNavbarToggle() {
    console.log('开始测试导航栏切换功能...');
    
    // 检查必要的元素是否存在
    const navbar = document.querySelector('.navbar, .navbar-container');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const toggleButton = document.querySelector('.navbar-toggler');
    
    if (!navbar) {
        console.error('❌ 未找到导航栏元素 (.navbar 或 .navbar-container)');
        return false;
    }
    
    if (!navbarCollapse) {
        console.error('❌ 未找到导航栏折叠元素 (.navbar-collapse)');
        return false;
    }
    
    if (!toggleButton) {
        console.error('❌ 未找到导航栏切换按钮 (.navbar-toggler)');
        return false;
    }
    
    console.log('✅ 所有必要元素都存在');
    
    // 检查响应式导航类是否已初始化
    if (typeof responsiveNav === 'undefined') {
        console.error('❌ ResponsiveNavigation 类未初始化');
        return false;
    }
    
    console.log('✅ ResponsiveNavigation 类已初始化');
    
    // 模拟移动端环境
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
    });
    
    console.log('📱 模拟移动端环境 (宽度: 768px)');
    
    // 测试初始状态
    const initialState = navbarCollapse.classList.contains('show');
    console.log(`📋 初始状态: ${initialState ? '展开' : '收起'}`);
    
    // 测试切换功能
    console.log('🔄 测试导航栏点击切换...');
    
    // 创建点击事件
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    
    // 点击导航栏（非交互元素区域）
    const navbarBackground = navbar.querySelector(':not(a):not(button):not(.nav-link):not(.navbar-toggler)') || navbar;
    navbarBackground.dispatchEvent(clickEvent);
    
    // 等待动画完成后检查状态
    setTimeout(() => {
        const newState = navbarCollapse.classList.contains('show');
        const stateChanged = newState !== initialState;
        
        if (stateChanged) {
            console.log(`✅ 切换成功: ${initialState ? '展开' : '收起'} → ${newState ? '展开' : '收起'}`);
        } else {
            console.log(`⚠️ 状态未改变: ${initialState ? '展开' : '收起'}`);
        }
        
        // 测试切换按钮
        console.log('🔄 测试切换按钮...');
        toggleButton.dispatchEvent(clickEvent);
        
        setTimeout(() => {
            const finalState = navbarCollapse.classList.contains('show');
            const buttonWorked = finalState !== newState;
            
            if (buttonWorked) {
                console.log(`✅ 切换按钮工作正常: ${newState ? '展开' : '收起'} → ${finalState ? '展开' : '收起'}`);
            } else {
                console.log(`❌ 切换按钮未工作`);
            }
            
            // 恢复原始窗口宽度
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: originalInnerWidth
            });
            
            console.log('🔄 恢复原始窗口宽度');
            console.log('✅ 导航栏切换功能测试完成');
            
            // 返回测试结果
            return stateChanged && buttonWorked;
        }, 500);
    }, 500);
}

// 测试导航栏事件监听器
function testNavbarEventListeners() {
    console.log('🔍 检查导航栏事件监听器...');
    
    const navbar = document.querySelector('.navbar, .navbar-container');
    if (!navbar) {
        console.error('❌ 未找到导航栏元素');
        return false;
    }
    
    // 检查是否已添加事件监听器标记
    const hasToggleListener = navbar.hasAttribute('data-navbar-toggle-initialized');
    
    if (hasToggleListener) {
        console.log('✅ 导航栏切换事件监听器已初始化');
    } else {
        console.log('⚠️ 导航栏切换事件监听器未初始化');
    }
    
    return hasToggleListener;
}

// 测试响应式断点
function testResponsiveBreakpoints() {
    console.log('📐 测试响应式断点...');
    
    if (typeof responsiveNav === 'undefined') {
        console.error('❌ ResponsiveNavigation 实例不可用');
        return false;
    }
    
    const breakpoints = [
        { width: 320, name: 'xs (超小屏)' },
        { width: 576, name: 'sm (小屏)' },
        { width: 768, name: 'md (中屏)' },
        { width: 992, name: 'lg (大屏)' },
        { width: 1200, name: 'xl (超大屏)' }
    ];
    
    const originalWidth = window.innerWidth;
    
    breakpoints.forEach(bp => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: bp.width
        });
        
        const isMobile = responsiveNav.isMobile();
        const isTablet = responsiveNav.isTablet();
        const isDesktop = responsiveNav.isDesktop();
        const currentBp = responsiveNav.getCurrentBreakpoint();
        
        console.log(`📱 ${bp.name} (${bp.width}px): 移动端=${isMobile}, 平板=${isTablet}, 桌面=${isDesktop}, 断点=${currentBp}`);
    });
    
    // 恢复原始宽度
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalWidth
    });
    
    console.log('✅ 响应式断点测试完成');
    return true;
}

// 运行所有测试
function runAllTests() {
    console.log('🚀 开始运行导航栏功能测试套件...');
    console.log('='.repeat(50));
    
    const tests = [
        { name: '事件监听器测试', fn: testNavbarEventListeners },
        { name: '响应式断点测试', fn: testResponsiveBreakpoints },
        { name: '导航栏切换测试', fn: testNavbarToggle }
    ];
    
    tests.forEach((test, index) => {
        console.log(`\n${index + 1}. ${test.name}`);
        console.log('-'.repeat(30));
        try {
            test.fn();
        } catch (error) {
            console.error(`❌ ${test.name}失败:`, error);
        }
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('🏁 测试套件运行完成');
}

// 页面加载完成后自动运行测试（如果在开发环境）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        // 等待导航组件初始化
        setTimeout(() => {
            if (confirm('是否运行导航栏功能测试？')) {
                runAllTests();
            }
        }, 1000);
    });
}

// 导出测试函数供手动调用
window.testNavbarToggle = testNavbarToggle;
window.testNavbarEventListeners = testNavbarEventListeners;
window.testResponsiveBreakpoints = testResponsiveBreakpoints;
window.runAllNavbarTests = runAllTests;