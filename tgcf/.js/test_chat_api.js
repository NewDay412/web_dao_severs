const http = require('http');

// 测试聊天API的用户列表接口
function testChatUsersApi() {
    const options = {
        hostname: 'localhost',
        port: 3003,
        path: '/api/chat/users',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMTY2MTA4OSwiZXhwIjoxNzMxNjY4Mjg5fQ.TQ1iBxO3eY6VfPvL4xVY4w9Z8a7s6d5f4g3h2j1k0l' // 假设这是一个有效的admin token
        }
    };

    const req = http.request(options, (res) => {
        console.log(`状态码: ${res.statusCode}`);
        console.log(`响应头: ${JSON.stringify(res.headers)}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('响应体:', JSON.parse(data));
        });
    });

    req.on('error', (e) => {
        console.error(`请求错误: ${e.message}`);
    });

    req.end();
}

testChatUsersApi();
