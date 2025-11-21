const axios = require('axios');
const jwt = require('jsonwebtoken');

// 创建测试令牌
const token = jwt.sign({username: 'admin', role: 'admin'}, 'your_secret_key', {expiresIn: '2h'});
console.log('Token:', token);

// 测试API调用
async function testApi() {
  try {
    const response = await axios.get('http://localhost:3003/api/admin/carousel', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    console.log('API响应:', response.data);
  } catch (error) {
    console.error('API调用失败:', error.response ? error.response.data : error.message);
    console.error('状态码:', error.response ? error.response.status : 'N/A');
  }
}

testApi();
