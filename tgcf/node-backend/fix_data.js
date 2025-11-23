const mysql = require('mysql2/promise');

async function fixData() {
  try {
    // 创建数据库连接
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Mysql',
      database: 'web_project'
    });

    console.log('=== 开始修复数据 ===');

    // 插入轮播图数据
    console.log('\n1. 插入轮播图数据');
    try {
      const carouselSql = `
        INSERT INTO carousel_images (title, image_url, link_url, description, display_order, is_active)
        VALUES 
        ('首页轮播1', '../img/轮播1.png', '/user-web/home.html', '首页轮播1描述', 1, 1),
        ('首页轮播2', '../img/轮播2.png', '/user-web/home.html', '首页轮播2描述', 2, 1),
        ('首页轮播3', '../img/轮播3.png', '/user-web/home.html', '首页轮播3描述', 3, 1),
        ('读者评价', '../img/轮播4.png', '/user-web/读者评价.html', '读者的精彩评价和感想', 4, 1),
        ('同人创作', '../img/轮播5.png', '/user-web/同人创作.html', '粉丝创作的同人作品', 5, 1),
        ('最新动态', '../img/轮播6.png', '/user-web/最新动态.html', '小说和动漫的最新消息', 6, 1)
      `;
      await connection.execute(carouselSql);
      console.log(' 轮播图数据插入成功');
    } catch (err) {
      console.log(' 轮播图数据已存在或插入失败:', err.message);
    }

    // 插入剧情简介数据
    console.log('\n2. 插入剧情简介数据');
    try {
      const storySql = `
        INSERT INTO story_intro (title, content, is_active)
        VALUES 
        ('故事背景', '这是一个关于冒险与成长的故事，发生在一个充满魔法与科技的世界。', 1),
        ('主要角色', '主角是一位勇敢的年轻人，他将面对各种挑战，结识新朋友，发现自己的命运。', 1),
        ('剧情梗概', '故事从主角的平凡生活开始，随着一系列事件的发生，他逐渐卷入了一场改变世界的冒险。', 1)
      `;
      await connection.execute(storySql);
      console.log(' 剧情简介数据插入成功');
    } catch (err) {
      console.log(' 剧情简介数据已存在或插入失败:', err.message);
    }

    // 验证数据
    console.log('\n3. 验证数据');
    
    const [storyIntroRows] = await connection.execute('SELECT * FROM story_intro');
    console.log(' 剧情简介表中有', storyIntroRows.length, '条记录');
    
    const [carouselRows] = await connection.execute('SELECT * FROM carousel_images');
    console.log(' 轮播图表中有', carouselRows.length, '条记录');

    await connection.end();
    console.log('\n=== 数据修复完成 ===');
  } catch (error) {
    console.error('修复数据失败:', error);
  }
}

fixData();
