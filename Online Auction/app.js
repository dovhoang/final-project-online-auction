var express = require('express');
var exphbs  = require('express-handlebars');
 
var app = express();

app.use(express.static('assets'));

app.engine('hbs', exphbs({
defaultLayout: 'main.hbs',
layoutsDir: 'views/_layouts'
}));
app.set('view engine', 'hbs');
 
app.get('/home',(req, res) => {
    res.render('index');
});
app.get('/admin',(req, res) => {
    res.render('administrator');
});
 
app.listen(3000);