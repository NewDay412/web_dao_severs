const WorkReviewModel = require('./models/workReview.model');

async function testActualCall() {
  try {
    console.log('模拟实际接口调用...');
    
    // 模拟没有status参数的情况（就像接口调用时）
    console.log('测试1: 没有status参数，有page和pageSize');
    const status = null; // 模拟req.query.status为空
    const page = 1;
    const pageSize = 10;
    
    console.log('调用参数:', { status, page, pageSize });
    
    const reviews = await WorkReviewModel.getAllReviews(status, page, pageSize);
    console.log('结果:', reviews.length, '条记录');
    
    console.log('测试2: 有status参数');
    const status2 = 'approved';
    const reviews2 = await WorkReviewModel.getAllReviews(status2, page, pageSize);
    console.log('结果:', reviews2.length, '条记录');
    
    console.log('测试完成');
  } catch (error) {
    console.error('测试失败:', error);
    console.error('错误堆栈:', error.stack);
  }
}

testActualCall();