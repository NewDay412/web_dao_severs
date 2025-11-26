/**
 * 天官赐福项目 - 响应式导航组件
 * 处理移动端导航菜单的显示和隐藏
 */

class ResponsiveNavigation {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupNavbarClickToggle();
        this.setupResizeHandler();
        this.setupClickOutside();
        this.setupKeyboardNavigation();
    }

    /**
     * 设置移动端菜单
     */
    setupMobileMenu() {
        // 查找导航栏切换按钮
        const toggleButton = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        
        if (toggleButton && navbarCollapse) {
            // 导航栏切换按钮点击事件
            toggleButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMobileMenu();
            });

            // 为导航链接添加点击事件（移动端自动关闭菜单）
            const navLinks = navbarCollapse.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth < 992) {
                        this.closeMobileMenu();
                    }
                });
            });
        }
    }

    /**
     * 设置导航栏点击切换功能
     */
    setupNavbarClickToggle() {
        // 为所有导航栏添加点击切换功能
        const navbars = document.querySelectorAll('.navbar, .navbar-container');
        
        navbars.forEach(navbar => {
            // 防止重复添加事件监听器
            if (navbar.hasAttribute('data-navbar-toggle-initialized')) {
                return;
            }
            navbar.setAttribute('data-navbar-toggle-initialized', 'true');
            
            navbar.addEventListener('click', (e) => {
                // 只在移动端生效
                if (window.innerWidth < 992) {
                    // 检查点击的是否为交互元素
                    const isInteractiveElement = e.target.closest('a, button, input, select, textarea, .nav-link, .navbar-toggler');
                    
                    // 如果不是交互元素，则切换菜单状态
                    if (!isInteractiveElement) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.toggleMobileMenu();
                    }
                }
            });
        });
    }

    /**
     * 切换移动端菜单
     */
    toggleMobileMenu() {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        const toggleButton = document.querySelector('.navbar-toggler');
        
        if (navbarCollapse) {
            // 检查多种可能的展开状态
            const isOpen = navbarCollapse.classList.contains('show') || 
                         navbarCollapse.classList.contains('collapsing') ||
                         (toggleButton && toggleButton.getAttribute('aria-expanded') === 'true');
            
            if (isOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }

    /**
     * 打开移动端菜单
     */
    openMobileMenu() {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        const toggleButton = document.querySelector('.navbar-toggler');
        
        if (navbarCollapse && !navbarCollapse.classList.contains('show')) {
            // 优先使用Bootstrap的collapse功能（如果可用）
            if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
                const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navbarCollapse);
                bsCollapse.show();
            } else {
                // 降级处理
                navbarCollapse.classList.add('show');
                navbarCollapse.style.maxHeight = navbarCollapse.scrollHeight + 'px';
            }
            
            // 更新按钮状态
            if (toggleButton) {
                toggleButton.setAttribute('aria-expanded', 'true');
                toggleButton.classList.add('active');
            }
            
            // 保持背景可滚动（根据题目要求）
            document.body.classList.add('navbar-expanded');
            
            // 触发自定义事件
            this.dispatchEvent('mobileMenuOpen');
        }
    }

    /**
     * 关闭移动端菜单
     */
    closeMobileMenu() {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        const toggleButton = document.querySelector('.navbar-toggler');
        
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            // 优先使用Bootstrap的collapse功能（如果可用）
            if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
                const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navbarCollapse);
                bsCollapse.hide();
            } else {
                // 降级处理
                navbarCollapse.classList.remove('show');
                navbarCollapse.style.maxHeight = '0';
            }
            
            // 更新按钮状态
            if (toggleButton) {
                toggleButton.setAttribute('aria-expanded', 'false');
                toggleButton.classList.remove('active');
            }
            
            // 恢复背景滚动
            document.body.classList.remove('navbar-expanded');
            document.body.style.overflow = '';
            
            // 触发自定义事件
            this.dispatchEvent('mobileMenuClose');
        }
    }

    /**
     * 设置窗口大小变化处理
     */
    setupResizeHandler() {
        let resizeTimer;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // 如果窗口变大，自动关闭移动端菜单
                if (window.innerWidth >= 992) {
                    this.closeMobileMenu();
                    document.body.style.overflow = '';
                }
                
                // 更新容器宽度
                this.updateContainerWidths();
            }, 100);
        });
    }

    /**
     * 设置点击外部关闭菜单
     */
    setupClickOutside() {
        document.addEventListener('click', (e) => {
            const navbar = document.querySelector('.navbar');
            const navbarCollapse = document.querySelector('.navbar-collapse');
            
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                // 如果点击的不是导航栏内的元素，关闭菜单
                if (!navbar.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        });
    }

    /**
     * 设置键盘导航
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const navbarCollapse = document.querySelector('.navbar-collapse');
            
            // ESC键关闭菜单
            if (e.key === 'Escape' && navbarCollapse && navbarCollapse.classList.contains('show')) {
                this.closeMobileMenu();
                
                // 将焦点返回到切换按钮
                const toggleButton = document.querySelector('.navbar-toggler');
                if (toggleButton) {
                    toggleButton.focus();
                }
            }
        });
    }

    /**
     * 更新容器宽度
     */
    updateContainerWidths() {
        const containers = document.querySelectorAll('.container-responsive');
        containers.forEach(container => {
            // 根据屏幕大小调整容器样式
            if (window.innerWidth < 576) {
                container.style.paddingLeft = '0.5rem';
                container.style.paddingRight = '0.5rem';
            } else if (window.innerWidth < 768) {
                container.style.paddingLeft = '0.75rem';
                container.style.paddingRight = '0.75rem';
            } else {
                container.style.paddingLeft = '1rem';
                container.style.paddingRight = '1rem';
            }
        });
    }

    /**
     * 触发自定义事件
     */
    dispatchEvent(eventName) {
        const event = new CustomEvent(eventName, {
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }

    /**
     * 获取当前屏幕断点
     */
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        if (width < 576) return 'xs';
        if (width < 768) return 'sm';
        if (width < 992) return 'md';
        if (width < 1200) return 'lg';
        if (width < 1400) return 'xl';
        return 'xxl';
    }

    /**
     * 检查是否为移动设备
     */
    isMobile() {
        return window.innerWidth < 768;
    }

    /**
     * 检查是否为平板设备
     */
    isTablet() {
        return window.innerWidth >= 768 && window.innerWidth < 992;
    }

    /**
     * 检查是否为桌面设备
     */
    isDesktop() {
        return window.innerWidth >= 992;
    }

    /**
     * 重新初始化导航功能（用于动态加载的内容）
     */
    reinitialize() {
        // 移除旧的事件监听器（如果需要）
        this.cleanup();
        
        // 重新初始化
        this.init();
    }

    /**
     * 清理事件监听器
     */
    cleanup() {
        // 这里可以添加清理逻辑，如果需要的话
        // 目前不需要特别的清理，因为事件监听器会自动覆盖
    }
}

/**
 * 响应式图片懒加载组件
 */
class ResponsiveImageLoader {
    constructor() {
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupErrorHandling();
    }

    /**
     * 设置交叉观察器进行懒加载
     */
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            });

            // 观察所有带有data-src属性的图片
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // 降级处理：直接加载所有图片
            this.loadAllImages();
        }
    }

    /**
     * 加载单个图片
     */
    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
        }
    }

    /**
     * 加载所有图片（降级处理）
     */
    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.loadImage(img));
    }

    /**
     * 设置图片错误处理
     */
    setupErrorHandling() {
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.handleImageError(e.target);
            }
        }, true);
    }

    /**
     * 处理图片加载错误
     */
    handleImageError(img) {
        // 设置默认图片
        const defaultSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij7lm77niYfml6Dms5XliqDovb08L3RleHQ+PC9zdmc+';
        
        if (img.src !== defaultSrc) {
            img.src = defaultSrc;
            img.alt = '图片加载失败';
            img.classList.add('error');
        }
    }
}

