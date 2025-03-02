const express = require('express');
const connection = require('../connection');
const router = express.Router();    // Create a router
const ejs = require('ejs');
const pdf = require('html-pdf');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const auth = require('../services/authenticaton');

router.post('/generateReport',auth.authenticateToken,(req,res)=>{
    const generateduuid = uuid.v4();    // Generate a UUID
    const orderDetails=req.body;
    var productDetailsReport =JSON.parse(orderDetails.productDetails);

    const query="INSERT INTO bill (name,Uuid,email,contactNumber,paymentmethod,total,productDetails,createdBy) VALUES (?,?,?,?,?,?,?,?)";
    connection.query(query,[orderDetails.name,generateduuid,orderDetails.email,orderDetails.contactNumber,orderDetails.paymentMethod,orderDetails.totalAmount,orderDetails.productDetails,res.locals.email],(err,results)=>{
        if(err){
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
        else{
            
            ejs.renderFile(path.join(__dirname, '../views/', "bill.ejs"), {productDetails:productDetailsReport,name:orderDetails.name,email:orderDetails.email,contactNumber:orderDetails.contactNumber,paymentMethod:orderDetails.paymentMethod,totalAmount:orderDetails.totalAmount}, (err, data) => {
                if (err) {
                    res.status(500).send(err);
                } else {
                    let options = {
                        "height": "11.25in",
                        "width": "8.5in",
                        "header": {
                            "height": "20mm"
                        },
                        "footer": {
                            "height": "20mm",
                        },
                    };
                    pdf.create(data, options).toFile(path.join(__dirname, '../generated_pdf/', generateduuid+'.pdf'), function (err, data) {
                        if (err) {
                            res.status(500).send(err);
                        } else {
                            res.status(200).json({message:"Bill generated successfully",uuid:generateduuid});
                        }
                    });
                }
            });
        }
    });
});


module.exports = router;  // Export the router