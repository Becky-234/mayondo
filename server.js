//1.DEPENDENCIES
const express = require('express');
const path = require('path');

//Import Routes
const authRoutes = require('./routes/authRoutes.js');
const stockRoutes = require('./routes/stockRoutes.js');
const salesRoutes = require('./routes/salesRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const dashboardRoutes = require('./routes/dashboardRoutes.js');
const indexRoutes = require('./routes/indexRoutes.js');


//2.INSTANTIATIONS
const app = express();
const port = 3000;


//3.CONFIGURATIONS
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//4.MIDDLEWARE
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));    //helps to pass data from forms


//5.ROUTES
//Using Imported Routes
app.use('/', authRoutes);
app.use('/', stockRoutes);
app.use('/', salesRoutes);
app.use('/', productRoutes);
app.use('/', dashboardRoutes);
app.use('/', indexRoutes);








app.listen(port, () => console.log(`Listening on port ${port}`));