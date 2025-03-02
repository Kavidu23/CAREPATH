const express = require('express');
const connection = require('../connection');
const router = express.Router();
var auth = require('../services/authenticaton');
var checkRole = require('../services/checkRole');

router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res) => {
   const category = req.body;
   const query = "insert into category (name) values (?)";
   connection.query(query, [category.name], (err, results) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });
      res.status(200).json({ message: "Category added successfully" });
   });
});

router.get('/get',(req, res) => {
    const query="SELECT * FROM category ORDER BY name";
    connection.query(query,(err,results)=>{
        if(err) return res.status(500).json({message:"Database error",error:err});
        res.status(200).json(results);
    });
});

router.patch('/update',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    const product = req.body;
    const query = "UPDATE category SET name = ? WHERE id = ?";
    connection.query(query,[product.name,product.id],(err,results)=>{
        if(!err){
            if(results.affectedRows>0){
                return res.status(200).json({message:"Category updated successfully"});
            }
            else{
                return res.status(404).json({message:"Category not found"});
            }
        }
        else{
            return res.status(500).json({message:"Database error",error:err});
        }
    });
});





module.exports = router;