// 图片验证函数 - 修复输入框消失问题
function validateImageUrl(input) {
  const url = input.value.trim();
  
  // 如果输入框为空，移除所有验证样式
  if (!url) {
    input.classList.remove('is-valid', 'is-invalid');
    return;
  }
  
  // 检查是否是有效的图片URL格式
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
  const isValidUrl = /^(https?:\/\/|\.\.?\/)/.test(url);
  const hasImageExtension = imageExtensions.test(url);
  
  if (isValidUrl && hasImageExtension) {
    // 有效的图片URL
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    
    // 显示预览图片
    showImagePreview(input);
  } else {
    // 无效的图片URL
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    
    // 隐藏预览图片
    hideImagePreview(input);
  }
}

// 显示图片预览
function showImagePreview(input) {
  const inputId = input.id;
  let previewId = '';
  let imgId = '';
  
  // 根据输入框ID确定预览容器ID
  if (inputId.includes('addImage')) {
    if (inputId === 'addImageUrl') {
      previewId = 'addHomeImagePreview';
      imgId = 'addHomePreviewImg';
    } else if (inputId === 'addImage') {
      previewId = 'addCharacterImagePreview';
      imgId = 'addCharacterPreviewImg';
    }
  } else if (inputId.includes('editImage')) {
    if (inputId === 'editCarouselImageUrl') {
      previewId = 'editImagePreview';
      imgId = 'editPreviewImg';
    } else if (inputId === 'editImage') {
      previewId = 'editCharacterImagePreview';
      imgId = 'editCharacterPreviewImg';
    }
  }
  
  const previewContainer = document.getElementById(previewId);
  const previewImg = document.getElementById(imgId);
  
  if (previewContainer && previewImg) {
    previewImg.src = input.value;
    previewContainer.style.display = 'block';
    
    // 处理图片加载错误
    previewImg.onerror = function() {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
      previewContainer.style.display = 'none';
    };
    
    previewImg.onload = function() {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
    };
  }
}

// 隐藏图片预览
function hideImagePreview(input) {
  const inputId = input.id;
  let previewId = '';
  
  // 根据输入框ID确定预览容器ID
  if (inputId.includes('addImage')) {
    if (inputId === 'addImageUrl') {
      previewId = 'addHomeImagePreview';
    } else if (inputId === 'addImage') {
      previewId = 'addCharacterImagePreview';
    }
  } else if (inputId.includes('editImage')) {
    if (inputId === 'editCarouselImageUrl') {
      previewId = 'editImagePreview';
    } else if (inputId === 'editImage') {
      previewId = 'editCharacterImagePreview';
    }
  }
  
  const previewContainer = document.getElementById(previewId);
  if (previewContainer) {
    previewContainer.style.display = 'none';
  }
}

// 图片上传处理函数
async function handleImageUpload(fileInput, targetInputId) {
  const file = fileInput.files[0];
  if (!file) return;
  
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    alert('只支持JPG、PNG、GIF、WebP格式的图片');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB');
    return;
  }
  
  // 显示上传进度
  const targetInput = document.getElementById(targetInputId);
  const originalValue = targetInput.value;
  targetInput.value = '正在上传...';
  targetInput.disabled = true;
  
  try {
    // 创建FormData对象
    const formData = new FormData();
    formData.append('image', file);
    
    // 上传图片到服务器
    const response = await fetch('http://localhost:3003/api/admin/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      // 上传成功，设置图片URL
      targetInput.value = result.data.imageUrl;
      targetInput.disabled = false;
      
      // 验证新的URL
      validateImageUrl(targetInput);
      
      alert('图片上传成功！');
    } else {
      throw new Error(result.error || '上传失败');
    }
  } catch (error) {
    console.error('图片上传失败:', error);
    
    // 恢复原始值
    targetInput.value = originalValue;
    targetInput.disabled = false;
    
    // 如果服务器上传失败，使用本地预览
    const reader = new FileReader();
    reader.onload = function(e) {
      targetInput.value = e.target.result;
      validateImageUrl(targetInput);
    };
    reader.readAsDataURL(file);
    
    console.warn('服务器上传失败，使用本地预览');
  }
  
  // 清空文件输入框
  fileInput.value = '';
}