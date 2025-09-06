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












app.listen(port, () => console.log(`Listening on port ${port}`));