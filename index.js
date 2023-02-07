const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
let Users = require('./models/users.model');

const salt = 1;

require('dotenv').config({ path: './.env' });

const app = express();
app.use(express.json());

// session saving and cookie management
app.use(cors({
    origin: ["http://localhost:3000","https://test-4e8c8.web.app"],
    methods: ["GET", "POST"],
    credentials: true,
    cross
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    key: "user",
    secret: "anirudh2628*",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 60 * 24,
    },
}));


//mongodb connection
mongoose.set("strictQuery", true);
const uri = process.env.ATLAS_URL;
mongoose.connect(uri, { useNewUrlParser: true });
const connection = mongoose.connection;
connection.once('open', () =>{
    console.log("DATABASE CONNECTED SUCCESFULLY");
});

//authentication Part
app.post('/signup', (req,res) => {
    const username = req.body.username;
    const email = req.body.email;
    const regpassword = req.body.password;
    bcrypt.hash(regpassword,salt,(err,password) => {
        const user = new Users({username, email, password});
        req.session.user = username;
        user.save().then(res.send("USER SAVED"))
    });
});

app.get('/checkLogin', (req,res) => {
    if (req.session.user) {
        res.send({loggedIn: true, username: req.session.user});
    }
    else{
        res.send({loggedIn: false})
    }
});

app.post('/login', (req,res) => {
    const regusername = req.body.username;
    const regemail = req.body.email;
    const regpassword = req.body.password;
    Users.find({username: regusername} || {email: regemail}, (err, responce) => {
        if (err != undefined) {
            res.send({loginStatus: false, message: 'Some Error encountered, Please try again after sometime'})
        }
        if(responce.length == 0){
            res.send({loginStatus: false, message: 'No such User exists'})
        } else{
            bcrypt.compare(regpassword, responce[0].password, (error, valid) => {
                if (error) {
                    res.send({loginStatus: false, message: 'Some Error encountered, Please try again after sometime'})
                }
                if (valid) {
                    req.session.user = regusername;
                    res.send({loginStatus: true, message: 'Successfull Login'})
                } else {
                    res.send({loginStatus: false, message: 'Incorrect Password'})
                }
            });
        };
    });
});

app.get('/logout', (req,res) => {
    req.session.destroy();
    res.send({loggedIn: false})
})

const port = process.env.PORT || 3001;

app.listen(port, (req,res) => {
    console.log("SERVER IS RUNNING AT PORT 3001");
});
