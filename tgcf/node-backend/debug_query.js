const db = require('./config/db');

async function debugQuery() {
    try {
        // 检查sender_name和receiver_name的分布
        const [senderRows] = await db.executeOn('web_project', 'SELECT DISTINCT sender_name FROM chat_messages');
        console.log('Sender names:', senderRows);
        
        const [receiverRows] = await db.executeOn('web_project', 'SELECT DISTINCT receiver_name FROM chat_messages');
        console.log('Receiver names:', receiverRows);
        
        // 检查UNION查询的中间结果
        const [union1] = await db.executeOn('web_project', 'SELECT sender_name as username, create_time FROM chat_messages');
        console.log('Union part 1:', union1);
        
        const [union2] = await db.executeOn('web_project', 'SELECT receiver_name as username, create_time FROM chat_messages');
        console.log('Union part 2:', union2);
        
        // 检查完整的UNION查询
        const [unionAll] = await db.executeOn('web_project', 
            `SELECT username, create_time FROM (
                SELECT sender_name as username, create_time FROM chat_messages
                UNION ALL
                SELECT receiver_name as username, create_time FROM chat_messages
            ) as all_users`
        );
        console.log('Union all result:', unionAll);
        
        // 检查过滤后的结果
        const [filtered] = await db.executeOn('web_project', 
            `SELECT username, create_time FROM (
                SELECT sender_name as username, create_time FROM chat_messages
                UNION ALL
                SELECT receiver_name as username, create_time FROM chat_messages
            ) as all_users 
            WHERE username != 'admin' AND username != 'all'`
        );
        console.log('Filtered result:', filtered);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

debugQuery();