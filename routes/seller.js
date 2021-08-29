const express = require("express");
const router = express.Router();
const rand = require("random-key");
const connection=require("../db/connection")
const upload =require("../db/multer");
const path = require("path");
let route=(app)=>{
     
    app.get("/sellerDashboard",(req,res)=>{
        if(req.session.userinfo){
    
        
        let sql = "select * from  porders inner join items on porders.pname = items.pname inner join accounts on porders.bname = accounts.uname having items.uname= ? and porders.stus='pending'";
        let qry = connection.query(sql,[req.session.userinfo],(err,rows)=>{
            
        if(err) throw err;
        res.render("seller/sellerDashboard",{item:rows ,l :req.session.prof})
        })
    }else{
        res.redirect("/login")
    }
    })
    app.get("/products",(req,res)=>{
        if(req.session.userinfo){
        let sql = "SELECT * FROM items WHERE uname=?";
            let qry = connection.query(sql,[req.session.userinfo],(err,rows)=>{
            if(err) throw err;
            
            res.render("seller/products",{
                item : rows,l :req.session.prof
            });
        });
        }
        else{
            res.redirect("login")
        }
    })
    app.get("/add",(req,res)=>{
        if(req.session.userinfo){
            res.render("seller/add",{l :req.session.prof})
        }
        else{
            res.redirect("/login")
        }
        
    })
    app.post("/add",upload.single('pimage'),(req,res)=>{
        let data;
        if(req.body.dprice===''){
            data={uname:req.session.userinfo,pname:req.body.pname,stock:req.body.stock,price:req.body.price,dprice:req.body.price,category:req.body.category,pimage:req.file.filename,descript:req.body.description}
        }else{
            data={uname:req.session.userinfo,pname:req.body.pname,stock:req.body.stock,price:req.body.price,dprice:req.body.dprice,category:req.body.category,pimage:req.file.filename,descript:req.body.description}
        }
        let sql="INSERT INTO items SET ?";
        let qry = connection.query(sql,data,(err,rows)=>{
            if(err) throw err;
            res.redirect("/products");
        });
    })
    app.post("/stock/:pname",(req,res)=>{
        let sql = "UPDATE items SET stock=stock+? WHERE pname=?";
        let qry = connection.query(sql,[req.body.qty,req.params.pname],(err,rows)=>{
            if(err) throw err;
            res.redirect("/products");
        });
    })
    app.get("/editProducts/:pname",(req,res)=>{
        let sql="SELECT * FROM items WHERE pname=?";
        let qry=connection.query(sql,[req.params.pname],(err,rows)=>{
            if(err) throw err;
            res.render("seller/editProduct",{item:rows,l :req.session.prof})
        })
    })
    app.post("/editProduct/:pname",(req,res)=>{
        let data1;
        if(req.body.category=='none'){
            
        data1={uname:req.session.userinfo,pname:req.body.pname,stock:req.body.stock,price:req.body.price,dprice:req.body.dprice,descript:req.body.description}
        }else{
            
            data1={uname:req.session.userinfo,pname:req.body.pname,stock:req.body.stock,price:req.body.price,dprice:req.body.dprice,category:req.body.category,descript:req.body.description}   
        }
        let sql="UPDATE items SET ? WHERE pname=?";
        let qry=connection.query(sql,[data1,req.params.pname],(err,rows)=>{
        if(err) throw err;
        res.redirect("/products")
        })
    })
    app.get("/paymentsummary",(req,res)=>{
        if(req.session.userinfo){
        let sql="SELECT * FROM trans WHERE taker=?";
        let sql0="SELECT * FROM sbal WHERE sname=?";
        let qry=connection.query(sql,req.session.userinfo,(err,rows)=>{
            let qry=connection.query(sql0,req.session.userinfo,(err,val)=>{
            res.render("seller/spayment",{item:rows,val:val,l :req.session.prof})
        }) })
    }else{
        res.redirect("/login")
    }       
    }) 
    app.get("/sellerorderhistory",(req,res)=>{
        if(req.session.userinfo){

	
            let sql = "select * from  porders inner join items on porders.pname = items.pname inner join accounts on porders.bname = accounts.uname having items.uname= ? and porders.stus!='pending'";
            let qry = connection.query(sql,[req.session.userinfo],(err,rows)=>{
                
            if(err) throw err;
            res.render("seller/sellerorderhistory",{item:rows ,l :req.session.prof})
            })
        }else{
            res.redirect("/login")
        }
    })
    app.get("/seller/profile",(req,res)=>{
        if(req.session.userinfo){
        let sql="SELECT * FROM accounts WHERE uname=?";
        let qry=connection.query(sql,[req.session.userinfo],(err,rows)=>{
            if(err) throw err;
            res.render("seller/profile",{item:rows,l :req.session.prof})
        })
    }else{
        res.redirect("/login")
    }
    })

    app.post("/seller/profile",(req,res)=>{
        if(req.session.userinfo){
        let data={uname:req.body.uname,fname:req.body.fname,lname:req.body.lname,email:req.body.email,addr:req.body.add}
        let sql="UPDATE accounts SET ? WHERE uname=?";
        let qry =connection.query(sql,[data,req.session.userinfo],(err,row)=>{
         if(err) throw err;
         res.redirect("/sellerDashboard");
        })}else{
            res.redirect("/login")
        }
    })
    return app.use("/admin",router)
}
module.exports = route;