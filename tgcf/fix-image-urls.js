/**
 * 修复图片URL问题的脚本
 * 确保在本地开发环境中图片URL指向正确的本地服务器
 */

// 在页面加载完成后执行修复
document.addEventListener('DOMContentLoaded', function() {
    fixAllImageUrls();
    
    // 监听动态添加的图片
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        fixImageUrlsInElement(node);
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

/**
 * 修复所有图片URL
 */
function fixAllImageUrls() {
    fixImageUrlsInElement(document.body);
}

/**
 * 修复指定元素及其子元素中的图片URL
 */
function fixImageUrlsInElement(element) {
    // 修复img标签的src属性
    const images = element.querySelectorAll ? element.querySelectorAll('img') : [];
    images.forEach(function(img) {
        if (img.src) {
            img.src = fixImageUrl(img.src);
        }
    });
    
    // 修复background-image样式
    const elementsWithBg = element.querySelectorAll ? element.querySelectorAll('*') : [];
    elementsWithBg.forEach(function(el) {
        const style = window.getComputedStyle(el);
        const bgImage = style.backgroundImage;
        if (bgImage && bgImage !== 'none' && bgImage.includes('uploads/')) {
            const fixedUrl = fixImageUrl(bgImage.replace(/url\(['"]?([^'"]*?)['"]?\)/, '$1'));
            el.style.backgroundImage = `url("${fixedUrl}")`;
        }
    });
    
    // 如果element本身是img标签
    if (element.tagName === 'IMG' && element.src) {
        element.src = fixImageUrl(element.src);
    }
}

/**
 * 修复单个图片URL
 */
function fixImageUrl(url) {
    if (!url) return url;
    
    const currentHost = window.location.hostname;
    
    // 本地开发环境处理
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        // 如果URL包含uploads路径但不是本地服务器地址，修复为本地地址
        if (url.includes('/uploads/') && !url.startsWith('http://localhost:3003/')) {
            // 提取文件名
            const fileName = url.split('/uploads/').pop();
            return `http://localhost:3003/uploads/${fileName}`;
        }
    }
    
    return url;
}

// 导出函数供其他脚本使用
if (typeof window !== 'undefined') {
    window.fixImageUrl = fixImageUrl;
    window.fixAllImageUrls = fixAllImageUrls;
}

console.log('图片URL修复脚本已加载');