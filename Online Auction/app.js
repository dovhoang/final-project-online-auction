const express = require('express');
const exphbs = require('express-handlebars');
const morgan = require('morgan');
const hbs_sections = require('express-handlebars-sections');
require('express-async-errors');
const session = require('express-session')
const flash = require('connect-flash');
const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))
app.use(express.static('assets'));
app.use(express.static('pictures'));

//Express-Session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}))

//Flash
app.use(flash());

app.engine('hbs', exphbs({
  helpers: {
    section: hbs_sections(),
    if_eq: function (a, b, opts) {
      if (a == b) {
        return opts.fn(this);
      } else {
        return opts.inverse(this);
      }
    },
  },
  defaultLayout: 'main.hbs',
  layoutsDir: 'views/_layouts'
}));
app.set('view engine', 'hbs');

require('./middlewares/locals.mdw')(app);
require('./middlewares/routes.mdw')(app);


app.use((req, res, next) => {
  res.render('vwError/error')
})
app.use((err, req, res, next) => {
  res.render('vwError/error')
})

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
})