const db = require('../config/db');

/**
 * 作品评价模型 - 处理作品评价相关的数据库操作
 */
class WorkReviewModel {
  /**
   * 获取所有作品评价
   * @param {string} status - 状态筛选（approved/pending/rejected）
   * @param {number} limit - 返回数量限制
   * @returns {Promise<Array>} 评价列表
   */
  static async getAllReviews(status = null, page = 1, pageSize = 10) {
    try {
      let query = 'SELECT * FROM work_reviews';
      let conditions = [];
      let params = [];
      
      if (status) {
        conditions.push('status = ?');
        params.push(status);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY create_time DESC';
      
      // 避免使用占位符处理LIMIT和OFFSET，直接拼接SQL
      if (pageSize) {
        const offset = (page - 1) * pageSize;
        query += ` LIMIT ${pageSize} OFFSET ${offset}`;
      }
      
      // 执行查询
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('获取评价列表失败:', error);
      throw error;
    }
  }

  /**
   * 添加作品评价
   * @param {object} reviewData - 评价数据
   * @returns {Promise<number>} 新增评价的ID
   */
  static async addReview(reviewData) {
    try {
      const {
        username,
        rating,
        content,
        tags = '',
        status = 'pending'
      } = reviewData;
      
      // 验证评分范围
      if (rating < 1 || rating > 5) {
        throw new Error('评分必须在1-5之间');
      }
      
      const [result] = await db.execute(
        `INSERT INTO work_reviews (username, rating, content, tags, status, create_time, update_time)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [username, rating, content, tags, status]
      );
      return result.insertId;
    } catch (error) {
      console.error('添加评价失败:', error);
      throw error;
    }
  }

  /**
   * 更新评价状态
   * @param {number} id - 评价ID
   * @param {string} status - 新状态
   * @returns {Promise<boolean>} 是否成功
   */
  static async updateReviewStatus(id, status) {
    try {
      await db.execute(
        `UPDATE work_reviews SET status = ?, update_time = NOW() WHERE id = ?`,
        [status, id]
      );
      return true;
    } catch (error) {
      console.error('更新评价状态失败:', error);
      throw error;
    }
  }

  /**
   * 删除作品评价
   * @param {number} id - 评价ID
   * @returns {Promise<boolean>} 是否成功
   */
  static async deleteReview(id) {
    try {
      await db.execute('DELETE FROM work_reviews WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('删除评价失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取作品评价
   * @param {number} id - 评价ID
   * @returns {Promise<Object|null>} 评价对象
   */
  static async getReviewById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM work_reviews WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('获取评价详情失败:', error);
      throw error;
    }
  }

  /**
   * 获取评价统计信息
   * @returns {Promise<Object>} 统计信息
   */
  static async getReviewStats() {
    try {
      // 获取平均评分
      const [avgRatingRows] = await db.execute(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as total_count FROM work_reviews WHERE status = ?',
        ['approved']
      );
      
      // 获取各评分数量分布
      const [ratingDistRows] = await db.execute(
        'SELECT rating, COUNT(*) as count FROM work_reviews WHERE status = ? GROUP BY rating ORDER BY rating DESC',
        ['approved']
      );
      
      return {
        avg_rating: avgRatingRows[0].avg_rating || 0,
        total_count: avgRatingRows[0].total_count || 0,
        rating_distribution: ratingDistRows
      };
    } catch (error) {
      console.error('获取评价统计失败:', error);
      throw error;
    }
  }
}

module.exports = WorkReviewModel;