app.post('/api/login', async (req, res) => {
  try {
    console.log('[LOGIN] 收到登录请求');
    
    // 安全地获取请求体
    let username = null;
    let password = null;
    
    try {
      username = req.body?.username || null;
      password = req.body?.password || null;
      console.log('[LOGIN] 解析到的用户名:', username);
    } catch (jsonError) {
      console.error('[LOGIN] JSON解析错误:', jsonError);
    }
    
    const errorId = Date.now();
    
    // 参数验证
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空',
        errorId
      });
    }
    
    // 优先使用默认账号（确保兼容性）
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign(
        { username: 'admin', role: 'admin' },
        JWT_SECRET,
        { expiresIn: '2h' }
      );
      
      return res.json({
        success: true,
        token,
        user: { username: 'admin', role: 'admin' },
        message: '管理员登录成功'
      });
    }
    
    if (username === 'user1' && password === 'password123') {
      const token = jwt.sign(
        { username: 'user1', role: 'user' },
        JWT_SECRET,
        { expiresIn: '2h' }
      );
      
      return res.json({
        success: true,
        token,
        user: { username: 'user1', role: 'user' },
        message: '用户登录成功'
      });
    }
    
    // 尝试数据库登录（如果默认账号失败）
    let user = null;
    
    // 尝试管理员登录
    try {
      user = await AdminModel.login(username, password);
      if (user) {
        const token = jwt.sign(
          { username: user.username, role: user.role },
          JWT_SECRET,
          { expiresIn: '2h' }
        );
        
        return res.json({
          success: true,
          token,
          user: { username: user.username, role: user.role },
          message: '管理员登录成功'
        });
      }
    } catch (adminError) {
      console.error(管理员登录失败 []:, adminError);
    }
    
    // 尝试普通用户登录
    try {
      user = await UserModel.login(username, password);
      if (user) {
        const token = jwt.sign(
          { username: user.username, role: 'user' },
          JWT_SECRET,
          { expiresIn: '2h' }
        );
        
        return res.json({
          success: true,
          token,
          user: { username: user.username, role: 'user' },
          message: '用户登录成功'
        });
      }
    } catch (userError) {
      console.error(普通用户登录失败 []:, userError);
    }
    
    // 所有登录方式都失败
    console.error(登录失败 []: 用户名或密码错误);
    return res.status(401).json({
      success: false,
      message: '用户名或密码错误',
      errorId
    });
    
  } catch (error) {
    console.error('[LOGIN] 内部错误:', error);
    const errorId = Date.now();
    return res.status(500).json({
      success: false,
      message: '服务器内部错误，请稍后重试',
      errorId
    });
  }
});
