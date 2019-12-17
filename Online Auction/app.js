var express = require('express');
var exphbs = require('express-handlebars');
var morgan = require('morgan')
const hbs_sections = require('express-handlebars-sections');
require('express-async-errors');
var app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))
app.use(express.static('assets'));
app.use(express.static('pictures'));

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

app.get('/home', (req, res) => {
  res.render('index');
});

// app.use((req, res, next) => {
//   res.send('You\'re lost');
// })

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('View error on console.');
// })

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
})