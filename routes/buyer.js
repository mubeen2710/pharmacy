const express = require("express");
const router = express.Router();
const rand = require("random-key");
const connection = require("../db/connection");

let route = (app) => {
    // route and controller for buyer to view his dashboard
    app.get("/userDashboard", (req, res) => {
        let sql = "SELECT * FROM porders INNER JOIN items ON porders.pname =items.pname HAVING porders.bname= ? AND stus != 'delivered'";
        let qry = connection.query(sql, req.session.userinfo, (err, rows) => {
            if (err) throw err;
            res.render("buyer/userDashboard", { item: rows, l: req.session.prof });
        });
        // route and controller for buyer to view ordered products
        app.get("/bordered/:orderId", (req, res) => {
            let sql = "SELECT * FROM porders INNER JOIN items ON porders.pname=items.pname HAVING id=?";
            let qry = connection.query(sql, req.params.orderId, (err, rows) => {
                if (err) throw err;
                res.render("buyer/orderDetails", { item: rows, l: req.session.prof });
            });
        });
    });
    // route and controller for buyer to view his alreadu delivered products
    app.get("/orderhistory", (req, res) => {
        let sql = "SELECT * FROM porders INNER JOIN items ON porders.pname =items.pname HAVING porders.bname= ? AND stus = 'delivered'";
        let qry = connection.query(sql, req.session.userinfo, (err, rows) => {
            if (err) throw err;
            res.render("buyer/orderHistory", { item: rows, l: req.session.prof });
        });
    });
     // route and controller for buyer to view his shipping address
    app.get("/shiping", (req, res) => {
        if (req.session.userinfo) {
            let sql = "SELECT * FROM accounts WHERE uname=?";
            let qry = connection.query(sql, [req.session.userinfo], (err, rows) => {
                if (err) throw err;
                res.render("buyer/shipping", { item: rows, l: req.session.prof });
            });
        } else {
            res.redirect("/login");
        }
    });
     // route and controller for buyer to see his profile
    app.get("/buyer/profile", (req, res) => {
        if (req.session.userinfo) {
            let sql = "SELECT * FROM accounts WHERE uname=?";
            let qry = connection.query(sql, [req.session.userinfo], (err, rows) => {
                if (err) throw err;
                res.render("buyer/profile", { item: rows, l: req.session.prof });
            });
        } else {
            res.redirect("/login");
        }
    });
     // route and controller for buyer to edit his profile
    app.post("/buyer/profile/", (req, res) => {
        if (req.session.userinfo) {
            let data = { uname: req.body.uname, fname: req.body.fname, lname: req.body.lname, email: req.body.email, addr: req.body.add };
            let sql = "UPDATE accounts SET ? WHERE uname=?";
            let qry = connection.query(sql, [data, req.session.userinfo], (err, row) => {
                if (err) throw err;
                res.redirect("/userDashboard");
            });
        } else {
            res.redirect("/login");
        }
    });
     // route and controller for buyer serch for required products
    app.post("/search", (req, res) => {
        let sql = "SELECT * FROM items WHERE pname LIKE '%" + req.body.val + "%'";
        let qry = connection.query(sql, [req.body.val], (err, rows) => {
            if (err) throw err;
            res.render("buyer/searchResults", { item: rows });
        });
    });
    return app.use("/buyer", router);
};
module.exports = route;
