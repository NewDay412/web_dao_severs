const db = require('./config/db');

async function testQuery() {
    try {
        const [rows] = await db.executeOn('web_project', `
            SELECT DISTINCT username, MAX(create_time) as last_message_time 
            FROM (
                SELECT sender_name as username, create_time FROM chat_messages
                UNION ALL
                SELECT receiver_name as username, create_time FROM chat_messages
            ) as all_users 
            WHERE username != 'admin' AND username != 'all'
            GROUP BY username 
            ORDER BY last_message_time DESC`);
        console.log('Query result:', rows);
    } catch (error) {
        console.error('Error:', error);
    }
}

testQuery();