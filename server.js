//1.DEPENDENCIES
const express = require('express');



//2.INSTANTIATIONS
const app = express();
const port = 3000

//3.CONFIGURATIONS


//4.MIDDLEWARE
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));    //helps to pass data from forms


//5.ROUTES
//Landing page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/html/index.html');
});

app.post('/index', (req, res) => {
    console.log(req.body);
});


//Login page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/html/login.html');
});

app.post('/login', (req, res) => {
    console.log(req.body);
});


//Signup page
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/html/signup.html');
});

app.post('/signup', (req, res) => {
    console.log(req.body);
});


//Dashboard Page
app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/html/dashboard.html');
});

app.post('/dashboard', (req, res) => {
    console.log(req.body);
});


//Users page
app.get('/users', (req, res) => {
    res.sendFile(__dirname + '/html/users.html');
});

app.post('/users', (req, res) => {
    console.log(req.body);
});


//Add user page
app.get('/adduser', (req, res) => {
    res.sendFile(__dirname + '/html/add-new-user.html');
});

app.post('/adduser', (req, res) => {
    console.log(req.body);
});


//Sales page
app.get('/sales', (req, res) => {
    res.sendFile(__dirname + '/html/sales.html');
});

app.post('/sales', (req, res) => {
    console.log(req.body);
});

//Add sales page
app.get('/addsale', (req, res) => {
    res.sendFile(__dirname + '/html/add-sale.html');
});

app.post('/addsale', (req, res) => {
    console.log(req.body);
});

//Stock page
app.get('/stock', (req, res) => {
    res.sendFile(__dirname + '/html/stock.html');
});

app.post('/stock', (req, res) => {
    console.log(req.body);
});


//Add stock page
app.get('/addstock', (req, res) => {
    res.sendFile(__dirname + '/html/add-stock.html');
});

app.post('/addstock', (req, res) => {
    console.log(req.body);
});


//Products page
app.get('/products', (req, res) => {
    res.sendFile(__dirname + '/html/products.html');
});

app.post('/products', (req, res) => {
    console.log(req.body);
});






app.listen(port, () => console.log(`Listening on port ${port}`));