const express = require("express");
const session = require("express-session");
const router = express.Router();
const rand = require("random-key");
const connection = require("../db/connection");

let route = (app) => {
     // route and controller for buyer to view his cart
    app.get("/cart", (req, res) => {
        if (req.session.userinfo) {
            let sql = "SELECT * FROM cart INNER JOIN items ON cart.cpname=items.pname HAVING username=?";
            let qry = connection.query(sql, req.session.userinfo, (err, rows) => {
                if (err) throw err;
                res.render("buyer/cart", { item: rows, l: req.session.prof });
            });
        } else {
            res.redirect("/login");
        }
    });
     // route and controller for buyer to add to his cart 
    app.post("/cart/:pname", (req, res) => {
        if (req.session.userinfo) {
            let data = { cpname: req.params.pname, username: req.session.userinfo };
            let sql = "INSERT INTO cart SET ?";
            let qry = connection.query(sql, data, (err, rows) => {
                if (err) throw err;
                res.redirect("/");
            });
        } else {
            res.redirect("/login");
        }
    });
    app.post("/cartRemove/:id", (req, res) => {
        let sql = "DELETE FROM cart WHERE id=?";
        let qry = connection.query(sql, req.params.id, (err, rows) => {
            if (err) throw err;
            res.redirect("/cart");
        });
    });
    app.post("/cart-checkout", (req, res) => {
        if (req.session.userinfo) {
            let sql = "SELECT * FROM cart INNER JOIN items ON cart.cpname=items.pname HAVING username=?";
            let sql2 = "SELECT * FROM accounts WHERE uname=?";
            let qry = connection.query(sql, req.session.userinfo, (err, rows) => {
                if (err) throw err;
                let price = 0,
                    len = rows.length;
                for (i = 0; i < len; i++) {
                    price += parseInt(rows[i].price);
                }
                let qry = connection.query(sql2, req.session.userinfo, (err, row) => {
                    if (err) throw err;
                    res.render("buyer/checkout", { item: rows, user: row, l: req.session.prof, price: price });
                });
            });
        }
    });

    return app.use("/admin", router);
};
module.exports = route;
