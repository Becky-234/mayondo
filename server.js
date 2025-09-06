//1.DEPENDENCIES
const express = require('express');

//Import Routes
const authRoutes = require('./routes/authRoutes');



//2.INSTANTIATIONS
const app = express();
const port = 3000;

//3.CONFIGURATIONS


//4.MIDDLEWARE
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));    //helps to pass data from forms


//5.ROUTES
//Using Imported Routes
app.use('/', authRoutes);

//Landing page
// router.get('/', (req, res) => {
//     res.render(__dirname + '/html/index.html');
// });

// router.post('/index', (req, res) => {
//     console.log(req.body);
// });






app.listen(port, () => console.log(`Listening on port ${port}`));