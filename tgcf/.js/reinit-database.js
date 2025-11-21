const db = require('./node-backend/config/db');

async function reinitializeDatabase() {
  try {
    console.log('=== 重新初始化数据库数据 ===');
    
    // 检查各表的数据情况
    console.log('\n1. 检查当前数据情况...');
    
    const tables = [
      'home_content',
      'character_info', 
      'story_intro',
      'work_reviews',
      'message_board',
      'navigation_menu',
      'basic_info',
      'character_quotes',
      'carousel_images'
    ];
    
    for (const table of tables) {
      try {
        const [rows] = await db.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${table}: ${rows[0].count} 条记录`);
      } catch (error) {
        console.log(`${table}: 表不存在或查询失败`);
      }
    }
    
    // 重新插入首页内容数据
    console.log('\n2. 重新插入首页内容数据...');
    try {
      const [homeCount] = await db.execute('SELECT COUNT(*) as count FROM home_content');
      if (homeCount[0].count === 0) {
        await db.execute(`
          INSERT INTO home_content (title, content, image_url, link_url, display_order, status, create_time, update_time)
          VALUES 
            ('天官赐福新章节更新', '最新章节已经发布，讲述了谢怜和花城的新冒险。这一章中，他们将面临更大的挑战和考验。', '../img/a5.png', '/user-web/天官赐福首页.html', 1, 'published', NOW(), NOW()),
            ('作品评价精选', '精选了一些读者的精彩评价和感想。这些评价从不同角度分析了作品的亮点和特色。', '../img/轮播6.png', '/user-web/天官赐福首页.html#作品评价', 2, 'published', NOW(), NOW()),
            ('角色介绍更新', '新增了更多角色的详细介绍和背景故事。包括主要角色的性格特点、成长经历和人物关系。', '../img/a6.png', '/user-web/角色介绍.html', 3, 'published', NOW(), NOW())
        `);
        console.log('✅ 首页内容数据插入成功');
      } else {
        console.log('首页内容数据已存在，跳过插入');
      }
    } catch (err) {
      console.log('首页内容数据插入失败:', err.message);
    }
    
    // 重新插入轮播图数据
    console.log('\n3. 重新插入轮播图数据...');
    try {
      const [carouselCount] = await db.execute('SELECT COUNT(*) as count FROM carousel_images');
      if (carouselCount[0].count === 0) {
        await db.execute(`
          INSERT INTO carousel_images (title, image_url, link_url, description, display_order, is_active, create_time, update_time)
          VALUES 
            ('天官赐福百无禁忌', '../img/轮播8.png', '/user-web/天官赐福首页.html', '谢怜和花城的仙侠爱情故事', 1, 1, NOW(), NOW()),
            ('角色介绍', '../img/轮播4.png', '/user-web/角色介绍.html', '了解作品中的精彩角色', 2, 1, NOW(), NOW()),
            ('作品评价', '../img/轮播6.png', '/user-web/天官赐福首页.html#作品评价', '读者的精彩评价和感想', 3, 1, NOW(), NOW()),
            ('精彩剧情', '../img/轮播3.png', '/user-web/天官赐福首页.html', '精彩的剧情内容', 4, 1, NOW(), NOW()),
            ('经典场景', '../img/轮播1.jpg', '/user-web/天官赐福首页.html', '经典的故事场景', 5, 1, NOW(), NOW())
        `);
        console.log('✅ 轮播图数据插入成功');
      } else {
        console.log('轮播图数据已存在，跳过插入');
      }
    } catch (err) {
      console.log('轮播图数据插入失败:', err.message);
    }
    
    // 重新插入角色数据
    console.log('\n4. 重新插入角色数据...');
    try {
      const [charCount] = await db.execute('SELECT COUNT(*) as count FROM character_info');
      if (charCount[0].count === 0) {
        await db.execute(`
          INSERT INTO character_info (name, description, image_url, personality, role_importance, display_order, status, create_time, update_time)
          VALUES 
            ('谢怜', '仙乐国太子。一心想拯救苍生，却连自己的国家和父母都守护不了。', '../img/谢伶.png', '温文尔雅，慈悲为怀', 'main', 1, 'published', NOW(), NOW()),
            ('花城', '从小受尽虐待，憎恶世界，后成为绝境鬼王。', '../img/花城.png', '深情专一，无所不能', 'main', 2, 'published', NOW(), NOW()),
            ('君吾', '两千年前是乌庸国的太子，天资过人，文武双全。', '../img/军吾.png', '霸气威严，武功绝世', 'main', 3, 'published', NOW(), NOW()),
            ('师青玄', '出身于豪门商贾之家，性情如风，喜欢结交朋友。', '../img/师青玄.jpg', '热心肠，正直有同情心', 'supporting', 4, 'published', NOW(), NOW()),
            ('风信', '仙乐太子的心腹下属，贴身侍卫，一起长大、登天、被贬和流放。', '../img/风信1.png', '忠诚勇敢，但有时性急', 'supporting', 5, 'published', NOW(), NOW()),
            ('慕情', '原为仙乐国太极大观扫地杂役，后因受到谢怜的赏识得以修炼。', '../img/慕情.jpg', '深沉稳重，忠诚可靠', 'supporting', 6, 'published', NOW(), NOW())
        `);
        console.log('✅ 角色数据插入成功');
      } else {
        console.log('角色数据已存在，跳过插入');
      }
    } catch (err) {
      console.log('角色数据插入失败:', err.message);
    }
    
    // 重新插入剧情简介数据
    console.log('\n5. 重新插入剧情简介数据...');
    try {
      const [storyCount] = await db.execute('SELECT COUNT(*) as count FROM story_intro');
      if (storyCount[0].count === 0) {
        await db.execute(`
          INSERT INTO story_intro (title, content, chapter_number, display_order, status, create_time, update_time)
          VALUES 
            ('天官赐福剧情简介', '八百年前，谢怜是金枝玉叶的太子殿下，风光无限的天之骄子。谁知一朝得道飞升，成为万人供奉的武神后，命途竟是急转直下，一贬再贬贬无可贬。八百年后，谢怜又双叒飞升了，这一次没有信徒也没有香火。某日收破烂归来的路上，他将一个神秘少年捡回家中，而这个少年，居然就是那位三界谈之色变的鬼王——花城。', 1, 1, 'published', NOW(), NOW()),
            ('第一章 初遇', '谢怜十七岁时，在仙乐国上元祭天游上担任扮演神武大帝的悦神武者。当华台绕城游行到第三圈，城楼上一名小儿不慎坠落，千钧一发之际，谢怜纵身跃出，如白影般逆空而上接住小儿，落地时脸上的黄金面具掉落，露出俊朗面容，引得万众欢呼。', 2, 2, 'published', NOW(), NOW())
        `);
        console.log('✅ 剧情简介数据插入成功');
      } else {
        console.log('剧情简介数据已存在，跳过插入');
      }
    } catch (err) {
      console.log('剧情简介数据插入失败:', err.message);
    }
    
    // 重新插入基本信息数据
    console.log('\n6. 重新插入基本信息数据...');
    try {
      const [basicCount] = await db.execute('SELECT COUNT(*) as count FROM basic_info');
      if (basicCount[0].count === 0) {
        await db.execute(`
          INSERT INTO basic_info (label, value, display_order, create_time, update_time)
          VALUES 
            ('作品名称', '天官赐福', 1, NOW(), NOW()),
            ('发表时间', '2017-06-16', 2, NOW(), NOW()),
            ('作品别名', '纯情太子妖艳妃', 3, NOW(), NOW()),
            ('主角', '谢怜、花城', 4, NOW(), NOW()),
            ('作者', '墨香铜臭', 5, NOW(), NOW()),
            ('最新章节', '第252章：鬼王的生辰', 6, NOW(), NOW()),
            ('文学体裁', '小说', 7, NOW(), NOW()),
            ('连载状态', '正文及番外均已完结', 8, NOW(), NOW()),
            ('连载平台', '晋江文学城', 9, NOW(), NOW()),
            ('出版状态', '已出版（全六册）', 10, NOW(), NOW()),
            ('类型', '原创-纯爱-架空历史-爱情', 11, NOW(), NOW()),
            ('全文字数', '1144742字', 12, NOW(), NOW())
        `);
        console.log('✅ 基本信息数据插入成功');
      } else {
        console.log('基本信息数据已存在，跳过插入');
      }
    } catch (err) {
      console.log('基本信息数据插入失败:', err.message);
    }
    
    // 重新插入人物语录数据
    console.log('\n7. 重新插入人物语录数据...');
    try {
      const [quoteCount] = await db.execute('SELECT COUNT(*) as count FROM character_quotes');
      if (quoteCount[0].count === 0) {
        await db.execute(`
          INSERT INTO character_quotes (character_name, content, image_url, display_order, status, create_time, update_time)
          VALUES 
            ('🌟 谢怜', '身在无间，心在桃源。\\n是非在己，毁誉由人，得失不论。\\n我虽身在无间，却心向桃源。但如果桃源本身就是无间呢？\\n拯救苍生那种事，对我来说太遥远了。我只想保护好我想保护的人。\\n人上有人，天外有天，风光的背后，不是沧桑，就是肮脏。', '../img/谢伶1.png', 1, 'published', NOW(), NOW()),
            ('🔥 花城', '为你明灯三千，为你花开满城。\\n我永远是你最忠诚的信徒。\\n殿下，我没有骗你，我真的…… 等了你八百年。\\n上元佳节，神武大街，惊鸿一瞥，百世沦陷。\\n殿下，你这可真是…… 要了我的命了。\\n天下无不散之筵席，但我永远不会离开你。', '../img/花城1.png', 2, 'published', NOW(), NOW()),
            ('📿 君吾（白无相）', '身在无间，心在无间。\\n谢怜，你真是…… 让我恶心。\\n我曾是神，也是人，最后，成了怪物。\\n没有人能审判我，除了我自己。', '../img/君吾1.png', 3, 'published', NOW(), NOW())
        `);
        console.log('✅ 人物语录数据插入成功');
      } else {
        console.log('人物语录数据已存在，跳过插入');
      }
    } catch (err) {
      console.log('人物语录数据插入失败:', err.message);
    }
    
    // 重新插入导航菜单数据
    console.log('\n8. 重新插入导航菜单数据...');
    try {
      const [menuCount] = await db.execute('SELECT COUNT(*) as count FROM navigation_menu');
      if (menuCount[0].count === 0) {
        await db.execute(`
          INSERT INTO navigation_menu (name, url, display_order, is_active, create_time, update_time)
          VALUES 
            ('首页', '/user-web/天官赐福首页.html', 1, true, NOW(), NOW()),
            ('角色介绍', '/user-web/角色介绍.html', 2, true, NOW(), NOW()),
            ('剧情简介', '/user-web/剧情简介.html', 3, true, NOW(), NOW()),
            ('作品评价', '/user-web/作品评价.html', 4, true, NOW(), NOW()),
            ('留言板', '/user-web/留言板.html', 5, true, NOW(), NOW())
        `);
        console.log('✅ 导航菜单数据插入成功');
      } else {
        console.log('导航菜单数据已存在，跳过插入');
      }
    } catch (err) {
      console.log('导航菜单数据插入失败:', err.message);
    }
    
    // 最终检查数据情况
    console.log('\n=== 最终数据统计 ===');
    for (const table of tables) {
      try {
        const [rows] = await db.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${table}: ${rows[0].count} 条记录`);
      } catch (error) {
        console.log(`${table}: 查询失败`);
      }
    }
    
    console.log('\n✅ 数据库重新初始化完成！');
    
  } catch (error) {
    console.error('❌ 重新初始化失败:', error);
  }
  process.exit(0);
}

reinitializeDatabase();