const mysql = require('mysql');
const util = require('util');

const pool = mysql.createPool({
  connectionLimit: 50,
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'onlineauction'
});

const mysql_query = util.promisify(pool.query).bind(pool);

module.exports = {
  load: sql => mysql_query(sql),
  add: (tableName, entity) => mysql_query(`insert into ${tableName} set ?`, entity),
  del: (tableName, condition) => mysql_query(`delete from ${tableName} where ?`, condition),
  patch: (tableName, entity, condition) => mysql_query(`update ${tableName} set ? where ?`, [entity, condition]),
};