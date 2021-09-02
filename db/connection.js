const {Pool, Client } = require('pg');

 let connection =new Pool({
 	  user: 'postgres',
 	  host: 'localhost',
 	  database: 'pharmacy',
 	  password: '9446546666mm',
 	  port: 5432,
 });

module.exports = connection;