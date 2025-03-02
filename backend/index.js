const express = require('express');
const cors = require('cors');   // Import cors
const connection = require('./connection');  // Import connection.js
const userRouter = require('./routes/user');  // Import user.js
const categoryRouter = require('./routes/category');  // Import category.js
const productRouter = require('./routes/product');  // Import product.js    
const billRouter = require('./routes/bill');  // Import bill.js
const dashboardRouter = require('./routes/dashboard');  // Import dashboard.js
const app = express();





app.use(cors());    // Use cors
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/user', userRouter);  // Use userRouter
app.use('/category', categoryRouter);  // Use categoryRouter
app.use('/product', productRouter);  // Use productRouter
app.use('/bill', billRouter);  // Use billRouter
app.use('/dashboard', dashboardRouter);  // Use dashboardRouter

module.exports = app;