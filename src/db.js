const { Pool } = require('pg');

const pool = new Pool({
  user: 'axia_ltas_user',
  host: 'dpg-d37uj2ur433s73f34580-a.oregon-postgres.render.com',
  database: 'axia_ltas',
  password: 'GB0L64UMsmUpQZY443k0QqdkPWAwbz39',
  port: 5432,
  ssl: {
    rejectUnauthorized: false, // necessário no Render
  },
});

module.exports = pool;