var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_revelsj',
  password        : 'XXXX',
  database        : 'cs340_revelsj'
});
module.exports.pool = pool;
