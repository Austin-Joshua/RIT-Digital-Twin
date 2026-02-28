const mysql = require('mysql2/promise');

async function patchDatabase() {
    const connection = await mysql.createConnection({
        host: 'digital-twin-db-austinjoshuamj-0251.j.aivencloud.com',
        port: 27171,
        user: 'avnadmin',
        password: 'RitDigitalTwin@2026',
        database: 'defaultdb',
        ssl: { rejectUnauthorized: false }
    });

    console.log('Connected to Aiven Database.');

    const queries = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;",
        "ALTER TABLE transport_routes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
        "ALTER TABLE transport_routes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;",
        "ALTER TABLE marks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
        "ALTER TABLE marks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;",
        "ALTER TABLE roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
        "ALTER TABLE roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;"
    ];

    for (const q of queries) {
        try {
            await connection.query(q);
            console.log('Successfully executed:', q);
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column already exists, skipping:', q);
            } else {
                console.error('Error executing query:', q, err.message);
            }
        }
    }

    await connection.end();
    console.log('Database patching complete.');
}

patchDatabase();
