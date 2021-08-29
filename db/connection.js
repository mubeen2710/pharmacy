const mysql = require("mysql");
 let connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: 3306,
    password: "9809177092mM?",
    database: "classicmodels",
});
module.exports = connection;