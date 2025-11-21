const db = require('../config/db');

class CarouselModel {
    static async createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS web_project.carousel (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL COMMENT '轮播图标题',
                image_url VARCHAR(500) NOT NULL COMMENT '图片URL',
                link_url VARCHAR(500) DEFAULT NULL COMMENT '点击跳转链接',
                description TEXT DEFAULT NULL COMMENT '描述',
                display_order INT DEFAULT 0 COMMENT '显示顺序',
                is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
                create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图表'
        `;
        
        try {
            await db.execute(sql);
            console.log('轮播图表创建成功');
        } catch (error) {
            console.error('创建轮播图表失败:', error);
            throw error;
        }
    }

    static async getAll() {
        const sql = 'SELECT * FROM web_project.carousel ORDER BY display_order ASC, create_time DESC';
        try {
            const [rows] = await db.execute(sql);
            return rows;
        } catch (error) {
            console.error('获取轮播图列表失败:', error);
            throw error;
        }
    }

    static async getActive() {
        const sql = 'SELECT * FROM web_project.carousel WHERE is_active = 1 ORDER BY display_order ASC';
        try {
            const [rows] = await db.execute(sql);
            return rows;
        } catch (error) {
            console.error('获取活跃轮播图失败:', error);
            throw error;
        }
    }

    static async getById(id) {
        const sql = 'SELECT * FROM web_project.carousel WHERE id = ?';
        try {
            const [rows] = await db.execute(sql, [id]);
            return rows[0];
        } catch (error) {
            console.error('获取轮播图详情失败:', error);
            throw error;
        }
    }

    static async create(data) {
        const sql = `
            INSERT INTO web_project.carousel (title, image_url, link_url, description, display_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        try {
            const [result] = await db.execute(sql, [
                data.title,
                data.image_url,
                data.link_url || null,
                data.description || null,
                data.display_order || 0,
                data.is_active !== undefined ? data.is_active : 1
            ]);
            return result.insertId;
        } catch (error) {
            console.error('创建轮播图失败:', error);
            throw error;
        }
    }

    static async update(id, data) {
        const sql = `
            UPDATE web_project.carousel 
            SET title = ?, image_url = ?, link_url = ?, description = ?, display_order = ?, is_active = ?
            WHERE id = ?
        `;
        try {
            const [result] = await db.execute(sql, [
                data.title,
                data.image_url,
                data.link_url || null,
                data.description || null,
                data.display_order || 0,
                data.is_active !== undefined ? data.is_active : 1,
                id
            ]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('更新轮播图失败:', error);
            throw error;
        }
    }

    static async delete(id) {
        const sql = 'DELETE FROM web_project.carousel WHERE id = ?';
        try {
            const [result] = await db.execute(sql, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('删除轮播图失败:', error);
            throw error;
        }
    }
}

module.exports = CarouselModel;