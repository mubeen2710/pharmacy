const express = require("express");
const router = express.Router();
const connection = require("../db/connection");
const path = require("path");
const session = require("express-session");
// const MySQLStore = require("express-mysql-session")(session);
const upload = require("../db/multer");

let l = false;
let routes = (app) => {
    app.get("/login", (req, res) => {
        res.render("login", { pn: req.params.pname });
    });
    app.post("/login", function async (req, res) {
        connection.connect();
        var username = req.body.uname;
        var password = req.body.pass;
        if (username && password) {
             connection.query("select * from accounts where (uname='abc traders') and (pass='123');", ['abc traders', '123'], function (error, results) {
                if (error) console.log(error.stack);
                if (results.length > 0) {
                    req.session.userinfo = username;
                    req.session._type = results[0]._type;
                    req.session.prof= results[0].prof;
                    if (results[0]._type === "buyer") {
                        res.redirect("/userDashboard");
                    } else {
                        res.redirect("/sellerDashboard");
                    }
                } else {
                    let message="Incorrect Username and/or Password!";
					res.render("login", { pn: req.params.pname,message:message });
                }
                res.end();
            });
        } else {
            let message="Please enter Username and Password!";
			res.render("login", { pn: req.params.pname,message:message });
            res.end();
        }
        connection.end();
    });
    app.get("/logout", (req, res) => {
        req.session.destroy((err) => {
            if (err) throw err;
        });
        res.redirect("/");
    });
    app.get("/", (req, res) => {
        // let sql = "SELECT * FROM items";
        // let qry = connection.query(sql, (err, rows) => {
        //     if (err) throw err;
            res.render("pharm",{item:[]});
        // });
    });

    app.get("/signup", (req, res) => {
        res.render("signup", { message: "" });
    });
    app.post("/signup", (req, res) => {
        let data;
        if (typeof req.body.usname !== "undefined") {
            
            data = [
                req.body.usname,
                req.body.fname,
                req.body.lname,
                req.body.email,
                req.body.phone,
                "buyer",
                 req.body.add1,
                req.body.add2,
                req.body.add3,
                req.body.pass,
                
                req.body.pin
            ];
        } else {
            
            data = [
                req.body.cuname,
                req.body.cfname,
                req.body.clname,
                req.body.cemail,
                req.body.cphone,
                "seller",
                req.body.cadd1,
                req.body.cadd2,
                req.body.cadd3,
               req.body.cpass,
                
                 req.body.pin,
            ];
        }
        let sql = "INSERT INTO accounts(uname, fname, lname, email, phone, _type, add1, add2, add3, pass, pin) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *";
        let qry = connection.query(sql, data, (err, rows) => {
            if (err) throw err;
            res.redirect("/login");
        });
    });
    app.post("/changeProf",upload.single("prof"),(req,res)=>{
        if(req.session.userinfo){
        let data={prof: req.file.filename}    
        let sql="UPDATE accounts SET ? WHERE uname=?";
        let qry =connection.query(sql,[data,req.session.userinfo],(err,row)=>{
            if(err) throw err;
            if (req.session._type === "buyer") {
                res.redirect("/buyer/profile");
            } else {
                res.redirect("/seller/profile");
            }
            
           })}else{
            res.redirect("/login")
           }
    })
    app.get("/dashboard", (req, res) => {
        if (req.session._type === "buyer") {
            res.redirect("/userDashboard");
        } else {
            res.redirect("/sellerDashboard");
        }
    });

    app.get("/detail/:pname", (req, res) => {
        let sql = "SELECT * FROM items WHERE pname=?";
        let sql0 = "SELECT * FROM items WHERE category=? and pname!=?";
        let qry = connection.query(sql, [req.params.pname], (err, rows) => {
            if (err) throw err;
            let qry0 = connection.query(sql0, [rows[0].category, req.params.pname], (err, rows0) => {
                if (err) throw err;
                res.render("detail", { item: rows, sim: rows0, l: req.session.prof });
            });
        });
    });

    app.get("/detail/:pname/buy", (req, res) => {
        let sql = "SELECT * FROM items WHERE pname=?";
        let sql2 = "SELECT * FROM accounts WHERE uname=?";
        let qry = connection.query(sql, [req.params.pname], (err, rows) => {
            if (err) throw err;
            row1 = rows;
        });
        let qry2 = connection.query(sql2, [req.session.userinfo], (err, row) => {
            if (err) throw err;
            res.render("buy", { item: row1, user: row, l: req.session.prof});
        });
    });
    app.post("/detail/:pname/buy", (req, res) => {
        let message = "";
        let datetime = new Date();
        let rqty, data2;
        let qty = parseInt(req.body.qty);
        console.log(`qty=${qty}`);
        let sql0 = "SELECT * FROM items WHERE pname=?";
        let sql = "INSERT INTO porders SET ?";
        let sql2 = "UPDATE items SET stock=stock-? WHERE pname=?";
        let qry = connection.query(sql0, [req.params.pname], (err, rows) => {
            if (err) throw err;
            rqty = rows[0].stock - qty;
            if (rows[0].dprice === 0) {
                
                data2 = { pname: req.params.pname, qty: req.body.qty, bname: req.session.userinfo, stus: "pending", amount: rows[0].price * qty,orderedOn: datetime };
            } else {
                
                data2 = { pname: req.params.pname, qty: req.body.qty, bname: req.session.userinfo, stus: "pending", amount: rows[0].dprice * qty,orderedOn: datetime  };
            }

            if (rqty >= 0) {
                let qry = connection.query(sql, data2, (err, values) => {
                    if (err) throw err;
                });
                let qry2 = connection.query(sql2, [qty, req.params.pname], (err, rows2) => {});
                res.redirect("/");
            } else {
                message = "required quantity is not available";
                let sqld = "SELECT * FROM items WHERE pname=?";
                let sqld2 = "SELECT * FROM accounts WHERE uname=?";
                let qry = connection.query(sqld, [req.params.pname], (err, rows) => {
                    if (err) throw err;
                    row1 = rows;
                });
                let qry2 = connection.query(sqld2, [req.session.userinfo], (err, row) => {
                    if (err) throw err;
                    res.render("buy", { item: row1, user: row, l: req.session.userinfo,message:message });
                });
            }
        });
    });
    app.post("/checkout",(req,res)=>{
        if(req.session.userinfo){
            let sql = "SELECT * FROM cart WHERE username=?";
            let sql1= "INSERT INTO porders SET ?";
            
            let qry =connection.query(sql,req.session.userinfo,(err,rows)=>{
                if(err) throw err;
                
                rows.forEach((row)=>{
                    
                    let data2 = {pname:row.cpname,qty:1,bname:req.session.userinfo,stus:'pending'}
                    let qry1=connection.query(sql1,data2,(err,value)=>{
                        if(err) throw err;
                       
                    })
                    
                })
                let sql3="DELETE FROM cart WHERE username=?";
                let qry2=connection.query(sql3,req.session.userinfo,(err,val)=>{
                    if(err) throw err;
                   
                })
                res.redirect("/")
            })}else{
                res.redirect("/login")
            }});
    return app.use("/", router);
};
module.exports = routes;
