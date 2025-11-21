/**
 * 图片验证和预览功能
 * 提供图片上传前的验证和预览功能
 */

/**
 * 验证图片文件
 * @param {File} file - 要验证的图片文件
 * @param {Object} options - 验证选项
 * @param {number} options.maxSize - 最大文件大小（字节）
 * @param {Array} options.allowedTypes - 允许的文件类型
 * @param {number} options.maxWidth - 最大宽度
 * @param {number} options.maxHeight - 最大高度
 * @returns {Promise<Object>} 验证结果
 */
function validateImageFile(file, options = {}) {
    return new Promise((resolve, reject) => {
        const {
            maxSize = 5 * 1024 * 1024, // 5MB
            allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            maxWidth = 1920,
            maxHeight = 1080
        } = options;

        // 验证文件大小
        if (file.size > maxSize) {
            return reject(new Error(`文件大小不能超过 ${maxSize / 1024 / 1024}MB`));
        }

        // 验证文件类型
        if (!allowedTypes.includes(file.type)) {
            return reject(new Error(`只支持 ${allowedTypes.join(', ')} 格式的图片`));
        }

        // 创建图片对象进行尺寸验证
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = function() {
            URL.revokeObjectURL(url);
            
            // 验证图片尺寸
            if (img.width > maxWidth || img.height > maxHeight) {
                return reject(new Error(`图片尺寸不能超过 ${maxWidth}x${maxHeight}`));
            }
            
            resolve({
                valid: true,
                width: img.width,
                height: img.height,
                size: file.size,
                type: file.type
            });
        };
        
        img.onerror = function() {
            URL.revokeObjectURL(url);
            reject(new Error('无法读取图片文件'));
        };
        
        img.src = url;
    });
}

/**
 * 创建图片预览
 * @param {File} file - 图片文件
 * @param {HTMLElement} previewElement - 预览元素
 * @param {Object} options - 预览选项
 * @returns {Promise<void>}
 */
function createImagePreview(file, previewElement, options = {}) {
    return new Promise((resolve, reject) => {
        const {
            maxWidth = 300,
            maxHeight = 300,
            quality = 0.8
        } = options;

        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // 计算缩放比例
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                    const scale = Math.min(maxWidth / width, maxHeight / height);
                    width = width * scale;
                    height = height * scale;
                }
                
                // 创建canvas进行缩放
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // 设置预览
                previewElement.src = canvas.toDataURL(file.type, quality);
                previewElement.style.display = 'block';
                
                resolve();
            };
            
            img.onerror = function() {
                reject(new Error('无法加载图片预览'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = function() {
            reject(new Error('无法读取文件'));
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * 清除图片预览
 * @param {HTMLElement} previewElement - 预览元素
 */
function clearImagePreview(previewElement) {
    previewElement.src = '';
    previewElement.style.display = 'none';
}

/**
 * 图片上传处理
 * @param {File} file - 图片文件
 * @param {string} uploadUrl - 上传地址
 * @param {Object} options - 上传选项
 * @returns {Promise<Object>} 上传结果
 */
function uploadImage(file, uploadUrl, options = {}) {
    return new Promise((resolve, reject) => {
        const {
            onProgress,
            timeout = 30000,
            headers = {}
        } = options;

        const formData = new FormData();
        formData.append('image', file);

        const xhr = new XMLHttpRequest();
        
        // 设置超时
        xhr.timeout = timeout;
        
        // 进度处理
        if (onProgress) {
            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    const percent = (e.loaded / e.total) * 100;
                    onProgress(percent);
                }
            };
        }
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (error) {
                        reject(new Error('服务器响应格式错误'));
                    }
                } else {
                    reject(new Error(`上传失败: ${xhr.status}`));
                }
            }
        };
        
        xhr.onerror = function() {
            reject(new Error('网络错误'));
        };
        
        xhr.ontimeout = function() {
            reject(new Error('上传超时'));
        };
        
        xhr.open('POST', uploadUrl, true);
        
        // 设置请求头
        Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key]);
        });
        
        xhr.send(formData);
    });
}

/**
 * 批量图片处理
 * @param {FileList} files - 文件列表
 * @param {Function} processFn - 处理函数
 * @param {Object} options - 选项
 * @returns {Promise<Array>} 处理结果
 */
function processImagesBatch(files, processFn, options = {}) {
    const {
        maxConcurrent = 3,
        onProgress
    } = options;

    const results = [];
    let completed = 0;
    const total = files.length;
    
    return new Promise((resolve, reject) => {
        if (total === 0) {
            resolve([]);
            return;
        }

        const queue = Array.from(files);
        let running = 0;
        let hasError = false;

        function runNext() {
            if (hasError || queue.length === 0) {
                return;
            }

            if (running >= maxConcurrent) {
                return;
            }

            running++;
            const file = queue.shift();
            
            processFn(file)
                .then(result => {
                    results.push(result);
                    completed++;
                    
                    if (onProgress) {
                        onProgress(completed, total);
                    }
                    
                    running--;
                    
                    if (completed === total) {
                        resolve(results);
                    } else {
                        runNext();
                    }
                })
                .catch(error => {
                    hasError = true;
                    reject(error);
                });
            
            runNext();
        }

        // 启动处理
        for (let i = 0; i < Math.min(maxConcurrent, total); i++) {
            runNext();
        }
    });
}

/**
 * 图片压缩
 * @param {File} file - 原文件
 * @param {Object} options - 压缩选项
 * @returns {Promise<File>} 压缩后的文件
 */
function compressImage(file, options = {}) {
    return new Promise((resolve, reject) => {
        const {
            maxWidth = 1920,
            maxHeight = 1080,
            quality = 0.8,
            maxSize = 2 * 1024 * 1024 // 2MB
        } = options;

        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = function() {
            URL.revokeObjectURL(url);
            
            let { width, height } = img;
            
            // 计算缩放比例
            if (width > maxWidth || height > maxHeight) {
                const scale = Math.min(maxWidth / width, maxHeight / height);
                width = width * scale;
                height = height * scale;
            }
            
            // 创建canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // 转换为blob
            canvas.toBlob(function(blob) {
                if (!blob) {
                    reject(new Error('图片压缩失败'));
                    return;
                }
                
                // 检查文件大小
                if (blob.size > maxSize) {
                    // 如果仍然太大，降低质量再次压缩
                    canvas.toBlob(function(blob2) {
                        if (!blob2) {
                            reject(new Error('图片压缩失败'));
                            return;
                        }
                        
                        const compressedFile = new File([blob2], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        });
                        
                        resolve(compressedFile);
                    }, file.type, quality * 0.7);
                } else {
                    const compressedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now()
                    });
                    
                    resolve(compressedFile);
                }
            }, file.type, quality);
        };
        
        img.onerror = function() {
            URL.revokeObjectURL(url);
            reject(new Error('无法加载图片'));
        };
        
        img.src = url;
    });
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateImageFile,
        createImagePreview,
        clearImagePreview,
        uploadImage,
        processImagesBatch,
        compressImage
    };
} else {
    window.ImageValidation = {
        validateImageFile,
        createImagePreview,
        clearImagePreview,
        uploadImage,
        processImagesBatch,
        compressImage
    };
}