/**
 * 响应式表格组件
 */
class ResponsiveTable {
    constructor() {
        this.init();
    }

    init() {
        this.setupTables();
        this.setupResizeHandler();
    }

    /**
     * 设置响应式表格
     */
    setupTables() {
        const tables = document.querySelectorAll('table:not(.table-responsive-custom table)');
        
        tables.forEach(table => {
            this.makeTableResponsive(table);
        });
    }

    /**
     * 使表格响应式
     */
    makeTableResponsive(table) {
        // 如果表格还没有被包装
        if (!table.parentElement.classList.contains('table-responsive-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive-wrapper';
            wrapper.style.overflowX = 'auto';
            wrapper.style.webkitOverflowScrolling = 'touch';
            
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }

        // 在移动端添加数据标签
        if (window.innerWidth < 768) {
            this.addDataLabels(table);
        }
    }

    /**
     * 为移动端添加数据标签
     */
    addDataLabels(table) {
        const headers = table.querySelectorAll('th');
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (headers[index]) {
                    cell.setAttribute('data-label', headers[index].textContent);
                }
            });
        });
    }

    /**
     * 设置窗口大小变化处理
     */
    setupResizeHandler() {
        let resizeTimer;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.setupTables();
            }, 100);
        });
    }
}

/**
 * 响应式通知组件
 */
