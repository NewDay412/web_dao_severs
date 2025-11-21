const db = require('./config/db');

async function checkData() {
  try {
    // 检查剧情简介数据
    console.log('=== 检查剧情简介数据 ===');
    const [storyIntroRows] = await db.executeOn('web_project', 'SELECT * FROM story_intro');
    console.log('剧情简介表中有', storyIntroRows.length, '条记录');
    console.log('数据内容:', storyIntroRows);

    // 检查轮播图数据
    console.log('\n=== 检查轮播图数据 ===');
    const [carouselRows] = await db.executeOn('web_project', 'SELECT * FROM carousel_images');
    console.log('轮播图表中有', carouselRows.length, '条记录');
    console.log('数据内容:', carouselRows);
  } catch (error) {
    console.error('检查数据失败:', error);
  }
}

checkData();
