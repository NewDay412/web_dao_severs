const db = require('../config/db');
const bcrypt = require('bcrypt');

class UserModel {
  /**
   * 用户注册
   */
  static async register(userData) {
    const { username, password, sex } = userData;
    
    // 检查用户名是否已存在
    const [existing] = await db.executeOn(
      'web_userdao',
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (existing.length > 0) {
      throw new Error('用户名已存在');
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 插入新用户
    const [result] = await db.executeOn(
      'web_userdao',
      'INSERT INTO users (username, password, sex, create_time) VALUES (?, ?, ?, NOW())',
      [username, hashedPassword, sex]
    );
    
    return result.insertId;
  }

  /**
   * 用户登录验证
   */
  static async login(username, password) {
    const [users] = await db.executeOn(
      'web_userdao',
      'SELECT id, username, password FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      throw new Error('USER_NOT_FOUND');
    }
    
    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (isValid) {
      return { id: user.id, username: user.username };
    }
    
    throw new Error('INVALID_PASSWORD');
  }
}

/**
 * 管理员模型
 */
class AdminModel {
  /**
   * 管理员登录验证
   */
  static async login(username, password) {
    const [admins] = await db.executeOn(
      'web_admindao',
      'SELECT id, username, password, role FROM admins WHERE username = ?',
      [username]
    );
    
    if (admins.length === 0) {
      return null;
    }
    
    const admin = admins[0];
    const isValid = await bcrypt.compare(password, admin.password);
    
    if (isValid) {
      return { id: admin.id, username: admin.username, role: admin.role };
    }
    
    return null;
  }

  /**
   * 获取所有管理员
   */
  static async getAllAdmins() {
    const [admins] = await db.executeOn(
      'web_admindao',
      'SELECT id, username, role, create_time, update_time FROM admins ORDER BY create_time DESC'
    );
    return admins;
  }

  /**
   * 添加管理员
   */
  static async addAdmin(adminData) {
    const { username, password, role } = adminData;
    
    // 检查用户名是否已存在
    const [existing] = await db.executeOn(
      'web_admindao',
      'SELECT id FROM admins WHERE username = ?',
      [username]
    );
    
    if (existing.length > 0) {
      throw new Error('用户名已存在');
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 插入新管理员
    const [result] = await db.executeOn(
      'web_admindao',
      'INSERT INTO admins (username, password, role, create_time) VALUES (?, ?, ?, NOW())',
      [username, hashedPassword, role]
    );
    
    return result.insertId;
  }

  /**
   * 获取单个管理员
   */
  static async getAdminById(id) {
    const [admins] = await db.executeOn(
      'web_admindao',
      'SELECT id, username, role, create_time FROM admins WHERE id = ?',
      [id]
    );
    return admins[0] || null;
  }

  /**
   * 删除管理员
   */
  static async deleteAdmin(id) {
    await db.executeOn(
      'web_admindao',
      'DELETE FROM admins WHERE id = ?',
      [id]
    );
  }

  /**
   * 根据用户名获取管理员信息
   * @param {string} username - 管理员用户名
   * @returns {object} 管理员信息
   */
  static async getAdminByUsername(username) {
    const [admins] = await db.executeOn(
      'web_admindao',
      'SELECT id, username, role, create_time, update_time FROM admins WHERE username = ?',
      [username]
    );
    return admins[0] || null;
  }
}

module.exports = { UserModel, AdminModel };