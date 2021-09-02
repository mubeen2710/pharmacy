const {Pool, Client } = require('pg');

 let connection =new Pool({
 	  user: 'sqyjgmixgscolg',
 	  host: 'ec2-3-230-61-252.compute-1.amazonaws.com',
 	  database: 'dd91abvt6of0n9',
 	  password: 'eae4678345e128a41dc2772f253ed4f8ec1621d4d1b81da3c4ec527ed6484367',
 	  port: 5432,
 });

module.exports = connection;