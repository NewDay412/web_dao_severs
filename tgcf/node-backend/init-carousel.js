const CarouselModel = require('./models/carousel.model');

async function initCarousel() {
    try {
        await CarouselModel.createTable();
        console.log('轮播图表初始化完成');
    } catch (error) {
        console.error('轮播图表初始化失败:', error);
    }
}

initCarousel();