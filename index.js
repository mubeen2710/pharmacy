const path = require("path");
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const { get } = require("http");
const buyerRoutes = require("./routes/buyer");
var session = require("express-session");
const initRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const sellerRoutes = require("./routes/seller");
const productsRoutes = require("./routes/products");
const connection =require("./db/connection")

let app = express();
app.use(express.static(__dirname + "/views"));

connection.connect();
// const server = http.createServer(app);

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  }))

// var sessionStore = new MySQLStore(
//      {
//          expiration: 10000000,
//          createDatabaseTable: true,
//          schema: {
//             tableName: "sessions",
//              columnNames: {
//                  session_id: "session_id",
//                  expires: "expires",
//                  data: "data",
//              },
//          },
//      },
//      connection
//  );

//  app.use(
//    session({
//             key: "session_cookie_name",
//         secret: "session_cookie_secret",
//         store: sessionStore,
//         resave: false,
//         saveUninitialized: false,
//      })
//  );

//started the server on port 4000
app.listen(process.env.PORT, () => {
    console.log("Server started ar port 6000..");
});

//writing a middleware to setup view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
sellerRoutes(app);
buyerRoutes(app);
adminRoutes(app);
productsRoutes(app);
initRoutes(app);
