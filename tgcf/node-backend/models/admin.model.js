const db = require('../config/db');
const bcrypt = require('bcrypt');

class AdminModel {
  /**
   * 管理员登录验证
   */
  static async login(username, password) {
    const [admins] = await db.executeOn('web_admindao',
      'SELECT id, username, password, role FROM admins WHERE username = ?',
      [username]
    );
    
    if (admins.length === 0) {
      throw new Error('USER_NOT_FOUND');
    }
    
    const admin = admins[0];
    const isValid = await bcrypt.compare(password, admin.password);
    
    if (isValid) {
      return { id: admin.id, username: admin.username, role: admin.role };
    }
    
    throw new Error('INVALID_PASSWORD');
  }

  /**
   * 创建新管理员
   */
  static async createAdmin(adminData) {
    try {
      const { username, password, role = 'admin' } = adminData;
      
      // 检查用户名是否已存在
      const [existing] = await db.executeOn('web_admindao',
        'SELECT id FROM admins WHERE username = ?',
        [username]
      );
      
      if (existing.length > 0) {
        throw new Error('用户名已存在');
      }
      
      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // 插入新管理员
      const [result] = await db.executeOn('web_admindao',
        'INSERT INTO admins (username, password, role, create_time) VALUES (?, ?, ?, NOW())',
        [username, hashedPassword, role]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('创建管理员失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有管理员
   */
  static async getAllAdmins() {
    try {
      const [admins] = await db.executeOn('web_admindao',
        'SELECT id, username, role, create_time FROM admins ORDER BY create_time DESC'
      );
      return admins;
    } catch (error) {
      console.error('获取管理员列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据用户名获取管理员信息
   * @param {string} username - 管理员用户名
   * @returns {object} 管理员信息
   */
  static async getAdminByUsername(username) {
    try {
      const [admins] = await db.executeOn('web_admindao',
        'SELECT id, username, role, create_time, update_time FROM admins WHERE username = ?',
        [username]
      );
      return admins[0] || null;
    } catch (error) {
      console.error('根据用户名获取管理员信息失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取管理员信息
   */
  static async getAdminById(id) {
    try {
      const [admins] = await db.executeOn('web_admindao',
        'SELECT id, username, role, create_time, update_time FROM admins WHERE id = ?',
        [id]
      );
      return admins[0] || null;
    } catch (error) {
      console.error('获取管理员信息失败:', error);
      throw error;
    }
  }

  /**
   * 添加管理员
   */
  static async addAdmin(adminData) {
    return await this.createAdmin(adminData);
  }

  /**
   * 更新管理员信息
   */
  static async updateAdmin(id, updateData) {
    try {
      const { username, role, password } = updateData;
      
      // 检查用户名是否已存在（排除当前用户）
      if (username) {
        const [existing] = await db.executeOn('web_admindao',
          'SELECT id FROM admins WHERE username = ? AND id != ?',
          [username, id]
        );
        
        if (existing.length > 0) {
          throw new Error('用户名已存在');
        }
      }
      
      let sql = 'UPDATE admins SET ';
      const params = [];
      const updates = [];
      
      if (username) {
        updates.push('username = ?');
        params.push(username);
      }
      
      if (role) {
        updates.push('role = ?');
        params.push(role);
      }
      
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.push('password = ?');
        params.push(hashedPassword);
      }
      
      updates.push('update_time = NOW()');
      sql += updates.join(', ') + ' WHERE id = ?';
      params.push(id);
      
      await db.executeOn('web_admindao', sql, params);
      return true;
    } catch (error) {
      console.error('更新管理员失败:', error);
      throw error;
    }
  }

  /**
   * 删除管理员
   */
  static async deleteAdmin(id) {
    try {
      await db.executeOn('web_admindao',
        'DELETE FROM admins WHERE id = ?',
        [id]
      );
      return true;
    } catch (error) {
      console.error('删除管理员失败:', error);
      throw error;
    }
  }

  /**
   * 验证管理员密码
   * @param {string} username - 管理员用户名
   * @param {string} password - 密码
   * @returns {boolean} 密码是否正确
   */
  static async verifyPassword(username, password) {
    try {
      const [admins] = await db.executeOn('web_admindao',
        'SELECT password FROM admins WHERE username = ?',
        [username]
      );
      
      if (admins.length === 0) {
        return false;
      }
      
      const admin = admins[0];
      return await bcrypt.compare(password, admin.password);
    } catch (error) {
      console.error('验证密码失败:', error);
      throw error;
    }
  }
}

module.exports = AdminModel;