class ResponsiveNotification {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 3;
    }

    /**
     * 显示通知
     */
    show(message, type = 'info', duration = 3003) {
        const notification = this.createNotification(message, type);
        this.addNotification(notification, duration);
    }

    /**
     * 创建通知元素
     */
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification-responsive notification-${type}-responsive`;
        
        const icon = this.getIcon(type);
        notification.innerHTML = `
            <i class="bi ${icon}"></i>
            <span>${this.escapeHtml(message)}</span>
            <button class="btn-close" aria-label="关闭">
                <i class="bi bi-x"></i>
            </button>
        `;

        // 添加关闭按钮事件
        const closeBtn = notification.querySelector('.btn-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        return notification;
    }

    /**
     * 获取图标
     */
    getIcon(type) {
        const icons = {
            success: 'bi-check-circle-fill',
            error: 'bi-exclamation-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };
        return icons[type] || icons.info;
    }

    /**
     * 添加通知
     */
    addNotification(notification, duration) {
        // 如果通知太多，移除最旧的
        if (this.notifications.length >= this.maxNotifications) {
            this.removeNotification(this.notifications[0]);
        }

        document.body.appendChild(notification);
        this.notifications.push(notification);

        // 调整位置
        this.updatePositions();

        // 自动移除
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }
    }

    /**
     * 移除通知
     */
    removeNotification(notification) {
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.updatePositions();
            }, 300);
        }
    }

    /**
     * 更新通知位置
     */
    updatePositions() {
        this.notifications.forEach((notification, index) => {
            const offset = index * (notification.offsetHeight + 10);
            notification.style.top = (20 + offset) + 'px';
        });
    }

    /**
     * 转义HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 全局实例
let responsiveNav, responsiveImageLoader, responsiveTable, responsiveNotification;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    responsiveNav = new ResponsiveNavigation();
    responsiveImageLoader = new ResponsiveImageLoader();
    responsiveTable = new ResponsiveTable();
    responsiveNotification = new ResponsiveNotification();
    
    // 全局通知函数
    window.showNotification = (message, type, duration) => {
        responsiveNotification.show(message, type, duration);
    };
    
    // 全局导航重新初始化函数
    window.reinitializeNavigation = () => {
        if (responsiveNav) {
            responsiveNav.reinitialize();
        }
    };
});

// 导出类供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ResponsiveNavigation,
        ResponsiveImageLoader,
        ResponsiveTable,
        ResponsiveNotification
    };
}

// 全局暴露类，供其他脚本使用
window.ResponsiveNavigation = ResponsiveNavigation;