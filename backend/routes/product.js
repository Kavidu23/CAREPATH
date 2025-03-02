const express=require('express');
const connection=require('../connection');  // Import connection.js
const router=express.Router();
var auth=require('../services/authenticaton');
var checkRole=require('../services/checkRole');

router.post('/add',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    const product=req.body;
    const query="insert into product (name,categoryid,description,price,status) values (?,?,?,?,'true')";
    connection.query(query,[product.name,product.categoryId,product.description,product.price],(err,results)=>{
        if(err) return res.status(500).json({message:"Database error",error:err});
        res.status(200).json({message:"Product added successfully"});
    });
});


router.get('/get',auth.authenticateToken,(req,res)=>{
    const query="SELECT p.id,p.name,p.description,p.price,p.status,c.id as categoryId,c.name as categoryName FROM product p INNER JOIN category as c  where p.categoryId=c.id";
    connection.query(query,(err,results)=>{
        if(err) return res.status(500).json({message:"Database error",error:err});
        res.status(200).json(results);
    });
}); 


router.get('/getBycategory/:id',auth.authenticateToken,(req,res)=>{
    const query="SELECT id,name from product where categoryId=? and status='true'";
    connection.query(query,[req.params.id],(err,results)=>{
        if(err) return res.status(500).json({message:"Database error",error:err});
        if(results.length>0){
            return res.status(200).json(results[0]);
        }
        else{
            res.status(404).json({message:"Product not found"});
        }
    });
}); 

router.get('/getById/:id',auth.authenticateToken,(req,res)=>{
    const query="SELECT id,name,description,price from product where id=?";
    connection.query(query,[req.params.id],(err,results)=>{
        if(err) return res.status(500).json({message:"Database error",error:err});
        if(results.length>0){
            return res.status(200).json(results[0]);
        }
        else{
            res.status(404).json({message:"Product not found"});
        }
    });
});



router.patch('/update',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    const product=req.body;
    const query="UPDATE product SET name=?,categoryId=?,description=?,price=? WHERE id=?";
    connection.query(query,[product.name,product.categoryId,product.description,product.price,product.id],(err,results)=>{
        if(!err){
            if(results.affectedRows>0){
                return res.status(200).json({message:"Product updated successfully"});
            }
            else{
                return res.status(404).json({message:"Product not found"});
            }
        }
        else{
            return res.status(500).json({message:"Database error",error:err});
        }
    });
});


router.delete('/delete/:id',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    const query="DELETE FROM product WHERE id=?";
    connection.query(query,[req.params.id],(err,results)=>{
        if(!err){
            if(results.affectedRows>0){
                return res.status(200).json({message:"Product deleted successfully"});
            }
            else{
                return res.status(404).json({message:"Product not found"});
            }
        }
        else{
            return res.status(500).json({message:"Database error",error:err});
        }
    });
});

router.patch('/updateStatus',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    const product=req.body;
    const query="UPDATE product SET status=? WHERE id=?";
    connection.query(query,[product.status,product.id],(err,results)=>{
        if(!err){
            if(results.affectedRows>0){
                return res.status(200).json({message:"Product status updated successfully"});
            }
            else{
                return res.status(404).json({message:"Product not found"});
            }
        }
        else{
            return res.status(500).json({message:"Database error",error:err});
        }
    });
});

module.exports=router;