const express = require("express");
const router = express.Router();
const rand = require("random-key");
const connection = require("../db/connection");

let route = (app) => {
    // route and controller for admin login
    app.get("/adminLogin", (req, res) => {
        res.render("admin/adminLogin", { pn: req.params.pname });
    });
    // route and controller for process admin login 
    app.post("/adminLogin", (req, res) => {
        var username = req.body.uname;
        var password = req.body.pass;
        if (username && password) {
            connection.query("SELECT * FROM accounts WHERE uname = ? AND pass = ?", [username, password], function (error, results) {
                if (error) throw error;
                if (results.length > 0) {
                    if (results[0]._type === "admin") {
                        req.session.userinfo = username;
                        req.session._type = results[0]._type;
                        res.redirect("/admin");
                    } else {
                        res.redirect("/");
                    }
                } else {
                    let message = "Incorrect Username and/or Password!";
                    res.render("admin/adminLogin", { pn: req.params.pname, message: message });
                }
                res.end();
            });
        } else {
            let message = "Please enter Username and Password!";
            res.render("login", { pn: req.params.pname, message: message });
            res.end();
        }
    });
    // route and controller for admin main page
    app.get("/admin", (req, res) => {
        if (req.session._type === "admin") {
            let sql = "SELECT * FROM items";
            let qry = connection.query(sql, (err, row) => {
                if (err) throw err;
                res.render("admin/admin", { item: row });
            });
        } else {
            res.redirect("/adminLogin");
        }
    });
    // route and controller for admin to view buyers
    app.get("/buyers", (req, res) => {
        if (req.session._type === "admin") {
            let sql = "SELECT * FROM accounts WHERE _type='buyer'";
            let qry = connection.query(sql, (err, row) => {
                if (err) throw err;
                res.render("admin/buyers", { item: row });
            });
        } else {
            res.redirect("/adminLogin");
        }
    });
    // route and controller for admin to view sellers
    app.get("/sellers", (req, res) => {
        if (req.session._type === "admin") {
            let sql = "SELECT * FROM accounts WHERE _type='seller'";
            let qry = connection.query(sql, (err, row) => {
                if (err) throw err;
                res.render("admin/sellers", { item: row });
            });
        } else {
            res.redirect("/adminLogin");
        }
    });
    // route and controller for admin view orders
    app.get("/orders", (req, res) => {
        if (req.session._type === "admin") {
            let sql =
                "SELECT * FROM porders INNER JOIN accounts ON porders.bname=accounts.uname INNER JOIN items ON porders.pname=items.pname ORDER BY porders.id DESC";
            let qry = connection.query(sql, (err, row) => {
                if (err) throw err;
                res.render("admin/orders", { item: row });
            });
        } else {
            res.redirect("/adminLogin");
        }
    });
    // route and controller for admin to make a order as delivered
    app.post("/orders/:id", (req, res) => {
        let sql = "UPDATE porders SET stus='delivered' WHERE id=? ";
        let sql0 = "SELECT * FROM porders WHERE id=?";
        let sql1 = "INSERT INTO trans SET ?";
        let sqlb = "SELECT * FROM items WHERE pname=?";
        let sqlb2 = "SELECT * FROM sbal WHERE sname=?";
        let sqlb2a = "INSERT INTO sbal SET sname=?,bal=?";
        let sqlb2b = "UPDATE sbal SET bal=? WHERE sname=?";
        let sqlb2b1 = "SELECT * FROM sbal WHERE sname=?";
        let datetime = new Date();
        let qry0 = connection.query(sql0, req.params.id, (err, row) => {
            if (err) throw err;
            let data = { givener: row[0].bname, taker: "admin", amount: row[0].amount, attime: datetime };
            let qry1 = connection.query(sql1, data, (err, val) => {
                if (err) throw err;
                let qrb = connection.query(sqlb, row[0].pname, (err, pr) => {
                    if (err) throw err;
                    let qrb2 = connection.query(sqlb2, pr[0].uname, (err, bal) => {
                        if (err) throw err;
                        if (typeof bal[0] === "undefined") {
                            let qrb2a = connection.query(sqlb2a, [pr[0].uname, row[0].amount * 0.85], (err, bal2a) => {
                                if (err) throw err;
                            });
                        } else {
                            console.log("hi");
                            let qrb2b1 = connection.query(sqlb2b1, pr[0].uname, (err, tra) => {
                                console.log(tra[0].bal);
                                let qrb2b = connection.query(sqlb2b, [tra[0].bal + row[0].amount * 0.85, pr[0].uname], (err, bal2a) => {
                                    if (err) throw err;
                                });
                            });
                        }
                    });
                });
                let qry = connection.query(sql, [req.params.id], (err, rows) => {
                    if (err) throw err;
                    res.redirect("/orders");
                });
            });
        });
    });
    // route and controller for admin login
    app.post("/sellerDashboard/:id", (req, res) => {
        let sql = "UPDATE porders SET stus='shipped' WHERE id=? ";
        let qry = connection.query(sql, [req.params.id], (err, rows) => {
            if (err) throw err;
        });
    });
    // route and controller for admin to view transactions history
    app.get("/transaction", (req, res) => {
        if (req.session._type === "admin") {
            let sql = "SELECT * FROM trans ORDER BY attime DESC";
            let sql0 = "SELECT * FROM sbal";
            let qry = connection.query(sql, (err, rows) => {
                let qry1 = connection.query(sql0, (err, val) => {
                    res.render("admin/transaction", { item: rows, sval: val });
                });
            });
        } else {
            res.redirect("/adminLogin");
        }
    });
    // route and controller for admin to make transactions
    app.post("/transaction/:sname/:amount", (req, res) => {
        let sql = "INSERT INTO trans SET ?";
        let datetime = new Date();
        let sql0 = "UPDATE sbal SET bal=0 WHERE sname=?";
        let data = { givener: "admin", taker: req.params.sname, amount: req.params.amount, attime: datetime };
        let qry = connection.query(sql, data, (err, rows) => {
            if (err) throw err;
            let qry0 = connection.query(sql0, req.params.sname, (err, val) => {
                if (err) throw err;
                res.redirect("/transaction");
            });
        });
    });
    // route and controller for admin to view buyers
    app.get("/buyer/detail", (req, res) => {
        if (req.session._type === "admin") {
            sql = "SELECT * FROM porders INNER JOIN items ON porders.pname=items.pname HAVING id=?";
            let qry = connection.query(sql, req.session.userinfo, (err, rows) => {
                res.render("buyer/details", { item: rows, l: req.session.userinfo });
            });
        } else {
            res.redirect("/adminLogin");
        }
    });
    // route and controller for admin to delete buyer
    app.post("/admin/userdelete/:uname", (req, res) => {
        let sql = "DELETE FROM accounts WHERE uname=?";
        let qry = connection.query(sql, req.params.uname, (err, rows) => {
            if (err) throw err;
            res.redirect("/buyers");
        });
    });
    // route and controller for admin to delete product
    app.post("/admin/productdelete/:pname", (req, res) => {
        let sql = "DELETE FROM items WHERE pname=?";
        let qry = connection.query(sql, req.params.pname, (err, rows) => {
            if (err) throw err;
            res.redirect("/admin");
        });
    });
    // route and controller for admin to delete seller
    app.post("/admin/sellerdelete/:uname", (req, res) => {
        let sql = "DELETE FROM accounts WHERE uname=?";
        let qry = connection.query(sql, req.params.uname, (err, rows) => {
            if (err) throw err;
            res.redirect("/sellers");
        });
    });

    return app.use("/admin", router);
};
module.exports = route;
