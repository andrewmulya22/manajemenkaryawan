const mysql = require('mysql');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'ap1',
    charset: 'utf8'
});

module.exports = pool;