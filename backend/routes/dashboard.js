const express=require('express');
const connection=require('../connection');  
const router=express.Router();  
const auth=require('../services/authenticaton');




router.get('/details',auth.authenticateToken,(req,res)=>{   
    var categoryCount;
    var productCount;
    var billCount;
    const query="SELECT COUNT(id) as categoryCount FROM category";
    connection.query(query,(err,results)=>{
        if(err){
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
        else{
            categoryCount=results[0].categoryCount;
            const query="SELECT COUNT(id) as productCount FROM product";
            connection.query(query,(err,results)=>{
                if(err){
                    console.log(err);
                    res.status(500).send("Internal Server Error");
                }
                else{
                    productCount=results[0].productCount;
                    const query="SELECT COUNT(id) as billCount FROM bill";
                    connection.query(query,(err,results)=>{
                        if(err){
                            console.log(err);
                            res.status(500).send("Internal Server Error");
                        }
                        else{
                            billCount=results[0].billCount;
                            res.status(200).json({categoryCount:categoryCount,productCount:productCount,billCount:billCount});
                        }
                    });
                }
            });
        }
    });
}); 


module.exports=router;  // Export the router