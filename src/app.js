const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const connectDB = require('./config/db')
const path = require('path')
const methodOverride = require('method-override')
const morgan = require('morgan')
const expressHbs = require('express-handlebars')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')

const app = express();

//Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())


// Method override
app.use(
    methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            let method = req.body._method
            delete req.body._method
            return method
        }
    })
)

// load env config
dotenv.config({
    path: path.resolve(__dirname, './config/config.env')
});

//Initialize app
const PORT = process.env.PORT || 9001
const ENV = process.env.NODE_ENV
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

connectDB();

//Passport Config
require('./config/passport')(passport)

//Sessions middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}))

//Handlebars helpers
const { formatDate, truncate, select, stripTags, editIcon } = require('./helpers/hbs')

//Handlebars
app.engine('.hbs', expressHbs.engine({
    helpers: {
        formatDate, truncate, select, stripTags, editIcon
    }, defaultLayout: 'main', extname: '.hbs'
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

//Passport middleware
app.use(passport.initialize())
app.use(passport.session())

//Set Global Variables
app.use(function (req, res, next) {
    res.locals.user = req.user || null;
    next()
})

//Static folders
app.use(express.static(path.join(__dirname, '../public')))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/story'))

app.listen(PORT, () => console.log(`Server running in ${ENV}  at port: ${PORT}`))