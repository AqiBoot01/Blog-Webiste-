require('dotenv').config();

const PORT = 5000 | process.env.PORT;

const express= require('express')
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const connectDB = require('./server/config/db')
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const session = require('express-session') 


const app = express();

connectDB(); 
app.use(express.urlencoded({extended: true}))
app.use(express.json());
app.use(express.static('public'));
app.use(methodOverride('_method'))


app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    unsave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODBURL
    })
}))



// Template Engine----------------------------
app.use(expressLayout);
app.set('layout' , './layouts/main')
app.set('view engine' , 'ejs')



app.use('/' , require('./server/routes/main'))
app.use('/' , require('./server/routes/admin'))

app.listen(PORT,()=>{
    console.log('Our app is listning ');
})